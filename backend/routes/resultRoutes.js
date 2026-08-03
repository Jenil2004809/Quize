const express = require('express');
const router = express.Router();
const {
  submitQuiz,
  getStudentResults,
  getQuizResults,
  getTeacherAllResults,
  getResultById
} = require('../controllers/resultController');
const { protect } = require('../middleware/auth');

router.use(protect);

// Submit quiz
router.post('/submit', submitQuiz);

// Get results history
router.get('/student/:studentId', getStudentResults);
router.get('/quiz/:quizId', getQuizResults);
router.get('/teacher/all', getTeacherAllResults);
router.get('/:id', getResultById);

module.exports = router;
