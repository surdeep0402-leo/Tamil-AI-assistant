# செந்தமிழ் AI (Senthamil AI)
### AI Powered Tamil Learning and Grammar Intelligence Assistant
*(தமிழ் கற்றல் மற்றும் இலக்கண நுண்ணறிவு உதவியாளர்)*

---

## 📌 Problem Statement Overview
Tamil is one of the world's oldest classical languages, renowned for its rich literary tradition and rigorous grammatical architecture codified in seminal works like **Tolkāppiyam (தொல்காப்பியம்)** and **Nannūl (நன்னூல்)**. Modern Tamil learners and digital writers often grapple with:
1. **Sandhi (புணர்ச்சி) Errors**: Knowing when and where hard consonants (க், ச், த், ப்) must double (வலிமிகும் இடங்கள்) or must never double (வலிமிகா இடங்கள்).
2. **Subject-Predicate Concord (பால், எண், இடம், காலம் இயைபு)**: Ensuring gender, number, and person agreement between pronouns and verb terminations (e.g. *அவன் வந்தது* ❌ vs *அவன் வந்தான்* ✔️).
3. **Spoken vs Written Tamil (கொச்சை / பேச்சுத்தமிழ் -> செந்தமிழ்)**: Normalizing informal spoken colloquialisms into formal written Tamil.
4. **Prosodic Morae (மாத்திரை) Calculation**: Understanding the rhythmic durations of short vowels, long vowels, pure consonants, and the unique Aytham letter (ஃ).
5. **Lack of Accessible Interactive AI Tutoring**: Learners need instant explanations, pronunciation guides, curated vocabulary, Thirukkural breakdowns, and gamified quizzes.

**செந்தமிழ் AI** solves this problem by combining a high-performance **Tamil Linguistic Rules Engine** with **Google Gemini AI** (`gemini-2.5-flash`), an interactive **HTML/CSS/JavaScript** frontend, and a persistent **MongoDB** database.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | HTML5 (Semantic & Accessible), CSS3 (Modern Heritage Design System, Dark/Light Themes, Glassmorphism, CSS Grid & Flexbox), Vanilla JavaScript (ES6+ Modular) |
| **Browser APIs** | **Web Speech API** for Tamil Text-to-Speech (`ta-IN`) and Speech Recognition Voice Input (`webkitSpeechRecognition`), **Clipboard API** |
| **Typing Support** | Real-time **Phonetic Tanglish Transliteration Engine** (e.g. `vanakkam` -> `வணக்கம்`) & On-screen **Tamil Virtual Keyboard** |
| **Backend** | **Node.js** (v24), **Express.js**, RESTful API architecture |
| **Database** | **MongoDB** (running locally on port `27017`), **Mongoose ODM** |
| **AI Integration** | **Google Gemini API** (`@google/genai` SDK using `gemini-2.5-flash`) + Built-in Classical Tamil Linguistic Fallback Engine |

---

## ✨ Core Features & Modules

### 1. ✍️ Grammar Intelligence & Proofreader (இலக்கணப் பகுப்பாய்வி)
- **Sandhi (புணர்ச்சி) Checker**:
  - Detects missing hard consonant doubling after demonstrative words (*அந்த, இந்த, எந்த*), interrogatives, 2nd accusative case markers (*-ஐ*), 4th dative case markers (*-கு*), and adverbs (*அப்படி, இப்படி, எப்படி*).
  - Validates forbidden doubling in subject-verb sequences and quantity modifiers (*எத்தனை, அத்தனை*).
- **Subject-Predicate Concord**:
  - Enforces person and gender agreements across all three persons (தன்மை, முன்னிலை, படர்க்கை).
- **Spoken Colloquial to Formal Normalizer**:
  - Automatically identifies colloquial speech patterns (e.g., *வரேன்* -> *வருகிறேன்*, *பாத்துட்டேன்* -> *பார்த்துவிட்டேன்*, *பண்ணிட்டேன்* -> *செய்துவிட்டேன்*) and provides standard formal Tamil equivalents.
- **Phonological Morae (மாத்திரை) Calculator**:
  - Accurately counts குறில் (1), நெடில் (2), மெய் (0.5), ஆய்தம் (0.5) and classifies consonants into வல்லினம் (Hard), மெல்லினம் (Soft), and இடையினம் (Medial).
- **Parts of Speech (POS) Tagging**:
  - Highlights பெயர்ச்சொல் (Noun), வினைமுற்று (Verb), பெயரடை (Adjective), வினையடை (Adverb), and இடைச்சொல் (Particle).
- **Deep AI Scholar Explanations**:
  - Generates classical grammatical rationale referencing *Nannūl* and *Tolkāppiyam* with audio pronunciation.

### 2. 🤖 AI Tamil Tutor Chatbot (தமிழ் ஆசான்)
- Interactive conversational AI persona (*செந்தமிழ் ஆசான்*).
- Explains literary figures, etymology, sentence crafting, and grammar nuances.
- Built-in Tamil voice input (Mic STT) and instant audio read-aloud (TTS).
- Quick prompt suggestions for common grammatical inquiries.

### 3. 📖 Structured Learning Curriculum (படிநிலைக் கற்றல்)
- **எழுத்துக்கள் (Alphabet Explorer)**: Complete interactive matrix of 12 உயிர் (Vowels), 18 மெய் (Consonants), and 1 ஆய்தம் with sound playback on click and morae classification.
- **ஐந்திலக்கணம் (Five Divisions of Tamil Grammar)**:
  1. எழுத்திலக்கணம் (Phonology & Orthography)
  2. சொல்லிலக்கணம் (Morphology & Syntax)
  3. பொருளிலக்கணம் (Poetics & Subject Matter)
  4. யாப்பிலக்கணம் (Prosody & Metrics)
  5. அணியிலக்கணம் (Rhetoric & Figures of Speech)
- **சொற்களஞ்சியம் (Vocabulary Bank)**: Categorized flashcards (Family, Nature, Food, Daily Life, Education, Emotions) with search and audio pronunciation.

### 4. 📜 Thirukkural Explorer (திருக்குறள் முற்றம்)
- Daily featured Kural card with two-line classical typography.
- Word-by-word grammatical breakdown (**பதவுரை**) table.
- Clear meanings in Tamil (**பொழிப்புரை**) and English translation.
- Literary and poetic figures (**அணி விளக்கம்**).
- Audio verse recitation.

### 5. 🎯 Gamified Quizzes & Challenges (பயிற்சிகள் & வினாடி வினா)
- Multi-category quizzes: Sandhi rules, Tense & Concord, Vocabulary, and General Grammar.
- Dynamic AI quiz question generator (`POST /api/quiz/questions?aiGenerated=true`).
- Real-time score cards, XP points (+25 XP per question), level progression, and streak tracking.

### 6. 📊 User Dashboard & Progress (முன்னேற்றப் பலகை)
- Tracks user level, total XP, learning streaks, and total sentences analyzed.
- Achievement badges (*தொடக்க மாணவன்*, *சந்தி வித்தகர்*, *குறள் காவலர்*, *செந்தமிழ் அறிஞர்*).
- Real-time MongoDB and AI service health monitors.

---

## 🚀 Quick Start Guide

### Prerequisites
1. **Node.js** (v18 or higher; v24 recommended)
2. **MongoDB** (Running on `127.0.0.1:27017`)

### 1. Install Dependencies
```bash
npm install
```

### 2. Seed Initial Database
Populates MongoDB with Tamil vocabulary, Thirukkural verses, and lesson topics:
```bash
npm run seed
```

### 3. Configure Environment Variables (Optional)
In `.env`:
```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/tamil_ai_assistant
GEMINI_API_KEY=your_gemini_api_key_here
```
*(Note: An API key is optional. If not set, the built-in deterministic classical rules engine runs seamlessly out-of-the-box!)*

### 4. Start the Application
```bash
npm start
```
Open your browser and navigate to:
👉 **`http://localhost:3000`**

---

## 📡 API Endpoints Reference

### Grammar Intelligence
- `POST /api/grammar/analyze` - Analyze sentence for Sandhi, concord, spoken-to-formal, morae, and AI explanations.
- `GET /api/grammar/history` - Retrieve recently analyzed sentences.
- `POST /api/grammar/mora-analysis` - Calculate text syllable durations and metrics.

### Learning Modules
- `GET /api/learning/alphabet` - Retrieve vowels, consonants, combinations, and morae.
- `GET /api/learning/grammar-topics` - Retrieve the five divisions of Tamil grammar.
- `GET /api/learning/vocabulary` - Query vocabulary by category and keyword search.
- `GET /api/learning/thirukkural` - Retrieve curated Thirukkural verses.
- `GET /api/learning/thirukkural/daily` - Retrieve the daily featured Thirukkural.

### Quizzes & Evaluation
- `GET /api/quiz/questions` - Fetch multiple-choice quiz questions (supports `?aiGenerated=true`).
- `POST /api/quiz/submit` - Grade submitted answers, award XP, update user streak, and persist results.
- `GET /api/quiz/history` - Retrieve past quiz results.

### AI Chatbot & Users
- `POST /api/chat/message` - Multi-turn conversational Tamil tutor response.
- `GET /api/user/profile` - Fetch current user statistics, level, and database health.
- `PUT /api/user/preferences` - Update user theme, speech rate, and API key.

---

## 📂 Project Structure

```
Project2/
├── package.json               # Dependencies and run scripts
├── server.js                  # Express application entry point
├── .env                       # Environment configuration
├── .env.example               # Example environment variables
├── README.md                  # Complete documentation
├── public/                    # Frontend Client
│   ├── index.html             # Semantic Single-Page Application UI
│   ├── css/
│   │   └── style.css          # Design system & dark/light theme
│   └── js/
│       ├── app.js             # Main frontend controller & reactive UI
│       ├── transliterate.js   # Phonetic Tanglish to Tamil transliterator
│       ├── virtualKeyboard.js # On-screen Tamil virtual keyboard
│       └── speech.js          # Web Speech API TTS & voice recognition
└── src/                       # Backend Source Code
    ├── config/
    │   └── db.js              # MongoDB connection manager
    ├── models/
    │   ├── User.js            # User profile, XP, streak schema
    │   ├── GrammarLog.js      # Grammar checks & corrections history
    │   ├── QuizResult.js      # Quiz score and performance records
    │   ├── Vocabulary.js      # Categorized Tamil words repository
    │   └── Thirukkural.js     # Curated Kural database with padha urai
    ├── routes/
    │   ├── grammarRoutes.js   # Sentence analysis endpoints
    │   ├── learningRoutes.js  # Alphabet, grammar topics, vocab & Kural
    │   ├── quizRoutes.js      # Question bank & scoring endpoints
    │   ├── chatRoutes.js      # AI tutor chat endpoints
    │   └── userRoutes.js      # Profile and preferences
    ├── services/
    │   ├── tamilLinguistics.js# Rule engine: Sandhi, Concord, Mora, Spoken
    │   └── geminiService.js   # Google Gemini 2.5 Flash integration
    └── seeds/
        └── seedData.js        # Initial database populator script
```

---

## 📜 License
This project is open-source and created for Tamil language preservation, research, and educational advancement.
