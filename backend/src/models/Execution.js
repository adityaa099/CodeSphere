const mongoose = require('mongoose');

const ExecutionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  code: {
    type: String,
    required: true,
    maxlength: 50000
  },
  language: {
    type: String,
    required: true,
    enum: ['python', 'cpp', 'java', 'javascript', 'csharp', 'go', 'rust', 'php', 'ruby', 'swift', 'typescript']
  },
  input: {
    type: String,
    default: '',
    maxlength: 10000
  },
  output: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['queued', 'running', 'success', 'error', 'timeout', 'killed'],
    default: 'queued'
  },
  executionTime: {
    type: Number, // in milliseconds
    default: 0
  },
  memoryUsed: {
    type: Number, // in bytes
    default: 0
  },
  containerId: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
ExecutionSchema.index({ user: 1, createdAt: -1 });
ExecutionSchema.index({ status: 1 });
ExecutionSchema.index({ language: 1 });

module.exports = mongoose.model('Execution', ExecutionSchema);
