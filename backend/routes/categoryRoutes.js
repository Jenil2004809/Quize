const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', getCategories);
router.post('/', protect, authorize('teacher', 'admin'), upload.single('image'), createCategory);
router.put('/:id', protect, authorize('teacher', 'admin'), upload.single('image'), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

module.exports = router;
