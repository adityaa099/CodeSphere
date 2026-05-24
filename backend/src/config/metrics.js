const client = require('prom-client');

const register = new client.Registry();

// Default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5]
});
register.registerMetric(httpRequestDuration);

const codeExecutionDuration = new client.Histogram({
  name: 'code_execution_duration_seconds',
  help: 'Duration of code executions in seconds',
  labelNames: ['language', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});
register.registerMetric(codeExecutionDuration);

const codeExecutionCounter = new client.Counter({
  name: 'code_executions_total',
  help: 'Total number of code executions',
  labelNames: ['language', 'status']
});
register.registerMetric(codeExecutionCounter);

const activeContainers = new client.Gauge({
  name: 'active_execution_containers',
  help: 'Number of currently active execution containers'
});
register.registerMetric(activeContainers);

const queueSize = new client.Gauge({
  name: 'execution_queue_size',
  help: 'Current size of the execution queue'
});
register.registerMetric(queueSize);

const setupMetrics = (app) => {
  // Middleware to track request durations
  app.use((req, res, next) => {
    const end = httpRequestDuration.startTimer();
    res.on('finish', () => {
      end({
        method: req.method,
        route: req.route ? req.route.path : req.path,
        status_code: res.statusCode
      });
    });
    next();
  });

  // Metrics endpoint for Prometheus
  app.get('/metrics', async (req, res) => {
    try {
      res.set('Content-Type', register.contentType);
      res.end(await register.metrics());
    } catch (err) {
      res.status(500).end(err);
    }
  });
};

module.exports = {
  setupMetrics,
  codeExecutionDuration,
  codeExecutionCounter,
  activeContainers,
  queueSize,
  register
};
