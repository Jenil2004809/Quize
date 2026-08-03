const mongoose = require('mongoose');
const crypto = require('crypto');

const certificateSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  resultId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Result',
    required: true,
    unique: true
  },
  certificateId: {
    type: String,
    required: true,
    unique: true,
    default: () => crypto.randomBytes(8).toString('hex').toUpperCase()
  },
  issuedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Certificate', certificateSchema);
