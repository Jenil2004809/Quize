const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const { getSettings, updateSettings } = require('../controllers/settingsController');

const router = express.Router();

router.get('/', protect, authorize('admin'), getSettings);
router.put('/', protect, authorize('admin'), updateSettings);

module.exports = router;

