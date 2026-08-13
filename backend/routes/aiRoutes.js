const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const {
  generateAIQuiz,
  explainQuestionWithAI,
  getAdaptiveQuestions,
  chatWithAI,
  scanToQuiz
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

// All AI endpoints are protected with JWT auth
router.use(protect);

router.post('/generate-quiz', generateAIQuiz);
router.post('/explain-question', explainQuestionWithAI);
router.get('/adaptive-questions/:quizId', getAdaptiveQuestions);
router.post('/chat', chatWithAI);
router.post('/scan-to-quiz', upload.single('file'), scanToQuiz);

module.exports = router;
