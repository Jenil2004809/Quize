const User = require('../models/User');
const Quiz = require('../models/Quiz');
const Result = require('../models/Result');
const Certificate = require('../models/Certificate');
const Notification = require('../models/Notification');

// @desc    Get all users with role filter
// @route   GET /api/users
// @access  Private (Admin)
const getUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const query = {};

    if (role) {
      query.role = role;
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    return res.json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve teacher account
// @route   PUT /api/users/approve-teacher/:id
// @access  Private (Admin)
const approveTeacher = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role !== 'teacher') {
      return res.status(400).json({ success: false, message: 'Only teacher accounts require approval' });
    }

    user.isApproved = true;
    await user.save();

    // Notify the teacher
    await Notification.create({
      recipientId: user._id,
      title: 'Account Approved! 🔓',
      message: 'Your teacher account has been approved by the administrator. You can now create and manage quizzes!',
      type: 'teacher_approved'
    });

    return res.json({ success: true, message: `Teacher ${user.name} approved successfully!`, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account (Cascades to remove user traces)
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userId = user._id;

    if (user.role === 'teacher') {
      // Find all quizzes by this teacher
      const quizzes = await Quiz.find({ creator: userId });
      const quizIds = quizzes.map(q => q._id);

      // Delete results and certificates for these quizzes
      await Result.deleteMany({ quizId: { $in: quizIds } });
      await Certificate.deleteMany({ quizId: { $in: quizIds } });

      // Delete quizzes
      await Quiz.deleteMany({ creator: userId });
    } else if (user.role === 'student') {
      // Delete results and certificates earned by this student
      await Result.deleteMany({ studentId: userId });
      await Certificate.deleteMany({ studentId: userId });
    }

    // Delete user notifications
    await Notification.deleteMany({ recipientId: userId });

    // Finally delete the user
    await user.deleteOne();

    return res.json({ success: true, message: `User account (${user.name}) and all associated records deleted successfully.` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  approveTeacher,
  deleteUser
};
