const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getStudents,
  getStudentById,
  getTeachers,
  getTeacherById,
  approveTeacher,
  rejectTeacher,
  toggleUserStatus,
  resetUserPassword,
  deleteUser,
  getDatabaseCollections,
  getCollectionRecords
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const admin = require('../middleware/admin');

// Apply protection & admin checking to all routes
router.use(protect);
router.use(admin);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Students Management
router.get('/students', getStudents);
router.get('/students/:id', getStudentById);

// Teachers Management
router.get('/teachers', getTeachers);
router.get('/teachers/:id', getTeacherById);
router.put('/teachers/:id/approve', approveTeacher);
router.put('/teachers/:id/reject', rejectTeacher);

// User Controls (Students + Teachers)
router.put('/users/:id/toggle-status', toggleUserStatus);
router.put('/users/:id/reset-password', resetUserPassword);
router.delete('/users/:id', deleteUser);

// Database Browser / Operations
router.get('/database/collections', getDatabaseCollections);
router.get('/database/collections/:name', getCollectionRecords);

module.exports = router;
