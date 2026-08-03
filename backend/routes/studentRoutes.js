const express = require('express');
const router = express.Router();
const {
  toggleBookmark,
  getBookmarks,
  getQuizHistory,
  getGlobalLeaderboard,
  getQuizLeaderboard
} = require('../controllers/studentController');
const { protect } = require('../middleware/auth');

router.use(protect);

// Bookmarks
router.get('/bookmarks', getBookmarks);
router.post('/bookmarks/:quizId', toggleBookmark);

// Attempt History
router.get('/history', getQuizHistory);

// Leaderboards
router.get('/leaderboard', getGlobalLeaderboard);
router.get('/leaderboard/:quizId', getQuizLeaderboard);

module.exports = router;
