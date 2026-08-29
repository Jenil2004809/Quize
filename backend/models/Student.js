const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    default: 'student'
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  coverPhoto: {
    type: String,
    default: ''
  },
  isApproved: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: true
  },
  otp: {
    type: String,
    default: null
  },
  otpExpires: {
    type: Date,
    default: null
  },
  bookmarks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz'
    }
  ]
}, {
  timestamps: true
});

// Hash password before saving
studentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
studentSchema.methods.comparePassword = async function(candidatePassword) {
  if (!candidatePassword || !this.password) return false;
  if (candidatePassword === this.password) return true;
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (err) {
    return false;
  }
};

module.exports = mongoose.model('Student', studentSchema);
