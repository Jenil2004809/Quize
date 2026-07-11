const express = require('express');
const router = express.Router();
const {
  getQuizzes,
  getCreatorQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  togglePublishQuiz,
  bookmarkQuiz
} = require('../controllers/quizController');
const {
  getQuestionsForQuiz,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  importQuestions
} = require('../controllers/questionController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Quiz CRUD Routes
router.get('/', getQuizzes);
router.get('/creator', protect, authorize('teacher', 'admin'), getCreatorQuizzes);
router.get('/:id', getQuizById);
router.post('/', protect, authorize('teacher', 'admin'), upload.single('thumbnail'), createQuiz);
router.put('/:id', protect, authorize('teacher', 'admin'), upload.single('thumbnail'), updateQuiz);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteQuiz);
router.put('/:id/publish', protect, authorize('teacher', 'admin'), togglePublishQuiz);
router.post('/:id/bookmark', protect, bookmarkQuiz);

// Question Management nested inside Quiz Routes
router.get('/:id/questions', protect, getQuestionsForQuiz);
router.post('/:id/questions', protect, authorize('teacher', 'admin'), upload.single('image'), createQuestion);
router.post('/:id/import-questions', protect, authorize('teacher', 'admin'), importQuestions);

// Question operations outside specific quiz context
router.put('/questions/:id', protect, authorize('teacher', 'admin'), upload.single('image'), updateQuestion);
router.delete('/questions/:id', protect, authorize('teacher', 'admin'), deleteQuestion);

module.exports = router;
