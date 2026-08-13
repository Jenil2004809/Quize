const Question = require('../models/Question');
const Quiz = require('../models/Quiz');

// Seeded pseudo-random generator (Mulberry32) for 100% reproducible per-student shuffling
function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Convert string ID to a numeric 32-bit seed
function stringToSeed(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

// Seeded Fisher-Yates Shuffle algorithm for candidate uniqueness across 60+ concurrent exam sessions
const seededShuffleArray = (array, seedVal) => {
  const arr = [...array];
  const random = mulberry32(seedVal);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// @desc    Get questions for a quiz (Stripped details for students during attempt + Per-Student Unique Shuffling)
// @route   GET /api/quizzes/:id/questions
// @access  Private (Auth required)
const getQuestionsForQuiz = async (req, res, next) => {
  try {
    const quizId = req.params.id;
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Check Admin concern & approval for students attempting quizzes (blocked only if explicitly set to false)
    if (req.user.role === 'student' && req.user.isApproved === false) {
      return res.status(403).json({
        success: false,
        isPendingAdminApproval: true,
        message: 'Cannot attempt quiz without Admin concern and explicit approval. Please contact Admin to unlock your quiz access.'
      });
    }

    // Check if student is locked due to tab violation and requires Admin authorization
    if (req.user.role === 'student') {
      const Result = require('../models/Result');
      const lockedResult = await Result.findOne({
        studentId: req.user._id,
        quizId,
        $or: [{ tabViolationLocked: true }, { wasDisqualified: true }]
      }).sort({ createdAt: -1 });

      if (lockedResult && !lockedResult.isAuthorizedForRetake) {
        return res.status(403).json({
          success: false,
          isTabViolationLocked: true,
          message: 'Failed to record attempts. Please contact admin.'
        });
      }
    }

    // Fetch questions
    const questions = await Question.find({ quizId }).sort({ createdAt: 1 });

    // Anti-Cheating Per-Student Unique Shuffle Filter for 60+ Concurrent Exam Candidates:
    // 1. Strip correct answers and explanations to prevent client-side inspection.
    // 2. Uniquely shuffle question order per candidate using candidate's unique student ID seed.
    // 3. Uniquely shuffle option choices for each question so choice positions vary per candidate.
    if (req.user.role === 'student') {
      const studentIdStr = req.user._id.toString();
      const quizIdStr = quizId.toString();
      const attemptKey = req.query.attemptId || req.query.t || Date.now();

      // Unique seed for question sequence per student attempt
      const questionSeed = stringToSeed(`${studentIdStr}_qseq_${quizIdStr}_${attemptKey}`);

      const sanitizedQuestions = questions.map(q => {
        const qObj = q.toObject();
        delete qObj.correctAnswers;
        delete qObj.explanation;

        // Unique seed for option sequence per student per question
        if (qObj.options && Array.isArray(qObj.options) && qObj.options.length > 0) {
          const optSeed = stringToSeed(`${studentIdStr}_opt_${q._id.toString()}_${attemptKey}`);
          qObj.options = seededShuffleArray(qObj.options, optSeed);
        }
        return qObj;
      });

      // Shuffle question order for the candidate attempt using unique student seed
      const shuffledQuestions = seededShuffleArray(sanitizedQuestions, questionSeed);

      return res.json({
        success: true,
        count: shuffledQuestions.length,
        shuffled: true,
        candidateSeed: questionSeed,
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

    const rawOptions = Array.isArray(options) ? options : (options ? JSON.parse(options) : []);
    const { randomizeQuestionOptions } = require('../utils/shuffleUtils');
    const shuffledOptions = randomizeQuestionOptions(rawOptions);

    const question = await Question.create({
      quizId,
      type,
      text,
      options: shuffledOptions,
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
