const Question = require('../models/Question');
const Quiz = require('../models/Quiz');

// Helper Fisher-Yates shuffle algorithm for anti-cheating randomness
const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// @desc    Get questions for a quiz (Stripped details for students during attempt + Fisher-Yates Shuffling)
// @route   GET /api/quizzes/:id/questions
// @access  Private (Auth required)
const getQuestionsForQuiz = async (req, res, next) => {
  try {
    const quizId = req.params.id;
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Fetch questions
    const questions = await Question.find({ quizId }).sort({ createdAt: 1 });

    // Anti-Cheating Security Filter for Students:
    // 1. Strip correct answers and explanations to prevent client-side inspection.
    // 2. Randomly shuffle question order via Fisher-Yates algorithm.
    // 3. Randomly shuffle option choices for each question so choice positions vary per candidate.
    if (req.user.role === 'student') {
      const sanitizedQuestions = questions.map(q => {
        const qObj = q.toObject();
        delete qObj.correctAnswers;
        delete qObj.explanation;
        if (qObj.options && Array.isArray(qObj.options) && qObj.options.length > 0) {
          qObj.options = shuffleArray(qObj.options);
        }
        return qObj;
      });

      // Shuffle question order for the candidate attempt
      const shuffledQuestions = shuffleArray(sanitizedQuestions);

      return res.json({
        success: true,
        count: shuffledQuestions.length,
        shuffled: true,
        questions: shuffledQuestions
      });
    }

    // Teachers / Admins see the full details in creation order
    return res.json({ success: true, count: questions.length, questions });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a question
// @route   POST /api/quizzes/:id/questions
// @access  Private (Creator/Admin)
const createQuestion = async (req, res, next) => {
  try {
    const quizId = req.params.id;
    const { type, text, options, correctAnswers, explanation, marks, negativeMarks, timer } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Check ownership
    if (quiz.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this quiz' });
    }

    if (!type || !text || !correctAnswers || correctAnswers.length === 0) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields' });
    }

    let image = '';
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    const question = await Question.create({
      quizId,
      type,
      text,
      options: Array.isArray(options) ? options : (options ? JSON.parse(options) : []),
      correctAnswers: Array.isArray(correctAnswers) ? correctAnswers : [correctAnswers],
      explanation: explanation || '',
      marks: parseFloat(marks || 1),
      negativeMarks: parseFloat(negativeMarks || 0),
      timer: parseInt(timer || 0),
      image
    });

    return res.status(201).json({ success: true, message: 'Question created successfully!', question });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a question
// @route   PUT /api/questions/:id
// @access  Private (Creator/Admin)
const updateQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const quiz = await Quiz.findById(question.quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Associated quiz not found' });
    }

    // Check ownership
    if (quiz.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this quiz' });
    }

    const fieldsToUpdate = [
      'type', 'text', 'options', 'correctAnswers', 'explanation', 'marks', 'negativeMarks', 'timer'
    ];

    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'options') {
          question.options = Array.isArray(req.body.options) ? req.body.options : JSON.parse(req.body.options);
        } else if (field === 'correctAnswers') {
          question.correctAnswers = Array.isArray(req.body.correctAnswers) ? req.body.correctAnswers : [req.body.correctAnswers];
        } else {
          question[field] = req.body[field];
        }
      }
    });

    if (req.file) {
      question.image = `/uploads/${req.file.filename}`;
    }

    await question.save();

    return res.json({ success: true, message: 'Question updated successfully!', question });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Private (Creator/Admin)
const deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const quiz = await Quiz.findById(question.quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Associated quiz not found' });
    }

    // Check ownership
    if (quiz.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this quiz' });
    }

    await question.deleteOne();

    return res.json({ success: true, message: 'Question deleted successfully!' });
  } catch (error) {
    next(error);
  }
};

// @desc    Import Questions in bulk (parsed Excel JSON payload)
// @route   POST /api/quizzes/:id/import-questions
// @access  Private (Creator/Admin)
const importQuestions = async (req, res, next) => {
  try {
    const quizId = req.params.id;
    const { questions } = req.body; // Expects array of question objects

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide an array of questions to import' });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Check ownership
    if (quiz.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this quiz' });
    }

    // Structure and validate questions payload
    const parsedQuestions = questions.map(q => {
      // Ensure arrays format correctly
      const opts = Array.isArray(q.options)
        ? q.options
        : (typeof q.options === 'string' ? q.options.split(',').map(o => o.trim()) : []);
      
      const corrects = Array.isArray(q.correctAnswers)
        ? q.correctAnswers
        : (typeof q.correctAnswers === 'string' ? q.correctAnswers.split(',').map(c => c.trim()) : [q.correctAnswers?.toString()]);

      return {
        quizId,
        type: q.type || 'mcq',
        text: q.text,
        options: opts,
        correctAnswers: corrects,
        explanation: q.explanation || '',
        marks: parseFloat(q.marks || 1),
        negativeMarks: parseFloat(q.negativeMarks || 0),
        timer: parseInt(q.timer || 0)
      };
    });

    // Bulk Insert
    const inserted = await Question.insertMany(parsedQuestions);

    return res.status(201).json({
      success: true,
      message: `Successfully imported ${inserted.length} questions!`,
      count: inserted.length
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getQuestionsForQuiz,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  importQuestions
};
