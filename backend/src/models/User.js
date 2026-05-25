const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'premium', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: ''
  },
  stats: {
    totalExecutions: { type: Number, default: 0 },
    languagesUsed: { type: [String], default: [] },
    snippetsSaved: { type: Number, default: 0 },
    totalExecutionTime: { type: Number, default: 0 } // in seconds
  },
  preferences: {
    theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
    fontSize: { type: Number, default: 14 },
    tabSize: { type: Number, default: 2 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before save
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT
UserSchema.methods.generateToken = function() {
  return jwt.sign(
    { id: this._id, username: this.username, role: this.role },
    process.env.JWT_SECRET || 'codesphere_secret',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Update stats helper atomically to prevent race conditions during concurrent executions (e.g. multi-tab)
UserSchema.methods.recordExecution = async function(language, executionTime) {
  await this.model('User').updateOne(
    { _id: this._id },
    {
      $inc: {
        'stats.totalExecutions': 1,
        'stats.totalExecutionTime': executionTime
      },
      $addToSet: {
        'stats.languagesUsed': language
      }
    }
  );
};

module.exports = mongoose.model('User', UserSchema);
