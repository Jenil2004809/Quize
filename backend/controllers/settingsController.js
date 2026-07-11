const PlatformSettings = require('../models/PlatformSettings');

// Get current platform settings (single document)
// @route   GET /api/settings
// @access  Private (Admin)
const getSettings = async (req, res, next) => {
  try {
    const doc = await PlatformSettings.findOne({});
    if (!doc) {
      const defaults = await PlatformSettings.create({});
      return res.json({
        success: true,
        settings: defaults
      });
    }

    return res.json({
      success: true,
      settings: doc
    });
  } catch (error) {
    next(error);
  }
};

// Update platform settings (merge into the single document)
// @route   PUT /api/settings
// @access  Private (Admin)
const updateSettings = async (req, res, next) => {
  try {
    const payload = req.body || {};

    const allowedFields = [
      'instituteName',
      'allowRegistrations',
      'autoApproveTeachers',
      'generateCertificates',
      'defaultLanguage'
    ];

    const updates = {};
    for (const key of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(payload, key)) {
        updates[key] = payload[key];
      }
    }

    const doc = await PlatformSettings.findOneAndUpdate(
      {},
      { $set: updates },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.json({
      success: true,
      message: 'Settings updated successfully',
      settings: doc
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings
};

