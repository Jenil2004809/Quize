const Message = require('../models/Message');

// @desc    Submit a contact message
// @route   POST /api/contact
// @access  Public
const submitMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Please provide all fields' });
    }

    const newMessage = await Message.create({
      name,
      email,
      subject,
      message
    });

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully! We will get back to you shortly.',
      messageData: newMessage
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all messages (Contact Us inbox)
// @route   GET /api/contact
// @access  Private (Admin only)
const getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    return res.json({ success: true, count: messages.length, messages });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle resolve message status
// @route   PUT /api/contact/:id/resolve
// @access  Private (Admin only)
const resolveMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    message.isResolved = !message.isResolved;
    await message.save();

    return res.json({
      success: true,
      message: message.isResolved ? 'Message marked as resolved' : 'Message marked as unresolved',
      messageData: message
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitMessage,
  getMessages,
  resolveMessage
};
