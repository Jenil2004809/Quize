const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Category = require('../models/Category');
const Subject = require('../models/Subject');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Admin = require('../models/Admin');
const Result = require('../models/Result');
const Certificate = require('../models/Certificate');
const Setting = require('../models/Setting');


async function auditDB() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/quiz_system');
  console.log('CONNECTED TO MONGO');

  console.log('\n--- QUIZZES ---');
  const quizzes = await Quiz.find({});
  console.log('Total quizzes:', quizzes.length);
  for (const q of quizzes) {
    const qCount = await Question.countDocuments({ quizId: q._id });
    const missing = [];
    if (!q.category) missing.push('category');
    if (!q.subject) missing.push('subject');
    if (!q.unitName) missing.push('unitName');
    if (!q.thumbnail) missing.push('thumbnail');
    if (qCount === 0) missing.push('NO_QUESTIONS');
    if (missing.length > 0) {
      console.log('Quiz [' + q._id + '] "' + q.title + '" missing: ' + missing.join(', ') + ' (qCount: ' + qCount + ')');
    }
  }


  console.log('Ln--- QUESTIONS ---');
  console.log('Checking questions...');
  const questions = await Question.find({});
  let qMissingExp = 0, qMissingOpts = 0, qMismatch = 0, qMissingMarks = 0;
  for (const q of questions) {
    if (!q.explanation || q.explanation.trim() === '') qMissingExp++;
    if (!q.options || q.options.length < 2) qMissingOpts++;
    if (q.options && q.correctAnswers && !q.options.includes(q.correctAnswers[0])) qMismatch++;
    if (!q.marks) qMissingMarks++;
  }
  console.log('Total questions: ' + questions.length);
  console.log('Missing explanation: ' + qMissingExp);
  console.log('Missing/insufficient options: ' + qMissingOpts);
  console.log('Correct key not in options: ' + qMismatch);
  console.log('Missing marks: ' + qMissingMarks);


  console.log('3N--- USERS ---');
  const students = await Student.find({});
  console.log('Students: ' + students.length);
  for (const s of students) {
    const m = [];
    if (!s.avatar) m.push('avatar');
    if (!s.phone) m.push('phone');
    if (m.length > 0) console.log(' Student "' + s.name + '" (' + s.email + ') missing: ' + m.join(', '));
  }


  console.log('3N--- TEACHERS ---');
  const teachers = await Teacher.find({});
  console.log('Teachers: ' + teachers.length);
  for (const t of teachers) {
    const m = [];
    if (!t.avatar) m.push('avatar');
    if (!t.phone) m.push('phone');
    if (!t.specialization) m.push('specialization');
    if (m.length > 0) console.log(' Teacher "' + t.name + '" (' + t.email + ') missing: ' + m.join(', '));
  }


  console.log('Ln--- ADMINS ---');
  const admins = await Admin.find({});
  console.log('Admins: ' + admins.length);
  for (const a of admins) {
    const m = [];
    if (!a.avatar) m.push('avatar');
    if (!a.phone) m.push('phone');
    if (m.length > 0) console.log(' Admin "' + a.name + '" (' + a.email + ') missing: ' + m.join(', '));
  }


  console.log('Ln--- RESULTS & CERTIFICATES ---');
  console.log('Checking results...');
  const results = await Result.find({});
  const passedResults = results.filter(r => r.passed);
  console.log('Passed results count: ' + passedResults.length);
  for (const r of passedResults) {
    const cert = await Certificate.findOne({ resultId: r._id });
    if (!cert) console.log(' Passed result ' + r._id + ' is missing Certificate!');
  }

  console.log('Ln--- SCHEMA CHECK DONE ---');
  await mongoose.disconnect();
}

auditDB();