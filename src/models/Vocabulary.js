const mongoose = require('mongoose');

const VocabularySchema = new mongoose.Schema({
  word: {
    type: String,
    required: true,
    index: true
  },
  transliteration: {
    type: String,
    required: true
  },
  meaningEn: {
    type: String,
    required: true
  },
  meaningTa: {
    type: String,
    required: true
  },
  partOfSpeech: {
    type: String,
    enum: ['பெயர்ச்சொல் (Noun)', 'வினைச்சொல் (Verb)', 'பெயரடை (Adjective)', 'வினையடை (Adverb)', 'இடைச்சொல் (Particle)'],
    default: 'பெயர்ச்சொல் (Noun)'
  },
  category: {
    type: String,
    required: true,
    enum: [
      'அன்றாட சொற்கள் (Daily)',
      'உறவுகள் (Family)',
      'இயற்கை (Nature)',
      'உணவு (Food)',
      'உடற்பாகங்கள் (Body)',
      'எண்கள் & நேரம் (Numbers & Time)',
      'கல்வி & தொழில் (Education & Work)',
      'உணர்ச்சிகள் (Emotions)'
    ]
  },
  exampleSentenceTa: String,
  exampleSentenceEn: String,
  audioPhonetic: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Vocabulary', VocabularySchema);
