const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');
const admin = require('../middleware/admin');
const upload = require('../middleware/upload');

// Public
router.get('/', getCategories);

// Private (Teachers / Admins)
router.post('/', protect, upload.single('image'), createCategory);
router.put('/:id', protect, upload.single('image'), updateCategory);

// Private (Admin only)
router.delete('/:id', protect, admin, deleteCategory);

module.exports = router;
