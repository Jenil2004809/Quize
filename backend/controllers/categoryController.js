const Category = require('../models/Category');
const Quiz = require('../models/Quiz');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    return res.json({ success: true, count: categories.length, categories });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private (Teacher/Admin)
const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const exists = await Category.findOne({ name });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    let image = '';
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    const category = await Category.create({
      name,
      description,
      image
    });

    return res.status(201).json({ success: true, message: 'Category created successfully!', category });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private (Teacher/Admin)
const updateCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    if (name) {
      category.name = name;
      category.slug = undefined; // Force regenerate slug
    }
    if (description) category.description = description;

    if (req.file) {
      category.image = `/uploads/${req.file.filename}`;
    }

    await category.save();

    return res.json({ success: true, message: 'Category updated successfully!', category });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private (Admin only)
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Check if any quizzes exist under this category
    const quizzesCount = await Quiz.countDocuments({ category: req.params.id });
    if (quizzesCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. There are ${quizzesCount} quizzes assigned to it.`
      });
    }

    await category.deleteOne();

    return res.json({ success: true, message: 'Category deleted successfully!' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
