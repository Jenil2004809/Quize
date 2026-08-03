const Quiz = require('../models/Quiz');
const Result = require('../models/Result');
const Student = require('../models/Student');

// @desc    Get all quizzes created by this teacher
// @route   GET /api/teachers/quizzes
// @access  Private (Teacher)
const getMyQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({ creator: req.user._id })
      .populate('category', 'name')
      .populate('subject', 'name')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: quizzes.length,
      quizzes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get results of students who took this teacher's quizzes
// @route   GET /api/teachers/results
// @access  Private (Teacher)
const getStudentResults = async (req, res, next) => {
  try {
    // 1. Get all quizzes created by this teacher
    const quizzes = await Quiz.find({ creator: req.user._id });
    const quizIds = quizzes.map(q => q._id);

    // 2. Find results for those quizzes
    const results = await Result.find({ quizId: { $in: quizIds } })
      .populate('studentId', 'name email avatar')
      .populate('quizId', 'title category difficulty passingMarks')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: results.length,
      results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get performance report for quizzes created by teacher
// @route   GET /api/teachers/reports
// @access  Private (Teacher)
const getReportsData = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({ creator: req.user._id });
    
    const reports = await Promise.all(quizzes.map(async (quiz) => {
      const attempts = await Result.find({ quizId: quiz._id });
      const totalAttempts = attempts.length;
      const passedAttempts = attempts.filter(a => a.passed).length;
      const failedAttempts = totalAttempts - passedAttempts;
      
      const averagePercentage = totalAttempts > 0
        ? parseFloat((attempts.reduce((sum, a) => sum + a.percentage, 0) / totalAttempts).toFixed(2))
        : 0;

      return {
        quizId: quiz._id,
        title: quiz.title,
        difficulty: quiz.difficulty,
        isPublished: quiz.isPublished,
        stats: {
          totalAttempts,
          passedAttempts,
          failedAttempts,
          passRate: totalAttempts > 0 ? parseFloat(((passedAttempts / totalAttempts) * 100).toFixed(1)) : 0,
          averagePercentage
        }
      };
    }));

    // Calculate aggregated overall stats
    const totalQuizzes = quizzes.length;
    const totalAttemptsAll = reports.reduce((sum, r) => sum + r.stats.totalAttempts, 0);
    const totalPassedAll = reports.reduce((sum, r) => sum + r.stats.passedAttempts, 0);
    const averagePassRate = totalAttemptsAll > 0 
      ? parseFloat(((totalPassedAll / totalAttemptsAll) * 100).toFixed(1))
      : 0;

    return res.json({
      success: true,
      summary: {
        totalQuizzes,
        totalAttempts: totalAttemptsAll,
        totalPassed: totalPassedAll,
        averagePassRate
      },
      reports
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyQuizzes,
  getStudentResults,
  getReportsData
};
