const Result = require('../models/Result');
const Quiz = require('../models/Quiz');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const PolicyViolationLog = require('../models/PolicyViolationLog');
const { emitToUser } = require('../config/socket');

// @desc    Get all policy violations for Admin Dashboard with stats cards & filters
// @route   GET /api/admin/policy-violations
// @access  Private (Admin)
const getPolicyViolations = async (req, res, next) => {
  try {
    const { status, search } = req.query;

    const query = {
      $or: [
        { wasDisqualified: true },
        { tabViolationLocked: true },
        { terminatedDueToViolation: true },
        { status: 'TERMINATED' },
        { disqualificationReason: { $regex: /tab change|attempts|policy/i } }
      ]
    };

    if (status) {
      query.approvalStatus = status.toUpperCase();
    }

    const violations = await Result.find(query)
      .populate('studentId', 'name email phone avatar isApproved')
      .populate('quizId', 'title category subject maxAttempts passingMarks timeLimit')
      .sort({ createdAt: -1 });

    // Filter by search if provided
    let filtered = violations;
    if (search) {
      const q = search.toLowerCase();
      filtered = violations.filter(v => 
        (v.studentId?.name || '').toLowerCase().includes(q) ||
        (v.studentId?.email || '').toLowerCase().includes(q) ||
        (v.quizId?.title || '').toLowerCase().includes(q)
      );
    }

    // Dashboard Cards Count Metrics
    const allViolations = await Result.find({
      $or: [
        { wasDisqualified: true },
        { tabViolationLocked: true },
        { terminatedDueToViolation: true },
        { status: 'TERMINATED' }
      ]
    });

    const stats = {
      totalViolations: allViolations.length,
      pendingApproval: allViolations.filter(v => v.approvalStatus === 'PENDING' || (!v.approvalStatus || v.approvalStatus === 'NONE')).length,
      approved: allViolations.filter(v => v.approvalStatus === 'APPROVED').length,
      rejected: allViolations.filter(v => v.approvalStatus === 'REJECTED').length,
      completed: allViolations.filter(v => v.status === 'COMPLETED').length
    };

    return res.json({
      success: true,
      stats,
      count: filtered.length,
      violations: filtered
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single policy violation details (Audit Trail + User Agent + IP + Device)
// @route   GET /api/admin/policy-violations/:id
// @access  Private (Admin)
const getPolicyViolationById = async (req, res, next) => {
  try {
    const violation = await Result.findById(req.params.id)
      .populate('studentId', 'name email phone avatar createdAt isApproved')
      .populate('quizId', 'title category subject passingMarks timeLimit maxAttempts');

    if (!violation) {
      return res.status(404).json({ success: false, message: 'Policy violation record not found' });
    }

    // Fetch related audit logs
    const auditLogs = await PolicyViolationLog.find({ resultId: violation._id }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      violation,
      auditLogs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve policy violation retake request
// @route   PUT /api/admin/policy-violations/:id/approve
// @access  Private (Admin)
const approvePolicyViolation = async (req, res, next) => {
  try {
    const { adminNotes } = req.body;
    const violation = await Result.findById(req.params.id)
      .populate('studentId', 'name email')
      .populate('quizId', 'title');

    if (!violation) {
      return res.status(404).json({ success: false, message: 'Violation record not found' });
    }

    violation.approvalStatus = 'APPROVED';
    violation.isAuthorizedForRetake = true;
    violation.tabViolationLocked = false;
    violation.wasDisqualified = false;
    if (adminNotes) violation.adminNotes = adminNotes;
    await violation.save();

    // Ensure student account is approved
    if (violation.studentId?._id) {
      await Student.findByIdAndUpdate(violation.studentId._id, { isApproved: true });
    }

    // Create Notification for Student
    const notif = await Notification.create({
      recipientId: violation.studentId._id,
      recipientModel: 'Student',
      title: 'Quiz Access Approved',
      message: 'Admin approved your quiz access. You may now attempt the quiz again.',
      type: 'announcement'
    });

    // Create Audit Log
    await PolicyViolationLog.create({
      action: 'ADMIN_APPROVED',
      userId: req.user._id,
      userModel: 'Admin',
      quizId: violation.quizId._id,
      resultId: violation._id,
      details: `Admin approved retake for student ${violation.studentId?.name}`
    });

    // Emit Real-Time Socket Event
    emitToUser(violation.studentId._id, 'notification_received', notif);
    emitToUser(violation.studentId._id, 'policy_violation_update', {
      quizId: violation.quizId._id,
      status: 'APPROVED',
      message: 'Admin approved your quiz access.'
    });

    return res.json({
      success: true,
      message: `Admin approved quiz access for ${violation.studentId?.name}. Student may now attempt the quiz again.`,
      violation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject policy violation retake request
// @route   PUT /api/admin/policy-violations/:id/reject
// @access  Private (Admin)
const rejectPolicyViolation = async (req, res, next) => {
  try {
    const { adminNotes } = req.body;
    const violation = await Result.findById(req.params.id)
      .populate('studentId', 'name email')
      .populate('quizId', 'title');

    if (!violation) {
      return res.status(404).json({ success: false, message: 'Violation record not found' });
    }

    violation.approvalStatus = 'REJECTED';
    violation.isAuthorizedForRetake = false;
    violation.tabViolationLocked = true;
    if (adminNotes) violation.adminNotes = adminNotes;
    await violation.save();

    // Create Notification for Student
    const notif = await Notification.create({
      recipientId: violation.studentId._id,
      recipientModel: 'Student',
      title: 'Quiz Access Request Rejected',
      message: 'Your request has been rejected by the administrator. Contact your instructor for further assistance.',
      type: 'security_warning'
    });

    // Create Audit Log
    await PolicyViolationLog.create({
      action: 'ADMIN_REJECTED',
      userId: req.user._id,
      userModel: 'Admin',
      quizId: violation.quizId._id,
      resultId: violation._id,
      details: `Admin rejected retake for student ${violation.studentId?.name}`
    });

    // Emit Real-Time Socket Event
    emitToUser(violation.studentId._id, 'notification_received', notif);
    emitToUser(violation.studentId._id, 'policy_violation_update', {
      quizId: violation.quizId._id,
      status: 'REJECTED',
      message: 'Your request has been rejected by the administrator.'
    });

    return res.json({
      success: true,
      message: `Policy violation request for ${violation.studentId?.name} rejected by administrator.`,
      violation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student status for specific quiz (Restrictions & 403 Forbidden check)
// @route   GET /api/student/quiz-status/:quizId
// @access  Private (Student)
const getStudentQuizStatus = async (req, res, next) => {
  try {
    const { quizId } = req.params;

    const result = await Result.findOne({
      studentId: req.user._id,
      quizId
    }).sort({ createdAt: -1 });

    if (!result) {
      return res.json({
        success: true,
        canAttempt: true,
        status: 'ACTIVE'
      });
    }

    if (result.approvalStatus === 'APPROVED' || result.isAuthorizedForRetake === true) {
      return res.json({
        success: true,
        canAttempt: true,
        isApproved: true,
        status: 'APPROVED',
        message: 'Admin approved your quiz access. You may now attempt the quiz again.'
      });
    }

    if (result.approvalStatus === 'PENDING') {
      return res.json({
        success: true,
        canAttempt: false,
        isPending: true,
        status: 'PENDING',
        message: 'Your retake approval request is pending administrator review.'
      });
    }

    if (result.approvalStatus === 'REJECTED') {
      return res.json({
        success: true,
        canAttempt: false,
        isRejected: true,
        status: 'REJECTED',
        message: 'Your retake approval request was rejected by the administrator.'
      });
    }

    if (result.wasDisqualified || result.tabViolationLocked || result.status === 'TERMINATED') {
      return res.json({
        success: true,
        canAttempt: false,
        isLocked: true,
        status: 'LOCKED',
        message: 'Access Denied: Quiz access locked due to policy violation. You can request admin approval.'
      });
    }

    return res.json({
      success: true,
      canAttempt: true,
      status: 'ACTIVE'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Student submits retake / access approval request to Admin
// @route   POST /api/policy-violations/request-retake
// @access  Private (Student)
const requestRetakeApproval = async (req, res, next) => {
  try {
    const { quizId, reason } = req.body;
    const studentId = req.user._id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const Admin = require('../models/Admin');

    let result = await Result.findOne({ studentId, quizId }).sort({ createdAt: -1 });

    if (!result) {
      result = new Result({
        studentId,
        quizId,
        score: 0,
        totalMarks: quiz.totalMarks || 10,
        passingMarks: quiz.passingMarks || 5,
        percentage: 0,
        isPassed: false,
        status: 'TERMINATED',
        answers: []
      });
    }

    result.status = 'TERMINATED';
    result.wasDisqualified = true;
    result.tabViolationLocked = true;
    result.terminatedDueToViolation = true;
    result.disqualificationReason = reason || 'Student requested retake approval from quiz details page.';
    result.approvalStatus = 'PENDING';
    result.isAuthorizedForRetake = false;
    await result.save();

    // Create Notification for All Admins
    const admins = await Admin.find({ role: 'admin' });
    for (const adm of admins) {
      await Notification.create({
        recipientId: adm._id,
        recipientModel: 'Admin',
        title: 'Retake Approval Requested 📩',
        message: `Student ${req.user.name} requested retake approval for quiz "${quiz.title}".`,
        type: 'security_warning'
      });
      emitToUser(adm._id, 'notification_received', { title: 'Retake Approval Requested' });
    }

    // Audit Log
    await PolicyViolationLog.create({
      action: 'RETAKE_REQUESTED',
      userId: studentId,
      userModel: 'Student',
      quizId,
      resultId: result._id,
      details: `Student ${req.user.name} requested retake approval for quiz "${quiz.title}". Note: ${reason || 'None'}`
    });

    return res.json({
      success: true,
      message: 'Retake approval request submitted to Administrator successfully.',
      approvalStatus: 'PENDING',
      resultId: result._id
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a policy violation record from the database
// @route   DELETE /api/admin/policy-violations/:id
// @access  Private (Admin)
const deletePolicyViolation = async (req, res, next) => {
  try {
    const violation = await Result.findById(req.params.id)
      .populate('studentId', 'name email');

    if (!violation) {
      return res.status(404).json({ success: false, message: 'Policy violation record not found' });
    }

    const studentName = violation.studentId?.name || 'Student';

    // Delete associated audit logs
    await PolicyViolationLog.deleteMany({ resultId: violation._id });

    // Delete the Result document from MongoDB
    await violation.deleteOne();

    return res.json({
      success: true,
      message: `Policy violation record for ${studentName} deleted successfully from database.`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPolicyViolations,
  getPolicyViolationById,
  approvePolicyViolation,
  rejectPolicyViolation,
  deletePolicyViolation,
  getStudentQuizStatus,
  requestRetakeApproval
};
