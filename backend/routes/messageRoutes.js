const express = require('express');
const router = express.Router();
const {
  submitMessage,
  getMessages,
  resolveMessage
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
const admin = require('../middleware/admin');

// Submit is public
router.post('/', submitMessage);

// Admin-only endpoints
router.get('/', protect, admin, getMessages);
router.put('/:id/resolve', protect, admin, resolveMessage);

module.exports = router;
