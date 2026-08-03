const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey12345!');

      // Find user based on role in JWT token
      let user = null;
      if (decoded.role === 'admin') {
        user = await Admin.findById(decoded.id).select('-password');
      } else if (decoded.role === 'student') {
        user = await Student.findById(decoded.id).select('-password');
      } else if (decoded.role === 'teacher') {
        user = await Teacher.findById(decoded.id).select('-password');
      }

      if (!user) {
        return res.status(401).json({ success: false, message: 'User session not found or account deactivated' });
      }

      // Check if user is active (applies to admin, student, teacher)
      if (user.isActive === false) {
        return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact support.' });
      }

      // Check if user is approved (applies to teacher when explicitly set to false)
      if (user.role === 'teacher' && user.isApproved === false) {
        return res.status(403).json({ success: false, message: 'Your teacher account is pending administrator approval.' });
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (error) {
      console.error('JWT verification error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };
