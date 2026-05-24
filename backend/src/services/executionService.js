const Docker = require('dockerode');
const { v4: uuidv4 } = require('uuid');
const {
  codeExecutionDuration,
  codeExecutionCounter,
  activeContainers
} = require('../config/metrics');

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

// Parse memory string like '256m', '1g' into bytes
function parseMemory(memStr) {
  if (!memStr) return 256 * 1024 * 1024; // default 256MB
  const str = String(memStr).toLowerCase().trim();
  const num = parseInt(str);
  if (isNaN(num)) return 256 * 1024 * 1024;
  if (str.endsWith('g')) return num * 1024 * 1024 * 1024;
  if (str.endsWith('m')) return num * 1024 * 1024;
  if (str.endsWith('k')) return num * 1024;
  // If it's already a large number, assume bytes
  if (num > 1024 * 1024) return num;
  // If it's a small number, assume megabytes
  return num * 1024 * 1024;
}

// Language configurations
const LANGUAGE_CONFIG = {
  python: {
    image: 'python:3.11-slim',
    extension: '.py',
    command: (filename) => ['python', filename],
    timeout: 10000
  },
  javascript: {
    image: 'node:20-slim',
    extension: '.js',
    command: (filename) => ['node', filename],
    timeout: 10000
  },
  cpp: {
    image: 'gcc:13',
    extension: '.cpp',
    command: (filename) => ['sh', '-c', `g++ -o /tmp/output ${filename} && /tmp/output`],
    timeout: 15000
  },
  java: {
    image: 'eclipse-temurin:17-jdk-alpine',
    extension: '.java',
    command: (filename) => ['sh', '-c', `javac ${filename} && java -cp /tmp Main`],
    timeout: 15000,
    mainClass: 'Main'
  },
  go: {
    image: 'golang:1.21-alpine',
    extension: '.go',
    command: (filename) => ['go', 'run', filename],
    timeout: 10000
  },
  rust: {
    image: 'rust:1.74-slim',
    extension: '.rs',
    command: (filename) => ['sh', '-c', `rustc -o /tmp/output ${filename} && /tmp/output`],
    timeout: 15000
  },
  csharp: {
    image: 'mcr.microsoft.com/dotnet/sdk:8.0',
    extension: '.cs',
    command: (filename) => ['sh', '-c', `cd /tmp && dotnet new console -o csapp --force > /dev/null 2>&1 && cp ${filename} /tmp/csapp/Program.cs && cd /tmp/csapp && dotnet run --no-restore 2>&1`],
    timeout: 30000
  },
  php: {
    image: 'php:8.2-cli',
    extension: '.php',
    command: (filename) => ['php', filename],
    timeout: 10000
  },
  ruby: {
    image: 'ruby:3.2-slim',
    extension: '.rb',
    command: (filename) => ['ruby', filename],
    timeout: 10000
  },
  swift: {
    image: 'swift:5.9',
    extension: '.swift',
    command: (filename) => ['swift', filename],
    timeout: 15000
  },
  typescript: {
    image: 'node:20-slim',
    extension: '.ts',
    command: (filename) => ['sh', '-c', `npx --yes tsx ${filename}`],
    timeout: 15000
  }
};

/**
 * Execute code in an isolated Docker container
 * @param {string} code - Source code to execute
 * @param {string} language - Programming language
 * @param {string} input - Standard input for the program
 * @returns {Object} Execution result with output, error, time, memory
 */
async function executeCode(code, language, input = '') {
  const config = LANGUAGE_CONFIG[language];

  if (!config) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const executionId = uuidv4();
  const filename = language === 'java'
    ? `/tmp/Main${config.extension}`
    : `/tmp/code_${executionId}${config.extension}`;

  const startTime = Date.now();
  let container = null;

  try {
    activeContainers.inc();

    // Create container with security restrictions
    container = await docker.createContainer({
      Image: config.image,
      Cmd: config.command(filename),
      AttachStdout: true,
      AttachStderr: true,
      AttachStdin: !!input,
      OpenStdin: !!input,
      Tty: false,
      NetworkDisabled: true, // No network access
      HostConfig: {
        Memory: parseMemory(process.env.MAX_MEMORY), // 256MB default
        MemorySwap: parseMemory(process.env.MAX_MEMORY),
        NanoCpus: (parseInt(process.env.MAX_CPUS) || 1) * 1e9,
        PidsLimit: 50, // Prevent fork bombs
        ReadonlyRootfs: false,
        AutoRemove: false, // We handle cleanup in finally block
        SecurityOpt: ['no-new-privileges'],
        CapDrop: ['ALL'], // Drop all Linux capabilities
      },
      WorkingDir: '/tmp',
      // Note: User restriction removed - many base images lack uid 1000
      // Security is enforced via CapDrop, no-new-privileges, NetworkDisabled
    });

    // Copy code into container
    const codeBuffer = Buffer.from(code);
    const tarStream = createTarStream(filename, codeBuffer);
    await container.putArchive(tarStream, { path: '/' });

    // Start container
    await container.start();

    // If there's input, write to stdin
    if (input) {
      const stream = await container.attach({
        stream: true,
        stdin: true,
        stdout: false,
        stderr: false
      });
      stream.write(input);
      stream.end();
    }

    // Wait for completion with timeout
    const timeout = config.timeout || parseInt(process.env.EXECUTION_TIMEOUT) || 10000;
    const result = await waitForContainer(container, timeout);

    const executionTime = Date.now() - startTime;

    // Get container stats for memory usage
    let memoryUsed = 0;
    try {
      const stats = await container.stats({ stream: false });
      memoryUsed = stats.memory_stats.usage || 0;
    } catch (e) {
      // Container may have already been removed
    }

    // Track metrics
    const status = result.exitCode === 0 ? 'success' : 'error';
    codeExecutionDuration.observe({ language, status }, executionTime / 1000);
    codeExecutionCounter.inc({ language, status });

    return {
      output: result.stdout.trim(),
      error: result.stderr.trim(),
      exitCode: result.exitCode,
      executionTime,
      memoryUsed,
      status: result.exitCode === 0 ? 'success' : 'error'
    };

  } catch (error) {
    const executionTime = Date.now() - startTime;

    if (error.message === 'EXECUTION_TIMEOUT') {
      codeExecutionCounter.inc({ language, status: 'timeout' });

      // Kill the container
      try {
        if (container) await container.kill();
      } catch (e) { /* container may already be stopped */ }

      return {
        output: '',
        error: 'Execution timed out. Your code took too long to execute.',
        exitCode: -1,
        executionTime,
        memoryUsed: 0,
        status: 'timeout'
      };
    }

    codeExecutionCounter.inc({ language, status: 'error' });

    return {
      output: '',
      error: error.message || 'An unexpected error occurred during execution.',
      exitCode: -1,
      executionTime,
      memoryUsed: 0,
      status: 'error'
    };

  } finally {
    activeContainers.dec();

    // Ensure container cleanup
    try {
      if (container) {
        await container.remove({ force: true });
      }
    } catch (e) {
      // Container may have been auto-removed
    }
  }
}

/**
 * Wait for container to finish with timeout
 */
function waitForContainer(container, timeout) {
  return new Promise(async (resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('EXECUTION_TIMEOUT'));
    }, timeout);

    try {
      // Wait for container to finish
      const data = await container.wait();
      clearTimeout(timer);

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
          // Not enough data for header, treat remainder as stdout
          stdout += buf.slice(offset).toString('utf-8');
          break;
        }

        const streamType = buf[offset]; // 1 = stdout, 2 = stderr
        const frameSize = buf.readUInt32BE(offset + 4);
        offset += 8;

        if (offset + frameSize > buf.length) {
          // Frame extends beyond buffer, take what we have
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

      resolve({
        stdout: stdout.substring(0, 10000), // Limit output size
        stderr: stderr.substring(0, 5000),
        exitCode: data.StatusCode
      });

    } catch (error) {
      clearTimeout(timer);
      reject(error);
    }
  });
}

/**
 * Create a tar archive stream for putting files into containers
 */
function createTarStream(filepath, content) {
  const path = require('path');
  const { Readable } = require('stream');

  const filename = path.basename(filepath);
  const dir = path.dirname(filepath);

  // Create tar header
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

/**
 * Get list of supported languages
 */
function getSupportedLanguages() {
  return Object.entries(LANGUAGE_CONFIG).map(([key, config]) => ({
    id: key,
    name: key.charAt(0).toUpperCase() + key.slice(1),
    extension: config.extension,
    image: config.image
  }));
}

/**
 * Pull required Docker images
 */
async function pullImages() {
  for (const [language, config] of Object.entries(LANGUAGE_CONFIG)) {
    try {
      console.log(`Pulling image: ${config.image}...`);
      await docker.pull(config.image);
      console.log(`✅ Pulled: ${config.image}`);
    } catch (error) {
      console.error(`❌ Failed to pull ${config.image}:`, error.message);
    }
  }
}

module.exports = {
  executeCode,
  getSupportedLanguages,
  pullImages,
  LANGUAGE_CONFIG
};
