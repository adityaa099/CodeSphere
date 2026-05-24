const Redis = require('ioredis');
const Docker = require('dockerode');
const { v4: uuidv4 } = require('uuid');
const { Readable } = require('stream');
const path = require('path');

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
});

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

const QUEUE_NAME = 'code_execution_queue';
const RESULT_PREFIX = 'execution_result:';

// Language configurations — must stay in sync with backend executionService.js
const LANGUAGE_CONFIG = {
  python: { image: 'python:3.11-slim', ext: '.py', cmd: (f) => ['python', f] },
  javascript: { image: 'node:20-slim', ext: '.js', cmd: (f) => ['node', f] },
  cpp: { image: 'gcc:13', ext: '.cpp', cmd: (f) => ['sh', '-c', `g++ -o /tmp/out ${f} && /tmp/out`] },
  java: { image: 'eclipse-temurin:17-jdk-alpine', ext: '.java', cmd: (f) => ['sh', '-c', `javac ${f} && java -cp /tmp Main`] },
  go: { image: 'golang:1.21-alpine', ext: '.go', cmd: (f) => ['go', 'run', f] },
  rust: { image: 'rust:1.74-slim', ext: '.rs', cmd: (f) => ['sh', '-c', `rustc -o /tmp/out ${f} && /tmp/out`] },
  csharp: {
    image: 'mcr.microsoft.com/dotnet/sdk:8.0',
    ext: '.cs',
    cmd: (f) => ['sh', '-c', `cd /tmp && dotnet new console -o csapp --force > /dev/null 2>&1 && cp ${f} /tmp/csapp/Program.cs && cd /tmp/csapp && dotnet run --no-restore 2>&1`],
    timeout: 30000
  },
  php: { image: 'php:8.2-cli', ext: '.php', cmd: (f) => ['php', f] },
  ruby: { image: 'ruby:3.2-slim', ext: '.rb', cmd: (f) => ['ruby', f] },
  swift: { image: 'swift:5.9', ext: '.swift', cmd: (f) => ['swift', f], timeout: 15000 },
  typescript: { image: 'node:20-slim', ext: '.ts', cmd: (f) => ['sh', '-c', `npx --yes tsx ${f}`], timeout: 15000 },
};

console.log(`
╔══════════════════════════════════════════╗
║   ⚡ CodeSphere Executor Worker         ║
║   Listening for execution jobs...        ║
║   Supported: ${Object.keys(LANGUAGE_CONFIG).join(', ')}
╚══════════════════════════════════════════╝
`);

/**
 * Create a tar archive stream for putting files into containers
 */
function createTarStream(filepath, content) {
  const header = Buffer.alloc(512);
  const name = filepath.startsWith('/') ? filepath.substring(1) : filepath;
  header.write(name, 0, Math.min(name.length, 100));

  // File mode
  header.write('0000644\0', 100, 8);
  // Owner ID
  header.write('0001000\0', 108, 8);
  // Group ID
  header.write('0001000\0', 116, 8);
  // File size in octal
  const sizeStr = content.length.toString(8).padStart(11, '0') + '\0';
  header.write(sizeStr, 124, 12);
  // Modification time
  const mtime = Math.floor(Date.now() / 1000).toString(8).padStart(11, '0') + '\0';
  header.write(mtime, 136, 12);
  // Type flag (0 = regular file)
  header.write('0', 156, 1);

  // Calculate checksum
  header.write('        ', 148, 8); // Initialize checksum field with spaces
  let checksum = 0;
  for (let i = 0; i < 512; i++) {
    checksum += header[i];
  }
  header.write(checksum.toString(8).padStart(6, '0') + '\0 ', 148, 8);

  // Padding to 512-byte blocks
  const paddingSize = (512 - (content.length % 512)) % 512;
  const padding = Buffer.alloc(paddingSize);
  const endBlock = Buffer.alloc(1024); // End-of-archive marker

  const stream = new Readable({
    read() {
      this.push(header);
      this.push(content);
      if (paddingSize > 0) this.push(padding);
      this.push(endBlock);
      this.push(null);
    }
  });

  return stream;
}

async function processJob(job) {
  const { executionId, code, language, input } = JSON.parse(job);
  const config = LANGUAGE_CONFIG[language];

  if (!config) {
    await redis.setex(
      `${RESULT_PREFIX}${executionId}`,
      300,
      JSON.stringify({ error: `Unsupported language: ${language}`, status: 'error' })
    );
    return;
  }

  const filename = language === 'java'
    ? `/tmp/Main${config.ext}`
    : `/tmp/code_${uuidv4()}${config.ext}`;

  const startTime = Date.now();
  let container;

  try {
    // Create container with security restrictions
    container = await docker.createContainer({
      Image: config.image,
      Cmd: config.cmd(filename),
      AttachStdout: true,
      AttachStderr: true,
      AttachStdin: !!input,
      OpenStdin: !!input,
      Tty: false,
      NetworkDisabled: true,
      HostConfig: {
        Memory: 256 * 1024 * 1024,
        MemorySwap: 256 * 1024 * 1024,
        NanoCpus: 1e9,
        PidsLimit: 50,
        AutoRemove: false, // We handle cleanup in finally block
        SecurityOpt: ['no-new-privileges'],
        CapDrop: ['ALL'],
      },
      WorkingDir: '/tmp',
    });

    // Inject code into container BEFORE starting (critical fix!)
    const codeBuffer = Buffer.from(code);
    const tarStream = createTarStream(filename, codeBuffer);
    await container.putArchive(tarStream, { path: '/' });

    // Start container
    await container.start();

    // If there's input, write to stdin
    if (input) {
      const stdinStream = await container.attach({
        stream: true,
        stdin: true,
        stdout: false,
        stderr: false
      });
      stdinStream.write(input);
      stdinStream.end();
    }

    // Wait with timeout
    const timeout = config.timeout || parseInt(process.env.EXECUTION_TIMEOUT) || 10000;
    const waitPromise = container.wait();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT')), timeout)
    );

    const data = await Promise.race([waitPromise, timeoutPromise]);

    // Get logs after container has finished (more reliable than streaming)
    const logBuffer = await container.logs({
      stdout: true,
      stderr: true,
      follow: false
    });

    // Parse Docker multiplexed stream output
    let stdout = '';
    let stderr = '';
    let offset = 0;
    const buf = Buffer.isBuffer(logBuffer) ? logBuffer : Buffer.from(logBuffer);

    while (offset < buf.length) {
      if (offset + 8 > buf.length) {
        stdout += buf.slice(offset).toString('utf-8');
        break;
      }

      const streamType = buf[offset]; // 1 = stdout, 2 = stderr
      const frameSize = buf.readUInt32BE(offset + 4);
      offset += 8;

      if (offset + frameSize > buf.length) {
        const payload = buf.slice(offset).toString('utf-8');
        if (streamType === 2) {
          stderr += payload;
        } else {
          stdout += payload;
        }
        break;
      }

      const payload = buf.slice(offset, offset + frameSize).toString('utf-8');
      if (streamType === 2) {
        stderr += payload;
      } else {
        stdout += payload;
      }
      offset += frameSize;
    }

    const result = {
      output: stdout.substring(0, 10000).trim(),
      error: stderr.substring(0, 5000).trim(),
      exitCode: data.StatusCode,
      executionTime: Date.now() - startTime,
      status: data.StatusCode === 0 ? 'success' : 'error'
    };

    await redis.setex(`${RESULT_PREFIX}${executionId}`, 300, JSON.stringify(result));
    console.log(`  ✅ [${language}] Exit: ${data.StatusCode} (${Date.now() - startTime}ms)`);

  } catch (error) {
    const isTimeout = error.message === 'TIMEOUT';

    if (isTimeout) {
      try { if (container) await container.kill(); } catch (e) { }
    }

    const result = {
      output: '',
      error: isTimeout
        ? 'Execution timed out. Your code took too long to execute.'
        : error.message,
      executionTime: Date.now() - startTime,
      status: isTimeout ? 'timeout' : 'error'
    };

    await redis.setex(`${RESULT_PREFIX}${executionId}`, 300, JSON.stringify(result));
    console.log(`  ❌ [${language}] ${isTimeout ? 'TIMEOUT' : error.message} (${Date.now() - startTime}ms)`);

  } finally {
    try {
      if (container) await container.remove({ force: true });
    } catch (e) {
      // Container may have been auto-removed
    }
  }
}

// Main loop - pop jobs from Redis queue
async function startWorker() {
  while (true) {
    try {
      const job = await redis.brpop(QUEUE_NAME, 0);
      if (job) {
        console.log(`📦 Processing job...`);
        await processJob(job[1]);
      }
    } catch (error) {
      console.error('Worker error:', error.message);
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

startWorker();
