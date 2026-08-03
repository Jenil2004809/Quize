const Student = require('../models/Student');
const Result = require('../models/Result');
const Quiz = require('../models/Quiz');

// @desc    Toggle quiz bookmark
// @route   POST /api/students/bookmarks/:quizId
// @access  Private (Student)
const toggleBookmark = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const student = await Student.findById(req.user._id);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found' });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const isBookmarked = student.bookmarks.includes(quizId);

    if (isBookmarked) {
      // Remove from bookmarks
      student.bookmarks = student.bookmarks.filter(id => id.toString() !== quizId.toString());
      await student.save();
      return res.json({ success: true, message: 'Quiz removed from bookmarks', bookmarks: student.bookmarks });
    } else {
      // Add to bookmarks
      student.bookmarks.push(quizId);
      await student.save();
      return res.json({ success: true, message: 'Quiz added to bookmarks', bookmarks: student.bookmarks });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get student bookmarks
// @route   GET /api/students/bookmarks
// @access  Private (Student)
const getBookmarks = async (req, res, next) => {
  try {
    const student = await Student.findById(req.user._id).populate({
      path: 'bookmarks',
      populate: { path: 'category', select: 'name' }
    });

    return res.json({
      success: true,
      bookmarks: student.bookmarks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student quiz attempts / history
// @route   GET /api/students/history
// @access  Private (Student)
const getQuizHistory = async (req, res, next) => {
  try {
    const results = await Result.find({ studentId: req.user._id })
      .populate('quizId', 'title thumbnail category difficulty')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: results.length,
      history: results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get global student leaderboard
// @route   GET /api/students/leaderboard
// @access  Private
const getGlobalLeaderboard = async (req, res, next) => {
  try {
    // Group results by studentId, sum up total scores of passed attempts
    const globalRankings = await Result.aggregate([
      { $match: { passed: true } },
      {
        $group: {
          _id: '$studentId',
          totalPoints: { $sum: '$score' },
          quizzesPassed: { $sum: 1 },
          averagePercentage: { $avg: '$percentage' }
        }
      },
      { $sort: { totalPoints: -1, quizzesPassed: -1 } },
      { $limit: 50 }
    ]);

    const rankings = await Promise.all(globalRankings.map(async (rank, index) => {
      const student = await Student.findById(rank._id).select('name email avatar');
      return {
        rank: index + 1,
        student,
        totalPoints: rank.totalPoints,
        quizzesPassed: rank.quizzesPassed,
        averagePercentage: parseFloat((rank.averagePercentage || 0).toFixed(1))
      };
    }));

    // Filter out potential deleted users
    const filteredRankings = rankings.filter(r => r.student !== null);

    return res.json({
      success: true,
      count: filteredRankings.length,
      rankings: filteredRankings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get quiz-specific leaderboard
// @route   GET /api/students/leaderboard/:quizId
// @access  Private
const getQuizLeaderboard = async (req, res, next) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const quizRankings = await Result.aggregate([
      { $match: { quizId: quiz._id } },
      { $sort: { score: -1, timeTaken: 1 } },
      {
        $group: {
          _id: '$studentId',
          bestResultId: { $first: '$_id' },
          maxScore: { $first: '$score' },
          maxPercentage: { $first: '$percentage' },
          minTimeTaken: { $first: '$timeTaken' },
          passed: { $first: '$passed' },
          attemptDate: { $first: '$createdAt' }
        }
      },
      { $sort: { maxScore: -1, minTimeTaken: 1 } },
      { $limit: 50 }
    ]);

    const rankings = await Promise.all(quizRankings.map(async (rank, index) => {
      const student = await Student.findById(rank._id).select('name email avatar');
      return {
        rank: index + 1,
        student,
        resultId: rank.bestResultId,
        score: rank.maxScore,
        percentage: rank.maxPercentage,
        timeTaken: rank.minTimeTaken,
        passed: rank.passed,
        date: rank.attemptDate
      };
    }));

    const filteredRankings = rankings.filter(r => r.student !== null);

    return res.json({
      success: true,
      count: filteredRankings.length,
      rankings: filteredRankings
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  toggleBookmark,
  getBookmarks,
  getQuizHistory,
  getGlobalLeaderboard,
  getQuizLeaderboard
};
