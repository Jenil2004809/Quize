require('dotenv').config();
const connectDB = require('./config/db');
const Admin = require('./models/Admin');
const app = require('./app');

// Initialize database connection
connectDB().then(async () => {
  // Ensure single default admin exists
  try {
    // Delete any other admin account so admin@quizsystem.com is the sole admin
    await Admin.deleteMany({ email: { $ne: 'admin@quizsystem.com' } });

    let admin1 = await Admin.findOne({ email: 'admin@quizsystem.com' });
    if (!admin1) {
      await Admin.create({
        name: 'System Administrator',
        email: 'admin@quizsystem.com',
        phone: '9999999999',
        password: 'Admin@123',
        role: 'admin',
        isActive: true
      });
    } else {
      admin1.password = 'Admin@123';
      admin1.isActive = true;
      await admin1.save();
    }
    console.log('🏁 Sole System Admin active: admin@quizsystem.com (Admin@123)');
  } catch (err) {
    console.error('❌ Error seeding single admin:', err.message);
  }
});

const PORT = process.env.PORT || 5005;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log('');
  console.log('🚀 =============================================');
  console.log(`🎓 Quiz Management API running on ${HOST}:${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('🚀 =============================================');
  console.log('');
});

// Handle EADDRINUSE and server errors gracefully
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use by another running process.`);
    console.error(`👉 Run 'npx kill-port ${PORT}' or terminate the duplicate node instance.`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', err.message);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});
