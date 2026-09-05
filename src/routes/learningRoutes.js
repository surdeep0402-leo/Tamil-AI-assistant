const express = require('express');
const router = express.Router();
const { ALPHABET_DATA, GRAMMAR_TOPICS } = require('../seeds/seedData');
const Vocabulary = require('../models/Vocabulary');
const Thirukkural = require('../models/Thirukkural');

/**
 * GET /api/learning/alphabet
 */
router.get('/alphabet', (req, res) => {
  res.json({
    success: true,
    data: ALPHABET_DATA
  });
});

/**
 * GET /api/learning/grammar-topics
 */
router.get('/grammar-topics', (req, res) => {
  res.json({
    success: true,
    topics: GRAMMAR_TOPICS
  });
});

/**
 * GET /api/learning/vocabulary
 */
router.get('/vocabulary', async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = {};

    if (category && category !== 'அனைத்தும்') {
      query.category = new RegExp(category, 'i');
    }

    if (search) {
      query.$or = [
        { word: new RegExp(search, 'i') },
        { transliteration: new RegExp(search, 'i') },
        { meaningEn: new RegExp(search, 'i') },
        { meaningTa: new RegExp(search, 'i') }
      ];
    }

    const words = await Vocabulary.find(query).sort({ category: 1, word: 1 });
    res.json({ success: true, count: words.length, words });
  } catch (error) {
    res.status(500).json({ error: 'சொற்களஞ்சியத்தை ஏற்றுவதில் பிழை.' });
  }
});

/**
 * GET /api/learning/thirukkural
 */
router.get('/thirukkural', async (req, res) => {
  try {
    const kurals = await Thirukkural.find().sort({ number: 1 });
    res.json({ success: true, count: kurals.length, kurals });
  } catch (error) {
    res.status(500).json({ error: 'திருக்குறள் தரவை ஏற்றுவதில் பிழை.' });
  }
});

/**
 * GET /api/learning/thirukkural/daily
 */
router.get('/thirukkural/daily', async (req, res) => {
  try {
    const count = await Thirukkural.countDocuments();
    if (count === 0) {
      return res.status(404).json({ error: 'குறட்பாக்கள் காணப்படவில்லை.' });
    }

    // Day of year modulo count
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const index = dayOfYear % count;

    const dailyKural = await Thirukkural.findOne().skip(index);
    res.json({ success: true, kural: dailyKural });
  } catch (error) {
    res.status(500).json({ error: 'தினசரி திருக்குறள் பெறுவதில் பிழை.' });
  }
});

module.exports = router;
