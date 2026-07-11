const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Result = require('../models/Result');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Get all quizzes (Filtered and Sorted)
// @route   GET /api/quizzes
// @access  Public
const getQuizzes = async (req, res, next) => {
  try {
    const { search, category, difficulty, sort } = req.query;

    const query = { isPublished: true, visibility: 'public' };

    // Search query keyword filter
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Difficulty level filter
    if (difficulty) {
      query.difficulty = difficulty;
    }

    // Dynamic sort sorting
    let sortBy = { createdAt: -1 }; // Default: Newest first
    if (sort === 'oldest') {
      sortBy = { createdAt: 1 };
    } else if (sort === 'title-asc') {
      sortBy = { title: 1 };
    } else if (sort === 'title-desc') {
      sortBy = { title: -1 };
    }

    const quizzes = await Quiz.find(query)
      .populate('category', 'name slug')
      .populate('creator', 'name avatar')
      .sort(sortBy);

    // Attach questions counts dynamically
    const quizzesWithCount = await Promise.all(quizzes.map(async (quiz) => {
      const questionsCount = await Question.countDocuments({ quizId: quiz._id });
      return {
        ...quiz.toObject(),
        questionsCount
      };
    }));

    return res.json({ success: true, count: quizzesWithCount.length, quizzes: quizzesWithCount });
  } catch (error) {
    next(error);
  }
};

// @desc    Get teacher's or admin's own quizzes
// @route   GET /api/quizzes/creator
// @access  Private (Teacher/Admin)
const getCreatorQuizzes = async (req, res, next) => {
  try {
    const query = {};
    if (req.user.role !== 'admin') {
      query.creator = req.user._id;
    }

    const quizzes = await Quiz.find(query)
      .populate('category', 'name')
      .populate('creator', 'name')
      .sort({ createdAt: -1 });

    const quizzesWithCount = await Promise.all(quizzes.map(async (quiz) => {
      const questionsCount = await Question.countDocuments({ quizId: quiz._id });
      return {
        ...quiz.toObject(),
        questionsCount
      };
    }));

    return res.json({ success: true, count: quizzesWithCount.length, quizzes: quizzesWithCount });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single quiz details
// @route   GET /api/quizzes/:id
// @access  Public (Authenticated)
const getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('category', 'name slug description')
      .populate('creator', 'name email avatar');

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const questionsCount = await Question.countDocuments({ quizId: quiz._id });

    return res.json({
      success: true,
      quiz: {
        ...quiz.toObject(),
        questionsCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a quiz
// @route   POST /api/quizzes
// @access  Private (Teacher/Admin)
const createQuiz = async (req, res, next) => {
  try {
    const { title, description, category, difficulty, timeLimit, passingMarks, maxAttempts, visibility } = req.body;

    if (!title || !category || !timeLimit || !passingMarks) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    let thumbnail = '';
    if (req.file) {
      thumbnail = `/uploads/${req.file.filename}`;
    }

    const quiz = await Quiz.create({
      title,
      description,
      category,
      difficulty: difficulty || 'medium',
      timeLimit: parseInt(timeLimit),
      passingMarks: parseInt(passingMarks),
      maxAttempts: parseInt(maxAttempts || 1),
      visibility: visibility || 'public',
      creator: req.user._id,
      isPublished: false
    });

    return res.status(201).json({ success: true, message: 'Quiz draft created successfully!', quiz });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a quiz
// @route   PUT /api/quizzes/:id
// @access  Private (Creator/Admin)
const updateQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Check ownership
    if (quiz.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this quiz' });
    }

    const fieldsToUpdate = [
      'title', 'description', 'category', 'difficulty',
      'timeLimit', 'passingMarks', 'maxAttempts', 'visibility'
    ];

    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        quiz[field] = req.body[field];
      }
    });

    if (req.file) {
      quiz.thumbnail = `/uploads/${req.file.filename}`;
    }

    await quiz.save();

    return res.json({ success: true, message: 'Quiz updated successfully!', quiz });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a quiz (Cascades to questions and results)
// @route   DELETE /api/quizzes/:id
// @access  Private (Creator/Admin)
const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Check ownership
    if (quiz.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this quiz' });
    }

    // Cascade delete questions
    await Question.deleteMany({ quizId: quiz._id });

    // Cascade delete results
    await Result.deleteMany({ quizId: quiz._id });

    // Delete the quiz
    await quiz.deleteOne();

    return res.json({ success: true, message: 'Quiz and all associated questions/results deleted successfully!' });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle quiz publishing
// @route   PUT /api/quizzes/:id/publish
// @access  Private (Creator/Admin)
const togglePublishQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Check ownership
    if (quiz.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this quiz' });
    }

    // Require at least one question to publish
    if (!quiz.isPublished) {
      const questionCount = await Question.countDocuments({ quizId: quiz._id });
      if (questionCount === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot publish an empty quiz. Please add questions first.'
        });
      }
    }

    quiz.isPublished = !quiz.isPublished;
    await quiz.save();

    // Trigger Notification for new quizzes published
    if (quiz.isPublished) {
      await Notification.create({
        recipientId: null, // Broadcast notification
        senderId: req.user._id,
        title: 'New Quiz Published! 🎯',
        message: `"${quiz.title}" has been published by ${req.user.name}. Go attempt it now and claim your certificate!`,
        type: 'quiz_published'
      });
    }

    return res.json({
      success: true,
      message: quiz.isPublished ? 'Quiz published successfully!' : 'Quiz reverted to draft.',
      isPublished: quiz.isPublished
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bookmark / Unbookmark a quiz
// @route   POST /api/quizzes/:id/bookmark
// @access  Private
const bookmarkQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const user = await User.findById(req.user._id);
    const index = user.bookmarks.indexOf(quiz._id);

    let bookmarked = false;
    if (index === -1) {
      user.bookmarks.push(quiz._id);
      bookmarked = true;
    } else {
      user.bookmarks.splice(index, 1);
    }

    await user.save();

    return res.json({
      success: true,
      message: bookmarked ? 'Quiz bookmarked!' : 'Quiz removed from bookmarks',
      bookmarked,
      bookmarks: user.bookmarks
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getQuizzes,
  getCreatorQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  togglePublishQuiz,
  bookmarkQuiz
};
