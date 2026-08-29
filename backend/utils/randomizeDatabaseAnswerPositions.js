const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Question = require('../models/Question');
const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/quiz_system';

// Fisher-Yates Shuffle
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const randomizeAllDatabaseAnswerPositions = async () => {
  try {
    console.log('🎲 RANDOMIZING ANSWER POSITIONS (A, B, C, D) ACROSS ALL MONGODB QUESTIONS...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB.');

    const questions = await Question.find({});
    console.log(`📊 Found ${questions.length} total questions in database. Updating option choices...`);

    let countA = 0;
    let countB = 0;
    let countC = 0;
    let countD = 0;
    let updatedCount = 0;

    for (const q of questions) {
      if (q.options && Array.isArray(q.options) && q.options.length > 1) {
        // Randomly shuffle options array so correct answers are evenly spread across A, B, C, D
        const shuffledOptions = shuffleArray(q.options);
        q.options = shuffledOptions;
        await q.save();
        updatedCount++;

        // Track stats for correct answer position
        if (q.correctAnswers && q.correctAnswers.length > 0) {
          const firstCorrect = q.correctAnswers[0];
          const index = shuffledOptions.indexOf(firstCorrect);
          if (index === 0) countA++;
          else if (index === 1) countB++;
          else if (index === 2) countC++;
          else if (index === 3) countD++;
        }
      }
    }

    console.log('\n===========================================================');
    console.log(`🎉 COMPLETED! Updated ${updatedCount} questions with randomized option choices.`);
    console.log('📈 CORRECT ANSWER POSITION DISTRIBUTION IN DATABASE:');
    console.log(`   - Option A (Index 0): ${countA} questions (${Math.round((countA / updatedCount) * 100)}%)`);
    console.log(`   - Option B (Index 1): ${countB} questions (${Math.round((countB / updatedCount) * 100)}%)`);
    console.log(`   - Option C (Index 2): ${countC} questions (${Math.round((countC / updatedCount) * 100)}%)`);
    console.log(`   - Option D (Index 3): ${countD} questions (${Math.round((countD / updatedCount) * 100)}%)`);
    console.log('===========================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error randomizing answer positions:', error);
    process.exit(1);
  }
};

randomizeAllDatabaseAnswerPositions();
