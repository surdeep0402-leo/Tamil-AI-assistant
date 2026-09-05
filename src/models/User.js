const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    default: 'தமிழ்க் கற்பவர்'
  },
  email: {
    type: String,
    trim: true,
    default: 'learner@senthamil.ai'
  },
  level: {
    type: Number,
    default: 1
  },
  xp: {
    type: Number,
    default: 120
  },
  streakDays: {
    type: Number,
    default: 3
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  completedLessons: [{
    lessonId: String,
    category: String,
    completedAt: {
      type: Date,
      default: Date.now
    }
  }],
  bookmarkedRules: [{
    ruleTitle: String,
    ruleCategory: String,
    explanation: String,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  customApiKey: {
    type: String,
    default: null
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'dark'
    },
    audioSpeed: {
      type: Number,
      default: 0.9
    },
    transliterationMode: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
