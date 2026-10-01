const { MongoClient, ObjectId } = require('mongodb');

// High-definition curated Unsplash image URLs
const CATEGORY_IMAGES = {
  'Computer Science & Engineering': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
  'Information Technology & Cloud Systems': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
  'Artificial Intelligence & Data Science': 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80',
  'Electronics & IoT Systems': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'
};

const QUIZ_THUMBNAILS = {
  // Software Engineering
  'SE Unit 1': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
  'SE Unit 2': 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80',
  'SE Unit 3': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
  'SE Unit 4': 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=800&q=80',

  // IoT
  'IoT Unit 1': 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&w=800&q=80',
  'IoT Unit 2': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
  'IoT Unit 3': 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
  'IoT Unit 4': 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
  'IOT UNIT 1': 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&w=800&q=80',

  // Web Services
  'WS Unit 1': 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=800&q=80',
  'WS Unit 2': 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
  'WS Unit 3': 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
  'WS Unit 4': 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?auto=format&fit=crop&w=800&q=80',

  // Computer Science & Algorithms
  'CS Unit 1': 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
  'CS Unit 2': 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=800&q=80',
  'CS Unit 3': 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?auto=format&fit=crop&w=800&q=80',
  'CS Unit 4': 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80',

  // DBMS
  'DBMS Unit 1': 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=800&q=80',
  'DBMS Unit 2': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
  'DBMS Unit 3': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
  'DBMS Unit 4': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',

  // AI & Data Science
  'AI Unit 1': 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80',
  'AI Unit 2': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
  'AI Unit 3': 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80',
  'AI Unit 4': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'
};

const STUDENT_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
];

const TEACHER_AVATARS = [
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
];

async function run() {
  const client = new MongoClient('mongodb://127.0.0.1:27018');
  await client.connect();
  const db = client.db('quiz_system');
  console.log('Connected to dedicated MongoDB on port 27018');

  // 1. Update Category Images
  console.log('\n--- 1. Updating Category Images ---');
  for (const [name, img] of Object.entries(CATEGORY_IMAGES)) {
    const res = await db.collection('categories').updateOne(
      { name: name },
      { $set: { image: img } }
    );
    console.log(`Category "${name}": matched ${res.matchedCount}, modified ${res.modifiedCount}`);
  }

  // 2. Update Quiz Thumbnails & Fix Custom Quiz
  console.log('\n--- 2. Updating Quiz Thumbnails ---');
  const quizzes = await db.collection('quizzes').find().toArray();
  for (const quiz of quizzes) {
    let thumb = '';
    for (const [prefix, url] of Object.entries(QUIZ_THUMBNAILS)) {
      if (quiz.title.toLowerCase().startsWith(prefix.toLowerCase()) || quiz.title.toLowerCase().includes(prefix.toLowerCase())) {
        thumb = url;
        break;
      }
    }
    if (!thumb) {
      thumb = 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80';
    }

    const updateFields = { thumbnail: thumb };

    // Fix custom quiz 'IOT UNIT 1' if needed
    if (quiz.title === 'IOT UNIT 1') {
      const iotCat = await db.collection('categories').findOne({ name: 'Electronics & IoT Systems' });
      const iotSub = await db.collection('subjects').findOne({ name: 'Internet of Things' });
      if (iotCat) updateFields.category = iotCat._id;
      if (iotSub) updateFields.subject = iotSub._id;
      updateFields.unitName = 'Unit 1: Introduction to IoT & Protocols';
      updateFields.difficulty = 'easy';
    }

    await db.collection('quizzes').updateOne(
      { _id: quiz._id },
      { $set: updateFields }
    );
    console.log(`Quiz "${quiz.title}" thumbnail set.`);
  }

  // 3. Update Question Difficulty across all questions
  console.log('\n--- 3. Updating Question Difficulties ---');
  for (const quiz of quizzes) {
    const questions = await db.collection('questions').find({ quizId: quiz._id }).toArray();
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      let diff = 'medium';
      const ratio = i / questions.length;
      if (quiz.difficulty === 'easy') {
        diff = ratio < 0.6 ? 'easy' : 'medium';
      } else if (quiz.difficulty === 'hard') {
        diff = ratio < 0.4 ? 'medium' : 'hard';
      } else {
        if (ratio < 0.35) diff = 'easy';
        else if (ratio < 0.75) diff = 'medium';
        else diff = 'hard';
      }

      await db.collection('questions').updateOne(
        { _id: q._id },
        { $set: { difficulty: diff } }
      );
    }
    console.log(`Quiz "${quiz.title}": updated ${questions.length} questions.`);
  }

  // 4. Update Students (avatar)
  console.log('\n--- 4. Updating Student Profiles ---');
  const students = await db.collection('students').find().toArray();
  for (let i = 0; i < students.length; i++) {
    const s = students[i];
    const avatar = STUDENT_AVATARS[i % STUDENT_AVATARS.length];
    await db.collection('students').updateOne(
      { _id: s._id },
      { $set: { avatar: avatar } }
    );
    console.log(`Student "${s.name}" avatar set.`);
  }

  // 5. Update Teachers (avatar, specialization for test)
  console.log('\n--- 5. Updating Teacher Profiles ---');
  const teachers = await db.collection('teachers').find().toArray();
  for (let i = 0; i < teachers.length; i++) {
    const t = teachers[i];
    const avatar = TEACHER_AVATARS[i % TEACHER_AVATARS.length];
    const update = { avatar: avatar };
    if (!t.specialization || t.specialization.trim() === '') {
      update.specialization = 'Full-Stack Software Engineering & Distributed Systems';
    }
    await db.collection('teachers').updateOne(
      { _id: t._id },
      { $set: update }
    );
    console.log(`Teacher "${t.name}" avatar & specialization updated.`);
  }

  console.log('\n=== ALL DATABASE FIELDS SUCCESSFULLY POPULATED ON PORT 27018 ===');
  await client.close();
}

run().catch(err => {
  console.error('Error populating database:', err);
  process.exit(1);
});
