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
  },
  tabViolationLocked: {
    type: Boolean,
    default: false
  },
  isAuthorizedForRetake: {
    type: Boolean,
    default: false
  },
  tabChangeCount: {
    type: Number,
    default: 0
  },
  terminatedDueToViolation: {
    type: Boolean,
    default: false
  },
  terminationReason: {
    type: String,
    enum: ['NONE', 'TAB_CHANGE_LIMIT_EXCEEDED'],
    default: 'NONE'
  },
  terminatedAt: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'COMPLETED', 'TERMINATED'],
    default: 'COMPLETED'
  },
  approvalStatus: {
    type: String,
    enum: ['NONE', 'PENDING', 'APPROVED', 'REJECTED'],
    default: 'NONE'
  },
  violationHistory: [{
    timestamp: { type: Date, default: Date.now },
    browser: { type: String, default: '' },
    ip: { type: String, default: '' },
    device: { type: String, default: '' },
    eventType: { type: String, default: 'TAB_CHANGE' }
  }],
  adminNotes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Result', resultSchema);
