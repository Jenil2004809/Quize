const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/quiz_system';
  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Warning: ${error.message}`);
    console.log('⚠️ Running in standalone mode; please set MONGO_URI in environment settings if needed.');
  }
};

module.exports = connectDB;
