const mongoose = require('mongoose');

const SnippetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Please provide code'],
    maxlength: [50000, 'Code cannot exceed 50000 characters']
  },
  language: {
    type: String,
    required: [true, 'Please specify a language'],
    enum: ['python', 'cpp', 'java', 'javascript', 'csharp', 'go', 'rust', 'php', 'ruby', 'swift', 'typescript']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: {
    type: [String],
    default: []
  },
  bookmarked: {
    type: Boolean,
    default: false
  },
  lastExecutionOutput: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

SnippetSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
SnippetSchema.index({ user: 1, createdAt: -1 });
SnippetSchema.index({ language: 1 });
SnippetSchema.index({ isPublic: 1 });

module.exports = mongoose.model('Snippet', SnippetSchema);
