const Subject = require('../models/Subject');
const Quiz = require('../models/Quiz');
const { notifyAnalyticsUpdate } = require('../config/socket');

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Public
const getSubjects = async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = {};

    if (category) {
      filter.category = category;
    }

    const subjects = await Subject.find(filter)
      .populate('category', 'name description')
      .sort({ name: 1 });

    return res.json({
      success: true,
      count: subjects.length,
      subjects
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single subject by ID or slug
// @route   GET /api/subjects/:idOrSlug
// @access  Public
const getSubjectByIdOrSlug = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    let subject;

    // Check if ID or slug
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      subject = await Subject.findById(idOrSlug).populate('category', 'name');
    } else {
      subject = await Subject.findOne({ slug: idOrSlug }).populate('category', 'name');
    }

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    return res.json({
      success: true,
      subject
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new subject
// @route   POST /api/subjects
// @access  Private (Teacher or Admin)
const createSubject = async (req, res, next) => {
  try {
    const { name, description, category } = req.body;

    if (!name || !category) {
      return res.status(400).json({ success: false, message: 'Subject name and category reference are required' });
    }

    const existingSubject = await Subject.findOne({ name });
    if (existingSubject) {
      return res.status(400).json({ success: false, message: 'Subject with this name already exists' });
    }

    const subject = await Subject.create({
      name,
      description,
      category
    });

    notifyAnalyticsUpdate();

    return res.status(201).json({
      success: true,
      message: 'Subject created successfully!',
      subject
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a subject
// @route   PUT /api/subjects/:id
// @access  Private (Teacher or Admin)
const updateSubject = async (req, res, next) => {
  try {
    const { name, description, category } = req.body;
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    if (name) {
      subject.name = name;
      subject.slug = undefined; // Trigger pre-validate hook to rebuild slug
    }
    if (description) subject.description = description;
    if (category) subject.category = category;

    await subject.save();

    return res.json({
      success: true,
      message: 'Subject updated successfully!',
      subject
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a subject
// @route   DELETE /api/subjects/:id
// @access  Private (Admin)
const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    // Set all quizzes pointing to this subject to null
    await Quiz.updateMany({ subject: subject._id }, { $set: { subject: null } });

    await subject.deleteOne();
    notifyAnalyticsUpdate();

    return res.json({
      success: true,
      message: 'Subject deleted and associated quizzes updated successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSubjects,
  getSubjectByIdOrSlug,
  createSubject,
  updateSubject,
  deleteSubject
};
