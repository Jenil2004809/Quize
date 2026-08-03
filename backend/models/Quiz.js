const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Quiz title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  thumbnail: {
    type: String,
    default: ''
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Quiz category is required'],
    index: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: false,
    index: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  timeLimit: {
    type: Number,
    required: [true, 'Time limit is required in minutes'],
    min: [1, 'Time limit must be at least 1 minute']
  },
  passingMarks: {
    type: Number,
    required: [true, 'Passing marks value is required'],
    min: [0, 'Passing marks cannot be negative']
  },
  maxAttempts: {
    type: Number,
    default: 1,
    min: [1, 'Maximum attempts must be at least 1']
  },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Quiz creator is required'],
    refPath: 'creatorModel',
    index: true
  },
  creatorModel: {
    type: String,
    required: true,
    enum: ['Teacher', 'Admin'],
    default: 'Teacher'
  },
  isPublished: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Quiz', quizSchema);
