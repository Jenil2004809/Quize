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
      quizId,
      $or: [
        { status: 'TERMINATED' },
        { terminatedDueToViolation: true },
        { wasDisqualified: true },
        { tabViolationLocked: true }
      ]
    }).sort({ createdAt: -1 });

    if (!result) {
      return res.json({
        success: true,
        canAttempt: true,
        status: 'ACTIVE'
      });
    }

    if (result.approvalStatus === 'APPROVED') {
      return res.json({
        success: true,
        canAttempt: true,
        status: 'APPROVED',
        message: 'Admin approved your quiz access. You may now attempt the quiz again.'
      });
    }

    // Otherwise student is blocked
    return res.status(403).json({
      success: false,
      canAttempt: false,
      status: result.approvalStatus || 'PENDING',
      reason: 'Quiz access blocked due to policy violation.',
      message: 'Access Denied: You exceeded the allowed tab change limit. Please wait until the administrator reviews your request.'
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
  getStudentQuizStatus
};
