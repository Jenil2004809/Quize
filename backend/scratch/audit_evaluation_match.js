const { MongoClient } = require('mongodb');

async function auditEvaluation() {
  const client = new MongoClient('mongodb://127.0.0.1:27018');
  await client.connect();
  const db = client.db('quiz_system');
  const questions = await db.collection('questions').find().toArray();
  console.log(`Auditing evaluation matching for ${questions.length} questions...`);

  let validMatchCount = 0;
  let invalidMatchCount = 0;
  const invalidQuestions = [];

  questions.forEach((q, idx) => {
    const opts = q.options || [];
    const corrects = q.correctAnswers || [];

    if (corrects.length === 0) {
      invalidMatchCount++;
      invalidQuestions.push({ idx: idx + 1, id: q._id, text: q.text, reason: 'No correct answers defined' });
      return;
    }

    // Check if each correct answer matches an option
    const allCorrectsFound = corrects.every(c => {
      const target = String(c).trim().toLowerCase();
      return opts.some(o => String(o).trim().toLowerCase() === target);
    });

    if (allCorrectsFound) {
      validMatchCount++;
    } else {
      invalidMatchCount++;
      invalidQuestions.push({
        idx: idx + 1,
        id: q._id,
        text: q.text,
        options: opts,
        correctAnswers: corrects,
        reason: 'Correct answer string not found in options list'
      });
    }
  });

  console.log(`\n=== AUDIT RESULTS ===`);
  console.log(`Valid Questions (Correct answer in options): ${validMatchCount} / ${questions.length}`);
  console.log(`Invalid Questions (Mismatch or missing): ${invalidMatchCount} / ${questions.length}`);

  if (invalidQuestions.length > 0) {
    console.log('\nInvalid Questions Details:');
    invalidQuestions.forEach(q => {
      console.log(`Q${q.idx} (ID: ${q.id}): ${q.text}`);
      console.log(`  Reason: ${q.reason}`);
      console.log(`  Options: ${JSON.stringify(q.options)}`);
      console.log(`  Correct: ${JSON.stringify(q.correctAnswers)}`);
    });
  }

  await client.close();
}

auditEvaluation().catch(console.error);
