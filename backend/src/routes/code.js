const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { executeCode, getSupportedLanguages } = require('../services/executionService');
const Execution = require('../models/Execution');
const User = require('../models/User');
const { queueSize } = require('../config/metrics');

// ─── Execute code ────────────────────────────────────────
router.post('/execute', protect, async (req, res) => {
  try {
    const { code, language, input } = req.body;

    // Validation
    if (!code || !language) {
      return res.status(400).json({ error: 'Please provide code and language' });
    }

    if (code.length > 50000) {
      return res.status(400).json({ error: 'Code exceeds maximum length of 50000 characters' });
    }

    const supportedLangs = getSupportedLanguages().map(l => l.id);
    if (!supportedLangs.includes(language)) {
      return res.status(400).json({
        error: `Unsupported language: ${language}. Supported: ${supportedLangs.join(', ')}`
      });
    }

    // Create execution record
    const execution = await Execution.create({
      user: req.user.id,
      code,
      language,
      input: input || '',
      status: 'running'
    });

    // Track queue size
    queueSize.inc();

    // Execute code in Docker container
    const result = await executeCode(code, language, input);

    queueSize.dec();

    // Update execution record
    execution.output = result.output;
    execution.error = result.error;
    execution.status = result.status;
    execution.executionTime = result.executionTime;
    execution.memoryUsed = result.memoryUsed;
    await execution.save();

    // Update user stats
    await req.user.recordExecution(language, result.executionTime / 1000);

    res.json({
      success: true,
      execution: {
        id: execution._id,
        output: result.output,
        error: result.error,
        status: result.status,
        executionTime: result.executionTime,
        memoryUsed: result.memoryUsed,
        language
      }
    });

  } catch (error) {
    queueSize.dec();
    console.error('Execution error:', error);
    res.status(500).json({ error: 'Code execution failed. Please try again.' });
  }
});

// ─── Get supported languages ─────────────────────────────
router.get('/languages', (req, res) => {
  res.json({
    success: true,
    languages: getSupportedLanguages()
  });
});

module.exports = router;
