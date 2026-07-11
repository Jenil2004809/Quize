const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - Verify JWT
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey12345!');

      // Get user from the token, excluding password
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User session not found' });
      }

      next();
    } catch (error) {
      console.error('JWT Verification Error:', error);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

// Authorize roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role (${req.user ? req.user.role : 'Guest'}) is not authorized to access this resource`
      });
    }
    next();
  };
};

// Check if user is approved (especially for teachers)
const verifyApproved = (req, res, next) => {
  if (!req.user || !req.user.isApproved) {
    return res.status(403).json({
      success: false,
      message: 'Your account is pending administrative approval. Please contact support.'
    });
  }
  next();
};

module.exports = {
  protect,
  authorize,
  verifyApproved
};
