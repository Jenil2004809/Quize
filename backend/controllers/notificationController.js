const Notification = require('../models/Notification');

// @desc    Get user notifications (Direct + Broadcast notifications)
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const recipientModel = req.user.role === 'admin' ? 'Admin' : (req.user.role === 'teacher' ? 'Teacher' : 'Student');
    
    const notifications = await Notification.find({
      $or: [
        { recipientId: req.user._id, recipientModel },
        { recipientId: null } // Broadcasts
      ]
    }).sort({ createdAt: -1 }).limit(30);

    return res.json({ success: true, count: notifications.length, notifications });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    // Verify ownership if it's not a broadcast
    if (notification.recipientId && notification.recipientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    notification.isRead = true;
    await notification.save();

    return res.json({ success: true, message: 'Notification marked as read', notification });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all user notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res, next) => {
  try {
    const recipientModel = req.user.role === 'admin' ? 'Admin' : (req.user.role === 'teacher' ? 'Teacher' : 'Student');

    await Notification.updateMany(
      {
        $or: [
          { recipientId: req.user._id, recipientModel },
          { recipientId: null }
        ],
        isRead: false
      },
      { isRead: true }
    );

    return res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

// @desc    Send Admin Concern / Approval Request for student quiz access
// @route   POST /api/notifications/request-admin-concern
// @access  Private (Student)
const requestAdminConcern = async (req, res, next) => {
  try {
    const { quizTitle } = req.body;
    
    await Notification.create({
      recipientId: null,
      recipientModel: 'Admin',
      senderId: req.user._id,
      senderModel: 'Student',
      title: 'Quiz Unlock & Admin Concern Request 🔒',
      message: `Student "${req.user.name}" (${req.user.email}) requested Admin concern and approval to attempt quiz "${quizTitle || 'Assessment'}".`,
      type: 'announcement'
    });

    return res.json({ success: true, message: 'Admin concern request logged successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  requestAdminConcern
};
