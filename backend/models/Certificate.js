const mongoose = require('mongoose');
const { v4: uuidv4 } = require('crypto'); // We can use crypto built-in or custom hash generator

const certificateSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
    default: () => require('crypto').randomBytes(8).toString('hex').toUpperCase()
  },
  issuedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Certificate', certificateSchema);
