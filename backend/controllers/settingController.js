const Setting = require('../models/Setting');

// @desc    Get Global System Settings
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res, next) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({
        instituteName: 'Quizzy International Academy',
        supportEmail: 'support@quizzy.com',
        supportPhone: '+1 800 555 0199',
        allowRegistrations: true,
        autoApproveTeachers: true,
        generateCertificates: true,
        passingPercentage: 50,
        maxQuizTimeLimit: 180,
        defaultLanguage: 'English',
        maintenanceMode: false
      });
    }

    return res.json({
      success: true,
      settings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Global System Settings
// @route   PUT /api/settings
// @access  Private (Admin)
const updateSettings = async (req, res, next) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting(req.body);
    } else {
      Object.assign(settings, req.body);
    }

    await settings.save();

    return res.json({
      success: true,
      message: 'System configurations updated successfully!',
      settings
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings
};
