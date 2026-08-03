const express = require('express');
const router = express.Router();
const {
  getSubjects,
  getSubjectByIdOrSlug,
  createSubject,
  updateSubject,
  deleteSubject
} = require('../controllers/subjectController');
const { protect } = require('../middleware/auth');
const admin = require('../middleware/admin');

// Public
router.get('/', getSubjects);
router.get('/:idOrSlug', getSubjectByIdOrSlug);

// Private (Teachers / Admins)
router.post('/', protect, createSubject);
router.put('/:id', protect, updateSubject);

// Private (Admin only)
router.delete('/:id', protect, admin, deleteSubject);

module.exports = router;
