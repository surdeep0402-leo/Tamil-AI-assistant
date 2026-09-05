/**
 * Tamil Linguistics Engine (தமிழ் இலக்கண நுண்ணறிவுப் பொறி)
 * Handles Tamil phonology, Sandhi rules, Concord checks, Spoken-to-Written conversion,
 * and Morae (மாத்திரை) calculations.
 */

// 1. TAMIL CHARACTERS DATABASE
const VOWELS_SHORT = ['அ', 'இ', 'உ', 'எ', 'ஒ'];
const VOWELS_LONG = ['ஆ', 'ஈ', 'ஊ', 'ஏ', 'ஐ', 'ஓ', 'ஔ'];
const VOWELS_ALL = [...VOWELS_SHORT, ...VOWELS_LONG];

const AYTHAM = 'ஃ';

const VALLINAM_MEI = ['க்', 'ச்', 'ட்', 'த்', 'ப்', 'ற்']; // வல்லினம் (Hard)
const MELLINAM_MEI = ['ங்', 'ஞ்', 'ண்', 'ந்', 'ம்', 'ன்']; // மெல்லினம் (Soft)
const IDAIYINAM_MEI = ['ய்', 'ர்', 'ல்', 'வ்', 'ழ்', 'ள்']; // இடையினம் (Medial)
const CONSONANTS_ALL = [...VALLINAM_MEI, ...MELLINAM_MEI, ...IDAIYINAM_MEI];

// Map of pure consonants to base letters
const CONSONANT_BASE = {
  'க்': 'க', 'ச்': 'ச', 'ட்': 'ட', 'த்': 'த', 'ப்': 'ப', 'ற்': 'ற',
  'ங்': 'ங', 'ஞ்': 'ஞ', 'ண்': 'ண', 'ந்': 'ந', 'ம்': 'ம', 'ன்': 'ன',
  'ய்': 'ய', 'ர்': 'ர', 'ல்': 'ல', 'வ்': 'வ', 'ழ்': 'ழ', 'ள்': 'ள'
};

const BASE_TO_PULLI = Object.fromEntries(Object.entries(CONSONANT_BASE).map(([k, v]) => [v, k]));

// Diacritic markers
const DIACRITICS = ['ா', 'ி', 'ீ', 'ு', 'ூ', 'ெ', 'ே', 'ை', 'ொ', 'ோ', 'ௌ', '்'];
const SHORT_DIACRITICS = ['ி', 'ு', 'ெ', 'ொ'];
const LONG_DIACRITICS = ['ா', 'ீ', 'ூ', 'ே', 'ை', 'ோ', 'ௌ'];

// Hard consonants that mutate in Sandhi (க, ச, த, ப)
const SANDHI_CONSONANTS = {
  'க': 'க்', 'கா': 'க்', 'கி': 'க்', 'கீ': 'க்', 'கு': 'க்', 'கூ': 'க்', 'கெ': 'க்', 'கே': 'க்', 'கை': 'க்', 'கொ': 'க்', 'கோ': 'க்', 'கௌ': 'க்',
  'ச': 'ச்', 'சா': 'ச்', 'சி': 'ச்', 'சீ': 'ச்', 'சு': 'ச்', 'சூ': 'ச்', 'செ': 'ச்', 'சே': 'ச்', 'சை': 'ச்', 'சொ': 'ச்', 'சோ': 'ச்', 'சௌ': 'ச்',
  'த': 'த்', 'தா': 'த்', 'தி': 'த்', 'தீ': 'த்', 'து': 'த்', 'தூ': 'த்', 'தெ': 'த்', 'தே': 'த்', 'தை': 'த்', 'தொ': 'த்', 'தோ': 'த்', 'தௌ': 'த்',
  'ப': 'ப்', 'பா': 'ப்', 'பி': 'ப்', 'பீ': 'ப்', 'பு': 'ப்', 'பூ': 'ப்', 'பெ': 'ப்', 'பே': 'ப்', 'பை': 'ப்', 'பொ': 'ப்', 'போ': 'ப்', 'பௌ': 'ப்'
};

// Spoken Tamil to Formal Written Tamil Lexicon
const SPOKEN_TO_WRITTEN = [
  { spoken: 'வரேன்', written: 'வருகிறேன்', explanation: 'பேச்சு வழக்கு: "வரேன்" -> முறையான எழுத்து வழக்கு: "வருகிறேன்"' },
  { spoken: 'வாரேன்', written: 'வருகிறேன்', explanation: 'பேச்சு வழக்கு: "வாரேன்" -> முறையான எழுத்து வழக்கு: "வருகிறேன்"' },
  { spoken: 'போறேன்', written: 'போகிறேன்', explanation: 'பேச்சு வழக்கு: "போறேன்" -> முறையான எழுத்து வழக்கு: "போகிறேன்"' },
  { spoken: 'போறான்', written: 'போகிறான்', explanation: 'பேச்சு வழக்கு: "போறான்" -> முறையான எழுத்து வழக்கு: "போகிறான்"' },
  { spoken: 'போறாள்', written: 'போகிறாள்', explanation: 'பேச்சு வழக்கு: "போறாள்" -> முறையான எழுத்து வழக்கு: "போகிறாள்"' },
  { spoken: 'பண்ணிட்டேன்', written: 'செய்துவிட்டேன்', explanation: 'பேச்சு வழக்கு: "பண்ணிட்டேன்" -> எழுத்து வழக்கு: "செய்துவிட்டேன்"' },
  { spoken: 'பண்ணினான்', written: 'செய்தான்', explanation: 'பேச்சு வழக்கு: "பண்ணினான்" -> எழுத்து வழக்கு: "செய்தான்"' },
  { spoken: 'பாத்துட்டேன்', written: 'பார்த்துவிட்டேன்', explanation: 'பேச்சு வழக்கு: "பாத்துட்டேன்" -> எழுத்து வழக்கு: "பார்த்துவிட்டேன்"' },
  { spoken: 'பாத்தேன்', written: 'பார்த்தேன்', explanation: 'பேச்சு வழக்கு: "பாத்தேன்" -> எழுத்து வழக்கு: "பார்த்தேன்"' },
  { spoken: 'சொல்லிட்டேன்', written: 'சொல்லிவிட்டேன்', explanation: 'பேச்சு வழக்கு: "சொல்லிட்டேன்" -> எழுத்து வழக்கு: "சொல்லிவிட்டேன்"' },
  { spoken: 'சொல்றேன்', written: 'சொல்கிறேன்', explanation: 'பேச்சு வழக்கு: "சொல்றேன்" -> எழுத்து வழக்கு: "சொல்கிறேன்"' },
  { spoken: 'இருக்குது', written: 'இருக்கிறது', explanation: 'பேச்சு வழக்கு: "இருக்குது" -> எழுத்து வழக்கு: "இருக்கிறது"' },
  { spoken: 'கீது', written: 'இருக்கிறது', explanation: 'வட்டாரப் பேச்சு: "கீது" -> முறையான வழக்கு: "இருக்கிறது"' },
  { spoken: 'இல்ல', written: 'இல்லை', explanation: 'பேச்சு வழக்கு: "இல்ல" -> எழுத்து வழக்கு: "இல்லை"' },
  { spoken: 'இல்லே', written: 'இல்லை', explanation: 'பேச்சு வழக்கு: "இல்லே" -> எழுத்து வழக்கு: "இல்லை"' },
  { spoken: 'என்னாச்சு', written: 'என்னவாயிற்று', explanation: 'பேச்சு வழக்கு: "என்னாச்சு" -> எழுத்து வழக்கு: "என்னவாயிற்று"' },
  { spoken: 'இங்க', written: 'இங்கே', explanation: 'பேச்சு வழக்கு: "இங்க" -> எழுத்து வழக்கு: "இங்கே"' },
  { spoken: 'அங்க', written: 'அங்கே', explanation: 'பேச்சு வழக்கு: "அங்க" -> எழுத்து வழக்கு: "அங்கே"' },
  { spoken: 'எங்க', written: 'எங்கே', explanation: 'பேச்சு வழக்கு: "எங்க" -> எழுத்து வழக்கு: "எங்கே"' },
  { spoken: 'எப்டி', written: 'எப்படி', explanation: 'பேச்சு வழக்கு: "எப்டி" -> எழுத்து வழக்கு: "எப்படி"' },
  { spoken: 'அப்டி', written: 'அப்படி', explanation: 'பேச்சு வழக்கு: "அப்டி" -> எழுத்து வழக்கு: "அப்படி"' },
  { spoken: 'இப்டி', written: 'இப்படி', explanation: 'பேச்சு வழக்கு: "இப்டி" -> எழுத்து வழக்கு: "இப்படி"' },
  { spoken: 'சாப்பிட்டியா', written: 'சாப்பிட்டாயா', explanation: 'பேச்சு வழக்கு: "சாப்பிட்டியா" -> எழுத்து வழக்கு: "சாப்பிட்டாயா"' },
  { spoken: 'தூங்கிட்டியா', written: 'தூங்கிவிட்டாயா', explanation: 'பேச்சு வழக்கு: "தூங்கிட்டியா" -> எழுத்து வழக்கு: "தூங்கிவிட்டாயா"' },
  { spoken: 'ரொம்ப', written: 'மிகவும்', explanation: 'பேச்சு வழக்கு: "ரொம்ப" -> முறையான வழக்கு: "மிகவும்"' }
];

/**
 * Split Tamil text into grapheme clusters (distinct Tamil letters/aksharas)
 */
function splitTamilGraphemes(text) {
  if (!text) return [];
  const graphemes = [];
  let i = 0;
  while (i < text.length) {
    const char = text[i];
    // Check if next character is a Tamil diacritic sign (pulli, vowel sign)
    let cluster = char;
    i++;
    while (i < text.length && DIACRITICS.includes(text[i])) {
      cluster += text[i];
      i++;
    }
    graphemes.push(cluster);
  }
  return graphemes;
}

/**
 * Calculate Mora (மாத்திரை) for a Tamil grapheme cluster
 */
function getGraphemeMora(cluster) {
  if (!cluster || cluster.trim() === '') return 0;

  // Aytham
  if (cluster === AYTHAM) return 0.5;

  // Pure consonant with pulli (e.g. க், ச், ட்...)
  if (cluster.endsWith('்')) return 0.5;

  // Pure vowels
  if (VOWELS_SHORT.includes(cluster)) return 1.0;
  if (VOWELS_LONG.includes(cluster)) return 2.0;

  // Vowel consonant: check diacritic
  if (cluster.length > 1) {
    const diacritic = cluster.slice(1);
    for (const d of LONG_DIACRITICS) {
      if (diacritic.includes(d)) return 2.0;
    }
    for (const d of SHORT_DIACRITICS) {
      if (diacritic.includes(d)) return 1.0;
    }
  }

  // Base consonant alone without diacritic represents 'consonant + அ' (e.g., க, ச, த) -> short vowel consonant
  const firstBase = cluster[0];
  if (Object.values(CONSONANT_BASE).includes(firstBase)) {
    return 1.0;
  }

  return 0; // Punctuation, Latin, space
}

/**
 * Total Mora and Letter breakdown calculation
 */
function calculateTextMora(text) {
  const graphemes = splitTamilGraphemes(text);
  let totalMora = 0;
  let uyirCount = 0;
  let meiCount = 0;
  let uyirMeiCount = 0;
  let aythamCount = 0;
  let vallinamCount = 0;
  let mellinamCount = 0;
  let idaiyinamCount = 0;

  const letterDetails = [];

  for (const g of graphemes) {
    const mora = getGraphemeMora(g);
    totalMora += mora;

    let category = 'பிற (Other)';
    let classType = '';

    if (g === AYTHAM) {
      aythamCount++;
      category = 'ஆய்த எழுத்து (Special)';
    } else if (VOWELS_ALL.includes(g)) {
      uyirCount++;
      category = VOWELS_SHORT.includes(g) ? 'உயிர் குறில் (Short Vowel)' : 'உயிர் நெடில் (Long Vowel)';
    } else if (g.endsWith('்')) {
      meiCount++;
      if (VALLINAM_MEI.includes(g)) {
        vallinamCount++;
        classType = 'வல்லினம் (Hard)';
      } else if (MELLINAM_MEI.includes(g)) {
        mellinamCount++;
        classType = 'மெல்லினம் (Soft)';
      } else if (IDAIYINAM_MEI.includes(g)) {
        idaiyinamCount++;
        classType = 'இடையினம் (Medial)';
      }
      category = `மெய் எழுத்து (${classType})`;
    } else if (Object.values(CONSONANT_BASE).includes(g[0])) {
      uyirMeiCount++;
      const isLong = mora === 2.0;
      category = isLong ? 'உயிர்மெய் நெடில் (Long Vowel-Consonant)' : 'உயிர்மெய்க் குறில் (Short Vowel-Consonant)';
    }

    if (mora > 0) {
      letterDetails.push({
        letter: g,
        mora,
        category
      });
    }
  }

  return {
    totalMora,
    letterCount: letterDetails.length,
    uyirCount,
    meiCount,
    uyirMeiCount,
    aythamCount,
    vallinamCount,
    mellinamCount,
    idaiyinamCount,
    letterDetails: letterDetails.slice(0, 30) // limit sample
  };
}

/**
 * Extract the leading sound consonant cluster of a Tamil word for Sandhi analysis
 */
function getLeadingSandhiConsonant(word) {
  if (!word) return null;
  const graphemes = splitTamilGraphemes(word.trim());
  if (graphemes.length === 0) return null;
  const firstGrapheme = graphemes[0];

  // Match க, ச, த, ப variants
  for (const [key, mei] of Object.entries(SANDHI_CONSONANTS)) {
    if (firstGrapheme.startsWith(key)) {
      return mei;
    }
  }
  return null;
}

/**
 * Sandhi (புணர்ச்சி) & Hard Consonant Doubling (வலிமிகும் / வலிமிகா இடங்கள்) Validator
 */
function analyzeSandhiRules(sentence) {
  const errors = [];
  const words = sentence.trim().split(/\s+/);

  for (let i = 0; i < words.length - 1; i++) {
    const currentWord = words[i].replace(/[.,!?;:()[\]"']/g, '');
    const nextWord = words[i + 1].replace(/[.,!?;:()[\]"']/g, '');

    if (!currentWord || !nextWord) continue;

    const leadingConsonant = getLeadingSandhiConsonant(nextWord);

    // RULE 1: சுட்டுப்பெயர்களுக்குப் பின் (அந்த, இந்த, எந்த) வலிமிகும்!
    // எ.கா: அந்த புத்தகம் -> அந்தப் புத்தகம்
    if (['அந்த', 'இந்த', 'எந்த'].includes(currentWord)) {
      if (leadingConsonant && !currentWord.endsWith(leadingConsonant)) {
        errors.push({
          type: 'sandhi',
          category: 'வலிமிகும் இடம் (Doubling Rule)',
          original: `${currentWord} ${nextWord}`,
          replacement: `${currentWord}${leadingConsonant} ${nextWord}`,
          rule: 'சுட்டு / வினாப் பெயர்களுக்குப் பின் வல்லினம் மிகும் (அந்த, இந்த, எந்த)',
          explanationTa: `"${currentWord}" என்ற சுட்டு/வினாச் சொல்லின் பின் "${nextWord}" வரும்போது "${leadingConsonant}" என்ற வல்லெழுத்து மிக வேண்டும்.`,
          explanationEn: `After demonstrative/interrogative words ("${currentWord}"), hard consonants double (${leadingConsonant}).`
        });
      }
    }

    // RULE 2: சுட்டெழுத்துக்களுக்குப் பின் (அ, இ, எ) வலிமிகும்!
    // எ.கா: அ பையன் -> அப்பையன்
    if (['அ', 'இ', 'எ'].includes(currentWord)) {
      if (leadingConsonant) {
        errors.push({
          type: 'sandhi',
          category: 'வலிமிகும் இடம் (Doubling Rule)',
          original: `${currentWord} ${nextWord}`,
          replacement: `${currentWord}${leadingConsonant}${nextWord}`,
          rule: 'அ, இ, எ என்னும் தனிச் சுட்டெழுத்து மற்றும் வினாவின் பின் வல்லினம் மிகும்',
          explanationTa: `"${currentWord}" என்னும் சுட்டு/வினா எழுத்தின் பின் வரும் வல்லினம் மிகுந்து ஒட்டி எழுதப்பட வேண்டும் (${currentWord}${leadingConsonant}${nextWord}).`,
          explanationEn: `After solitary demonstrative/interrogative vowels (${currentWord}), the hard consonant doubles and joins (${currentWord}${leadingConsonant}${nextWord}).`
        });
      }
    }

    // RULE 3: அப்படி, இப்படி, எப்படி வினையெச்சங்களின் பின் வலிமிகும்!
    // எ.கா: அப்படி செய் -> அப்படிச் செய்
    if (['அப்படி', 'இப்படி', 'எப்படி'].includes(currentWord)) {
      if (leadingConsonant && !currentWord.endsWith(leadingConsonant)) {
        errors.push({
          type: 'sandhi',
          category: 'வலிமிகும் இடம் (Doubling Rule)',
          original: `${currentWord} ${nextWord}`,
          replacement: `${currentWord}${leadingConsonant} ${nextWord}`,
          rule: 'அப்படி, இப்படி, எப்படி ஆகியவற்றின் பின் வல்லினம் மிகும்',
          explanationTa: `"${currentWord}" என்ற சொல்லின் பின் வரும் வல்லெழுத்து (${leadingConsonant}) மிக வேண்டும்.`,
          explanationEn: `Hard consonants double after modal adverbs "${currentWord}".`
        });
      }
    }

    // RULE 4: அங்கே, இங்கே, எங்கே ஆகியவற்றின் பின் வல்லினம் மிகும்!
    if (['அங்கே', 'இங்கே', 'எங்கே'].includes(currentWord)) {
      if (leadingConsonant && !currentWord.endsWith(leadingConsonant)) {
        errors.push({
          type: 'sandhi',
          category: 'வலிமிகும் இடம் (Doubling Rule)',
          original: `${currentWord} ${nextWord}`,
          replacement: `${currentWord}${leadingConsonant} ${nextWord}`,
          rule: 'அங்கே, இங்கே, எங்கே ஆகியவற்றின் பின் வல்லினம் மிகும்',
          explanationTa: `"${currentWord}" இடப்பெயரின் பின் வரும் வல்லெழுத்து (${leadingConsonant}) மிக வேண்டும்.`,
          explanationEn: `Hard consonants double after locative markers "${currentWord}".`
        });
      }
    }

    // RULE 5: இரண்டாம் வேற்றுமை உருபு (Accusative Case 'ஐ') விரிந்து நின்றால் வலிமிகும்!
    // எ.கா: பாடத்தை படி -> பாடத்தைப் படி, கதையை சொல் -> கதையைச் சொல்
    if (currentWord.endsWith('ை') || currentWord.endsWith('யை') || currentWord.endsWith('லை') || currentWord.endsWith('தை')) {
      // Exclude words that are adjectives or particles like இல்லை, எத்தனை
      if (!['இல்லை', 'எத்தனை', 'அத்தனை', 'இத்தனை'].includes(currentWord)) {
        if (leadingConsonant && !currentWord.endsWith(leadingConsonant)) {
          errors.push({
            type: 'sandhi',
            category: 'இரண்டாம் வேற்றுமை விரி (Accusative Sandhi)',
            original: `${currentWord} ${nextWord}`,
            replacement: `${currentWord}${leadingConsonant} ${nextWord}`,
            rule: 'இரண்டாம் வேற்றுமை உருபாகிய "ஐ" வெளிப்பட்டு வரும் தொடரில் வல்லினம் மிகும்',
            explanationTa: `"${currentWord}" என்ற சொல்லில் இரண்டாம் வேற்றுமை உருபு "ஐ" வந்துள்ளதால், அடுத்த சொல்லின் தொடக்க வல்லெழுத்தான "${leadingConsonant}" மிக வேண்டும்.`,
            explanationEn: `When the accusative case marker "-ai" is explicit in "${currentWord}", the following hard consonant doubles.`
          });
        }
      }
    }

    // RULE 6: நான்காம் வேற்றுமை உருபு (Dative Case 'கு') விரிந்து நின்றால் வலிமிகும்!
    // எ.கா: அவருக்கு கொடு -> அவருக்குக் கொடு, எனக்கு தா -> எனக்குத் தா
    if (currentWord.endsWith('கு') || currentWord.endsWith('க்கு')) {
      if (leadingConsonant && !currentWord.endsWith(leadingConsonant)) {
        errors.push({
          type: 'sandhi',
          category: 'நான்காம் வேற்றுமை விரி (Dative Sandhi)',
          original: `${currentWord} ${nextWord}`,
          replacement: `${currentWord}${leadingConsonant} ${nextWord}`,
          rule: 'நான்காம் வேற்றுமை உருபாகிய "கு" வெளிப்பட்டு வரும் தொடரில் வல்லினம் மிகும்',
          explanationTa: `"${currentWord}" என்ற நான்காம் வேற்றுமை சொல்லின் பின் "${leadingConsonant}" மிக வேண்டும்.`,
          explanationEn: `When the dative marker "-ku" ends the word, the subsequent consonant must double (${leadingConsonant}).`
        });
      }
    }

    // RULE 7: வலிமிகா இடங்கள் (Where doubling is FORBIDDEN)
    // எ.கா: எழுவாய் தொடரில் வல்லினம் மிகாது: "தம்பி படித்தான்" (தம்பிப் படித்தான் என்பது தவறு)
    // "எத்தனை பழங்கள்" (எத்தனைப் பழங்கள் என்பது தவறு)
    if (['எத்தனை', 'அத்தனை', 'இத்தனை'].includes(currentWord)) {
      if (leadingConsonant && nextWord.startsWith(leadingConsonant)) {
        errors.push({
          type: 'sandhi',
          category: 'வலிமிகா இடம் (No Doubling Rule)',
          original: `${currentWord} ${nextWord}`,
          replacement: `${currentWord} ${nextWord.slice(leadingConsonant.length)}`,
          rule: 'எத்தனை, அத்தனை, இத்தனை ஆகியவற்றின் பின் வல்லினம் மிகாது',
          explanationTa: `"${currentWord}" என்ற சொல்லுக்குப் பின் வல்லினம் மிகக் கூடாது.`,
          explanationEn: `Hard consonants do not double after quantity indicators "${currentWord}".`
        });
      }
    }
  }

  return errors;
}

/**
 * Subject-Verb Concord (திணை, பால், எண், இடம், காலம் இயைபு) Validator
 * Checks agreement between subject pronouns/nouns and verb terminations.
 */
function analyzeConcord(sentence) {
  const errors = [];
  const words = sentence.trim().split(/\s+/).map(w => w.replace(/[.,!?;:()[\]"']/g, ''));

  // Subject pronoun signatures
  const PRONOUN_RULES = [
    {
      subject: 'நான்', // 1st person singular (தன்மை ஒருமை)
      expectedEndings: ['ஏன்', 'கிறேன்', 'கின்றேன்', 'வேன்', 'த்தேன்', 'டேன்', 'றேன்', 'பேன்', 'தேன்'],
      forbiddenEndings: ['ஆன்', 'ஆள்', 'ஆர்', 'ஆர்கள்', 'அது', 'து', 'ன', 'ஓம்', 'ஆய்', 'ஈர்கள்'],
      correctSuffix: '...ஏன் (எ.கா: வந்தேன் / செய்கிறேன்)',
      person: 'தன்மை ஒருமை (1st Person Singular)'
    },
    {
      subject: 'நாங்கள்', // 1st person plural (தன்மை பன்மை)
      expectedEndings: ['ஓம்', 'கிறோம்', 'வோம்'],
      forbiddenEndings: ['ஆன்', 'ஆள்', 'ஆர்', 'அது', 'ஏன்', 'ஆய்'],
      correctSuffix: '...ஓம் (எ.கா: வந்தோம் / செய்கிறோம்)',
      person: 'தன்மை பன்மை (1st Person Plural)'
    },
    {
      subject: 'நாம்', // 1st person inclusive plural
      expectedEndings: ['ஓம்', 'கிறோம்', 'வோம்'],
      forbiddenEndings: ['ஆன்', 'ஆள்', 'ஆர்', 'அது', 'ஏன்', 'ஆய்'],
      correctSuffix: '...ஓம் (எ.கா: செல்வோம் / பாடுவோம்)',
      person: 'தன்மை பன்மை (1st Person Plural)'
    },
    {
      subject: 'நீ', // 2nd person singular (முன்னிலை ஒருமை)
      expectedEndings: ['ஆய்', 'கstation', 'கின்றாய்', 'வாய்', 'தே'],
      forbiddenEndings: ['ஆன்', 'ஆள்', 'ஆர்', 'அது', 'ஏன்', 'ஓம்', 'ஈர்கள்'],
      correctSuffix: '...ஆய் (எ.கா: வந்தாய் / செய்வாய்)',
      person: 'முன்னிலை ஒருமை (2nd Person Singular)'
    },
    {
      subject: 'நீங்கள்', // 2nd person honorific/plural (முன்னிலை பன்மை)
      expectedEndings: ['ஈர்கள்', 'இர்கள்', 'கள்'],
      forbiddenEndings: ['ஆன்', 'ஆள்', 'அது', 'ஏன்', 'ஆய்'],
      correctSuffix: '...ஈர்கள் (எ.கா: வந்தீர்கள் / பாருங்கள்)',
      person: 'முன்னிலை பன்மை (2nd Person Plural)'
    },
    {
      subject: 'அவன்', // Masculine singular (ஆண்பால் ஒருமை)
      expectedEndings: ['ஆன்', 'கிறான்', 'வான்', 'த்தான்', 'ட்டான்'],
      forbiddenEndings: ['ஆள்', 'ஆர்', 'ஆர்கள்', 'அது', 'து', 'ஏன்', 'ஓம்', 'ஆய்'],
      correctSuffix: '...ஆன் (எ.கா: வந்தான் / பாடுகிறான்)',
      person: 'படர்க்கை ஆண்பால் ஒருமை (3rd Person Masculine)'
    },
    {
      subject: 'அவள்', // Feminine singular (பெண்பால் ஒருமை)
      expectedEndings: ['ஆள்', 'கிறாள்', 'வாள்', 'த்தாள்', 'ட்டாள்'],
      forbiddenEndings: ['ஆன்', 'ஆர்', 'ஆர்கள்', 'அது', 'து', 'ஏன்', 'ஓம்', 'ஆய்'],
      correctSuffix: '...ஆள் (எ.கா: வந்தாள் / பாடுகிறாள்)',
      person: 'படர்க்கை பெண்பால் ஒருமை (3rd Person Feminine)'
    },
    {
      subject: 'அவர்', // Honorific singular (பலர்பால் மரியாதை)
      expectedEndings: ['ஆர்', 'கிறார்', 'வார்', 'த்தார்'],
      forbiddenEndings: ['ஆன்', 'ஆள்', 'அது', 'து', 'ஏன்', 'ஆய்'],
      correctSuffix: '...ஆர் (எ.கா: வந்தார் / படிக்கிறார்)',
      person: 'படர்க்கை பலர்பால் ஒருமை (3rd Person Honorific)'
    },
    {
      subject: 'அவர்கள்', // 3rd person plural (பலர்பால்)
      expectedEndings: ['ஆர்கள்', 'கிறார்கள்', 'வார்கள்', 'த்தனர்'],
      forbiddenEndings: ['ஆன்', 'ஆள்', 'அது', 'து', 'ஏன்', 'ஆய்'],
      correctSuffix: '...ஆர்கள் (எ.கா: வந்தார்கள் / ஓடினார்கள்)',
      person: 'படர்க்கை பலர்பால் (3rd Person Plural)'
    },
    {
      subject: 'அது', // Neuter singular (ஒன்றன்பால்)
      expectedEndings: ['அது', 'து', 'ற்று', 'கிறது'],
      forbiddenEndings: ['ஆன்', 'ஆள்', 'ஆர்', 'ஆர்கள்', 'ஏன்', 'ஓம்', 'ஆய்'],
      correctSuffix: '...து / ...கிறது (எ.கா: வந்தது / ஓடுகிறது)',
      person: 'படர்க்கை ஒன்றன்பால் (3rd Person Neuter Singular)'
    },
    {
      subject: 'அவை', // Neuter plural (பலவின்பால்)
      expectedEndings: ['அன', 'தன', 'கின்றன'],
      forbiddenEndings: ['ஆன்', 'ஆள்', 'ஆர்', 'ஆர்கள்', 'ஏன்', 'ஓம்', 'ஆய்', 'து'],
      correctSuffix: '...அன / ...கின்றன (எ.கா: வந்தன / ஓடுகின்றன)',
      person: 'படர்க்கை பலவின்பால் (3rd Person Neuter Plural)'
    }
  ];

  for (const rule of PRONOUN_RULES) {
    const subjectIdx = words.indexOf(rule.subject);
    if (subjectIdx !== -1 && subjectIdx < words.length - 1) {
      // Find the predicate/verb (usually the last word or succeeding verb)
      const verb = words[words.length - 1];

      // Check if verb improperly ends with forbidden endings
      for (const forbidden of rule.forbiddenEndings) {
        if (verb.endsWith(forbidden)) {
          errors.push({
            type: 'concord',
            category: 'பால்/எண்/இட இயைபுப் பிழை (Concord Error)',
            original: `${rule.subject} ... ${verb}`,
            replacement: `பயனிலை விகுதி: ${rule.correctSuffix}`,
            rule: `எழுவாய்-பயனிலை இயைபு: ${rule.person} எழுவாய்க்குப் பொருத்தமான பயனிலை விகுதி வர வேண்டும்`,
            explanationTa: `எழுவாய் "${rule.subject}" என்பது ${rule.person} ஆகும். எனவே பயனிலை "${verb}" என்று முடிவது தவறு; ${rule.correctSuffix} என்று முடிதல் வேண்டும்.`,
            explanationEn: `Subject "${rule.subject}" (${rule.person}) does not agree with verb ending "${verb}". Expected ending pattern: ${rule.correctSuffix}.`
          });
          break;
        }
      }
    }
  }

  return errors;
}

/**
 * Spoken to Written Tamil Analysis
 */
function analyzeSpokenColloquial(sentence) {
  const replacements = [];
  let converted = sentence;

  for (const item of SPOKEN_TO_WRITTEN) {
    // Unicode-aware word boundary matching
    const regex = new RegExp(`(^|[\\s.,!?;:()[\\]"“”'])${item.spoken}(?=[\\s.,!?;:()[\\]"“”']|$)`, 'gu');
    if (regex.test(converted)) {
      converted = converted.replace(regex, `$1${item.written}`);
      replacements.push({
        type: 'colloquial',
        category: 'பேச்சுத்தமிழ் திருத்தம் (Colloquial to Formal)',
        original: item.spoken,
        replacement: item.written,
        rule: 'முறையான எழுத்துத் தமிழ் பயன்பாடு',
        explanationTa: item.explanation,
        explanationEn: `Converted spoken colloquial phrase to standard formal Tamil: "${item.written}".`
      });
    }
  }

  return {
    hasColloquial: replacements.length > 0,
    convertedText: converted,
    colloquialErrors: replacements
  };
}

/**
 * Simple Parts of Speech (POS) Tagger for Common Tamil Sentences
 */
function tagPartsOfSpeech(sentence) {
  const words = sentence.trim().split(/\s+/);
  return words.map(rawWord => {
    const w = rawWord.replace(/[.,!?;:()[\]"']/g, '');
    let tag = 'பெயர்ச்சொல் (Noun)';
    let detail = 'பொருட்பெயர் / பொதுப்பெயர்';

    if (['நான்', 'நாம்', 'நாங்கள்', 'நீ', 'நீங்கள்', 'அவன்', 'அவள்', 'அவர்', 'அவர்கள்', 'அது', 'அவை'].includes(w)) {
      tag = 'சுட்டு / இடப்பெயர் (Pronoun)';
      detail = 'மூவிடப் பெயர்கள்';
    } else if (w.endsWith('ான்') || w.endsWith('ாள்') || w.endsWith('ார்') || w.endsWith('ேன்') || w.endsWith('ோம்') || w.endsWith('து') || w.endsWith('ன') || w.endsWith('கிறான்') || w.endsWith('கிறாள்') || w.endsWith('கிறேன்')) {
      tag = 'வினைமுற்று (Finite Verb)';
      detail = 'வினைச்சொல் / பயனிலை';
    } else if (w.endsWith('படித்த') || w.endsWith('ஓடிய') || w.endsWith('நல்ல') || w.endsWith('பெரிய') || w.endsWith('சிறிய')) {
      tag = 'பெயரடை (Adjective / பெயரெச்சம்)';
      detail = 'பெயரை விசேஷிக்கும் சொல்';
    } else if (w.endsWith('மெல்ல') || w.endsWith('விரைவாக') || w.endsWith('நன்றாக') || w.endsWith('இனிமையாக')) {
      tag = 'வினையடை (Adverb / வினையெச்சம்)';
      detail = 'வினையை விசேஷிக்கும் சொல்';
    } else if (['மற்றும்', 'ஆனால்', 'எனவே', 'ஆகவே', 'அன்றியும்'].includes(w)) {
      tag = 'இணைப்புச் சொல் (Conjunction / இடைச்சொல்)';
      detail = 'வாக்கியங்களை இணைக்கும் இடைச்சொல்';
    }

    return { word: w, tag, detail };
  });
}

/**
 * Full Tamil Linguistics Evaluation Pipeline
 */
function analyzeTamilSentence(sentence) {
  if (!sentence || typeof sentence !== 'string') {
    return {
      isValid: false,
      message: 'செல்லுபடியாகும் வாக்கியத்தை உள்ளிடவும் (Please enter a valid sentence).'
    };
  }

  const cleanText = sentence.trim();

  // 1. Spoken analysis
  const spokenResult = analyzeSpokenColloquial(cleanText);

  // 2. Sandhi analysis
  const sandhiErrors = analyzeSandhiRules(spokenResult.convertedText);

  // 3. Concord analysis
  const concordErrors = analyzeConcord(spokenResult.convertedText);

  // 4. Mora & Letter metrics
  const moraStats = calculateTextMora(cleanText);

  // 5. Parts of Speech
  const posTags = tagPartsOfSpeech(cleanText);

  // Construct auto-corrected sentence
  let corrected = spokenResult.convertedText;
  for (const err of sandhiErrors) {
    if (err.original && err.replacement && corrected.includes(err.original)) {
      corrected = corrected.replace(err.original, err.replacement);
    }
  }

  const allErrors = [
    ...spokenResult.colloquialErrors,
    ...sandhiErrors,
    ...concordErrors
  ];

  return {
    originalText: cleanText,
    correctedText: corrected,
    isFlawless: allErrors.length === 0,
    errors: allErrors,
    errorCount: allErrors.length,
    moraStats,
    posTags,
    summary: {
      sandhiIssues: sandhiErrors.length,
      concordIssues: concordErrors.length,
      colloquialIssues: spokenResult.colloquialErrors.length,
      overallGrade: allErrors.length === 0 ? 'சிறப்பு (Flawless)' : (allErrors.length <= 2 ? 'நன்று (Good)' : 'திருத்தம் தேவை (Needs Correction)')
    }
  };
}

module.exports = {
  splitTamilGraphemes,
  getGraphemeMora,
  calculateTextMora,
  analyzeSandhiRules,
  analyzeConcord,
  analyzeSpokenColloquial,
  tagPartsOfSpeech,
  analyzeTamilSentence,
  VOWELS_ALL,
  CONSONANTS_ALL,
  VALLINAM_MEI,
  MELLINAM_MEI,
  IDAIYINAM_MEI
};
