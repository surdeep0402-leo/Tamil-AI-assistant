const express = require('express');
const router = express.Router();
const { chatWithTamilTutor, isGeminiConfigured } = require('../services/geminiService');

/**
 * POST /api/chat/message
 * Conversational AI Tamil Tutor Chatbot
 */
router.post('/message', async (req, res) => {
  try {
    const { message, conversationHistory = [], customApiKey } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ error: 'செய்தியை உள்ளிடவும் (Message is required).' });
    }

    const reply = await chatWithTamilTutor(message.trim(), conversationHistory, customApiKey);

    res.json({
      success: true,
      reply,
      isAIKeyActive: isGeminiConfigured(customApiKey),
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({ error: 'உரையாடலில் பிழை ஏற்பட்டது (Chat processing error).' });
  }
});

/**
 * GET /api/chat/status
 * Check if Gemini is enabled
 */
router.get('/status', (req, res) => {
  const { customApiKey } = req.query;
  res.json({
    aiActive: isGeminiConfigured(customApiKey),
    model: 'gemini-2.5-flash'
  });
});

module.exports = router;
