const mongoose = require('mongoose');

const ThirukkuralSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: true,
    unique: true
  },
  line1: {
    type: String,
    required: true
  },
  line2: {
    type: String,
    required: true
  },
  section: {
    type: String, // அறத்துப்பால், பொருட்பால், காமத்துப்பால்
    required: true
  },
  chapter: {
    type: String, // கடவுள் வாழ்த்து, etc.
    required: true
  },
  chapterEn: {
    type: String
  },
  padhaUrai: [{
    word: String,
    meaning: String,
    grammarNote: String
  }],
  meaningTa: {
    type: String,
    required: true
  },
  meaningEn: {
    type: String,
    required: true
  },
  grammarExplanation: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Thirukkural', ThirukkuralSchema);
