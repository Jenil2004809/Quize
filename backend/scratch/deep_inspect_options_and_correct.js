const { MongoClient } = require('mongodb');

async function deepInspect() {
  const client = new MongoClient('mongodb://127.0.0.1:27018');
  await client.connect();
  const db = client.db('quiz_system');
  const questions = await db.collection('questions').find().toArray();

  console.log(`Inspecting ${questions.length} questions for option formatting...`);

  let countLetterOnly = 0; // e.g. correctAnswers = ["A"] or ["b"]
  let countTextMatch = 0;   // correctAnswers = ["The Spiral Model (Boehm)"]
  let countPrefixOptions = 0; // options = ["A. The Spiral...", "B. ..."]

  questions.forEach((q, idx) => {
    const corrects = q.correctAnswers || [];
    const opts = q.options || [];

    corrects.forEach(c => {
      const trimmed = String(c).trim();
      if (['A', 'B', 'C', 'D', 'a', 'b', 'c', 'd', 'OPTION A', 'OPTION B', 'OPTION C', 'OPTION D'].includes(trimmed.toUpperCase())) {
        countLetterOnly++;
        console.log(`Mismatch Letter Q${idx+1} (ID: ${q._id}): text="${q.text}"`);
        console.log(`   Correct: ${JSON.stringify(corrects)}`);
        console.log(`   Options: ${JSON.stringify(opts)}`);
      } else {
        countTextMatch++;
      }
    });

    opts.forEach(o => {
      if (/^[A-D][\.\)]\s+/i.test(o.trim())) {
        countPrefixOptions++;
      }
    });
  });

  console.log('\n--- DEEP INSPECTION SUMMARY ---');
  console.log(`Total questions: ${questions.length}`);
  console.log(`Questions with letter-only correctAnswers ("A"/"B"/"C"/"D"): ${countLetterOnly}`);
  console.log(`Questions with full-text correctAnswers: ${countTextMatch}`);
  console.log(`Options with A./B./C. prefixes: ${countPrefixOptions}`);

  await client.close();
}

deepInspect().catch(console.error);
