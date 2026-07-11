const express = require('express');
const router = express.Router();
const {
  getQuizLeaderboard,
  getGlobalLeaderboard
} = require('../controllers/leaderboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getGlobalLeaderboard);
router.get('/:quizId', protect, getQuizLeaderboard);

module.exports = router;
