const { MongoClient } = require('mongodb');
const { balanceAndDistributeQuestionOptions } = require('../utils/shuffleUtils');

async function rebalanceAllQuestions() {
  const client = new MongoClient('mongodb://127.0.0.1:27018');
  await client.connect();
  const db = client.db('quiz_system');
  console.log('Connected to dedicated MongoDB on port 27018');

  // Fetch all quizzes
  const quizzes = await db.collection('quizzes').find().toArray();
  console.log(`Found ${quizzes.length} quizzes. Rebalancing question options per quiz...`);

  let totalUpdated = 0;
  const stats = { 0: 0, 1: 0, 2: 0, 3: 0 };

  for (const quiz of quizzes) {
    const questions = await db.collection('questions').find({ quizId: quiz._id }).toArray();
    if (questions.length === 0) continue;

    // Apply balanced option distribution to this quiz's questions
    const rebalanced = balanceAndDistributeQuestionOptions(questions);

    for (const q of rebalanced) {
      await db.collection('questions').updateOne(
        { _id: q._id },
        { $set: { options: q.options } }
      );
      totalUpdated++;

      // Track correct answer position
      if (Array.isArray(q.correctAnswers) && q.correctAnswers.length > 0) {
        const target = q.correctAnswers[0].trim().toLowerCase();
        const pos = q.options.findIndex(o => o.trim().toLowerCase() === target);
        if (pos >= 0 && pos <= 3) {
          stats[pos]++;
        }
      }
    }
  }

  console.log(`\n=== REBALANCING COMPLETE ===`);
  console.log(`Successfully rebalanced options for ${totalUpdated} questions across all quizzes!`);
  console.log(`New Correct Answer Position Distribution across options:`);
  console.log(`- Option A (Index 0): ${stats[0]} questions (${Math.round(stats[0]/totalUpdated*100)}%)`);
  console.log(`- Option B (Index 1): ${stats[1]} questions (${Math.round(stats[1]/totalUpdated*100)}%)`);
  console.log(`- Option C (Index 2): ${stats[2]} questions (${Math.round(stats[2]/totalUpdated*100)}%)`);
  console.log(`- Option D (Index 3): ${stats[3]} questions (${Math.round(stats[3]/totalUpdated*100)}%)`);

  await client.close();
}

rebalanceAllQuestions().catch(err => {
  console.error('Error rebalancing options:', err);
  process.exit(1);
});
