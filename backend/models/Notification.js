const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'recipientModel',
    default: null, // Null indicates global / all-user notification
    index: true
  },
  recipientModel: {
    type: String,
    enum: ['Admin', 'Student', 'Teacher'],
    required: function() { return this.recipientId != null; }
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'senderModel',
    default: null
  },
  senderModel: {
    type: String,
    enum: ['Admin', 'Student', 'Teacher'],
    required: function() { return this.senderId != null; }
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['quiz_published', 'quiz_completed', 'certificate_ready', 'announcement', 'teacher_approved', 'security_warning', 'exam_failed'],
    default: 'announcement'
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
