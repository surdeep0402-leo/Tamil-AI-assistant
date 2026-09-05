const express = require('express');
const router = express.Router();
const { analyzeTamilSentence, calculateTextMora } = require('../services/tamilLinguistics');
const { getAIGrammarExplanation } = require('../services/geminiService');
const GrammarLog = require('../models/GrammarLog');
const User = require('../models/User');

/**
 * POST /api/grammar/analyze
 * Comprehensive sentence analysis (Sandhi, Concord, Spoken, Mora, AI Feedback)
 */
router.post('/analyze', async (req, res) => {
  try {
    const { sentence, customApiKey, useAI = true } = req.body;

    if (!sentence || typeof sentence !== 'string' || sentence.trim() === '') {
      return res.status(400).json({ error: 'வாக்கியத்தை உள்ளிடவும் (Please provide a Tamil sentence).' });
    }

    // 1. Run Tamil Rule Engine
    const ruleResults = analyzeTamilSentence(sentence);

    // 2. Get AI In-Depth Explanation
    let aiExplanation = '';
    if (useAI) {
      aiExplanation = await getAIGrammarExplanation(sentence, ruleResults, customApiKey);
    }

    // 3. Save to MongoDB if available
    let logRecord = null;
    try {
      // Find default user or active user
      const user = await User.findOne();
      logRecord = await GrammarLog.create({
        originalText: ruleResults.originalText,
        correctedText: ruleResults.correctedText,
        errors: ruleResults.errors.map(e => ({
          type: e.type,
          original: e.original || '',
          replacement: e.replacement || '',
          rule: e.rule || '',
          explanationTa: e.explanationTa || '',
          explanationEn: e.explanationEn || ''
        })),
        breakdown: {
          letterCount: ruleResults.moraStats.letterCount,
          wordCount: sentence.trim().split(/\s+/).length,
          totalMora: ruleResults.moraStats.totalMora,
          posTagging: ruleResults.posTags
        },
        aiExplanation,
        source: customApiKey || process.env.GEMINI_API_KEY ? 'hybrid_ai' : 'rules_engine',
        userId: user ? user._id : null
      });

      // Award small XP for grammar practice
      if (user) {
        user.xp += 10;
        await user.save();
      }
    } catch (dbErr) {
      console.warn('Grammar log DB save non-fatal error:', dbErr.message);
    }

    return res.json({
      success: true,
      analysis: {
        ...ruleResults,
        aiExplanation,
        logId: logRecord ? logRecord._id : null
      }
    });
  } catch (error) {
    console.error('Grammar Analyze Route Error:', error);
    res.status(500).json({ error: 'இலக்கணப் பகுப்பாய்வில் பிழை ஏற்பட்டது (Error analyzing sentence).' });
  }
});

/**
 * GET /api/grammar/history
 * Fetch recent grammar analysis logs
 */
router.get('/history', async (req, res) => {
  try {
    const logs = await GrammarLog.find().sort({ createdAt: -1 }).limit(10);
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ error: 'வரலாற்றை மீட்டெடுப்பதில் பிழை ஏற்பட்டது.' });
  }
});

/**
 * POST /api/grammar/mora-analysis
 * Instant mora (மாத்திரை) calculation
 */
router.post('/mora-analysis', (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text required' });
  }
  const stats = calculateTextMora(text);
  res.json({ success: true, stats });
});

module.exports = router;
