const Result = require('../models/Result');
const Quiz = require('../models/Quiz');
const User = require('../models/User');

// @desc    Get leaderboard rankings for a specific quiz
// @route   GET /api/leaderboard/:quizId
// @access  Public (Authenticated)
const getQuizLeaderboard = async (req, res, next) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Aggregate best score per student for this quiz
    const rankings = await Result.aggregate([
      { $match: { quizId: quiz._id } },
      // Sort by score desc, then timeTaken asc (faster is better)
      { $sort: { score: -1, timeTaken: 1 } },
      // Group by student to find their best attempt
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
      // Sort the grouped results
      { $sort: { maxScore: -1, minTimeTaken: 1 } },
      // Limit to top 50
      { $limit: 50 }
    ]);

    // Populate student information manually after aggregation
    const populatedRankings = await Promise.all(rankings.map(async (rank, index) => {
      const student = await User.findById(rank._id).select('name email avatar');
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

    return res.json({ success: true, count: populatedRankings.length, rankings: populatedRankings });
  } catch (error) {
    next(error);
  }
};

// @desc    Get global overall student leaderboard
// @route   GET /api/leaderboard
// @access  Public (Authenticated)
const getGlobalLeaderboard = async (req, res, next) => {
  try {
    // Aggregate overall scores across all quizzes for all students
    const globalRankings = await Result.aggregate([
      { $match: { passed: true } }, // Only count passed quizzes for score accrual
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

    const populatedGlobal = await Promise.all(globalRankings.map(async (rank, index) => {
      const student = await User.findById(rank._id).select('name email avatar');
      return {
        rank: index + 1,
        student,
        totalPoints: rank.totalPoints,
        quizzesPassed: rank.quizzesPassed,
        averagePercentage: parseFloat(rank.averagePercentage.toFixed(1))
      };
    }));

    return res.json({ success: true, count: populatedGlobal.length, rankings: populatedGlobal });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getQuizLeaderboard,
  getGlobalLeaderboard
};
