const express = require('express');
const router = express.Router();
const {
  getMyQuizzes,
  getStudentResults,
  getReportsData
} = require('../controllers/teacherController');
const { protect } = require('../middleware/auth');

router.use(protect);

// My Quizzes
router.get('/quizzes', getMyQuizzes);

// Results on My Quizzes
router.get('/results', getStudentResults);

// Performance Reports
router.get('/reports', getReportsData);

module.exports = router;
