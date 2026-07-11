const express = require('express');
const router = express.Router();
const {
  submitQuiz,
  getStudentResults,
  getQuizResults,
  getResultById
} = require('../controllers/resultController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/submit', protect, submitQuiz);
router.get('/student/:studentId', protect, getStudentResults);
router.get('/quiz/:quizId', protect, authorize('teacher', 'admin'), getQuizResults);
router.get('/:id', protect, getResultById);

module.exports = router;
