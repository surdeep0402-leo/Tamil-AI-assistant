const { GoogleGenAI } = require('@google/genai');

/**
 * Initialize Google GenAI client
 */
function getGenAIClient(customKey) {
  const apiKey = customKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

/**
 * Check if Gemini is configured
 */
function isGeminiConfigured(customKey) {
  const key = customKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  return Boolean(key && key.trim() !== '');
}

/**
 * AI Grammar In-depth Review & Teaching
 */
async function getAIGrammarExplanation(sentence, ruleFindings, customKey) {
  const client = getGenAIClient(customKey);

  if (!client) {
    // High-quality deterministic fallback tutor response
    const issues = ruleFindings.errors || [];
    if (issues.length === 0) {
      return `🎉 வாழ்த்துக்கள்! நீங்கள் எழுதிய வாக்கியம்: "${sentence}" இலக்கண விதிகளுக்கு உட்பட்டு பிழையின்றிச் சிறப்பாக அமைந்துள்ளது. இதில் எழுவாய்-பயனிலை இயைபும், புணர்ச்சி விதிகளும் செம்மையாகக் கையாளப்பட்டுள்ளன.`;
    }

    const explanationList = issues.map((e, idx) => `${idx + 1}. ${e.rule}: ${e.explanationTa}`).join('\n');
    return `📝 இலக்கணப் பகுப்பாய்வு முடிவு:\n\n` +
      `நீங்கள் குறிப்பிட்ட வாக்கியத்தில் பின்வரும் இலக்கண நெறிகள் கவனிக்கப்பட வேண்டும்:\n\n${explanationList}\n\n` +
      `💡 திருத்தப்பட்ட வடிவம்: "${ruleFindings.correctedText}"\n\n` +
      `குறிப்பு: தொல்காப்பிய மற்றும் நன்னூல் விதிகளின்படி புணர்ச்சி மற்றும் பால்-எண் இயைபு மிக முக்கியமானது.`;
  }

  try {
    const prompt = `
You are "செந்தமிழ் ஆசான்" (Senthamil Aasaan), a renowned Tamil linguistics scholar and friendly AI tutor.
Analyze this Tamil sentence: "${sentence}"

Identified preliminary rule findings:
${JSON.stringify(ruleFindings.errors, null, 2)}

Please provide:
1. Accurate corrected sentence (if any error).
2. Deep grammatical reasoning referencing classical Tamil grammar (நன்னூல் / தொல்காப்பியம் rules such as புணர்ச்சி, வேற்றுமை, எழுவாய்-பயனிலை இயைபு).
3. Clear explanation in polite Tamil, followed by a concise English summary.
4. An illustrative additional example reinforcing this rule.

Keep the response engaging, educational, and formatting clean using bullet points and emojis.
`;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    return response.text;
  } catch (error) {
    console.error('Gemini Grammar Review Error:', error.message);
    return `⚠️ AI பகுப்பாய்வில் தற்காலிக இடர்பாடு ஏற்பட்டது. உள்ளமைக்கப்பட்ட இலக்கணப் பொறி முடிவு: ${ruleFindings.errors.map(e => e.explanationTa).join(', ')}`;
  }
}

/**
 * Conversational AI Tamil Tutor Chat
 */
async function chatWithTamilTutor(userMessage, conversationHistory = [], customKey) {
  const client = getGenAIClient(customKey);

  if (!client) {
    // Intelligent conversational fallback responses
    const lower = userMessage.toLowerCase().trim();
    if (lower.includes('வணக்கம்') || lower.includes('hello') || lower.includes('vanakkam')) {
      return `வணக்கம்! நான் உங்கள் 'செந்தமிழ் AI' இலக்கண உதவியாளர். தமிழ் எழுத்துக்கள், புணர்ச்சி விதிகள், திருக்குறள் விளக்கம் அல்லது வாக்கியப் பிழை திருத்தம் குறித்து நீங்கள் எதை வேண்டுமானாலும் கேட்கலாம்!`;
    }
    if (lower.includes('சந்தி') || lower.includes('புணர்ச்சி') || lower.includes('sandhi')) {
      return `புணர்ச்சி என்பது நிலைமொழியின் இறுதி எழுத்தும், வருமொழியின் முதல் எழுத்தும் ஒன்றோடொன்று சேர்வதாகும். இது இயல்பு புணர்ச்சி மற்றும் விகாரப் புணர்ச்சி என இருவகைப்படும். விகாரப் புணர்ச்சி: தோன்றல், திரிதல், கெடுதல் என மூவகைப்படும். (எ.கா: வாழை + பழம் = வாழைப்பழம் - 'ப்' தோன்றல் விகாரம்).`;
    }
    if (lower.includes('வல்லினம்') || lower.includes('vallinam')) {
      return `வல்லின மெய்யெழுத்துக்கள் ஆறு: க், ச், ட், த், ப், ற் (கசடதபற). இதில் க, ச, த, ப ஆகிய நான்கு எழுத்துக்களே சொல்லின் முதலில் வந்து வலிமிகுந்து புணரும்.`;
    }
    if (lower.includes('திருக்குறள்') || lower.includes('thirukkural')) {
      return `திருக்குறள் திருவள்ளுவரால் இயற்றப்பட்ட உலகப் பொதுமறை நூல். இதில் அறத்துப்பால் (38 அதிகாரங்கள்), பொருட்பால் (70 அதிகாரங்கள்), காமத்துப்பால் (25 அதிகாரங்கள்) என மொத்தம் 133 அதிகாரங்களும், 1330 குறட்பாக்களும் உள்ளன.`;
    }

    return `நான் உங்கள் தமிழ் மொழி ஆசான். நீங்கள் கேட்ட வினா: "${userMessage}".\n\n` +
      `தமிழ் இலக்கணத்தில் எழுத்து, சொல், பொருள், யாப்பு, அணி என ஐந்து பிரிவுகள் உள்ளன. விரிவான AI கலந்துரையாடலுக்கு அமைப்புகள் (Settings) பக்கத்தில் உங்கள் Gemini API Key ஐ இணைக்கலாம்!`;
  }

  try {
    const formattedHistory = conversationHistory.slice(-6).map(h => `${h.role === 'user' ? 'User' : 'Tutor'}: ${h.text}`).join('\n');

    const prompt = `
You are "செந்தமிழ் ஆசான்" (Senthamil Aasaan), an expert, encouraging and knowledgeable AI Tamil teacher and grammar assistant.
You guide learners in mastering Tamil language, grammar (இலக்கணம்), literature, poetry, and correct pronunciation.

Conversation context:
${formattedHistory}

User's current query: "${userMessage}"

Guidelines:
- Reply in elegant, warm, accessible Tamil (with phonetic/English guidance if the user asks in English).
- When explaining grammar, give real-life examples and highlight root words.
- Encourage the student at every step.
- Include 1-2 interesting Tamil cultural or literary facts when relevant.
`;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    return response.text;
  } catch (error) {
    console.error('Gemini Chat Error:', error.message);
    return `மன்னிக்கவும், AI சேவையைத் தொடர்புகொள்வதில் தாமதம் ஏற்பட்டது. தயவுசெய்து உங்கள் இணைய இணைப்பை அல்லது API விசை அமைப்பைச் சரிபார்க்கவும்.`;
  }
}

/**
 * Generate Dynamic Quiz Question via AI
 */
async function generateAIQuizQuestion(topic, difficulty = 'medium', customKey) {
  const client = getGenAIClient(customKey);
  if (!client) return null;

  try {
    const prompt = `
Generate a single multiple-choice quiz question about Tamil grammar or vocabulary.
Topic: "${topic}"
Difficulty: "${difficulty}"

Return JSON ONLY matching this schema:
{
  "question": "Tamil question string",
  "questionEn": "English translation of question",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "correctIndex": 0,
  "explanation": "Detailed explanation of why this answer is correct in Tamil",
  "rule": "The underlying grammatical rule"
}
`;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    return JSON.parse(response.text);
  } catch (err) {
    console.error('Quiz Gen Error:', err.message);
    return null;
  }
}

module.exports = {
  isGeminiConfigured,
  getAIGrammarExplanation,
  chatWithTamilTutor,
  generateAIQuizQuestion
};
