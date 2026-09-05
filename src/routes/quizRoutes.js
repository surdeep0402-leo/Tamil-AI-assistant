const express = require('express');
const router = express.Router();
const { PREBUILT_QUIZZES } = require('../seeds/seedData');
const { generateAIQuizQuestion } = require('../services/geminiService');
const QuizResult = require('../models/QuizResult');
const User = require('../models/User');

/**
 * GET /api/quiz/questions
 * Fetch quiz questions for practice
 */
router.get('/questions', async (req, res) => {
  try {
    const { category, aiGenerated, customApiKey } = req.query;

    if (aiGenerated === 'true') {
      const generated = await generateAIQuizQuestion(category || 'Sandhi புணர்ச்சி விதிகள்', 'medium', customApiKey);
      if (generated) {
        return res.json({
          success: true,
          questions: [{
            id: `ai_${Date.now()}`,
            category: category || 'ai_generated',
            ...generated
          }]
        });
      }
    }

    let filtered = PREBUILT_QUIZZES;
    if (category && category !== 'all') {
      filtered = PREBUILT_QUIZZES.filter(q => q.category === category);
    }

    // Shuffle questions slightly for variety
    const shuffled = [...filtered].sort(() => 0.5 - Math.random());

    // Do not reveal correctIndex directly in the question list sent for answering
    const clientQuestions = shuffled.map(q => ({
      id: q.id,
      category: q.category,
      question: q.question,
      questionEn: q.questionEn,
      options: q.options
    }));

    res.json({
      success: true,
      count: clientQuestions.length,
      questions: clientQuestions
    });
  } catch (error) {
    res.status(500).json({ error: 'வினாடி வினா வினாக்களைப் பெறுவதில் பிழை.' });
  }
});

/**
 * POST /api/quiz/submit
 * Evaluate answers, award XP, and record outcome
 */
router.post('/submit', async (req, res) => {
  try {
    const { category = 'general_ilakkanam', answers = [] } = req.body;

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'விடைகளைச் சமர்ப்பிக்கவும்.' });
    }

    let correctCount = 0;
    const evaluatedDetails = [];

    for (const ans of answers) {
      const found = PREBUILT_QUIZZES.find(q => q.id === ans.questionId);
      if (found) {
        const isCorrect = found.correctIndex === ans.selectedIndex;
        if (isCorrect) correctCount++;

        evaluatedDetails.push({
          questionId: found.id,
          questionText: found.question,
          userAnswer: found.options[ans.selectedIndex] || 'விடை அளிக்கப்படவில்லை',
          correctAnswer: found.options[found.correctIndex],
          isCorrect,
          explanation: found.explanation
        });
      } else {
        // AI dynamic question or unknown question fallback
        evaluatedDetails.push({
          questionId: ans.questionId,
          questionText: ans.questionText || 'AI கேள்வி',
          userAnswer: 'சமர்ப்பிக்கப்பட்டது',
          correctAnswer: 'சரிபார்க்கப்பட்டது',
          isCorrect: true,
          explanation: 'பயிற்சி விடை ஏற்றுக்கொள்ளப்பட்டது.'
        });
        correctCount++;
      }
    }

    const totalQuestions = answers.length;
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
    const xpEarned = correctCount * 25 + 10; // 25 XP per correct answer + 10 bonus for completing

    // Update user stats
    let user = null;
    try {
      user = await User.findOne();
      if (user) {
        user.xp += xpEarned;
        // Check level up (every 200 XP = 1 level)
        user.level = Math.floor(user.xp / 200) + 1;
        user.lastActive = new Date();
        await user.save();
      }

      await QuizResult.create({
        category,
        totalQuestions,
        correctAnswers: correctCount,
        scorePercentage,
        xpEarned,
        details: evaluatedDetails,
        userId: user ? user._id : null
      });
    } catch (dbErr) {
      console.warn('Quiz result DB save warning:', dbErr.message);
    }

    res.json({
      success: true,
      summary: {
        totalQuestions,
        correctAnswers: correctCount,
        scorePercentage,
        xpEarned,
        userTotalXp: user ? user.xp : xpEarned,
        userLevel: user ? user.level : 1,
        details: evaluatedDetails
      }
    });
  } catch (error) {
    console.error('Quiz submit error:', error);
    res.status(500).json({ error: 'மதிப்பீடு செய்வதில் பிழை ஏற்பட்டது.' });
  }
});

/**
 * GET /api/quiz/history
 */
router.get('/history', async (req, res) => {
  try {
    const history = await QuizResult.find().sort({ createdAt: -1 }).limit(10);
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ error: 'வினாடி வினா வரலாற்றைப் பெறுவதில் பிழை.' });
  }
});

module.exports = router;
