const mongoose = require('mongoose');

const platformSettingsSchema = new mongoose.Schema({
  instituteName: {
    type: String,
    default: 'Quizzy International Academy'
  },
  allowRegistrations: {
    type: Boolean,
    default: true
  },
  autoApproveTeachers: {
    type: Boolean,
    default: false
  },
  generateCertificates: {
    type: Boolean,
    default: true
  },
  defaultLanguage: {
    type: String,
    default: 'English'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PlatformSettings', platformSettingsSchema);

