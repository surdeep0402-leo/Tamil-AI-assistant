require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Vocabulary = require('../models/Vocabulary');
const Thirukkural = require('../models/Thirukkural');
const { connectDB } = require('../config/db');

const ALPHABET_DATA = {
  uyir: [
    { letter: 'அ', type: 'குறில் (Short)', sound: 'a', example: 'அம்மா (Mother)', mora: 1 },
    { letter: 'ஆ', type: 'நெடில் (Long)', sound: 'aa', example: 'ஆடு (Goat)', mora: 2 },
    { letter: 'இ', type: 'குறில் (Short)', sound: 'i', example: 'இலை (Leaf)', mora: 1 },
    { letter: 'ஈ', type: 'நெடில் (Long)', sound: 'ee', example: 'ஈட்டி (Spear)', mora: 2 },
    { letter: 'உ', type: 'குறில் (Short)', sound: 'u', example: 'உரல் (Mortar)', mora: 1 },
    { letter: 'ஊ', type: 'நெடில் (Long)', sound: 'oo', example: 'ஊஞ்சல் (Swing)', mora: 2 },
    { letter: 'எ', type: 'குறில் (Short)', sound: 'e', example: 'எலி (Rat)', mora: 1 },
    { letter: 'ஏ', type: 'நெடில் (Long)', sound: 'ae', example: 'ஏணி (Ladder)', mora: 2 },
    { letter: 'ஐ', type: 'நெடில் (Long)', sound: 'ai', example: 'ஐந்து (Five)', mora: 2 },
    { letter: 'ஒ', type: 'குறில் (Short)', sound: 'o', example: 'ஒட்டகம் (Camel)', mora: 1 },
    { letter: 'ஓ', type: 'நெடில் (Long)', sound: 'oa', example: 'ஓடம் (Boat)', mora: 2 },
    { letter: 'ஔ', type: 'நெடில் (Long)', sound: 'au', example: 'ஔவையார் (Avvaiyar)', mora: 2 }
  ],
  aytham: [
    { letter: 'ஃ', type: 'ஆய்தம் (Special)', sound: 'akh', example: 'எஃகு (Steel)', mora: 0.5 }
  ],
  mei: [
    { letter: 'க்', group: 'வல்லினம் (Hard)', sound: 'k', example: 'கொக்கு (Crane)', mora: 0.5 },
    { letter: 'ங்', group: 'மெல்லினம் (Soft)', sound: 'ng', example: 'சிங்கம் (Lion)', mora: 0.5 },
    { letter: 'ச்', group: 'வல்லினம் (Hard)', sound: 'ch', example: 'பச்சை (Green)', mora: 0.5 },
    { letter: 'ஞ்', group: 'மெல்லினம் (Soft)', sound: 'nj', example: 'ஊஞ்சல் (Swing)', mora: 0.5 },
    { letter: 'ட்', group: 'வல்லினம் (Hard)', sound: 't', example: 'பட்டம் (Kite)', mora: 0.5 },
    { letter: 'ண்', group: 'மெல்லினம் (Soft)', sound: 'n', example: 'கண் (Eye)', mora: 0.5 },
    { letter: 'த்', group: 'வல்லினம் (Hard)', sound: 'th', example: 'நத்தை (Snail)', mora: 0.5 },
    { letter: 'ந்', group: 'மெல்லினம் (Soft)', sound: 'n', example: 'பந்து (Ball)', mora: 0.5 },
    { letter: 'ப்', group: 'வல்லினம் (Hard)', sound: 'p', example: 'கப்பல் (Ship)', mora: 0.5 },
    { letter: 'ம்', group: 'மெல்லினம் (Soft)', sound: 'm', example: 'மரம் (Tree)', mora: 0.5 },
    { letter: 'ய்', group: 'இடையினம் (Medial)', sound: 'y', example: 'பாய் (Mat)', mora: 0.5 },
    { letter: 'ர்', group: 'இடையினம் (Medial)', sound: 'r', example: 'ஏர் (Plough)', mora: 0.5 },
    { letter: 'ல்', group: 'இடையினம் (Medial)', sound: 'l', example: 'சேவல் (Rooster)', mora: 0.5 },
    { letter: 'வ்', group: 'இடையினம் (Medial)', sound: 'v', example: 'செவ்வகம் (Rectangle)', mora: 0.5 },
    { letter: 'ழ்', group: 'இடையினம் (Medial)', sound: 'zh (Special retroflex)', example: 'தமிழ் (Tamil)', mora: 0.5 },
    { letter: 'ள்', group: 'இடையினம் (Medial)', sound: 'L (Retroflex lateral)', example: 'வாள் (Sword)', mora: 0.5 },
    { letter: 'ற்', group: 'வல்லினம் (Hard)', sound: 'tr / R', example: 'காற்று (Wind)', mora: 0.5 },
    { letter: 'ன்', group: 'மெல்லினம் (Soft)', sound: 'n (Alveolar)', example: 'மான் (Deer)', mora: 0.5 }
  ]
};

const GRAMMAR_TOPICS = [
  {
    id: 'eluthu',
    title: '1. எழுத்திலக்கணம் (Phonology & Orthography)',
    subtitle: 'எழுத்துக்களின் பிறப்பு, வகை மற்றும் மாத்திரை அளவுகள்',
    summary: 'தமிழ் மொழியின் அடிப்படை ஒலிகளையும் எழுத்துக்களையும் விளக்குவது எழுத்திலக்கணம்.',
    sections: [
      {
        heading: 'முதல் எழுத்துக்கள் (30)',
        content: 'உயிர் எழுத்துக்கள் 12 + மெய் எழுத்துக்கள் 18 = 30 எழுத்துக்களும் தனித்து இயங்கும் ஆற்றல் படைத்ததால் முதல் எழுத்துக்கள் எனப்படும்.'
      },
      {
        heading: 'சார்பெழுத்துக்கள் (10 வகைகள்)',
        content: 'முதல் எழுத்துக்களைச் சார்ந்து வரும் எழுத்துக்கள்: 1. உயிர்மெய், 2. ஆய்தம், 3. உயிரளபெடை, 4. ஒற்றளபெடை, 5. குற்றியலிகரம், 6. குற்றியலுகரம், 7. ஐகாரக்குறுக்கம், 8. ஔகாரக்குறுக்கம், 9. மகரக்குறுக்கம், 10. ஆய்தக்குறுக்கம்.'
      },
      {
        heading: 'மாத்திரை (ஒலிக்கும் கால அளவு)',
        content: 'குறில் எழுத்துக்களுக்கு 1 மாத்திரை, நெடில் எழுத்துக்களுக்கு 2 மாத்திரை, மெய் மற்றும் ஆய்த எழுத்துக்களுக்கு 1/2 மாத்திரை.'
      }
    ]
  },
  {
    id: 'sol',
    title: '2. சொல்லிலக்கணம் (Morphology & Parts of Speech)',
    subtitle: 'சொற்களின் வகைகள், வேற்றுமை உருபுகள் மற்றும் வாக்கிய அமைப்பு',
    summary: 'ஓரெழுத்து தனித்தோ, பல எழுத்துக்கள் சேர்ந்தோ பொருள் தருவது சொல் எனப்படும்.',
    sections: [
      {
        heading: 'நால்வகைச் சொற்கள்',
        content: '1. பெயர்ச்சொல் (Noun): ஒன்றன் பெயரைக் குறிக்கும் (எ.கா: மரம், கண்ணன்).\n2. வினைச்சொல் (Verb): ஒரு செயலைக் குறிக்கும் (எ.கா: ஓடினான், பாடுகிறாள்).\n3. இடைச்சொல் (Particle): பெயரையும் வினையையும் சார்ந்து வருவது (எ.கா: மற்று, உம்).\n4. உரிச்சொல் (Qualifier): பெயர், வினைகளின் பண்பை மிகுதிப்படுத்த வருவது (எ.கா: சால, உறு, தவ).'
      },
      {
        heading: 'வேற்றுமை (8 வகைகள்)',
        content: 'முதலாம் வேற்றுமை (எழுவாய்), 2-ஆம் வேற்றுமை (ஐ), 3-ஆம் வேற்றுமை (ஆல், ஆன், ஒடு, ஓடு), 4-ஆம் வேற்றுமை (கு), 5-ஆம் வேற்றுமை (இன், இல்), 6-ஆம் வேற்றுமை (அது, ஆது, அ), 7-ஆம் வேற்றுமை (கண், இல், இடம்), 8-ஆம் வேற்றுமை (விளி வேற்றுமை).'
      },
      {
        heading: 'புணர்ச்சி விதிகள் (Sandhi)',
        content: 'நிலைமொழியும் வருமொழியும் சேர்வது புணர்ச்சி. தோன்றல் (பூ + கூடை = பூக்கூடை), திரிதல் (பல் + பொடி = பற்பொடி), கெடுதல் (மரம் + வேர் = மரவேர்).'
      }
    ]
  },
  {
    id: 'porul',
    title: '3. பொருளிலக்கணம் (Subject Matter & Poetics)',
    subtitle: 'மனித வாழ்வின் அகம் மற்றும் புற ஒழுக்க நெறிகள்',
    summary: 'பண்டைய தமிழர்களின் வாழ்க்கை முறையை அகம் (உள்ளத்து உணர்வு/காதல்) மற்றும் புறம் (வீரம்/கொடை/அறம்) எனப் பிரித்து உரைப்பது பொருளிலக்கணம்.',
    sections: [
      {
        heading: 'அகப்பொருள் (அன்பின் ஐந்திணை)',
        content: 'குறிஞ்சி (மலையும் மலை சார்ந்த இடமும் - புணர்தல்), முல்லை (காடும் காடு சார்ந்த இடமும் - இருத்தல்), மருதம் (வயலும் வயல் சார்ந்த இடமும் - ஊடல்), நெய்தல் (கடலும் கடல் சார்ந்த இடமும் - இரங்கல்), பாலை (மணலும் மணல் சார்ந்த இடமும் - பிரிதல்).'
      },
      {
        heading: 'புறப்பொருள் (12 திணைகள்)',
        content: 'வெட்சி (ஆநிரை கவர்தல்), கரந்தை (மீட்டல்), வஞ்சி (மண் ஆசை கொண்டு போருக்குச் செல்லுதல்), காஞ்சி (எதிர்த்துப் போரிடல்), நொச்சி (மதிலைக் காத்தல்), உழிஞை (மதில் வளைத்தல்), தும்பை (இருவரும் நேருக்கு நேர் போரிடல்), வாகை (வெற்றி பெறுதல்), பாடாண், பொதுவியல், கைக்கிளை, பெருந்திணை.'
      }
    ]
  },
  {
    id: 'yaappu',
    title: '4. யாப்பிலக்கணம் (Prosody & Metrics)',
    subtitle: 'செய்யுள் இயற்றுவதற்கான ஆறு உறுப்புகள்',
    summary: 'செய்யுள் அல்லது கவிதையை மரபு விதிகளுடன் கட்டமைப்பது யாப்பிலக்கணம்.',
    sections: [
      {
        heading: 'யாப்பின் ஆறு உறுப்புகள்',
        content: '1. எழுத்து (குறில், நெடில், ஒற்று)\n2. அசை (நேரசை, நிரையசை)\n3. சீர் (ஓரசை, ஈரசை, மூவசை, நாலசைச் சீர்)\n4. தளை (ஏழு வகை தளைகள்)\n5. அடி (குரலடி, சிந்தடி, அளவடி, நெடிலடி, கழிநெடிலடி)\n6. தொடை (மோனை, எதுகை, இயைபு, முரண், அந்தாதி).'
      },
      {
        heading: 'பாவகைகள்',
        content: 'வெண்பா (செப்பலோசை - திருக்குறள் வெண்பா வகையைச் சார்ந்தது), ஆசிரியப்பா (அகவலோசை), கலிப்பா (துள்ளலோசை), வஞ்சிப்பா (தூங்கலோசை).'
      }
    ]
  },
  {
    id: 'ani',
    title: '5. அணியிலக்கணம் (Rhetoric & Figures of Speech)',
    subtitle: 'செய்யுளுக்கு அழகு சேர்க்கும் அணிகள்',
    summary: 'அணி என்பதற்கு "அழகு" என்பது பொருள். செய்யுளின் கருத்துக்கு சுவையும் அழகும் ஊட்டுவது அணியிலக்கணம்.',
    sections: [
      {
        heading: 'முக்கிய அணிகள்',
        content: '1. உவமையணி: உவமை, உவமேயம், உவம உருபு (போல, போன்ற) வெளிப்பட்டு வருவது. (எ.கா: "மலர் போன்ற பாதம்").\n2. உருவக அணி: உவமையையும் பொருளையும் ஒன்றெனக் கூறுவது (எ.கா: "மலர்முகம்" உவமை, "முகமலர்" உருவகம்).\n3. வேற்றுமை அணி: இரு பொருள்களுக்கு இடையே உள்ள ஒற்றுமையைக் கூறி, பின் அவற்றுள் ஒன்றை வேறுபடுத்திக் காட்டுவது.\n4. தற்குறிப்பேற்ற அணி: இயல்பாக நிகழும் நிகழ்ச்சியின் மீது கவிஞன் தன் குறிப்பை ஏற்றிக் கூறுவது.'
      }
    ]
  }
];

const VOCABULARY_LIST = [
  {
    word: 'வணக்கம்',
    transliteration: 'Vanakkam',
    meaningEn: 'Greetings / Hello',
    meaningTa: 'மரியாதையுடன் வாழ்த்துதல்',
    partOfSpeech: 'பெயர்ச்சொல் (Noun)',
    category: 'அன்றாட சொற்கள் (Daily)',
    exampleSentenceTa: 'அனைவருக்கும் எனது இனிய வணக்கம்.',
    exampleSentenceEn: 'Warm greetings to everyone.'
  },
  {
    word: 'நன்றி',
    transliteration: 'Nandri',
    meaningEn: 'Thank you / Gratitude',
    meaningTa: 'செய்த உதவிக்குக் காட்டும் நற்பண்பு',
    partOfSpeech: 'பெயர்ச்சொல் (Noun)',
    category: 'அன்றாட சொற்கள் (Daily)',
    exampleSentenceTa: 'உங்களின் அன்பான உதவிக்கு மிக்க நன்றி.',
    exampleSentenceEn: 'Thank you very much for your kind help.'
  },
  {
    word: 'அம்மா',
    transliteration: 'Amma',
    meaningEn: 'Mother',
    meaningTa: 'தாய் / அன்னை',
    partOfSpeech: 'பெயர்ச்சொல் (Noun)',
    category: 'உறவுகள் (Family)',
    exampleSentenceTa: 'அம்மா குழந்தைக்கு அன்போடு உணவு ஊட்டினார்.',
    exampleSentenceEn: 'Mother fed the child with love.'
  },
  {
    word: 'அப்பா',
    transliteration: 'Appa',
    meaningEn: 'Father',
    meaningTa: 'தந்தை',
    partOfSpeech: 'பெயர்ச்சொல் (Noun)',
    category: 'உறவுகள் (Family)',
    exampleSentenceTa: 'அப்பா எனக்கு நல்ல புத்தகங்களை வாங்கிக் கொடுத்தார்.',
    exampleSentenceEn: 'Father bought me good books.'
  },
  {
    word: 'மழை',
    transliteration: 'Mazhai',
    meaningEn: 'Rain',
    meaningTa: 'வானிலிருந்து பொழியும் நீர்த்துளி',
    partOfSpeech: 'பெயர்ச்சொல் (Noun)',
    category: 'இயற்கை (Nature)',
    exampleSentenceTa: 'மழை பெய்ததால் பயிர்கள் செழித்து வளர்ந்தன.',
    exampleSentenceEn: 'Crops flourished because of the rain.'
  },
  {
    word: 'சூரியன்',
    transliteration: 'Sooriyan',
    meaningEn: 'Sun',
    meaningTa: 'ஞாயிறு / பகலவன்',
    partOfSpeech: 'பெயர்ச்சொல் (Noun)',
    category: 'இயற்கை (Nature)',
    exampleSentenceTa: 'சூரியன் கிழக்கில் தோன்றி உலகிற்கு ஒளி தருகிறது.',
    exampleSentenceEn: 'The sun rises in the east and brings light to the world.'
  },
  {
    word: 'நிலா',
    transliteration: 'Nilaa',
    meaningEn: 'Moon',
    meaningTa: 'சந்திரன் / திங்கள்',
    partOfSpeech: 'பெயர்ச்சொல் (Noun)',
    category: 'இயற்கை (Nature)',
    exampleSentenceTa: 'இரவில் முழு நிலா அழகாக ஒளி வீசுகிறது.',
    exampleSentenceEn: 'The full moon shines beautifully at night.'
  },
  {
    word: 'சோறு',
    transliteration: 'Soru',
    meaningEn: 'Cooked rice / Meal',
    meaningTa: 'சமைத்த உணவு',
    partOfSpeech: 'பெயர்ச்சொல் (Noun)',
    category: 'உணவு (Food)',
    exampleSentenceTa: 'சுடச்சுட சோறும் சாம்பாரும் சுவையாக இருக்கும்.',
    exampleSentenceEn: 'Hot rice and sambar are very delicious.'
  },
  {
    word: 'தண்ணீர்',
    transliteration: 'Thanneer',
    meaningEn: 'Water',
    meaningTa: 'குடிநீர் / புனல்',
    partOfSpeech: 'பெயர்ச்சொல் (Noun)',
    category: 'உணவு (Food)',
    exampleSentenceTa: 'உடல் நலத்திற்கு நாள்தோறும் போதுமான தண்ணீர் குடிக்க வேண்டும்.',
    exampleSentenceEn: 'We must drink plenty of water daily for good health.'
  },
  {
    word: 'கண்',
    transliteration: 'Kan',
    meaningEn: 'Eye',
    meaningTa: 'பார்வை உறுப்பு',
    partOfSpeech: 'பெயர்ச்சொல் (Noun)',
    category: 'உடற்பாகங்கள் (Body)',
    exampleSentenceTa: 'எண்ணும் எழுத்தும் கண்ணெனத் தகும்.',
    exampleSentenceEn: 'Numbers and letters are as precious as two eyes.'
  },
  {
    word: 'படி',
    transliteration: 'Padi',
    meaningEn: 'Read / Study',
    meaningTa: 'கற்றல் / வாசித்தல்',
    partOfSpeech: 'வினைச்சொல் (Verb)',
    category: 'கல்வி & தொழில் (Education & Work)',
    exampleSentenceTa: 'நாள்தோறும் நூலகத்திற்குச் சென்று நல்ல நூல்களைப் படி.',
    exampleSentenceEn: 'Go to the library daily and read good books.'
  },
  {
    word: 'மகிழ்ச்சி',
    transliteration: 'Magizhchi',
    meaningEn: 'Happiness / Joy',
    meaningTa: 'உள்ளக் களிப்பு',
    partOfSpeech: 'பெயர்ச்சொல் (Noun)',
    category: 'உணர்ச்சிகள் (Emotions)',
    exampleSentenceTa: 'பிறருக்கு உதவி செய்வது மனதிற்கு மகிழ்ச்சி தரும்.',
    exampleSentenceEn: 'Helping others brings joy to the mind.'
  }
];

const THIRUKKURAL_LIST = [
  {
    number: 1,
    line1: 'அகர முதல எழுத்தெல்லாம் ஆதி',
    line2: 'பகவன் முதற்றே உலகு.',
    section: 'அறத்துப்பால்',
    chapter: 'கடவுள் வாழ்த்து',
    chapterEn: 'The Praise of God',
    padhaUrai: [
      { word: 'அகர', meaning: 'அ என்ற எழுத்து', grammarNote: 'பெயரெச்சம்' },
      { word: 'முதல', meaning: 'முதன்மையாகக் கொண்டவை', grammarNote: 'குறிப்புப் பெயரெச்சம்' },
      { word: 'எழுத்தெல்லாம்', meaning: 'எழுத்துக்கள் எல்லாம்', grammarNote: 'உம்மைத் தொகை / முழுமை' },
      { word: 'ஆதி பகவன்', meaning: 'முழுமுதற்கடவுள்', grammarNote: 'இருபெயரொட்டுப் பண்புத்தொகை' },
      { word: 'முதற்றே உலகு', meaning: 'முதன்மையாகக் கொண்டது உலகம்', grammarNote: 'ஏகார ஈற்றுப் பயனிலை' }
    ],
    meaningTa: 'எழுத்துக்களுக்கெல்லாம் "அ" எப்படி தொடக்கமாக இருக்கிறதோ, அதுபோல உலகிலுள்ள உயிர்களுக்கெல்லாம் ஆதிபகவன் தொடக்கமாக இருக்கிறான்.',
    meaningEn: 'As the letter "A" is the first of all letters, so is the eternal God the primary origin of the universe.',
    grammarExplanation: 'இக்குறளில் "எடுத்துக்காட்டு உவமையணி" பொதிந்துள்ளது. "போல" என்ற உவம உருபு மறைந்து வந்துள்ளது.'
  },
  {
    number: 391,
    line1: 'கற்க கசடறக் கற்பவை கற்றபின்',
    line2: 'நிற்க அதற்குத் தக.',
    section: 'பொருட்பால்',
    chapter: 'கல்வி',
    chapterEn: 'Learning',
    padhaUrai: [
      { word: 'கற்க', meaning: 'நன்கு படித்திடுக', grammarNote: 'வியங்கோள் வினைமுற்று (க ஈறு)' },
      { word: 'கசடறக்', meaning: 'குற்றமில்லாமல் (கசடு + அற)', grammarNote: 'வினையெச்சம்; வலிமிகுதல்' },
      { word: 'கற்பவை', meaning: 'கற்கத் தகுந்த நூல்களை', grammarNote: 'வினையாலணையும் பெயர்' },
      { word: 'கற்றபின்', meaning: 'படித்த பின்னர்', grammarNote: 'கால வினையெச்சம்' },
      { word: 'நிற்க', meaning: 'அதன்படி ஒழுகுக', grammarNote: 'வியங்கோள் வினைமுற்று' },
      { word: 'அதற்குத் தக', meaning: 'அக்கல்விக்குத் தகுந்தபடி', grammarNote: 'நான்காம் வேற்றுமை விரி, வலிமிகுதல்' }
    ],
    meaningTa: 'கற்க வேண்டிய நூல்களைக் குற்றமறக் கற்க வேண்டும்; அவ்வாறு கற்ற பிறகு, கற்ற கல்விக்குத் தக்கவாறு நல்வழியில் வாழ வேண்டும்.',
    meaningEn: 'Learn thoroughly without flaws that which is worth learning; after learning, abide by the conduct it teaches.',
    grammarExplanation: '"கற்க", "நிற்க" என்பவை வியங்கோள் வினைமுற்றுகள். "கசடறக்" மற்றும் "அதற்குத்" என்பவற்றில் வல்லினம் மிகுந்துள்ளது (Sandhi rule).'
  },
  {
    number: 314,
    line1: 'இன்னாசெய்தாரை ஒறுத்தல் அவர்நாண',
    line2: 'நன்னயம் செய்து விடல்.',
    section: 'அறத்துப்பால்',
    chapter: 'இன்னா செய்யாமை',
    chapterEn: 'Not Doing Evil',
    padhaUrai: [
      { word: 'இன்னா', meaning: 'தீங்கு அல்லது துன்பம்', grammarNote: 'பண்புப்பெயர்' },
      { word: 'செய்தாரை', meaning: 'செய்தவர்களை', grammarNote: 'இரண்டாம் வேற்றுமை வினையாலணையும் பெயர்' },
      { word: 'ஒறுத்தல்', meaning: 'தண்டிக்கும் வழி', grammarNote: 'தொழிற்பெயர்' },
      { word: 'அவர்நாண', meaning: 'அவர் வெட்கப்படும்படி', grammarNote: 'செயவென் வினையெச்சம்' },
      { word: 'நன்னயம்', meaning: 'நல்ல நன்மைகளை', grammarNote: 'பண்புத்தொகை' },
      { word: 'செய்து விடல்', meaning: 'செய்துவிடுதல்', grammarNote: 'கூட்டு வினைமுற்று' }
    ],
    meaningTa: 'நமக்குத் துன்பம் செய்தவரைத் தண்டிக்கும் சிறந்த வழி, அவர் வெட்கப்படும்படியாக அவருக்குத் திரும்ப நன்மையே செய்து விடுவதாகும்.',
    meaningEn: 'The best way to punish those who have wronged you is to make them blush with shame by doing them good in return.',
    grammarExplanation: '"இன்னாசெய்தாரை" என்பது இரண்டாம் வேற்றுமை வினையாலணையும் பெயர் ("ஐ" உருபு). "ஒறுத்தல்", "விடல்" என்பவை தொழிற்பெயர்கள்.'
  }
];

const PREBUILT_QUIZZES = [
  {
    id: 'q1',
    category: 'sandhi',
    question: 'கீழ்க்கண்டவற்றுள் சரியான புணர்ச்சி வடிவம் எது?',
    questionEn: 'Which is the correct Sandhi form?',
    options: ['அந்த புத்தகம்', 'அந்தப் புத்தகம்', 'அந்தப் புத்தக்க', 'அந்த புத்தம்'],
    correctIndex: 1,
    explanation: '"அந்த", "இந்த", "எந்த" ஆகிய சுட்டு/வினாச் சொற்களுக்குப் பின் வரும் வல்லினம் மிகும். எனவே "அந்தப் புத்தகம்" என்பதே சரி.',
    rule: 'சுட்டுப் பெயர்களுக்குப் பின் வல்லினம் மிகும்'
  },
  {
    id: 'q2',
    category: 'sandhi',
    question: 'இரண்டாம் வேற்றுமை விரிக்குச் சரியான எடுத்துக்காட்டு எது?',
    questionEn: 'Which is the correct example of 2nd case Sandhi doubling?',
    options: ['பாடத்தை படி', 'பாடத்தைப் படி', 'பாடம் படி', 'பாடத்தை படிக்கிறான்'],
    correctIndex: 1,
    explanation: 'இரண்டாம் வேற்றுமை உருபு "ஐ" வெளிப்பட்டு வரும்போது நிலைமொழியின் பின் வல்லினம் மிகும். எனவே "பாடத்தைப் படி" என்பதே சரி.',
    rule: 'இரண்டாம் வேற்றுமை விரியில் வல்லினம் மிகும்'
  },
  {
    id: 'q3',
    category: 'tense_concord',
    question: '"அவள் நேற்று பள்ளிக்குச் ________" - கோடிட்ட இடத்தை நிரப்புக:',
    questionEn: 'Fill in the blank with correct subject-verb concord:',
    options: ['சென்றான்', 'சென்றாள்', 'சென்றது', 'சென்றார்கள்'],
    correctIndex: 1,
    explanation: '"அவள்" என்பது படர்க்கை பெண்பால் ஒருமை. எனவே பயனிலை "சென்றாள்" (ஆள் விகுதி) என முடிதல் வேண்டும்.',
    rule: 'படர்க்கை பெண்பால் ஒருமை எழுவாய்க்கு "...ஆள்" என்ற பயனிலை விகுதி வரும்.'
  },
  {
    id: 'q4',
    category: 'tense_concord',
    question: '"நான் நாளை மதுரைக்குச் ________" - எதிர்காலத் தன்மை ஒருமை வடிவம் எது?',
    questionEn: 'Which is the correct 1st-person future tense verb?',
    options: ['செல்கிறேன்', 'சென்றேன்', 'செல்வேன்', 'செல்வோம்'],
    correctIndex: 2,
    explanation: '"நான்" (தன்மை ஒருமை) + எதிர்காலம் = "செல்வேன்" (-வேன் விகுதி).',
    rule: 'தன்மை ஒருமை எதிர்கால வினைமுற்று "...வேன் / ...பேன்" என முடியும்.'
  },
  {
    id: 'q5',
    category: 'vocabulary',
    question: '"ஞாயிறு" என்பதன் பொருள் என்ன?',
    questionEn: 'What is the meaning of the Tamil word "ஞாயிறு"?',
    options: ['நிலவு', 'சூரியன்', 'மழை', 'காற்று'],
    correctIndex: 1,
    explanation: '"ஞாயிறு" என்பது சூரியனைக் குறிக்கும் தூய தமிழ்ச் சொல்.',
    rule: 'இயற்கைப் பெயர்கள்'
  },
  {
    id: 'q6',
    category: 'general_ilakkanam',
    question: 'தமிழ் மொழியில் உள்ள உயிர் எழுத்துக்களின் எண்ணிக்கை எத்தனை?',
    questionEn: 'How many vowels (உயிர் எழுத்துக்கள்) are there in Tamil?',
    options: ['18', '12', '216', '1'],
    correctIndex: 1,
    explanation: 'தமிழ் மொழியில் அ முதல் ஔ வரை 12 உயிர் எழுத்துக்கள் உள்ளன.',
    rule: 'எழுத்திலக்கணம்'
  },
  {
    id: 'q7',
    category: 'general_ilakkanam',
    question: 'ஆய்த எழுத்தின் ஒலிக்கும் மாத்திரை அளவு என்ன?',
    questionEn: 'What is the mora duration of the Aytham letter (ஃ)?',
    options: ['1 மாத்திரை', '2 மாத்திரை', 'அரை (1/2) மாத்திரை', '3 மாத்திரை'],
    correctIndex: 2,
    explanation: 'மெய் எழுத்துக்கள் மற்றும் ஆய்த எழுத்திற்கு உரிய கால அளவு அரை (1/2) மாத்திரை ஆகும்.',
    rule: 'மாத்திரை அளவு'
  },
  {
    id: 'q8',
    category: 'thirukkural',
    question: 'திருக்குறளில் உள்ள மொத்த அதிகாரங்கள் எத்தனை?',
    questionEn: 'How many total chapters (அதிகாரங்கள்) are in Thirukkural?',
    options: ['100', '133', '1330', '38'],
    correctIndex: 1,
    explanation: 'திருக்குறளில் 133 அதிகாரங்களும், அதிகாரத்திற்கு 10 பாடல்கள் வீதம் மொத்தம் 1330 குறட்பாக்களும் உள்ளன.',
    rule: 'திருக்குறள் இலக்கிய அமைப்பு'
  }
];

async function seedDatabase() {
  await connectDB();

  console.log('[Seed] Seeding database records...');

  try {
    // 1. Create default demo user if none exists
    let user = await User.findOne();
    if (!user) {
      user = await User.create({
        username: 'செந்தமிழ் மாணவன்',
        email: 'student@senthamil.ai',
        level: 1,
        xp: 150,
        streakDays: 3,
        preferences: {
          theme: 'dark',
          audioSpeed: 0.9,
          transliterationMode: true
        }
      });
      console.log(`[Seed] Created demo user: ${user.username}`);
    }

    // 2. Seed Vocabulary
    const existingVocabCount = await Vocabulary.countDocuments();
    if (existingVocabCount === 0) {
      await Vocabulary.insertMany(VOCABULARY_LIST);
      console.log(`[Seed] Inserted ${VOCABULARY_LIST.length} vocabulary words.`);
    }

    // 3. Seed Thirukkural
    const existingKuralCount = await Thirukkural.countDocuments();
    if (existingKuralCount === 0) {
      await Thirukkural.insertMany(THIRUKKURAL_LIST);
      console.log(`[Seed] Inserted ${THIRUKKURAL_LIST.length} Thirukkural entries.`);
    }

    console.log('[Seed] Seeding completed successfully!');
  } catch (error) {
    console.error('[Seed Error]:', error.message);
  }
}

// If run directly via node CLI
if (require.main === module) {
  seedDatabase().then(() => {
    mongoose.connection.close();
    process.exit(0);
  });
}

module.exports = {
  seedDatabase,
  ALPHABET_DATA,
  GRAMMAR_TOPICS,
  VOCABULARY_LIST,
  THIRUKKURAL_LIST,
  PREBUILT_QUIZZES
};
