const { MongoClient } = require('mongodb');

async function inspect() {
  const client = new MongoClient('mongodb://127.0.0.1:27018');
  await client.connect();
  const db = client.db('quiz_system');
  const questions = await db.collection('questions').find().toArray();
  console.log(`Total questions in database: ${questions.length}`);

  let optionAPosCount = 0;
  let optionBPosCount = 0;
  let optionCPosCount = 0;
  let optionDPosCount = 0;
  let mismatchCount = 0;

  questions.forEach((q, idx) => {
    const opts = q.options || [];
    const correct = q.correctAnswers || [];
    
    // Check which index correct answer corresponds to
    if (correct.length > 0) {
      const target = correct[0].trim().toLowerCase();
      const pos = opts.findIndex(o => o.trim().toLowerCase() === target);
      if (pos === 0) optionAPosCount++;
      else if (pos === 1) optionBPosCount++;
      else if (pos === 2) optionCPosCount++;
      else if (pos === 3) optionDPosCount++;
      else {
        // Maybe correct[0] is 'A', 'B', 'C', 'D' or '0', '1', '2', '3' or something else
        mismatchCount++;
      }
    }
  });

  console.log(`Answer positions across all ${questions.length} questions:`);
  console.log(`- Index 0 (Option A): ${optionAPosCount}`);
  console.log(`- Index 1 (Option B): ${optionBPosCount}`);
  console.log(`- Index 2 (Option C): ${optionCPosCount}`);
  console.log(`- Index 3 (Option D): ${optionDPosCount}`);
  console.log(`- Mismatched or non-index: ${mismatchCount}`);

  console.log('\nFirst 5 Sample Questions:');
  questions.slice(0, 5).forEach((q, i) => {
    console.log(`Q${i+1}: ${q.text}`);
    console.log(`   Options: ${JSON.stringify(q.options)}`);
    console.log(`   Correct: ${JSON.stringify(q.correctAnswers)}`);
  });

  await client.close();
}

inspect().catch(console.error);
