require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Result = require('../models/Result');
const Certificate = require('../models/Certificate');
const Notification = require('../models/Notification');
const Message = require('../models/Message');

const seedDatabase = async () => {
  try {
    // Connect
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/quiz_system');
    console.log('Seeder: Database Connected...');

    // Clear collections
    await User.deleteMany();
    await Category.deleteMany();
    await Quiz.deleteMany();
    await Question.deleteMany();
    await Result.deleteMany();
    await Certificate.deleteMany();
    await Notification.deleteMany();
    await Message.deleteMany();
    console.log('Seeder: Database cleared.');

    // Seed Users
    // passwords will be hashed in the pre-save hook
    const users = await User.create([
      {
        name: 'System Admin',
        email: 'admin@quiz.com',
        password: 'Admin@1234',
        role: 'admin',
        isApproved: true,
        isEmailVerified: true
      },
      {
        name: 'Teacher Jane',
        email: 'teacher@quiz.com',
        password: 'Teacher@1234',
        role: 'teacher',
        isApproved: true,
        isEmailVerified: true
      },
      {
        name: 'Student John',
        email: 'student@quiz.com',
        password: 'Student@1234',
        role: 'student',
        isApproved: true,
        isEmailVerified: true
      }
    ]);
    console.log('Seeder: Users created.');

    const teacher = users.find(u => u.role === 'teacher');

    // Seed Categories
    const categories = await Category.create([
      {
        name: 'Computer Science',
        description: 'Quizzes covering web development, database design, algorithms, and tech languages.',
        image: ''
      },
      {
        name: 'Mathematics',
        description: 'Test your algebra, geometry, calculus, and basic mental math operations.',
        image: ''
      },
      {
        name: 'General Knowledge',
        description: 'World histories, geography, sports, pop culture, and fun trivia.',
        image: ''
      }
    ]);
    console.log('Seeder: Categories created.');

    const csCat = categories.find(c => c.name === 'Computer Science');
    const mathCat = categories.find(c => c.name === 'Mathematics');

    // Seed Javascript Quiz
    const jsQuiz = await Quiz.create({
      title: 'JavaScript Fundamentals',
      description: 'Test your understanding of scopes, closures, dynamic typings, and basic JS operations.',
      category: csCat._id,
      difficulty: 'medium',
      timeLimit: 10, // 10 minutes
      passingMarks: 3,
      maxAttempts: 3,
      visibility: 'public',
      creator: teacher._id,
      isPublished: true
    });

    const mathQuiz = await Quiz.create({
      title: 'Mental Math Challenge',
      description: 'Quick arithmetic questions to test your speed and accuracy.',
      category: mathCat._id,
      difficulty: 'easy',
      timeLimit: 5,
      passingMarks: 2,
      maxAttempts: 5,
      visibility: 'public',
      creator: teacher._id,
      isPublished: true
    });
    console.log('Seeder: Quizzes created.');

    // Seed JS Questions
    await Question.create([
      {
        quizId: jsQuiz._id,
        type: 'mcq',
        text: 'Which keyword is used to declare a block-scoped variable in modern JavaScript?',
        options: ['var', 'let', 'const', 'both let and const'],
        correctAnswers: ['both let and const'],
        explanation: 'In ES6, both let and const declare variables that are scoped to the block, statement, or expression on which they are used.',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        quizId: jsQuiz._id,
        type: 'true-false',
        text: 'JavaScript is a statically-typed language.',
        options: ['True', 'False'],
        correctAnswers: ['False'],
        explanation: 'JavaScript is a dynamically-typed language, meaning variables are not directly associated with any particular value type.',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        quizId: jsQuiz._id,
        type: 'fill-in-the-blank',
        text: 'What is the string evaluation of: typeof NaN ?',
        options: [],
        correctAnswers: ['number'],
        explanation: 'Although NaN stands for "Not-a-Number", its structural data type is actually a number.',
        marks: 1,
        negativeMarks: 0
      },
      {
        quizId: jsQuiz._id,
        type: 'multiple-correct',
        text: 'Which of the following are falsy values in JavaScript? (Select all that apply)',
        options: ['0', '"" (empty string)', '[] (empty array)', 'null', 'undefined'],
        correctAnswers: ['0', '"" (empty string)', 'null', 'undefined'],
        explanation: 'In JavaScript, 0, "", null, and undefined are falsy. Empty array [] is evaluated as truthy.',
        marks: 2,
        negativeMarks: 0.5
      }
    ]);

    // Seed Math Questions
    await Question.create([
      {
        quizId: mathQuiz._id,
        type: 'mcq',
        text: 'What is the value of 15 * 6 - 12?',
        options: ['78', '90', '84', '72'],
        correctAnswers: ['78'],
        explanation: 'By BODMAS rules, multiply first: 15 * 6 = 90. Then subtract: 90 - 12 = 78.',
        marks: 1
      },
      {
        quizId: mathQuiz._id,
        type: 'true-false',
        text: 'A triangle can have two right angles.',
        options: ['True', 'False'],
        correctAnswers: ['False'],
        explanation: 'The sum of all angles in a triangle is 180 degrees. If it had two right angles (90 + 90 = 180), the third angle would have to be 0, which is impossible.',
        marks: 1
      },
      {
        quizId: mathQuiz._id,
        type: 'fill-in-the-blank',
        text: 'Solve for x: 3x + 7 = 22. What is x?',
        options: [],
        correctAnswers: ['5'],
        explanation: 'Subtract 7 from both sides: 3x = 15. Divide by 3: x = 5.',
        marks: 1
      }
    ]);

    console.log('Seeder: Questions seeded.');
    
    // Seed initial notifications
    await Notification.create({
      recipientId: null,
      title: 'Welcome to Quizzy! 🎉',
      message: 'Explore categories, search for dynamic quizzes, attempt exams, and earn certifications instantly.',
      type: 'announcement'
    });

    console.log('Seeder: Successfully completed database population!');
    process.exit(0);
  } catch (error) {
    console.error('Seeder Error:', error);
    process.exit(1);
  }
};

seedDatabase();
