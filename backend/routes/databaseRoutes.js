const express = require('express');
const router = express.Router();
const {
  listCollections,
  getCollectionRecords,
  updateCollectionRecord,
  deleteCollectionRecord
} = require('../controllers/databaseController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('admin'));

router.get('/', listCollections);
router.get('/:collection', getCollectionRecords);
router.put('/:collection/:id', updateCollectionRecord);
router.delete('/:collection/:id', deleteCollectionRecord);

module.exports = router;
