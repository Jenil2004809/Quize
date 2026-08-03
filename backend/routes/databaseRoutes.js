const express = require('express');
const router = express.Router();
const {
  getCollections,
  getCollectionRecords,
  updateCollectionRecord,
  deleteCollectionRecord,
  seedSampleData
} = require('../controllers/databaseController');
const { protect } = require('../middleware/auth');
const admin = require('../middleware/admin');

router.use(protect);
router.use(admin);

router.get('/', getCollections);
router.post('/seed', seedSampleData);
router.get('/:collection', getCollectionRecords);
router.put('/:collection/:id', updateCollectionRecord);
router.delete('/:collection/:id', deleteCollectionRecord);

module.exports = router;
