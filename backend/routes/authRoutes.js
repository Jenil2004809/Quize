const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  verifyOTP,
  resendOTP,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  changePassword
} = require('../controllers/authController');
const { registerRules, loginRules } = require('../validators/authValidator');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');
const upload = require('../middleware/uploadMiddleware');

router.post('/register', authLimiter, registerRules, registerUser);
router.post('/login', authLimiter, loginRules, loginUser);
router.post('/verify-otp', protect, verifyOTP);
router.post('/resend-otp', protect, resendOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/profile', protect, getProfile);
router.put('/profile', protect, upload.single('avatar'), updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
