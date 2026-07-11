const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateOTP, sendOTPEmail } = require('../utils/otp');

// Helper to sign JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwtkey12345!', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// @desc    Register a new user (Student or Teacher)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Create user (pre-save hook hashes password)
    const otpCode = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins validity

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      otp: otpCode,
      otpExpires,
      isEmailVerified: false
    });

    // Send OTP verification email
    await sendOTPEmail(user.email, otpCode, 'verification');

    // Create token
    const token = signToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Registration successful! An OTP code has been sent to your email.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        isEmailVerified: user.isEmailVerified,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate User & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check if teacher is approved
    if (user.role === 'teacher' && !user.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Your teacher account is pending administrator approval. You will receive an email once approved.'
      });
    }

    const token = signToken(user._id);

    return res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        isEmailVerified: user.isEmailVerified,
        avatar: user.avatar,
        bookmarks: user.bookmarks
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP for email activation
// @route   POST /api/auth/verify-otp
// @access  Private
const verifyOTP = async (req, res, next) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ success: false, message: 'Please provide the OTP code' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'Email is already verified' });
    }

    // Check if OTP matches and has not expired
    if (user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP code' });
    }

    // Activate email verification
    user.isEmailVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    return res.json({
      success: true,
      message: 'Email address verified successfully!',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        isEmailVerified: user.isEmailVerified,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend Email Verification OTP
// @route   POST /api/auth/resend-otp
// @access  Private
const resendOTP = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'Email is already verified' });
    }

    const otpCode = generateOTP();
    user.otp = otpCode;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOTPEmail(user.email, otpCode, 'verification');

    return res.json({ success: true, message: 'Verification OTP has been resent to your email.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password - Request reset link OTP
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user registered with this email address' });
    }

    const otpCode = generateOTP();
    user.otp = otpCode;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOTPEmail(user.email, otpCode, 'reset');

    return res.json({ success: true, message: 'A password reset OTP has been sent to your email.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password using OTP code
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide all details (email, otp, new password)' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP code' });
    }

    // Set new password
    user.password = newPassword;
    user.otp = null;
    user.otpExpires = null;
    await user.save(); // pre-save will hash the password

    return res.json({ success: true, message: 'Password has been reset successfully! You can now login.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    return res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile details
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (avatar) user.avatar = avatar;

    // Handle avatar upload via file upload directly (if sent by multer, it goes to profile-avatar routes)
    if (req.file) {
      user.avatar = `/uploads/${req.file.filename}`;
    }

    await user.save();

    return res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        isEmailVerified: user.isEmailVerified,
        avatar: user.avatar,
        bookmarks: user.bookmarks
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new password' });
    }

    const user = await User.findById(req.user._id);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    return res.json({ success: true, message: 'Password changed successfully!' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyOTP,
  resendOTP,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  changePassword
};
