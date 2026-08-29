const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Admin = require('../models/Admin');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Result = require('../models/Result');
const Category = require('../models/Category');
const Subject = require('../models/Subject');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');
const { getActiveUsersCount, notifyAnalyticsUpdate } = require('../config/socket');

// @desc    Get Admin Dashboard Analytics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getDashboardStats = async (req, res, next) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalTeachers = await Teacher.countDocuments();
    const pendingTeachers = await Teacher.countDocuments({ isApproved: false });
    const totalQuizzes = await Quiz.countDocuments();
    const totalQuestions = await Question.countDocuments();
    const totalAttempts = await Result.countDocuments();

    // Latest users (combining Students and Teachers sorted by createdAt)
    const latestStudents = await Student.find().sort({ createdAt: -1 }).limit(5).select('-password');
    const latestTeachers = await Teacher.find().sort({ createdAt: -1 }).limit(5).select('-password');
    const latestQuizzes = await Quiz.find().sort({ createdAt: -1 }).limit(5).populate('category', 'name');

    // Category breakdown
    const categories = await Category.find();
    const categoryData = await Promise.all(categories.map(async (cat) => {
      const count = await Quiz.countDocuments({ category: cat._id });
      return {
        category: cat.name,
        count
      };
    }));

    // Registration timeline (grouping counts of students + teachers by month for last 6 months)
    const studentsList = await Student.find().select('createdAt');
    const teachersList = await Teacher.find().select('createdAt');
    
    const monthlyRegMap = {};
    const processDates = (list) => {
      list.forEach(u => {
        const month = u.createdAt.toLocaleString('default', { month: 'short', year: '2-digit' });
        monthlyRegMap[month] = (monthlyRegMap[month] || 0) + 1;
      });
    };
    processDates(studentsList);
    processDates(teachersList);

    const timelineData = Object.keys(monthlyRegMap).map(month => ({
      month,
      registrations: monthlyRegMap[month]
    }));

    // Quiz attempts by month
    const attemptsByMonth = await Result.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          attempts: { $sum: 1 },
          averagePercentage: { $avg: '$percentage' }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 6 }
    ]);

    const performanceData = attemptsByMonth.map(item => ({
      month: item._id,
      attempts: item.attempts,
      averagePercentage: parseFloat((item.averagePercentage || 0).toFixed(2))
    }));

    return res.json({
      success: true,
      stats: {
        totalStudents,
        totalTeachers,
        pendingTeachers,
        totalQuizzes,
        totalQuestions,
        totalAttempts,
        activeUsers: getActiveUsersCount() || 1,
        systemStatus: 'Operational'
      },
      latestUsers: {
        students: latestStudents,
        teachers: latestTeachers
      },
      latestQuizzes,
      timelineData,
      categoryData,
      performanceData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Students with search and filter
// @route   GET /api/admin/students
// @access  Private (Admin)
const getStudents = async (req, res, next) => {
  try {
    const { search, isActive } = req.query;
    const query = {};

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await Student.find(query).select('-password').sort({ createdAt: -1 });
    return res.json({ success: true, count: students.length, students });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Student by ID with full statistics
// @route   GET /api/admin/students/:id
// @access  Private (Admin)
const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).select('-password');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const attempts = await Result.find({ studentId: student._id })
      .populate('quizId', 'title category difficulty')
      .sort({ createdAt: -1 });

    const totalAttempts = attempts.length;
    const passedAttempts = attempts.filter(a => a.passed).length;
    const averagePercentage = totalAttempts > 0
      ? parseFloat((attempts.reduce((sum, a) => sum + a.percentage, 0) / totalAttempts).toFixed(2))
      : 0;

    return res.json({
      success: true,
      student,
      stats: {
        totalAttempts,
        passedAttempts,
        failedAttempts: totalAttempts - passedAttempts,
        averagePercentage
      },
      history: attempts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Teachers with search/filters
// @route   GET /api/admin/teachers
// @access  Private (Admin)
const getTeachers = async (req, res, next) => {
  try {
    const { search, isApproved, isActive } = req.query;
    const query = {};

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    if (isApproved !== undefined) {
      query.isApproved = isApproved === 'true';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const teachers = await Teacher.find(query).select('-password').sort({ createdAt: -1 });
    return res.json({ success: true, count: teachers.length, teachers });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Teacher by ID
// @route   GET /api/admin/teachers/:id
// @access  Private (Admin)
const getTeacherById = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id).select('-password');
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    const quizzes = await Quiz.find({ creator: teacher._id }).populate('category', 'name');

    return res.json({
      success: true,
      teacher,
      stats: {
        quizzesCreated: quizzes.length
      },
      quizzes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve a Teacher account
// @route   PUT /api/admin/teachers/:id/approve
// @access  Private (Admin)
const approveTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    teacher.isApproved = true;
    teacher.isActive = true;
    await teacher.save();

    // Create system notification
    await Notification.create({
      recipientId: teacher._id,
      recipientModel: 'Teacher',
      title: 'Teacher Account Approved! 🎉',
      message: 'Your account has been approved by the administrator. You can now login and manage quizzes.',
      type: 'teacher_approved'
    });

    notifyAnalyticsUpdate();

    return res.json({
      success: true,
      message: `Teacher account for ${teacher.name} has been approved.`,
      teacher
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject / Suspend a Teacher account
// @route   PUT /api/admin/teachers/:id/reject
// @access  Private (Admin)
const rejectTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    teacher.isApproved = false;
    await teacher.save();

    notifyAnalyticsUpdate();

    return res.json({
      success: true,
      message: `Teacher account for ${teacher.name} has been suspended/rejected.`,
      teacher
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle Activation Status of User (Student or Teacher)
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private (Admin)
const toggleUserStatus = async (req, res, next) => {
  try {
    const { role } = req.body; // 'student' or 'teacher'
    let user = null;

    if (role === 'student') {
      user = await Student.findById(req.params.id);
    } else if (role === 'teacher') {
      user = await Teacher.findById(req.params.id);
    } else {
      return res.status(400).json({ success: false, message: 'Role must be student or teacher' });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    return res.json({
      success: true,
      message: `User status changed. Active: ${user.isActive}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Force Reset User Password
// @route   PUT /api/admin/users/:id/reset-password
// @access  Private (Admin)
const resetUserPassword = async (req, res, next) => {
  try {
    const { role, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password is required (min 6 characters)' });
    }

    let user = null;
    if (role === 'student') {
      user = await Student.findById(req.params.id);
    } else if (role === 'teacher') {
      user = await Teacher.findById(req.params.id);
    } else {
      return res.status(400).json({ success: false, message: 'Role must be student or teacher' });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    return res.json({
      success: true,
      message: `Password for ${user.name} was successfully reset by Admin.`
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const id = req.params.id;

    // Check if user is a student
    const student = await Student.findById(id);
    if (student) {
      // Cascade deletes for results and notifications
      await Result.deleteMany({ studentId: id });
      await Notification.deleteMany({ recipientId: id, recipientModel: 'Student' });
      await student.deleteOne();

      return res.json({ success: true, message: 'Student and related results deleted successfully.' });
    }

    // Check if user is a teacher
    const teacher = await Teacher.findById(id);
    if (teacher) {
      // Cascade deletes: Find quizzes created by this teacher
      const quizzes = await Quiz.find({ creator: id });
      const quizIds = quizzes.map(q => q._id);

      // Delete results, questions, quizzes, and notifications
      await Result.deleteMany({ quizId: { $in: quizIds } });
      await Question.deleteMany({ quizId: { $in: quizIds } });
      await Quiz.deleteMany({ creator: id });
      await Notification.deleteMany({ recipientId: id, recipientModel: 'Teacher' });

      await teacher.deleteOne();
      notifyAnalyticsUpdate();

      return res.json({ success: true, message: 'Teacher, quizzes, and related quiz data deleted successfully.' });
    }

    return res.status(404).json({ success: false, message: 'User not found in Student or Teacher collections.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get List of Database Collections
// @route   GET /api/admin/database/collections
// @access  Private (Admin)
const getDatabaseCollections = async (req, res, next) => {
  try {
    const collections = Object.keys(mongoose.connection.collections);
    return res.json({ success: true, count: collections.length, collections });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Records of a specific collection
// @route   GET /api/admin/database/collections/:name
// @access  Private (Admin)
const getCollectionRecords = async (req, res, next) => {
  try {
    const name = req.params.name;
    const dbCollection = mongoose.connection.collections[name];

    if (!dbCollection) {
      return res.status(404).json({ success: false, message: `Collection ${name} not found` });
    }

    const records = await dbCollection.find({}).limit(100).toArray();
    return res.json({ success: true, count: records.length, records });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or Reject any user (Student or Teacher)
// @route   PUT /api/users/:id/approve
// @access  Private (Admin)
const approveUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    let user = await Teacher.findById(id);
    let role = 'Teacher';

    if (!user) {
      user = await Student.findById(id);
      role = 'Student';
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isApproved = true;
    user.isActive = true;
    await user.save();

    if (user.isApproved) {
      await Notification.create({
        recipientId: user._id,
        recipientModel: role,
        title: 'Account Approved! 🎉',
        message: `Your ${role.toLowerCase()} account has been approved by the administrator. You can now login.`,
        type: 'teacher_approved'
      });
    }

    notifyAnalyticsUpdate();

    return res.json({
      success: true,
      message: `${role} account for ${user.name} has been ${user.isApproved ? 'approved' : 'rejected'}.`,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tab violation disqualifications for Admin authorization
// @route   GET /api/admin/tab-violations
// @access  Private (Admin)
const getTabViolations = async (req, res, next) => {
  try {
    const violations = await Result.find({
      $or: [
        { wasDisqualified: true },
        { tabViolationLocked: true },
        { disqualificationReason: { $regex: /tab change|attempts/i } }
      ]
    })
      .populate('studentId', 'name email phone avatar isApproved')
      .populate('quizId', 'title category subject maxAttempts')
      .sort({ createdAt: -1 });

    return res.json({ success: true, count: violations.length, violations });
  } catch (error) {
    next(error);
  }
};

// @desc    Authorize a student to re-attempt quiz after tab violation lock
// @route   PUT /api/admin/tab-violations/:resultId/authorize
// @access  Private (Admin)
const authorizeTabViolationRetake = async (req, res, next) => {
  try {
    const { resultId } = req.params;
    const resultDoc = await Result.findById(resultId)
      .populate('quizId', 'title')
      .populate('studentId', 'name email');

    if (!resultDoc) {
      return res.status(404).json({ success: false, message: 'Violation record not found' });
    }

    resultDoc.isAuthorizedForRetake = true;
    resultDoc.tabViolationLocked = false;
    resultDoc.wasDisqualified = false;
    resultDoc.approvalStatus = 'APPROVED';
    await resultDoc.save();

    // Ensure student account isApproved = true
    if (resultDoc.studentId && resultDoc.studentId._id) {
      await Student.findByIdAndUpdate(resultDoc.studentId._id, { isApproved: true });
    }

    // Send in-app notification to Student
    await Notification.create({
      recipientId: resultDoc.studentId._id,
      recipientModel: 'Student',
      title: 'Quiz Re-attempt Authorized! 🔓',
      message: `Admin has authorized your account for "${resultDoc.quizId?.title || 'Quiz'}". You can now attempt the quiz again!`,
      type: 'announcement'
    });

    notifyAnalyticsUpdate();

    return res.json({
      success: true,
      message: `Authorized retake for ${resultDoc.studentId?.name}. Student can now attempt the quiz second time!`,
      result: resultDoc
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getStudents,
  getStudentById,
  getTeachers,
  getTeacherById,
  approveTeacher,
  rejectTeacher,
  toggleUserStatus,
  resetUserPassword,
  deleteUser,
  getDatabaseCollections,
  getCollectionRecords,
  approveUser,
  getTabViolations,
  authorizeTabViolationRetake
};
