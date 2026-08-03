const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const { approveTeacher, rejectTeacher, deleteUser, approveUser } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const admin = require('../middleware/admin');

// Handler for fetching users based on role filter (needed by frontend)
const getUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    let users = [];

    if (role === 'teacher') {
      const query = {};
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      users = await Teacher.find(query).select('-password').sort({ createdAt: -1 });
    } else if (role === 'student') {
      const query = {};
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      users = await Student.find(query).select('-password').sort({ createdAt: -1 });
    } else {
      // Return both if no role specified
      const [students, teachers] = await Promise.all([
        Student.find().select('-password'),
        Teacher.find().select('-password')
      ]);
      users = [...students, ...teachers];
    }

    return res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// Admin only routes for managing users
router.use(protect);
router.use(admin);

router.get('/', getUsers);
router.put('/approve-teacher/:id', approveTeacher);
router.put('/reject-teacher/:id', rejectTeacher);
router.put('/:id/approve', approveUser);
router.delete('/:id', deleteUser);

module.exports = router;
