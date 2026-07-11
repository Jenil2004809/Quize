const User = require('../models/User');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Result = require('../models/Result');
const Category = require('../models/Category');
const Notification = require('../models/Notification');
const Certificate = require('../models/Certificate');
const Message = require('../models/Message');

const collections = {
  students: {
    label: 'Students',
    model: User,
    baseQuery: { role: 'student' },
    searchFields: ['name', 'email'],
    hiddenFields: '-password -otp'
  },
  teachers: {
    label: 'Teachers',
    model: User,
    baseQuery: { role: 'teacher' },
    searchFields: ['name', 'email'],
    hiddenFields: '-password -otp'
  },
  admins: {
    label: 'Admins',
    model: User,
    baseQuery: { role: 'admin' },
    searchFields: ['name', 'email'],
    hiddenFields: '-password -otp'
  },
  quizzes: {
    label: 'Quizzes',
    model: Quiz,
    baseQuery: {},
    searchFields: ['title', 'description', 'difficulty', 'visibility']
  },
  questions: {
    label: 'Questions',
    model: Question,
    baseQuery: {},
    searchFields: ['text', 'type', 'explanation']
  },
  results: {
    label: 'Results',
    model: Result,
    baseQuery: {},
    searchFields: []
  },
  subjects: {
    label: 'Subjects',
    model: Category,
    baseQuery: {},
    searchFields: ['name', 'description', 'slug']
  },
  notifications: {
    label: 'Notifications',
    model: Notification,
    baseQuery: {},
    searchFields: ['title', 'message', 'type']
  },
  certificates: {
    label: 'Certificates',
    model: Certificate,
    baseQuery: {},
    searchFields: ['certificateId']
  },
  messages: {
    label: 'Contact Messages',
    model: Message,
    baseQuery: {},
    searchFields: ['name', 'email', 'subject', 'message']
  }
};

const getCollectionConfig = (name) => collections[name];

const buildSearchQuery = (config, search) => {
  if (!search || !config.searchFields.length) return {};
  return {
    $or: config.searchFields.map((field) => ({
      [field]: { $regex: search, $options: 'i' }
    }))
  };
};

const listCollections = async (req, res, next) => {
  try {
    const summaries = await Promise.all(
      Object.entries(collections).map(async ([key, config]) => ({
        key,
        label: config.label,
        count: await config.model.countDocuments(config.baseQuery)
      }))
    );

    res.json({ success: true, collections: summaries });
  } catch (error) {
    next(error);
  }
};

const getCollectionRecords = async (req, res, next) => {
  try {
    const config = getCollectionConfig(req.params.collection);
    if (!config) {
      return res.status(404).json({ success: false, message: 'Collection is not available for administration' });
    }

    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
    const sortField = req.query.sortField || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const status = req.query.status;

    const query = {
      ...config.baseQuery,
      ...buildSearchQuery(config, req.query.search)
    };

    if (status === 'published') query.isPublished = true;
    if (status === 'draft') query.isPublished = false;
    if (status === 'approved') query.isApproved = true;
    if (status === 'pending') query.isApproved = false;
    if (status === 'passed') query.passed = true;
    if (status === 'failed') query.passed = false;
    if (status === 'unread') query.isRead = false;
    if (status === 'read') query.isRead = true;

    const [records, total] = await Promise.all([
      config.model
        .find(query)
        .select(config.hiddenFields || '')
        .sort({ [sortField]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      config.model.countDocuments(query)
    ]);

    res.json({
      success: true,
      collection: req.params.collection,
      page,
      pages: Math.ceil(total / limit) || 1,
      total,
      records
    });
  } catch (error) {
    next(error);
  }
};

const updateCollectionRecord = async (req, res, next) => {
  try {
    const config = getCollectionConfig(req.params.collection);
    if (!config) {
      return res.status(404).json({ success: false, message: 'Collection is not available for administration' });
    }

    const record = await config.model.findOne({ _id: req.params.id, ...config.baseQuery });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    const payload = { ...req.body };
    delete payload._id;
    delete payload.__v;
    delete payload.createdAt;
    delete payload.updatedAt;

    Object.assign(record, payload);
    await record.save();

    const updatedRecord = await config.model.findById(record._id).select(config.hiddenFields || '').lean();
    res.json({ success: true, message: 'Record updated successfully', record: updatedRecord });
  } catch (error) {
    next(error);
  }
};

const deleteCollectionRecord = async (req, res, next) => {
  try {
    const config = getCollectionConfig(req.params.collection);
    if (!config) {
      return res.status(404).json({ success: false, message: 'Collection is not available for administration' });
    }

    const record = await config.model.findOne({ _id: req.params.id, ...config.baseQuery });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    if (req.params.collection === 'admins' && record._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account from here' });
    }

    await record.deleteOne();
    res.json({ success: true, message: 'Record deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listCollections,
  getCollectionRecords,
  updateCollectionRecord,
  deleteCollectionRecord
};
