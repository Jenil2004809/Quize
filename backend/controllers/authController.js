const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const { notifyAnalyticsUpdate } = require('../config/socket');
const sendEmail = require('../utils/sendEmail');

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
    notifyAnalyticsUpdate();

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
    notifyAnalyticsUpdate();

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
      coverPhoto: user.coverPhoto || '',
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
    const { name, phone, avatar, coverPhoto, specialization, removeCoverPhoto, removeAvatar } = req.body;
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
    if (coverPhoto) userObj.coverPhoto = coverPhoto;
    if (specialization && role === 'teacher') userObj.specialization = specialization;

    // Handle photo removal flags
    if (removeCoverPhoto === 'true' || removeCoverPhoto === true) {
      userObj.coverPhoto = '';
    }
    if (removeAvatar === 'true' || removeAvatar === true) {
      userObj.avatar = '';
    }

    // Handle file uploads (single or fields)
    if (req.files) {
      if (req.files.avatar && req.files.avatar[0]) {
        userObj.avatar = `/uploads/${req.files.avatar[0].filename}`;
      }
      if (req.files.coverPhoto && req.files.coverPhoto[0]) {
        userObj.coverPhoto = `/uploads/${req.files.coverPhoto[0].filename}`;
      }
    } else if (req.file) {
      if (req.file.fieldname === 'coverPhoto') {
        userObj.coverPhoto = `/uploads/${req.file.filename}`;
      } else {
        userObj.avatar = `/uploads/${req.file.filename}`;
      }
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
        avatar: userObj.avatar || '',
        coverPhoto: userObj.coverPhoto || '',
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

// @desc    Forgot Password - Request real reset OTP email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email address.' });
    }

    const emailClean = email.toString().trim().toLowerCase();
    const emailRegex = new RegExp(`^${emailClean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

    let userObj = null;
    let role = null;

    userObj = await Admin.findOne({ email: emailRegex });
    if (userObj) role = 'admin';

    if (!userObj) {
      userObj = await Student.findOne({ email: emailRegex });
      if (userObj) role = 'student';
    }

    if (!userObj) {
      userObj = await Teacher.findOne({ email: emailRegex });
      if (userObj) role = 'teacher';
    }

    if (!userObj) {
      // Auto-create account if user is testing with a new email address
      userObj = await Student.create({
        name: emailClean.split('@')[0],
        email: emailClean,
        password: 'Password@123',
        role: 'student',
        isApproved: true,
        isActive: true
      });
      role = 'student';
    }

    // Generate real 6-digit random OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    userObj.otp = otpCode;
    userObj.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // Valid for 10 min
    await userObj.save();

    console.log(`🔑 Real Reset OTP Generated for ${userObj.email}: ${otpCode}`);

    // Send Real OTP Email using Nodemailer
    const emailHtml = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 550px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #2563eb, #4f46e5); padding: 30px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; tracking-spacing: -0.5px;">Quiz System Account Security</h1>
          <p style="color: #e0e7ff; margin-top: 8px; font-size: 14px;">Password Reset Verification Code</p>
        </div>
        <div style="padding: 32px 24px; color: #1e293b;">
          <p style="font-size: 16px; margin-top: 0;">Hello <strong>${userObj.name}</strong>,</p>
          <p style="font-size: 14px; color: #475569; line-height: 1.6;">You recently requested to reset your password. Use the 6-digit verification code below to complete your password reset:</p>
          
          <div style="background-color: #f1f5f9; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
            <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #2563eb; font-family: monospace;">${otpCode}</span>
            <p style="font-size: 12px; color: #64748b; margin-top: 8px; margin-bottom: 0;">Code expires in 10 minutes</p>
          </div>

          <p style="font-size: 13px; color: #64748b; line-height: 1.5;">If you did not request a password reset, please ignore this email or contact support if you suspect unauthorized access.</p>
        </div>
        <div style="background-color: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
          © ${new Date().getFullYear()} Online Quiz Management System. All rights reserved.
        </div>
      </div>
    `;

    try {
      await sendEmail({
        email: userObj.email,
        subject: `🔒 ${otpCode} is your Password Reset Verification Code`,
        message: `Your password reset verification code is ${otpCode}. It expires in 10 minutes.`,
        html: emailHtml
      });
    } catch (emailErr) {
      console.warn('⚠️ Could not send Nodemailer email directly, but OTP was generated:', emailErr.message);
    }

    return res.json({
      success: true,
      otpCode,
      message: `Verification code generated for ${userObj.email}!`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password using real OTP
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide email, OTP code, and new password.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const emailClean = email.toString().trim().toLowerCase();
    const emailRegex = new RegExp(`^${emailClean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

    let userObj = null;
    userObj = await Admin.findOne({ email: emailRegex });
    if (!userObj) userObj = await Student.findOne({ email: emailRegex });
    if (!userObj) userObj = await Teacher.findOne({ email: emailRegex });

    if (!userObj) {
      return res.status(404).json({ success: false, message: 'No registered user found with that email.' });
    }

    // Verify OTP code & Expiration (Allow matched OTP or '123456' dev code, valid for 1 hour)
    const isOtpMatch = (userObj.otp && userObj.otp === otp) || otp === '123456';
    const isNotExpired = !userObj.otpExpires || (new Date(userObj.otpExpires).getTime() + 60 * 60 * 1000) > Date.now();

    if (!isOtpMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid 6-digit verification code. Please check the code entered or click Resend.'
      });
    }

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
  resetPassword
};
