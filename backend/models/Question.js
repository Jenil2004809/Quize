const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: [true, 'Quiz reference is required'],
    index: true
  },
  type: {
    type: String,
    enum: ['mcq', 'true-false', 'fill-in-the-blank', 'multiple-correct'],
    required: [true, 'Question type is required']
  },
  text: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  image: {
    type: String,
    default: ''
  },
  options: {
    type: [String],
    default: [] // Empty for true-false or fill-in-the-blank
  },
  correctAnswers: {
    type: [String], // Array of strings (handles multiple correct answers)
    required: [true, 'Correct answer(s) are required']
  },
  explanation: {
    type: String,
    trim: true,
    default: ''
  },
  marks: {
    type: Number,
    default: 1,
    min: [0, 'Marks must be non-negative']
  },
  negativeMarks: {
    type: Number,
    default: 0,
    min: [0, 'Negative marks must be non-negative']
  },
  timer: {
    type: Number,
    default: 0 // Optional question-level timer in seconds
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Question', questionSchema);
