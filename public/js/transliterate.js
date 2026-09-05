/**
 * Tanglish to Tamil Phonetic Transliteration Engine
 * Converts English phonetic typing into native Tamil script in real time.
 */

const TAMIL_MAP = {
  // Vowels (Initial)
  'aa': 'ஆ', 'A': 'ஆ', 'a': 'அ',
  'ee': 'ஈ', 'I': 'ஈ', 'i': 'இ',
  'oo': 'ஊ', 'U': 'ஊ', 'u': 'உ',
  'ae': 'ஏ', 'E': 'ஏ', 'e': 'எ',
  'ai': 'ஐ',
  'oa': 'ஓ', 'O': 'ஓ', 'o': 'ஒ',
  'au': 'ஔ', 'ou': 'ஔ',

  // Consonants (Base pure consonants with pulli)
  'k': 'க்', 'g': 'க்',
  'ng': 'ங்',
  'ch': 'ச்', 's': 'ச்', 'j': 'ஜ்',
  'nj': 'ஞ்', 'gn': 'ஞ்',
  'th': 'த்', 'dh': 'த்',
  'd': 'ட்', 't': 'ட்',
  'n': 'ன்', 'nh': 'ந்', 'N': 'ண்',
  'p': 'ப்', 'b': 'ப்',
  'm': 'ம்',
  'y': 'ய்',
  'r': 'ர்', 'R': 'ற்',
  'l': 'ல்', 'L': 'ள்',
  'v': 'வ்', 'w': 'வ்',
  'zh': 'ழ்', 'z': 'ழ்',
  'sh': 'ஷ்', 'h': 'ஹ்'
};

// Vowel signs (Diacritics applied after consonant)
const VOWEL_SIGNS = {
  'a': '', // Implicit in base consonant
  'aa': 'ா', 'A': 'ா',
  'i': 'ி',
  'ee': 'ீ', 'ii': 'ீ', 'I': 'ீ',
  'u': 'ு',
  'oo': 'ூ', 'uu': 'ூ', 'U': 'ூ',
  'e': 'ெ',
  'ae': 'ே', 'ee': 'ே', 'E': 'ே',
  'ai': 'ை',
  'o': 'ொ',
  'oa': 'ோ', 'oo': 'ோ', 'O': 'ோ',
  'au': 'ௌ', 'ou': 'ௌ'
};

// Base letter without pulli
const PULLI_TO_BASE = {
  'க்': 'க', 'ங்': 'ங', 'ச்': 'ச', 'ஞ்': 'ஞ', 'ட்': 'ட', 'ண்': 'ண',
  'த்': 'த', 'ந்': 'ந', 'ப்': 'ப', 'ம்': 'ம', 'ய்': 'ய', 'ர்': 'ர',
  'ல்': 'ல', 'வ்': 'வ', 'ழ்': 'ழ', 'ள்': 'ள', 'ற்': 'ற', 'ன்': 'ன',
  'ஜ்': 'ஜ', 'ஷ்': 'ஷ', 'ஸ்': 'ஸ', 'ஹ்': 'ஹ'
};

// Common word dictionary shortcuts for instant accuracy
const COMMON_SHORTCUTS = {
  'vanakkam': 'வணக்கம்',
  'nandri': 'நன்றி',
  'amma': 'அம்மா',
  'appa': 'அப்பா',
  'tamil': 'தமிழ்',
  'thamizh': 'தமிழ்',
  'thamizhi': 'தமிழி',
  'ilakkanam': 'இலக்கணம்',
  'kural': 'குறள்',
  'thirukkural': 'திருக்குறள்',
  'nan': 'நான்',
  'naan': 'நான்',
  'nee': 'நீ',
  'avan': 'அவன்',
  'aval': 'அவள்',
  'avargal': 'அவர்கள்',
  'varugiren': 'வருகிறேன்',
  'padithan': 'படித்தான்',
  'padithal': 'படித்தாள்',
  'seithan': 'செய்தான்',
  'palli': 'பள்ளி',
  'veedu': 'வீடு',
  'kaalai': 'காலை',
  'iravu': 'இரவு',
  'unakku': 'உனக்கு',
  'enakku': 'எனக்கு',
  'athanai': 'அத்தனை',
  'ithanai': 'இத்தனை',
  'ethanai': 'எத்தனை',
  'antha': 'அந்த',
  'intha': 'இந்த',
  'entha': 'எந்த'
};

/**
 * Phonetic transliteration of a single token
 */
function transliterateWord(word) {
  if (!word) return '';
  const lower = word.toLowerCase();

  // Check dictionary shortcut
  if (COMMON_SHORTCUTS[lower]) {
    return COMMON_SHORTCUTS[lower];
  }

  let result = '';
  let i = 0;
  const len = word.length;

  // Patterns ordered by length descending to match multicharacter tokens first (e.g. 'zh', 'th', 'ng', 'ch', 'ai', 'aa')
  const CONSONANT_PATTERNS = ['zh', 'sh', 'th', 'dh', 'ng', 'nj', 'gn', 'ch', 'k', 'g', 's', 'j', 'd', 't', 'n', 'N', 'p', 'b', 'm', 'y', 'r', 'R', 'l', 'L', 'v', 'w', 'z', 'h'];
  const VOWEL_PATTERNS = ['aa', 'ee', 'ii', 'oo', 'uu', 'ae', 'ai', 'oa', 'au', 'ou', 'a', 'i', 'u', 'e', 'o', 'A', 'I', 'U', 'E', 'O'];

  while (i < len) {
    // 1. Check for consonant pattern first
    let matchConsonant = null;
    for (const pat of CONSONANT_PATTERNS) {
      if (word.startsWith(pat, i)) {
        matchConsonant = pat;
        break;
      }
    }

    if (matchConsonant) {
      const pulliChar = TAMIL_MAP[matchConsonant];
      const baseChar = PULLI_TO_BASE[pulliChar] || pulliChar;
      i += matchConsonant.length;

      // Check if followed by vowel
      let matchVowel = null;
      for (const vPat of VOWEL_PATTERNS) {
        if (word.startsWith(vPat, i)) {
          matchVowel = vPat;
          break;
        }
      }

      if (matchVowel) {
        const sign = VOWEL_SIGNS[matchVowel] !== undefined ? VOWEL_SIGNS[matchVowel] : '';
        result += baseChar + sign;
        i += matchVowel.length;
      } else {
        // Pure consonant with pulli
        result += pulliChar;
      }
      continue;
    }

    // 2. Check for initial/standalone vowel
    let matchVowel = null;
    for (const vPat of VOWEL_PATTERNS) {
      if (word.startsWith(vPat, i)) {
        matchVowel = vPat;
        break;
      }
    }

    if (matchVowel && TAMIL_MAP[matchVowel]) {
      result += TAMIL_MAP[matchVowel];
      i += matchVowel.length;
      continue;
    }

    // 3. Fallback character (punctuation, numbers, special characters)
    result += word[i];
    i++;
  }

  return result;
}

/**
 * Transliterates an entire text paragraph, preserving spacing and punctuation
 */
function transliterateTamil(text) {
  if (!text) return '';
  // Split words preserving delimiters
  return text.split(/(\s+|[.,!?;:()[\]"'])/).map(part => {
    if (/^(\s+|[.,!?;:()[\]"'])$/.test(part) || !part) {
      return part;
    }
    // Only transliterate if contains latin letters
    if (/[a-zA-Z]/.test(part)) {
      return transliterateWord(part);
    }
    return part;
  }).join('');
}

// Export for browser
window.transliterateTamil = transliterateTamil;
window.transliterateWord = transliterateWord;
