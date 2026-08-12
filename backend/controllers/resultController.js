const Result = require('../models/Result');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Certificate = require('../models/Certificate');
const Notification = require('../models/Notification');
const Student = require('../models/Student');

// @desc    Submit a quiz attempt
// @route   POST /api/results/submit
// @access  Private (Student)
const submitQuiz = async (req, res, next) => {
  try {
    const { quizId, answers, timeTaken, integrityScore, wasDisqualified, disqualificationReason } = req.body;

    if (!quizId || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Please provide quizId and your answers' });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Verify if student is locked/terminated due to 3rd tab violation
    const existingLock = await Result.findOne({
      studentId: req.user._id,
      quizId,
      $or: [{ tabViolationLocked: true }, { wasDisqualified: true }, { status: 'TERMINATED' }]
    }).sort({ createdAt: -1 });

    if (existingLock && !existingLock.isAuthorizedForRetake) {
      return res.status(403).json({
        success: false,
        isTabViolationLocked: true,
        message: 'Submission blocked due to policy violation. You cannot submit the quiz after 3rd violation. Please contact admin.'
      });
    }

    // Verify student attempt limit
    const attemptsCount = await Result.countDocuments({ studentId: req.user._id, quizId });
    if (attemptsCount >= quiz.maxAttempts) {
      return res.status(400).json({
        success: false,
        message: `You have reached the maximum attempt limit of ${quiz.maxAttempts} for this quiz.`
      });
    }

    // Fetch all questions for this quiz
    const questions = await Question.find({ quizId });
    const totalQuestions = questions.length;

    let score = 0;
    let correctAnswersCount = 0;
    let wrongAnswersCount = 0;
    let skippedAnswersCount = 0;
    let totalPossibleMarks = 0;

    const evaluatedAnswers = [];

    // Map user answers for fast lookup
    const userAnswersMap = {};
    answers.forEach(ans => {
      userAnswersMap[ans.questionId] = ans.selectedAnswers || [];
    });

    questions.forEach(question => {
      totalPossibleMarks += question.marks;
      const userSelected = userAnswersMap[question._id.toString()] || [];
      
      // Check if skipped
      if (userSelected.length === 0) {
        skippedAnswersCount++;
        evaluatedAnswers.push({
          questionId: question._id,
          selectedAnswers: [],
          isCorrect: false,
          marksAwarded: 0
        });
        return;
      }

      // Check correctness
      let isCorrect = false;

      if (question.type === 'multiple-correct' || question.type === 'multiple-select') {
        // Must match all correct answers exactly
        const sortedCorrect = [...question.correctAnswers].sort();
        const sortedSelected = [...userSelected].sort();
        isCorrect = sortedCorrect.length === sortedSelected.length &&
          sortedCorrect.every((val, index) => val.toLowerCase().trim() === sortedSelected[index].toLowerCase().trim());
      } else {
        // Single option (mcq, true-false, fill-in-the-blank)
        const correctVal = question.correctAnswers[0]?.toLowerCase().trim();
        const selectedVal = userSelected[0]?.toLowerCase().trim();
        isCorrect = correctVal === selectedVal;
      }

      let marksAwarded = 0;
      if (isCorrect) {
        correctAnswersCount++;
        marksAwarded = question.marks;
        score += question.marks;
      } else {
        wrongAnswersCount++;
        marksAwarded = -question.negativeMarks;
        score -= question.negativeMarks;
      }

      evaluatedAnswers.push({
        questionId: question._id,
        selectedAnswers: userSelected,
        isCorrect,
        marksAwarded
      });
    });

    // Make sure score doesn't fall below zero
    if (score < 0) score = 0;

    const percentage = totalPossibleMarks > 0 ? (score / totalPossibleMarks) * 100 : 0;
    
    // Check tab switch violation or explicit disqualification
    const isTabSwitchFailure = Boolean(wasDisqualified) || Number(integrityScore) <= 40;
    const finalPassed = isTabSwitchFailure ? false : (score >= quiz.passingMarks);
    const failReason = disqualificationReason || (isTabSwitchFailure ? 'Failed to record attempts. Please contact admin.' : '');

    // Save Result
    const result = await Result.create({
      studentId: req.user._id,
      quizId,
      score: isTabSwitchFailure ? 0 : score,
      percentage: isTabSwitchFailure ? 0 : parseFloat(percentage.toFixed(2)),
      totalQuestions,
      correctAnswers: isTabSwitchFailure ? 0 : correctAnswersCount,
      wrongAnswers: isTabSwitchFailure ? totalQuestions : wrongAnswersCount,
      skippedAnswers: skippedAnswersCount,
      integrityScore: parseInt(integrityScore || 100),
      answers: evaluatedAnswers,
      timeTaken: parseInt(timeTaken || 0),
      passed: finalPassed,
      wasDisqualified: isTabSwitchFailure,
      disqualificationReason: failReason,
      tabViolationLocked: isTabSwitchFailure,
      isAuthorizedForRetake: false,
      tabChangeCount: isTabSwitchFailure ? 3 : (req.body.tabChangeCount || 0),
      terminatedDueToViolation: isTabSwitchFailure,
      terminationReason: isTabSwitchFailure ? 'TAB_CHANGE_LIMIT_EXCEEDED' : 'NONE',
      terminatedAt: isTabSwitchFailure ? new Date() : null,
      status: isTabSwitchFailure ? 'TERMINATED' : 'COMPLETED',
      approvalStatus: isTabSwitchFailure ? 'PENDING' : 'NONE'
    });

    // Generate Certificate for the attempt if passed
    if (finalPassed) {
      await Certificate.create({
        studentId: req.user._id,
        quizId,
        resultId: result._id
      });
    }

    // Create Notification to Student
    await Notification.create({
      recipientId: req.user._id,
      recipientModel: 'Student',
      title: isTabSwitchFailure
        ? 'Quiz Removed'
        : (finalPassed ? 'Quiz Passed! 🎓 Certificate Ready!' : 'Quiz Attempt Failed ❌'),
      message: isTabSwitchFailure
        ? 'You have been removed from the quiz because you exceeded the maximum allowed tab changes. Please contact the administrator to request authorization.'
        : (finalPassed
            ? `Congratulations! You passed "${quiz.title}" with ${percentage.toFixed(1)}%. Your certificate is available for download.`
            : `You scored ${percentage.toFixed(1)}% on "${quiz.title}". Passing requirement was ${quiz.passingMarks} marks.`),
      type: isTabSwitchFailure ? 'security_warning' : 'certificate_ready'
    });

    return res.status(201).json({
      success: true,
      message: finalPassed ? 'Quiz passed! Certificate generated.' : (isTabSwitchFailure ? 'Failed to record attempts. Please contact admin.' : 'Quiz completed.'),
      resultId: result._id,
      percentage,
      passed: finalPassed,
      wasDisqualified: isTabSwitchFailure
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all attempts for a specific student
// @route   GET /api/results/student/:studentId
// @access  Private (Auth required)
const getStudentResults = async (req, res, next) => {
  try {
    const studentId = req.params.studentId;

    // Check permissions
    if (req.user._id.toString() !== studentId && req.user.role === 'student') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const results = await Result.find({ studentId })
      .populate('quizId', 'title description thumbnail difficulty timeLimit passingMarks')
      .sort({ createdAt: -1 });

    const resultsWithCertificates = await Promise.all(results.map(async (r) => {
      const cert = await Certificate.findOne({ resultId: r._id });
      return {
        ...r.toObject(),
        certificateId: cert ? cert.certificateId : null
      };
    }));

    return res.json({ success: true, count: resultsWithCertificates.length, results: resultsWithCertificates });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all attempts for a quiz (For Teacher analytics)
// @route   GET /api/results/quiz/:quizId
// @access  Private (Teacher/Admin)
const getQuizResults = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Check ownership
    if (quiz.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const results = await Result.find({ quizId })
      .populate('studentId', 'name email avatar')
      .sort({ createdAt: -1 });

    return res.json({ success: true, count: results.length, results });
  } catch (error) {
    next(error);
  }
};

// @desc    Get result by ID
// @route   GET /api/results/:id
// @access  Private (Auth required)
const getResultById = async (req, res, next) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('studentId', 'name email avatar')
      .populate({
        path: 'quizId',
        select: 'title description thumbnail difficulty passingMarks timeLimit creator',
        populate: { path: 'category', select: 'name' }
      });

    if (!result) {
      return res.status(404).json({ success: false, message: 'Result record not found' });
    }

    // Check authorization: Must be the student, the quiz creator, or an admin
    const isStudent = req.user._id.toString() === result.studentId._id.toString();
    const isCreator = req.user._id.toString() === result.quizId.creator.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isStudent && !isCreator && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Fetch quiz questions (including correct keys and explanation for review)
    const questions = await Question.find({ quizId: result.quizId._id }).sort({ createdAt: 1 });
    const certificate = await Certificate.findOne({ resultId: result._id });

    return res.json({
      success: true,
      result,
      questions,
      certificateId: certificate ? certificate.certificateId : null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all attempts for all quizzes created by the logged in teacher/admin
// @route   GET /api/results/teacher/all
// @access  Private (Teacher/Admin)
const getTeacherAllResults = async (req, res, next) => {
  try {
    let quizQuery = {};
    if (req.user.role !== 'admin') {
      quizQuery.creator = req.user._id;
    }

    const quizzes = await Quiz.find(quizQuery).select('_id title');
    const quizIds = quizzes.map(q => q._id);

    const results = await Result.find({ quizId: { $in: quizIds } })
      .populate('studentId', 'name email avatar')
      .populate('quizId', 'title category difficulty passingMarks timeLimit')
      .sort({ createdAt: -1 });

    return res.json({ success: true, count: results.length, results });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitQuiz,
  getStudentResults,
  getQuizResults,
  getTeacherAllResults,
  getResultById
};
