const mongoose = require('mongoose');

async function cleanupExtraAdmins() {
  await mongoose.connect('mongodb://127.0.0.1:27017/quiz_system');
  const Admin = require('../models/Admin');

  console.log('🚀 CLEANING UP EXTRA ADMIN ACCOUNTS FROM MONGODB...');

  const primaryAdmin = await Admin.findOne({ email: 'admin@quizsystem.com' });
  let keepId = null;

  if (primaryAdmin) {
    keepId = primaryAdmin._id;
    console.log('📌 Primary Admin Found:', primaryAdmin.name, `(${primaryAdmin.email})`);
  } else {
    const firstAdmin = await Admin.findOne();
    if (firstAdmin) {
      firstAdmin.email = 'admin@quizsystem.com';
      firstAdmin.name = 'System Administrator';
      await firstAdmin.save();
      keepId = firstAdmin._id;
      console.log('📌 Primary Admin Configured:', firstAdmin.email);
    }
  }

  // Delete all other Admin accounts except the primary admin
  const deleteRes = await Admin.deleteMany({ _id: { $ne: keepId } });
  console.log(`✅ Deleted ${deleteRes.deletedCount} extra Admin records from database.`);

  const remaining = await Admin.find().select('-password');
  console.log(`\n📊 Remaining Admin Accounts in MongoDB: ${remaining.length}`);
  remaining.forEach((a, i) => {
    console.log(`  [${i + 1}] ID: ${a._id} | Name: "${a.name}" | Email: "${a.email}" | Role: "${a.role}"`);
  });

  process.exit(0);
}

cleanupExtraAdmins().catch((err) => {
  console.error('Error during cleanup:', err);
  process.exit(1);
});
