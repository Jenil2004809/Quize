const express = require('express');
const router = express.Router();
const { getDashboardAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.get('/dashboard', protect, getDashboardAnalytics);

module.exports = router;
