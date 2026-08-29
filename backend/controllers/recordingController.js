const path = require('path');
const fs = require('fs');
const Result = require('../models/Result');
const Quiz = require('../models/Quiz');
const Student = require('../models/Student');
const { notifyAnalyticsUpdate } = require('../config/socket');

// @desc    Upload Student Quiz Session Recording
// @route   POST /api/recordings/upload/:resultId
// @access  Private (Student/Admin/Teacher)
const uploadRecording = async (req, res, next) => {
  try {
    const { resultId } = req.params;
    const duration = parseFloat(req.body.duration || 0);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video recording file was uploaded.'
      });
    }

    const result = await Result.findById(resultId);
    if (!result) {
      // Remove uploaded file if result record does not exist
      if (req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        success: false,
        message: 'Result session not found.'
      });
    }

    // Verify ownership (Student submitting own recording or Admin/Teacher)
    if (req.user.role === 'student' && result.studentId.toString() !== req.user._id.toString()) {
      if (req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only upload recordings for your own quiz attempts.'
      });
    }

    // Save relative URL path for cross-platform static serving
    const recordingUrl = `/uploads/recordings/${req.file.filename}`;

    result.recordingUrl = recordingUrl;
    result.recordingSize = req.file.size || 0;
    result.recordingDuration = duration > 0 ? duration : (result.timeTaken || 0);
    result.hasRecording = true;

    await result.save();
    notifyAnalyticsUpdate();

    return res.status(200).json({
      success: true,
      message: 'Quiz session recording saved successfully.',
      recordingUrl,
      recordingDuration: result.recordingDuration,
      recordingSize: result.recordingSize
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Quiz Recordings for Quizzes Created by Authenticated Teacher
// @route   GET /api/recordings/teacher
// @access  Private (Teacher)
const getTeacherRecordings = async (req, res, next) => {
  try {
    const { quizId, search, passed, status } = req.query;

    // Find all quizzes authored by this teacher
    const teacherQuizzes = await Quiz.find({
      $or: [
        { creator: req.user._id },
        { isSystemQuiz: true } // Allow teachers to view recordings on system curriculum quizzes as well
      ]
    }).select('_id title');

    const teacherQuizIds = teacherQuizzes.map(q => q._id);

    const query = {
      quizId: { $in: teacherQuizIds },
      hasRecording: true
    };

    if (quizId && quizId !== 'all') {
      query.quizId = quizId;
    }

    if (passed === 'true') query.passed = true;
    if (passed === 'false') query.passed = false;
    if (status && status !== 'all') query.status = status;

    let results = await Result.find(query)
      .populate('studentId', 'name email avatar phone')
      .populate('quizId', 'title category subject difficulty timeLimit passingMarks')
      .sort({ createdAt: -1 });

    // Optional Search Filter by Student Name or Email
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      results = results.filter(r => {
        const studentName = r.studentId?.name || '';
        const studentEmail = r.studentId?.email || '';
        const quizTitle = r.quizId?.title || '';
        return searchRegex.test(studentName) || searchRegex.test(studentEmail) || searchRegex.test(quizTitle);
      });
    }

    return res.status(200).json({
      success: true,
      count: results.length,
      recordings: results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Platform Quiz Recordings (Global Admin Access)
// @route   GET /api/recordings/admin
// @access  Private (Admin)
const getAdminRecordings = async (req, res, next) => {
  try {
    const { quizId, search, passed, status, violationsOnly } = req.query;

    const query = {
      hasRecording: true
    };

    if (quizId && quizId !== 'all') {
      query.quizId = quizId;
    }

    if (passed === 'true') query.passed = true;
    if (passed === 'false') query.passed = false;
    if (status && status !== 'all') query.status = status;

    if (violationsOnly === 'true') {
      query.$or = [
        { wasDisqualified: true },
        { tabViolationLocked: true },
        { tabChangeCount: { $gt: 0 } },
        { integrityScore: { $lt: 100 } }
      ];
    }

    let results = await Result.find(query)
      .populate('studentId', 'name email avatar phone')
      .populate('quizId', 'title category subject difficulty timeLimit passingMarks')
      .sort({ createdAt: -1 });

    // Search Filter by Student Name or Email or Quiz Title
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      results = results.filter(r => {
        const studentName = r.studentId?.name || '';
        const studentEmail = r.studentId?.email || '';
        const quizTitle = r.quizId?.title || '';
        return searchRegex.test(studentName) || searchRegex.test(studentEmail) || searchRegex.test(quizTitle);
      });
    }

    return res.status(200).json({
      success: true,
      count: results.length,
      recordings: results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Single Quiz Session Recording Details
// @route   GET /api/recordings/:id
// @access  Private (Admin/Teacher)
const getRecordingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Strict access control: Only Admin and Teachers
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Quiz session recordings are only accessible by Administrators and Teachers.'
      });
    }

    const result = await Result.findById(id)
      .populate('studentId', 'name email avatar phone')
      .populate('quizId', 'title category subject difficulty timeLimit passingMarks creator');

    if (!result || !result.hasRecording || !result.recordingUrl) {
      return res.status(404).json({
        success: false,
        message: 'Recording not found for this quiz session.'
      });
    }

    // If teacher, verify that teacher is creator or quiz is accessible
    if (req.user.role === 'teacher') {
      const quizCreator = result.quizId?.creator?.toString();
      const isSystemQuiz = result.quizId?.isSystemQuiz;
      if (quizCreator && quizCreator !== req.user._id.toString() && !isSystemQuiz) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: You do not have permission to view recordings for this quiz.'
        });
      }
    }

    return res.status(200).json({
      success: true,
      recording: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a Session Recording (File and Reference)
// @route   DELETE /api/recordings/:id
// @access  Private (Admin)
const deleteRecording = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Only System Administrators can delete session recordings.'
      });
    }

    const result = await Result.findById(id);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result session not found.'
      });
    }

    if (result.recordingUrl) {
      const filename = path.basename(result.recordingUrl);
      const filePath = path.join(__dirname, '..', 'uploads', 'recordings', filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.warn('Failed to delete recording file from disk:', e.message);
        }
      }
    }

    result.recordingUrl = '';
    result.recordingSize = 0;
    result.recordingDuration = 0;
    result.hasRecording = false;
    await result.save();
    notifyAnalyticsUpdate();

    return res.status(200).json({
      success: true,
      message: 'Recording deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadRecording,
  getTeacherRecordings,
  getAdminRecordings,
  getRecordingById,
  deleteRecording
};
