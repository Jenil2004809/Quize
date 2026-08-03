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
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public endpoints
router.get('/', getQuizzes);
router.get('/:id', getQuizById);

// Protected endpoints (Students / Teachers / Admins)
router.get('/creator/all', protect, getCreatorQuizzes);
router.post('/:id/bookmark', protect, bookmarkQuiz);

// Quiz Management (Teachers / Admins)
router.post('/', protect, upload.single('thumbnail'), createQuiz);
router.put('/:id', protect, upload.single('thumbnail'), updateQuiz);
router.delete('/:id', protect, deleteQuiz);
router.put('/:id/publish', protect, togglePublishQuiz);

// Questions Management (Teachers / Admins)
router.get('/:id/questions', protect, getQuestionsForQuiz);
router.post('/:id/questions', protect, upload.single('image'), createQuestion);
router.put('/questions/:id', protect, upload.single('image'), updateQuestion);
router.delete('/questions/:id', protect, deleteQuestion);
router.post('/:id/import-questions', protect, importQuestions);

module.exports = router;
