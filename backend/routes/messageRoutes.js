const express = require('express');
const router = express.Router();
const {
  submitMessage,
  getMessages,
  resolveMessage
} = require('../controllers/messageController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', submitMessage);
router.get('/', protect, authorize('admin'), getMessages);
router.put('/:id/resolve', protect, authorize('admin'), resolveMessage);

module.exports = router;
