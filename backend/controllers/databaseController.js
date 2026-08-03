const mongoose = require('mongoose');

// Helper to resolve model name from collection key
const getModel = (collectionName) => {
  const map = {
    admins: 'Admin',
    students: 'Student',
    teachers: 'Teacher',
    quizzes: 'Quiz',
    questions: 'Question',
    categories: 'Category',
    subjects: 'Subject',
    results: 'Result',
    certificates: 'Certificate',
    notifications: 'Notification',
    messages: 'Message'
  };
  const modelName = map[collectionName];
  return modelName ? mongoose.model(modelName) : null;
};

// Metadata mapping to make MongoDB collections clear and self-documenting
const collectionMetadataMap = {
  admins: {
    description: 'Platform administrators with system configuration, approval, and user management privileges.',
    fields: ['name', 'email', 'phone', 'role', 'isActive'],
    relations: 'System Root Role'
  },
  students: {
    description: 'Registered student accounts, quiz bookmarks, and individual performance profiles.',
    fields: ['name', 'email', 'phone', 'bookmarks', 'isApproved', 'isActive'],
    relations: 'References Quiz (via bookmarks array)'
  },
  teachers: {
    description: 'Educators authorized to construct quizzes, manage question banks, and review attempt metrics.',
    fields: ['name', 'email', 'phone', 'specialization', 'isApproved', 'isActive'],
    relations: 'Referenced by Quiz (creator)'
  },
  quizzes: {
    description: 'Assessment exams containing time limits, difficulty ratings, passing marks, and category tags.',
    fields: ['title', 'category', 'difficulty', 'timeLimit', 'passingMarks', 'maxAttempts', 'isPublished'],
    relations: 'Belongs to Category, Subject, and Creator (Teacher/Admin)'
  },
  questions: {
    description: 'Question items (MCQ, True/False, Multiple Select, Fill in Blank, Short Answer).',
    fields: ['quizId', 'type', 'text', 'options', 'correctAnswers', 'marks', 'negativeMarks'],
    relations: 'Belongs to Quiz (quizId)'
  },
  categories: {
    description: 'Primary domain classifications for organizing quizzes (e.g. Science, Technology, Math).',
    fields: ['name', 'description', 'icon'],
    relations: 'Referenced by Quiz & Subject'
  },
  subjects: {
    description: 'Academic subject subfields assigned under main categories.',
    fields: ['name', 'category', 'code'],
    relations: 'Belongs to Category'
  },
  results: {
    description: 'Student exam submission records with score totals, accuracy percentages, and pass/fail states.',
    fields: ['studentId', 'quizId', 'score', 'percentage', 'passed', 'timeTaken'],
    relations: 'References Student & Quiz'
  },
  certificates: {
    description: 'Unique digital award credentials generated automatically upon passing a quiz.',
    fields: ['certificateId', 'studentId', 'quizId', 'resultId', 'createdAt'],
    relations: 'References Student, Quiz & Result'
  },
  notifications: {
    description: 'In-app user updates and activity notifications for students and teachers.',
    fields: ['recipientId', 'recipientModel', 'title', 'message', 'isRead', 'type'],
    relations: 'Polymorphic reference (Student / Teacher / Admin)'
  },
  messages: {
    description: 'User inquiries and support feedback submitted through the Contact Us form.',
    fields: ['name', 'email', 'subject', 'message', 'isResolved'],
    relations: 'Independent Contact Inquiry'
  }
};

// @desc    Get all collections, counts, and schema metadata
// @route   GET /api/database
// @access  Private (Admin only)
const getCollections = async (req, res, next) => {
  try {
    const list = [
      { key: 'admins', label: 'Admins' },
      { key: 'students', label: 'Students' },
      { key: 'teachers', label: 'Teachers' },
      { key: 'quizzes', label: 'Quizzes' },
      { key: 'questions', label: 'Questions' },
      { key: 'categories', label: 'Categories' },
      { key: 'subjects', label: 'Subjects' },
      { key: 'results', label: 'Results' },
      { key: 'certificates', label: 'Certificates' },
      { key: 'notifications', label: 'Notifications' },
      { key: 'messages', label: 'Messages' }
    ];

    const collectionsWithCounts = await Promise.all(list.map(async (item) => {
      try {
        const model = getModel(item.key);
        const count = model ? await model.countDocuments() : 0;
        const meta = collectionMetadataMap[item.key] || {};
        return {
          ...item,
          count,
          description: meta.description || '',
          fields: meta.fields || [],
          relations: meta.relations || ''
        };
      } catch (err) {
        return { ...item, count: 0, description: '', fields: [], relations: '' };
      }
    }));

    return res.json({
      success: true,
      collections: collectionsWithCounts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get records for a collection
// @route   GET /api/database/:collection
// @access  Private (Admin only)
const getCollectionRecords = async (req, res, next) => {
  try {
    const collectionKey = req.params.collection;
    const { search, page = 1, limit = 10, sortField = 'createdAt', sortOrder = 'desc' } = req.query;

    const model = getModel(collectionKey);
    if (!model) {
      return res.status(404).json({ success: false, message: `Collection ${collectionKey} not found` });
    }

    // Build search query if applicable
    const query = {};
    if (search) {
      const searchFields = [];
      const paths = model.schema.paths;
      for (let path in paths) {
        if (paths[path].instance === 'String') {
          searchFields.push({ [path]: { $regex: search, $options: 'i' } });
        }
      }
      if (searchFields.length > 0) {
        query.$or = searchFields;
      }
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skipIndex = (pageNum - 1) * limitNum;

    // Sorting
    const sort = { [sortField]: sortOrder === 'desc' ? -1 : 1 };

    const total = await model.countDocuments(query);
    const records = await model.find(query)
      .sort(sort)
      .skip(skipIndex)
      .limit(limitNum);

    const metadata = collectionMetadataMap[collectionKey] || {};

    return res.json({
      success: true,
      records,
      metadata,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      total
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a collection record
// @route   PUT /api/database/:collection/:id
// @access  Private (Admin only)
const updateCollectionRecord = async (req, res, next) => {
  try {
    const { collection, id } = req.params;
    const model = getModel(collection);

    if (!model) {
      return res.status(404).json({ success: false, message: `Collection ${collection} not found` });
    }

    const record = await model.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    return res.json({
      success: true,
      message: 'Record updated successfully',
      record
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a collection record
// @route   DELETE /api/database/:collection/:id
// @access  Private (Admin only)
const deleteCollectionRecord = async (req, res, next) => {
  try {
    const { collection, id } = req.params;
    const model = getModel(collection);

    if (!model) {
      return res.status(404).json({ success: false, message: `Collection ${collection} not found` });
    }

    const record = await model.findById(id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    await record.deleteOne();

    return res.json({
      success: true,
      message: 'Record deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Seed database with clean sample categories, subjects, and sample quizzes
// @route   POST /api/database/seed
// @access  Private (Admin only)
const seedSampleData = async (req, res, next) => {
  try {
    const Category = mongoose.model('Category');
    const Subject = mongoose.model('Subject');
    const Quiz = mongoose.model('Quiz');
    const Question = mongoose.model('Question');
    const Admin = mongoose.model('Admin');

    // Create default categories if none exist
    let catTech = await Category.findOne({ name: 'Technology & Programming' });
    if (!catTech) {
      catTech = await Category.create({
        name: 'Technology & Programming',
        description: 'Software development, algorithms, web technologies, and database architecture.'
      });
    }

    let catScience = await Category.findOne({ name: 'Science & General Knowledge' });
    if (!catScience) {
      catScience = await Category.create({
        name: 'Science & General Knowledge',
        description: 'Physics, chemistry, general aptitude, and global trivia.'
      });
    }

    // Create sample subject
    let subJS = await Subject.findOne({ name: 'JavaScript & Web Architecture' });
    if (!subJS) {
      subJS = await Subject.create({
        name: 'JavaScript & Web Architecture',
        category: catTech._id,
        description: 'Core ECMAScript fundamentals, async operations, and web APIs.'
      });
    }

    // Check if sample quiz exists
    let adminUser = await Admin.findOne();
    if (adminUser) {
      let sampleQuiz = await Quiz.findOne({ title: 'Full-Stack JavaScript Essentials' });
      if (!sampleQuiz) {
        sampleQuiz = await Quiz.create({
          title: 'Full-Stack JavaScript Essentials',
          description: 'Test your understanding of modern JavaScript, asynchronous execution, promises, and REST API conventions.',
          category: catTech._id,
          subject: subJS._id,
          difficulty: 'medium',
          timeLimit: 15,
          passingMarks: 3,
          maxAttempts: 5,
          visibility: 'public',
          creator: adminUser._id,
          creatorModel: 'Admin',
          isPublished: true
        });

        // Add questions to sample quiz
        await Question.create([
          {
            quizId: sampleQuiz._id,
            type: 'mcq',
            text: 'Which operator is used to compare both value and data type in JavaScript?',
            options: ['==', '===', '=', '!='],
            correctAnswers: ['==='],
            explanation: '=== checks strict equality without type coercion.',
            marks: 2,
            negativeMarks: 0
          },
          {
            quizId: sampleQuiz._id,
            type: 'true-false',
            text: 'Promises in JavaScript can resolve asynchronously.',
            options: ['True', 'False'],
            correctAnswers: ['True'],
            explanation: 'Promises handle asynchronous computations.',
            marks: 1,
            negativeMarks: 0
          },
          {
            quizId: sampleQuiz._id,
            type: 'short-answer',
            text: 'What keyword defines a constant variable in JavaScript?',
            options: [],
            correctAnswers: ['const'],
            explanation: 'const declares variables whose references cannot be reassigned.',
            marks: 2,
            negativeMarks: 0
          }
        ]);
      }
    }

    return res.json({
      success: true,
      message: 'Sample data seeded successfully into MongoDB!'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCollections,
  getCollectionRecords,
  updateCollectionRecord,
  deleteCollectionRecord,
  seedSampleData
};
