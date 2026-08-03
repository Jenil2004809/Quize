const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  instituteName: {
    type: String,
    default: 'Quizzy International Academy',
    trim: true
  },
  supportEmail: {
    type: String,
    default: 'support@quizzy.com',
    trim: true
  },
  supportPhone: {
    type: String,
    default: '+1 800 555 0199',
    trim: true
  },
  allowRegistrations: {
    type: Boolean,
    default: true
  },
  autoApproveTeachers: {
    type: Boolean,
    default: true
  },
  generateCertificates: {
    type: Boolean,
    default: true
  },
  passingPercentage: {
    type: Number,
    default: 50
  },
  maxQuizTimeLimit: {
    type: Number,
    default: 180
  },
  defaultLanguage: {
    type: String,
    default: 'English'
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Setting', settingSchema);
