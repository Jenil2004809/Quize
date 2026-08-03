const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: [true, 'Mobile number is required'],
    trim: true,
    index: true
  },
  otpHash: {
    type: String,
    required: [true, 'Hashed OTP code is required']
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // Document automatically purged at expiresAt date
  },
  attempts: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Otp', otpSchema);
