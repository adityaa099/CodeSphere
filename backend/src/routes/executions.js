const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Execution = require('../models/Execution');

// ─── Get execution history ──────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const language = req.query.language;
    const status = req.query.status;

    const query = { user: req.user.id };
    if (language) query.language = language;
    if (status) query.status = status;

    const [executions, total] = await Promise.all([
      Execution.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-code'), // Don't return full code in listing
      Execution.countDocuments(query)
    ]);

    res.json({
      success: true,
      executions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch execution history' });
  }
});

// ─── Get single execution ────────────────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const execution = await Execution.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }

    res.json({ success: true, execution });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch execution' });
  }
});

// ─── Get execution stats ─────────────────────────────────
router.get('/stats/summary', protect, async (req, res) => {
  try {
    const [
      totalExecutions,
      successfulExecutions,
      languageStats,
      recentExecutions
    ] = await Promise.all([
      Execution.countDocuments({ user: req.user.id }),
      Execution.countDocuments({ user: req.user.id, status: 'success' }),
      Execution.aggregate([
        { $match: { user: req.user._id || req.user.id } },
        { $group: { _id: '$language', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Execution.find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('language status executionTime createdAt')
    ]);

    res.json({
      success: true,
      stats: {
        totalExecutions,
        successfulExecutions,
        failedExecutions: totalExecutions - successfulExecutions,
        successRate: totalExecutions > 0
          ? ((successfulExecutions / totalExecutions) * 100).toFixed(1)
          : 0,
        languageStats,
        recentExecutions
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
