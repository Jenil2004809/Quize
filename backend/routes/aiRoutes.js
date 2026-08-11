const express = require('express');
const router = express.Router();
const {
  generateAIQuiz,
  explainQuestionWithAI,
  getAdaptiveQuestions,
  chatWithAI
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const admin = require('../middleware/admin');

// All AI endpoints are protected with JWT auth
router.use(protect);

router.post('/generate-quiz', generateAIQuiz);
router.post('/explain-question', explainQuestionWithAI);
router.get('/adaptive-questions/:quizId', getAdaptiveQuestions);
router.post('/chat', chatWithAI);

module.exports = router;
