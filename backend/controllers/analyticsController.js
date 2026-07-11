const User = require('../models/User');
const Quiz = require('../models/Quiz');
const Result = require('../models/Result');
const Certificate = require('../models/Certificate');
const Category = require('../models/Category');
const Question = require('../models/Question');
const Notification = require('../models/Notification');

// @desc    Get dashboard analytics depending on role
// @route   GET /api/analytics/dashboard
// @access  Private
const getDashboardAnalytics = async (req, res, next) => {
  try {
    const role = req.user.role;

    if (role === 'student') {
      const studentId = req.user._id;

      // Basic stats
      const totalAttempts = await Result.countDocuments({ studentId });
      const passedAttempts = await Result.countDocuments({ studentId, passed: true });
      const failedAttempts = totalAttempts - passedAttempts;
      const certificatesCount = await Certificate.countDocuments({ studentId });

      // Calculate average score
      const results = await Result.find({ studentId });
      const averagePercentage = results.length > 0
        ? parseFloat((results.reduce((sum, r) => sum + r.percentage, 0) / results.length).toFixed(2))
        : 0;

      // Recent attempts
      const recentAttempts = await Result.find({ studentId })
        .populate('quizId', 'title thumbnail category difficulty')
        .sort({ createdAt: -1 })
        .limit(5);

      // Score progress over time
      const timelineData = results
        .sort((a, b) => a.createdAt - b.createdAt)
        .map(r => ({
          date: r.createdAt.toLocaleDateString(),
          score: r.score,
          percentage: r.percentage
        }));

      // Category breakdown
      const categoryReportMap = {};
      for (let r of results) {
        const quiz = await Quiz.findById(r.quizId).populate('category');
        if (quiz && quiz.category) {
          const catName = quiz.category.name;
          categoryReportMap[catName] = (categoryReportMap[catName] || 0) + 1;
        }
      }
      const categoryData = Object.keys(categoryReportMap).map(key => ({
        category: key,
        attempts: categoryReportMap[key]
      }));

      return res.json({
        success: true,
        stats: {
          totalAttempts,
          passedAttempts,
          failedAttempts,
          certificatesCount,
          averagePercentage
        },
        recentAttempts,
        timelineData,
        categoryData
      });
    }

    if (role === 'teacher') {
      const teacherId = req.user._id;

      // Get teacher's quizzes
      const quizzes = await Quiz.find({ creator: teacherId });
      const quizIds = quizzes.map(q => q._id);

      const totalQuizzes = quizzes.length;
      const publishedQuizzes = quizzes.filter(q => q.isPublished).length;
      const draftQuizzes = totalQuizzes - publishedQuizzes;

      // Total attempts on teacher's quizzes
      const totalAttempts = await Result.countDocuments({ quizId: { $in: quizIds } });
      const passedAttempts = await Result.countDocuments({ quizId: { $in: quizIds }, passed: true });
      const failedAttempts = totalAttempts - passedAttempts;

      // Average score on their quizzes
      const results = await Result.find({ quizId: { $in: quizIds } });
      const averageScore = results.length > 0
        ? parseFloat((results.reduce((sum, r) => sum + r.score, 0) / results.length).toFixed(2))
        : 0;

      // Category report for teacher's quizzes
      const categories = await Category.find();
      const categoryData = await Promise.all(categories.map(async (cat) => {
        const quizCount = await Quiz.countDocuments({ creator: teacherId, category: cat._id });
        return {
          category: cat.name,
          quizzes: quizCount
        };
      }));

      // Top quizzes by attempt counts
      const quizAttemptsMap = [];
      for (let quiz of quizzes) {
        const count = await Result.countDocuments({ quizId: quiz._id });
        quizAttemptsMap.push({
          title: quiz.title,
          attempts: count
        });
      }
      const popularQuizzes = quizAttemptsMap.sort((a, b) => b.attempts - a.attempts).slice(0, 5);

      return res.json({
        success: true,
        stats: {
          totalQuizzes,
          publishedQuizzes,
          draftQuizzes,
          totalAttempts,
          passedAttempts,
          failedAttempts,
          averageScore
        },
        popularQuizzes,
        categoryData
      });
    }

    if (role === 'admin') {
      // System counts
      const totalStudents = await User.countDocuments({ role: 'student' });
      const totalTeachers = await User.countDocuments({ role: 'teacher' });
      const pendingTeachers = await User.countDocuments({ role: 'teacher', isApproved: false });
      const activeUsers = await User.countDocuments({ isApproved: true });
      const totalQuizzes = await Quiz.countDocuments();
      const totalQuestions = await Question.countDocuments();
      const totalResults = await Result.countDocuments();
      const totalSubjects = await Category.countDocuments();
      const totalNotifications = await Notification.countDocuments();
      const averageScoreDoc = await Result.aggregate([
        { $group: { _id: null, averagePercentage: { $avg: '$percentage' }, averageScore: { $avg: '$score' } } }
      ]);
      const averagePercentage = averageScoreDoc[0]?.averagePercentage
        ? parseFloat(averageScoreDoc[0].averagePercentage.toFixed(2))
        : 0;

      // Recent users
      const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('-password');

      // User registrations timeline (last 6 months - simulated or calculated)
      // For simplicity, aggregate from database
      const users = await User.find().select('createdAt role');
      const monthlyRegistrations = {};
      users.forEach(u => {
        const month = u.createdAt.toLocaleString('default', { month: 'short', year: '2-digit' });
        monthlyRegistrations[month] = (monthlyRegistrations[month] || 0) + 1;
      });

      const timelineData = Object.keys(monthlyRegistrations).map(month => ({
        month,
        registrations: monthlyRegistrations[month]
      }));

      // Quizzes breakdown by category
      const categories = await Category.find();
      const categoryReport = await Promise.all(categories.map(async (cat) => {
        const count = await Quiz.countDocuments({ category: cat._id });
        return {
          category: cat.name,
          count
        };
      }));

      const attemptsByMonth = await Result.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            attempts: { $sum: 1 },
            averagePercentage: { $avg: '$percentage' }
          }
        },
        { $sort: { _id: 1 } },
        { $limit: 12 }
      ]);

      const performanceData = attemptsByMonth.map((item) => ({
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
          totalResults,
          totalSubjects,
          totalNotifications,
          activeUsers,
          averagePercentage,
          systemStatus: 'Operational'
        },
        recentUsers,
        timelineData,
        categoryReport,
        performanceData
      });
    }

    return res.status(400).json({ success: false, message: 'Invalid User Role' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardAnalytics
};
