const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const User = require('../models/User');
const Execution = require('../models/Execution');
const Snippet = require('../models/Snippet');

// ─── Admin Dashboard Stats ──────────────────────────────
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const [
      totalUsers,
      totalExecutions,
      totalSnippets,
      recentExecutions,
      languageBreakdown,
      userGrowth
    ] = await Promise.all([
      User.countDocuments(),
      Execution.countDocuments(),
      Snippet.countDocuments(),
      Execution.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('user', 'username')
        .select('language status executionTime createdAt'),
      Execution.aggregate([
        { $group: { _id: '$language', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      User.aggregate([
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: -1 } },
        { $limit: 30 }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalExecutions,
        totalSnippets,
        recentExecutions,
        languageBreakdown,
        userGrowth
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

// ─── Get all users ───────────────────────────────────────
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;
