const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { apiLimiter } = require('./middleware/rateLimiter');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false // Allows serving local uploads cross-origin
}));

app.use(cors({
  origin: true, // Dynamically allow mobile phone Wi-Fi IPs & local development origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Morgan HTTP Logger
app.use(morgan('dev'));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// General API request limiter
app.use('/api/', apiLimiter);

// ─── API Routes ────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/teachers', require('./routes/teacherRoutes'));
app.use('/api/quizzes', require('./routes/quizRoutes'));
app.use('/api/subjects', require('./routes/subjectRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/contact', require('./routes/messageRoutes'));
app.use('/api/database', require('./routes/databaseRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/results', require('./routes/resultRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/leaderboard', require('./routes/leaderboardRoutes'));
app.use('/api/settings', require('./routes/settingRoutes'));

// ─── Health Check ──────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: '🎓 Online Quiz Management System API is running!',
    version: '2.0.0',
    status: 'Healthy'
  });
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
