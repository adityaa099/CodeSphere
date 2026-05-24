const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const validator = require('validator');

// ─── Register ────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Please provide a valid email' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        error: existingUser.email === email
          ? 'Email already registered'
          : 'Username already taken'
      });
    }

    // Create user
    const user = await User.create({ username, email, password });
    const token = user.generateToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        stats: user.stats,
        preferences: user.preferences,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// ─── Login ───────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = user.generateToken();

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        stats: user.stats,
        preferences: user.preferences,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// ─── Get current user ────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        stats: user.stats,
        preferences: user.preferences,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── Update preferences ─────────────────────────────────
router.put('/preferences', protect, async (req, res) => {
  try {
    const { theme, fontSize, tabSize } = req.body;
    const user = await User.findById(req.user.id);

    if (theme) user.preferences.theme = theme;
    if (fontSize) user.preferences.fontSize = fontSize;
    if (tabSize) user.preferences.tabSize = tabSize;

    await user.save();

    res.json({ success: true, preferences: user.preferences });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
