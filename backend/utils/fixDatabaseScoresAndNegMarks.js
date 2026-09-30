const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Question = require('../models/Question');
const Quiz = require('../models/Quiz');
const Result = require('../models/Result');

const fixDatabase = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/quiz_system';
  console.log('Connecting to:', mongoUri);
  await mongoose.connect(mongoUri);

  // 1. Reset negativeMarks on all questions to 0
  const qUpdateRes = await Question.updateMany({ negativeMarks: { $gt: 0 } }, { $set: { negativeMarks: 0 } });
  console.log('Reset negativeMarks to 0 on questions count:', qUpdateRes.modifiedCount);

  // 2. Re-evaluate existing student results
  const results = await Result.find({});
  console.log('Total results in database:', results.length);

  let updatedResultsCount = 0;

  for (const res of results) {
    if (res.wasDisqualified) continue;

    if (res.answers && res.answers.length > 0) {
      let earnedMarks = 0;
      let totalPossibleMarks = 0;
      let correctCount = 0;
      let wrongCount = 0;
      let skippedCount = 0;

      for (const ans of res.answers) {
        const q = await Question.findById(ans.questionId);
        const marks = q?.marks || 1;
        totalPossibleMarks += marks;

        if (ans.isCorrect) {
          correctCount++;
          ans.marksAwarded = marks;
          earnedMarks += marks;
        } else if (!ans.selectedAnswers || ans.selectedAnswers.length === 0) {
          skippedCount++;
          ans.marksAwarded = 0;
        } else {
          wrongCount++;
          ans.marksAwarded = 0;
        }
      }

      if (totalPossibleMarks === 0) totalPossibleMarks = res.answers.length || 1;

      const newPercentage = Math.round((earnedMarks / totalPossibleMarks) * 100);

      const quiz = await Quiz.findById(res.quizId);
      const passingMarks = quiz?.passingMarks || Math.ceil(totalPossibleMarks * 0.6);

      res.score = earnedMarks;
      res.percentage = newPercentage;
      res.correctAnswers = correctCount;
      res.wrongAnswers = wrongCount;
      res.skippedAnswers = skippedCount;
      res.passed = earnedMarks >= passingMarks;

      await res.save();
      updatedResultsCount++;
      console.log('Updated Result ' + res._id + ': score=' + earnedMarks + '/' + totalPossibleMarks + ', percentage=' + newPercentage + '%, correct=' + correctCount + ', wrong=' + wrongCount);
    } else if (res.correctAnswers > 0 && res.score === 0) {
      const totalQ = res.totalQuestions || 10;
      const earned = res.correctAnswers * 1;
      const newPct = Math.round((earned / totalQ) * 100);
      res.score = earned;
      res.percentage = newPct;
      await res.save();
      updatedResultsCount++;
      console.log('Updated summary Result ' + res._id + ': score=' + earned + '/' + totalQ + ', percentage=' + newPct + '%');
    }
  }

  console.log('Results checked. Updated: ', updatedResultsCount);
  await mongoose.disconnect();
  console.log('Migration done!');
};

fixDatabase();