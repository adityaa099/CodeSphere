require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
const connectRedis = require('./config/redis');
const { setupMetrics } = require('./config/metrics');

// Import routes
const authRoutes = require('./routes/auth');
const codeRoutes = require('./routes/code');
const snippetRoutes = require('./routes/snippets');
const executionRoutes = require('./routes/executions');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Connect to databases ────────────────────────────────────
connectDB();
const redisClient = connectRedis();

// ─── Security Middleware ──────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Execution-specific rate limit (stricter)
const executionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { error: 'Too many code executions. Please wait before running more code.' }
});
app.use('/api/code/execute', executionLimiter);

// ─── General Middleware ───────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Make Redis available in routes
app.use((req, res, next) => {
  req.redisClient = redisClient;
  next();
});

// ─── Prometheus metrics ───────────────────────────────────────
setupMetrics(app);

// ─── Routes ───────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/code', codeRoutes);
app.use('/api/snippets', snippetRoutes);
app.use('/api/executions', executionRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'CodeSphere Backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});

// ─── Start Server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║     🚀 CodeSphere Backend Server        ║
  ║     Running on port ${PORT}               ║
  ║     Environment: ${process.env.NODE_ENV || 'development'}        ║
  ╚══════════════════════════════════════════╝
  `);
});

module.exports = app;
