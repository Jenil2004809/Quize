const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingController');
const { protect } = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/', getSettings);
router.put('/', protect, admin, updateSettings);

module.exports = router;
