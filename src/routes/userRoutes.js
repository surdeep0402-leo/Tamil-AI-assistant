const express = require('express');
const router = express.Router();
const User = require('../models/User');
const GrammarLog = require('../models/GrammarLog');
const QuizResult = require('../models/QuizResult');
const { getDBStatus } = require('../config/db');

/**
 * GET /api/user/profile
 */
router.get('/profile', async (req, res) => {
  try {
    let user = await User.findOne();
    if (!user) {
      user = await User.create({
        username: 'செந்தமிழ் மாணவன்',
        level: 1,
        xp: 150,
        streakDays: 3
      });
    }

    const checksCount = await GrammarLog.countDocuments();
    const quizCount = await QuizResult.countDocuments();
    const dbStatus = getDBStatus();

    res.json({
      success: true,
      user,
      stats: {
        totalGrammarChecks: checksCount,
        totalQuizzesTaken: quizCount,
        dbConnected: dbStatus.connected
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'பயனர் விவரத்தைப் பெறுவதில் பிழை.' });
  }
});

/**
 * PUT /api/user/preferences
 */
router.put('/preferences', async (req, res) => {
  try {
    const { username, theme, audioSpeed, transliterationMode, customApiKey } = req.body;
    let user = await User.findOne();

    if (!user) {
      user = new User();
    }

    if (username) user.username = username;
    if (customApiKey !== undefined) user.customApiKey = customApiKey;
    if (theme) user.preferences.theme = theme;
    if (audioSpeed) user.preferences.audioSpeed = audioSpeed;
    if (transliterationMode !== undefined) user.preferences.transliterationMode = transliterationMode;

    await user.save();
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: 'விருப்பங்களைச் சேமிப்பதில் பிழை.' });
  }
});

module.exports = router;
