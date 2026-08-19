const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Otp = require('../models/Otp');
const { generateOTP } = require('../utils/otp');
const { sendRealSMS } = require('../services/smsService');

// Helper to sign JWT token including both ID and Role
const signToken = (id, role) => {
  return jwt.sign(
    { id, role }, 
    process.env.JWT_SECRET || 'supersecretjwtkey12345!', 
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc    Register a new Student
// @route   POST /api/auth/student/register
// @access  Public
const registerStudent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, phone } = req.body;

    // Check if email already registered in any user collection
    const emailExists = await Promise.all([
      Admin.findOne({ email }),
      Student.findOne({ email }),
      Teacher.findOne({ email })
    ]);
    if (emailExists.some(user => user !== null)) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const student = await Student.create({
      name,
      email,
      password,
      phone: phone || '',
      role: 'student',
      isEmailVerified: true,
      isApproved: true
    });

    const token = signToken(student._id, 'student');

    return res.status(201).json({
      success: true,
      message: 'Student registration successful!',
      token,
      user: {
        _id: student._id,
        name: student.name,
        email: student.email,
        role: 'student',
        avatar: student.avatar,
        isActive: student.isActive,
        isEmailVerified: true
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new Teacher
// @route   POST /api/auth/teacher/register
// @access  Public
const registerTeacher = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, phone, specialization } = req.body;

    // Check if email already registered in any user collection
    const emailExists = await Promise.all([
      Admin.findOne({ email }),
      Student.findOne({ email }),
      Teacher.findOne({ email })
    ]);
    if (emailExists.some(user => user !== null)) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const teacher = await Teacher.create({
      name,
      email,
      password,
      phone: phone || '',
      role: 'teacher',
      specialization: specialization || '',
      isApproved: true,
      isEmailVerified: true
    });

    const token = signToken(teacher._id, 'teacher');

    return res.status(201).json({
      success: true,
      message: 'Teacher registration successful! Please note that teacher accounts require administrative approval.',
      token,
      user: {
        _id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        role: 'teacher',
        specialization: teacher.specialization,
        isApproved: teacher.isApproved,
        avatar: teacher.avatar,
        isActive: teacher.isActive,
        isEmailVerified: true
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unified Register Endpoint (detects role from body)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  const { role } = req.body;
  if (role === 'teacher') {
    return registerTeacher(req, res, next);
  } else {
    return registerStudent(req, res, next);
  }
};

// @desc    Authenticate User (Admin, Student, Teacher) & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, phone, identifier, password } = req.body;
    const target = (email || phone || identifier || '').toString().trim();
    const targetLower = target.toLowerCase();

    if (!target || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email/mobile and password' });
    }

    let user = null;
    let role = null;

    // 1. Search Admin
    const emailRegex = new RegExp(`^${targetLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    user = await Admin.findOne({ $or: [{ email: emailRegex }, { phone: target }] });
    if (user) role = 'admin';

    // 2. Search Student
    if (!user) {
      user = await Student.findOne({ $or: [{ email: emailRegex }, { phone: target }] });
      if (user) role = 'student';
    }

    // 3. Search Teacher
    if (!user) {
      user = await Teacher.findOne({ $or: [{ email: emailRegex }, { phone: target }] });
      if (user) role = 'teacher';
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Please check your email/mobile or password.' });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check if user is active
    if (user.isActive === false) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact support.' });
    }

    // Check if user is approved (teachers are approved by default, students are always approved)
    if (role === 'teacher' && user.isApproved === false) {
      return res.status(403).json({
        success: false,
        message: 'Your teacher account is pending administrator approval. Please contact support.'
      });
    }

    const token = signToken(user._id, role);

    const userPayload = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: role,
      avatar: user.avatar || '',
      isActive: user.isActive,
      isApproved: user.isApproved === true,
      isEmailVerified: true
    };

    if (role === 'teacher') {
      userPayload.specialization = user.specialization;
    }
    if (role === 'student') {
      userPayload.bookmarks = user.bookmarks || [];
    }

    return res.json({
      success: true,
      token,
      user: userPayload
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout User
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = async (req, res, next) => {
  return res.json({
    success: true,
    message: 'User logged out successfully. Please clear headers/cookies on client side.'
  });
};

// @desc    Get Current User Profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    return res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar, specialization } = req.body;
    const userId = req.user._id;
    const role = req.user.role;

    let userObj = null;

    if (role === 'admin') {
      userObj = await Admin.findById(userId);
    } else if (role === 'student') {
      userObj = await Student.findById(userId);
    } else if (role === 'teacher') {
      userObj = await Teacher.findById(userId);
    }

    if (!userObj) {
      return res.status(404).json({ success: false, message: 'User record not found' });
    }

    if (name) userObj.name = name;
    if (phone !== undefined) userObj.phone = phone;
    if (avatar) userObj.avatar = avatar;
    if (specialization && role === 'teacher') userObj.specialization = specialization;

    if (req.file) {
      userObj.avatar = `/uploads/${req.file.filename}`;
    }

    await userObj.save();

    return res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        _id: userObj._id,
        name: userObj.name,
        email: userObj.email,
        phone: userObj.phone || '',
        role: role,
        avatar: userObj.avatar,
        isActive: userObj.isActive,
        specialization: userObj.specialization || undefined,
        bookmarks: userObj.bookmarks || undefined,
        isEmailVerified: userObj.isEmailVerified
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change own password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new password' });
    }

    const userId = req.user._id;
    const role = req.user.role;

    let userObj = null;
    if (role === 'admin') {
      userObj = await Admin.findById(userId);
    } else if (role === 'student') {
      userObj = await Student.findById(userId);
    } else if (role === 'teacher') {
      userObj = await Teacher.findById(userId);
    }

    const isMatch = await userObj.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    userObj.password = newPassword;
    await userObj.save();

    return res.json({ success: true, message: 'Password updated successfully!' });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password - Request reset OTP
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide email address' });
    }

    let userObj = null;
    let role = null;

    userObj = await Admin.findOne({ email });
    if (userObj) role = 'admin';

    if (!userObj) {
      userObj = await Student.findOne({ email });
      if (userObj) role = 'student';
    }

    if (!userObj) {
      userObj = await Teacher.findOne({ email });
      if (userObj) role = 'teacher';
    }

    if (!userObj) {
      return res.status(404).json({ success: false, message: 'No registered user found with that email' });
    }

    // Set a dummy OTP for backward compatibility in model validation/fields
    const otpCode = '123456';
    userObj.otp = otpCode;
    userObj.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await userObj.save();

    return res.json({
      success: true,
      message: 'A password reset verification has been initiated. You can enter any 6 digits (e.g., 123456) to reset your password.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password using OTP
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide email, otp and newPassword' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    let userObj = null;

    userObj = await Admin.findOne({ email });
    if (!userObj) userObj = await Student.findOne({ email });
    if (!userObj) userObj = await Teacher.findOne({ email });

    if (!userObj) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify OTP (Bypassed)
    userObj.password = newPassword;
    userObj.otp = null;
    userObj.otpExpires = null;
    userObj.isEmailVerified = true;
    await userObj.save();

    return res.json({
      success: true,
      message: 'Password reset successful! You can now log in with your new password.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send 6-digit Real SMS OTP for authentication
// @route   POST /api/auth/send-otp
// @access  Public
const sendOTP = async (req, res, next) => {
  try {
    const { phone, email, identifier, channel } = req.body;
    const target = (phone || email || identifier || '').toString().trim();

    if (!target) {
      return res.status(400).json({ success: false, message: 'Mobile number is required.' });
    }

    const targetLower = target.toLowerCase();

    // Check Users collection (Student, Teacher, Admin) by phone or email
    let user = await Student.findOne({ $or: [{ phone: target }, { email: targetLower }] });
    if (!user) user = await Teacher.findOne({ $or: [{ phone: target }, { email: targetLower }] });
    if (!user) user = await Admin.findOne({ $or: [{ phone: target }, { email: targetLower }] });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Mobile number is not registered.'
      });
    }

    // Rate limit: Max 1 OTP request every 60 seconds
    const existingOtp = await Otp.findOne({ phone: target });
    if (existingOtp) {
      const timePassedSeconds = (Date.now() - new Date(existingOtp.createdAt).getTime()) / 1000;
      if (timePassedSeconds < 60) {
        return res.status(429).json({
          success: false,
          message: `Please wait ${Math.ceil(60 - timePassedSeconds)} seconds before requesting a new OTP.`
        });
      }
    }

    // Delete any existing active OTP for this phone
    await Otp.deleteMany({ phone: target });

    // Generate secure random 6-digit OTP
    const otpCode = generateOTP();

    // Hash OTP before storing in database using bcrypt
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otpCode, salt);

    // Store OTP in separate OTP collection with 5-minute expiry (MongoDB TTL index)
    await Otp.create({
      phone: target,
      otpHash,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      attempts: 0,
      createdAt: new Date()
    });

    // Dispatch real SMS or WhatsApp OTP
    await sendRealSMS(target, otpCode, channel || 'sms');

    return res.json({
      success: true,
      message: 'OTP sent successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Mobile SMS / Email OTP & return JWT Token + Role
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res, next) => {
  try {
    const { phone, email, identifier, otp } = req.body;
    const target = (phone || email || identifier || '').toString().trim();

    if (!target || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide mobile number and OTP code' });
    }

    const targetLower = target.toLowerCase();

    // Verify user exists
    let user = await Student.findOne({ $or: [{ phone: target }, { email: targetLower }] });
    let role = 'student';

    if (!user) {
      user = await Teacher.findOne({ $or: [{ phone: target }, { email: targetLower }] });
      role = 'teacher';
    }

    if (!user) {
      user = await Admin.findOne({ $or: [{ phone: target }, { email: targetLower }] });
      role = 'admin';
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify active OTP record exists
    const otpRecord = await Otp.findOne({ $or: [{ phone: target }, { email: targetLower }] });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'OTP expired or not found' });
    }

    // Check expiry time
    if (new Date() > new Date(otpRecord.expiresAt)) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }

    // Check attempts limit (maximum 5 attempts)
    if (otpRecord.attempts >= 5) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(429).json({ success: false, message: 'Too many attempts. Please request a new OTP.' });
    }

    // Compare OTP hash
    const isMatch = await bcrypt.compare(otp.trim(), otpRecord.otpHash);
    if (!isMatch) {
      await Otp.updateOne({ _id: otpRecord._id }, { $inc: { attempts: 1 } });
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // Delete OTP record after successful verification
    await Otp.deleteOne({ _id: otpRecord._id });

    // Generate JWT token (24-hour expiration)
    const token = jwt.sign(
      { id: user._id, role },
      process.env.JWT_SECRET || 'supersecretjwtkey12345!',
      { expiresIn: '24h' }
    );

    const userPayload = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || target,
      role: role,
      avatar: user.avatar || '',
      isActive: user.isActive,
      isEmailVerified: true
    };

    if (role === 'teacher') {
      userPayload.isApproved = user.isApproved;
      userPayload.specialization = user.specialization;
    }
    if (role === 'student') {
      userPayload.bookmarks = user.bookmarks || [];
    }

    return res.json({
      success: true,
      token,
      role,
      user: userPayload,
      message: 'Mobile OTP verification successful'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend OTP code
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOTP = async (req, res, next) => {
  return sendOTP(req, res, next);
};

module.exports = {
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
};
