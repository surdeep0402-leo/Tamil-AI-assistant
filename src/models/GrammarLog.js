const mongoose = require('mongoose');

const GrammarLogSchema = new mongoose.Schema({
  originalText: {
    type: String,
    required: true
  },
  correctedText: {
    type: String,
    required: true
  },
  errors: [{
    type: {
      type: String,
      enum: ['sandhi', 'concord', 'spelling', 'colloquial', 'case_marker', 'general'],
      default: 'general'
    },
    original: String,
    replacement: String,
    index: Number,
    rule: String,
    explanationTa: String,
    explanationEn: String
  }],
  breakdown: {
    letterCount: Number,
    wordCount: Number,
    totalMora: Number, // மாத்திரை
    posTagging: [{
      word: String,
      tag: String, // பெயர்ச்சொல், வினைச்சொல், etc.
      detail: String
    }]
  },
  aiExplanation: {
    type: String,
    default: ''
  },
  source: {
    type: String,
    enum: ['hybrid_ai', 'rules_engine', 'gemini_flash'],
    default: 'rules_engine'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true,
  suppressReservedKeysWarning: true
});

module.exports = mongoose.model('GrammarLog', GrammarLogSchema);
