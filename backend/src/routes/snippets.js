const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Snippet = require('../models/Snippet');
const User = require('../models/User');

// ─── Create snippet ─────────────────────────────────────
router.post('/', protect, async (req, res) => {
  try {
    const { title, code, language, description, isPublic, tags } = req.body;

    if (!title || !code || !language) {
      return res.status(400).json({ error: 'Please provide title, code, and language' });
    }

    const snippet = await Snippet.create({
      user: req.user.id,
      title,
      code,
      language,
      description: description || '',
      isPublic: isPublic || false,
      tags: tags || []
    });

    // Update user stats
    const user = await User.findById(req.user.id);
    user.stats.snippetsSaved += 1;
    await user.save();

    res.status(201).json({ success: true, snippet });
  } catch (error) {
    console.error('Create snippet error:', error);
    res.status(500).json({ error: 'Failed to save snippet' });
  }
});

// ─── Get user's snippets ─────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const language = req.query.language;
    const search = req.query.search;

    const query = { user: req.user.id };
    if (language) query.language = language;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const [snippets, total] = await Promise.all([
      Snippet.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Snippet.countDocuments(query)
    ]);

    res.json({
      success: true,
      snippets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch snippets' });
  }
});

// ─── Get single snippet ─────────────────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const snippet = await Snippet.findOne({
      _id: req.params.id,
      $or: [{ user: req.user.id }, { isPublic: true }]
    });

    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }

    res.json({ success: true, snippet });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch snippet' });
  }
});

// ─── Update snippet ─────────────────────────────────────
router.put('/:id', protect, async (req, res) => {
  try {
    const snippet = await Snippet.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }

    const { title, code, language, description, isPublic, tags, bookmarked } = req.body;

    if (title) snippet.title = title;
    if (code) snippet.code = code;
    if (language) snippet.language = language;
    if (description !== undefined) snippet.description = description;
    if (isPublic !== undefined) snippet.isPublic = isPublic;
    if (tags) snippet.tags = tags;
    if (bookmarked !== undefined) snippet.bookmarked = bookmarked;

    await snippet.save();

    res.json({ success: true, snippet });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update snippet' });
  }
});

// ─── Delete snippet ──────────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const snippet = await Snippet.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }

    // Update user stats
    const user = await User.findById(req.user.id);
    user.stats.snippetsSaved = Math.max(0, user.stats.snippetsSaved - 1);
    await user.save();

    res.json({ success: true, message: 'Snippet deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete snippet' });
  }
});

// ─── Toggle bookmark ─────────────────────────────────────
router.patch('/:id/bookmark', protect, async (req, res) => {
  try {
    const snippet = await Snippet.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }

    snippet.bookmarked = !snippet.bookmarked;
    await snippet.save();

    res.json({ success: true, bookmarked: snippet.bookmarked });
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle bookmark' });
  }
});

module.exports = router;
