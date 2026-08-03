const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  registerStudent,
  registerTeacher,
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  sendOTP,
  verifyOTP,
  resendOTP
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Validation rules
const registerRules = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const loginRules = [
  body('password').notEmpty().withMessage('Password is required')
];

// Unified Register & Role-specific Register (for backwards compatibility/tests)
router.post('/register', registerRules, registerUser);
router.post('/student/register', registerRules, registerStudent);
router.post('/teacher/register', registerRules, registerTeacher);

// Login & Logout
router.post('/login', loginRules, loginUser);
router.post('/logout', logoutUser);

// OTP Verification Public Endpoints
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

// Password recovery
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Profile (Protected)
router.get('/profile', protect, getProfile);
router.put('/profile', protect, upload.single('avatar'), updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
