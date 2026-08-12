const express = require('express');
const router = express.Router();
const {
  getPolicyViolations,
  getPolicyViolationById,
  approvePolicyViolation,
  rejectPolicyViolation,
  deletePolicyViolation,
  getStudentQuizStatus
} = require('../controllers/policyViolationController');
const { protect } = require('../middleware/auth');
const admin = require('../middleware/admin');

// Protected Student Quiz Status Route
router.get('/student/quiz-status/:quizId', protect, getStudentQuizStatus);

// Admin Only Routes
router.get('/admin/policy-violations', protect, admin, getPolicyViolations);
router.get('/admin/policy-violations/:id', protect, admin, getPolicyViolationById);
router.put('/admin/policy-violations/:id/approve', protect, admin, approvePolicyViolation);
router.put('/admin/policy-violations/:id/reject', protect, admin, rejectPolicyViolation);
router.delete('/admin/policy-violations/:id', protect, admin, deletePolicyViolation);

module.exports = router;
