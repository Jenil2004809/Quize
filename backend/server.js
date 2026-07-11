require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { apiLimiter } = require('./middleware/rateLimiter');

// Initialize database
connectDB();

const app = express();

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false // Allows serving local uploads cross-origin
}));

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// General API request limiter
app.use('/api/', apiLimiter);

// ─── API Routes ────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/quizzes', require('./routes/quizRoutes'));
app.use('/api/results', require('./routes/resultRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/contact', require('./routes/messageRoutes'));
app.use('/api/leaderboard', require('./routes/leaderboardRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/database', require('./routes/databaseRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));

// ─── Health Check ──────────────────────────────────────────────────────────

app.get('/', (req, res) => {
  res.json({
    message: '🎓 Online Quiz Management System API is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      quizzes: '/api/quizzes',
      questions: '/api/quizzes/:id/questions',
      results: '/api/results',
      categories: '/api/categories',
      leaderboard: '/api/leaderboard',
      analytics: '/api/analytics/dashboard',
      notifications: '/api/notifications',
      contact: '/api/contact',
      users: '/api/users',
      database: '/api/database'
    }
  });
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ================================');
  console.log(`🎓 Quiz API Server running on port ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('🚀 ================================');
  console.log('');
});
