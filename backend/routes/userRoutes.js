const express = require('express');
const router = express.Router();
const {
  getUsers,
  approveTeacher,
  deleteUser
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('admin'), getUsers);
router.put('/approve-teacher/:id', protect, authorize('admin'), approveTeacher);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
