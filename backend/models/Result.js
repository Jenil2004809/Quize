const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  selectedAnswers: [String], // Handles single and multiple answers
  isCorrect: {
    type: Boolean,
    default: false
  },
  marksAwarded: {
    type: Number,
    default: 0
  }
}, { _id: false });

const resultSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student reference is required'],
    index: true
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: [true, 'Quiz reference is required'],
    index: true
  },
  score: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    default: 0
  },
  wrongAnswers: {
    type: Number,
    default: 0
  },
  skippedAnswers: {
    type: Number,
    default: 0
  },
  integrityScore: {
    type: Number,
    default: 100
  },
  answers: [answerSchema],
  timeTaken: {
    type: Number, // In seconds
    required: true
  },
  passed: {
    type: Boolean,
    required: true
  },
  wasDisqualified: {
    type: Boolean,
    default: false
  },
  disqualificationReason: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Result', resultSchema);
