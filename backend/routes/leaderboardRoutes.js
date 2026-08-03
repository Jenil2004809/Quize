const express = require('express');
const router = express.Router();
const { getGlobalLeaderboard, getQuizLeaderboard } = require('../controllers/studentController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getGlobalLeaderboard);
router.get('/:quizId', getQuizLeaderboard);

module.exports = router;
