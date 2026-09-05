const mongoose = require('mongoose');

const QuizResultSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['sandhi', 'tense_concord', 'vocabulary', 'sentence_order', 'thirukkural', 'general_ilakkanam']
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    required: true
  },
  scorePercentage: {
    type: Number,
    required: true
  },
  xpEarned: {
    type: Number,
    default: 0
  },
  details: [{
    questionId: String,
    questionText: String,
    userAnswer: String,
    correctAnswer: String,
    isCorrect: Boolean,
    explanation: String
  }],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('QuizResult', QuizResultSchema);
