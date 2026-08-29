require('dotenv').config();
const seedOriginalDatabase = require('./seedOriginalDatabase');

const seed = async () => {
  try {
    console.log('🚀 INITIALIZING 100% ORIGINAL ACADEMIC DATABASE SEEDER...');
    await seedOriginalDatabase();
    console.log('✅ SEEDING COMPLETE.');
    process.exit(0);
  } catch (err) {
    console.error('❌ SEEDING FAILED:', err);
    process.exit(1);
  }
};

if (require.main === module) {
  seed();
}

module.exports = seed;
