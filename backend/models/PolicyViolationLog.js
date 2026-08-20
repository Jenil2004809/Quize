const mongoose = require('mongoose');

const policyViolationLogSchema = new mongoose.Schema({
  action: {
    type: String,
    enum: [
      'TAB_SWITCH_DETECTED',
      'QUIZ_TERMINATED',
      'ADMIN_APPROVED',
      'ADMIN_REJECTED',
      'RETAKE_REQUESTED',
      'NOTIFICATION_SENT',
      'NOTIFICATION_READ'
    ],
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'userModel',
    required: true
  },
  userModel: {
    type: String,
    enum: ['Student', 'Admin', 'Teacher'],
    default: 'Student'
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    default: null
  },
  resultId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Result',
    default: null
  },
  details: {
    type: String,
    default: ''
  },
  browser: {
    type: String,
    default: ''
  },
  ip: {
    type: String,
    default: ''
  },
  device: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PolicyViolationLog', policyViolationLogSchema);
