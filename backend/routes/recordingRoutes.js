const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  uploadRecording,
  getTeacherRecordings,
  getAdminRecordings,
  getRecordingById,
  deleteRecording
} = require('../controllers/recordingController');
const { protect } = require('../middleware/auth');
const admin = require('../middleware/admin');

// Ensure uploads/recordings directory exists
const recordingsDir = path.join(__dirname, '..', 'uploads', 'recordings');
if (!fs.existsSync(recordingsDir)) {
  fs.mkdirSync(recordingsDir, { recursive: true });
}

// Multer Storage Configuration for Exam Video Recordings
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, recordingsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.webm';
    cb(null, `recording-${uniqueSuffix}${ext}`);
  }
});

const videoFilter = (req, file, cb) => {
  // Allow all standard video formats and webm/blob stream recordings
  if (
    file.mimetype.startsWith('video/') ||
    file.mimetype === 'application/octet-stream' ||
    file.originalname.match(/\.(webm|mp4|ogg|mkv|mov|avi)$/i)
  ) {
    cb(null, true);
  } else {
    cb(null, true); // Permissive for browser MediaRecorder blobs
  }
};

const uploadVideo = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB max recording size
  fileFilter: videoFilter
});

// All recording routes require authenticated JWT session
router.use(protect);

// Student/Exam endpoint to upload video recording on submission
router.post('/upload/:resultId', uploadVideo.single('video'), uploadRecording);

// Teacher-specific recordings access
router.get('/teacher', getTeacherRecordings);

// Admin-specific global recordings access
router.get('/admin', admin, getAdminRecordings);

// Fetch single recording details (Admin or Teacher)
router.get('/:id', getRecordingById);

// Admin delete recording
router.delete('/:id', admin, deleteRecording);

module.exports = router;
