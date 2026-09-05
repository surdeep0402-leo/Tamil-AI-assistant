/**
 * Senthamil AI Assistant - Main Application Controller
 */

// Application State
const AppState = {
  user: {
    username: 'செந்தமிழ் மாணவன்',
    level: 1,
    xp: 150,
    streakDays: 3,
    apiKey: localStorage.getItem('senthamil_gemini_api_key') || '',
    theme: localStorage.getItem('senthamil_theme') || 'dark',
    audioSpeed: parseFloat(localStorage.getItem('senthamil_audio_speed')) || 0.9,
    transliterateEnabled: true
  },
  quiz: {
    activeCategory: 'all',
    questions: [],
    currentIndex: 0,
    userAnswers: [],
    isAnswered: false
  },
  thirukkuralList: [],
  currentKuralIndex: 0,
  vocabularyList: [],
  grammarTopics: [],
  chatHistory: []
};

// UI Helper: Toast Notifications
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;

  if (type === 'success') toast.style.borderLeftColor = '#10b981';
  if (type === 'error') toast.style.borderLeftColor = '#e11d48';

  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3500);
}

// Global Voice Helper
function speakText(text, buttonElement = null) {
  if (window.tamilSpeech) {
    window.tamilSpeech.speak(text, buttonElement);
  }
}

// Global Chat Quick Prompt Trigger
function sendQuickPrompt(prompt) {
  const input = document.getElementById('chatInput');
  if (input) {
    input.value = prompt;
    document.getElementById('sendChatBtn').click();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initVirtualKeyboard('virtualKeyboardContainer');
  initTabs();
  initUser();
  initGrammarAnalyzer();
  initChat();
  initLearning();
  initThirukkural();
  initQuiz();
  initSettings();
});

/* ==========================================================================
   1. Theme & User Profile Management
   ========================================================================== */

function initTheme() {
  const savedTheme = AppState.user.theme;
  document.documentElement.setAttribute('data-theme', savedTheme);

  const toggleBtn = document.getElementById('toggleThemeBtn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      AppState.user.theme = next;
      localStorage.setItem('senthamil_theme', next);
      showToast(`வண்ண அமைப்பு மாற்றப்பட்டது: ${next === 'dark' ? 'இரவு (Dark)' : 'பகல் (Light)'}`);
    });
  }

  // Virtual Keyboard toggle
  const toggleKbdBtn = document.getElementById('toggleKeyboardBtn');
  const kbdContainer = document.getElementById('virtualKeyboardContainer');
  if (toggleKbdBtn && kbdContainer) {
    toggleKbdBtn.addEventListener('click', () => {
      kbdContainer.classList.toggle('active');
      toggleKbdBtn.classList.toggle('active');
    });
  }
}

async function initUser() {
  try {
    const res = await fetch('/api/user/profile');
    const data = await res.json();
    if (data.success && data.user) {
      AppState.user.username = data.user.username;
      AppState.user.level = data.user.level || 1;
      AppState.user.xp = data.user.xp || 150;
      AppState.user.streakDays = data.user.streakDays || 3;
      updateUserUI();

      // Update dashboard stats
      document.getElementById('dashXpVal').textContent = AppState.user.xp;
      document.getElementById('dashStreakVal').textContent = AppState.user.streakDays;
      document.getElementById('dashChecksVal').textContent = data.stats.totalGrammarChecks || 0;
      document.getElementById('dbStatusBadge').textContent = data.stats.dbConnected ? 'இணைக்கப்பட்டுள்ளது ✔️' : 'அகநிலை முறை (Offline) ⚠️';
    }
  } catch (err) {
    console.warn('User fetch warning:', err);
    updateUserUI();
  }
}

function updateUserUI() {
  const xpVal = document.getElementById('userXpVal');
  const levelVal = document.getElementById('userLevelVal');
  const streakVal = document.getElementById('userStreakVal');
  const dashXp = document.getElementById('dashXpVal');

  if (xpVal) xpVal.textContent = `${AppState.user.xp} XP`;
  if (levelVal) levelVal.textContent = AppState.user.level;
  if (streakVal) streakVal.textContent = `${AppState.user.streakDays} நாட்கள்`;
  if (dashXp) dashXp.textContent = AppState.user.xp;
}

function awardXP(amount) {
  AppState.user.xp += amount;
  AppState.user.level = Math.floor(AppState.user.xp / 200) + 1;
  updateUserUI();
  showToast(`+${amount} XP புள்ளிகள் கிடைத்துள்ளன! 🌟`, 'success');
}

/* ==========================================================================
   2. Tab Navigation
   ========================================================================== */

function initTabs() {
  const tabs = document.querySelectorAll('.nav-tab');
  const panes = document.querySelectorAll('.tab-pane');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetId = tab.dataset.tab;
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add('active');
    });
  });
}

/* ==========================================================================
   3. Grammar Intelligence Analyzer
   ========================================================================== */

function initGrammarAnalyzer() {
  const input = document.getElementById('grammarInput');
  const analyzeBtn = document.getElementById('analyzeSentenceBtn');
  const clearBtn = document.getElementById('clearEditorBtn');
  const speakBtn = document.getElementById('speakInputBtn');
  const voiceBtn = document.getElementById('voiceInputBtn');
  const transliterateToggle = document.getElementById('transliterateToggle');
  const samplePills = document.querySelectorAll('.sample-pill[data-sample]');
  const copyBtn = document.getElementById('copyCorrectedBtn');
  const speakAIBtn = document.getElementById('speakAIExplanationBtn');

  // Transliteration on input
  if (input) {
    input.addEventListener('keyup', (e) => {
      if (!transliterateToggle.checked) return;
      if (e.key === ' ' || e.key === 'Enter') {
        const cursor = input.selectionStart;
        const currentVal = input.value;
        const converted = window.transliterateTamil(currentVal);
        if (converted !== currentVal) {
          input.value = converted;
          input.setSelectionRange(cursor, cursor);
        }
      }
    });
  }

  // Clear button
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      input.value = '';
      document.getElementById('grammarResults').style.display = 'none';
      input.focus();
    });
  }

  // Sample prompt selection
  samplePills.forEach(pill => {
    pill.addEventListener('click', () => {
      input.value = pill.dataset.sample;
      analyzeBtn.click();
    });
  });

  // Speak input
  if (speakBtn) {
    speakBtn.addEventListener('click', () => {
      if (input.value.trim()) {
        speakText(input.value, speakBtn);
      }
    });
  }

  // Voice Speech-to-Text
  if (voiceBtn) {
    voiceBtn.addEventListener('click', () => {
      if (window.tamilSpeech) {
        window.tamilSpeech.startListening(
          (recognized) => {
            input.value = (input.value ? input.value + ' ' : '') + recognized;
            showToast('குரல் கேட்கப்பட்டது: ' + recognized, 'success');
          },
          (isListening) => {
            if (isListening) {
              voiceBtn.classList.add('btn-danger');
              voiceBtn.textContent = '🔴 கேட்கிறது...';
            } else {
              voiceBtn.classList.remove('btn-danger');
              voiceBtn.textContent = '🎤 குரல் உள்ளீடு';
            }
          }
        );
      }
    });
  }

  // Copy corrected text
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const corrected = document.getElementById('correctedSentenceDisplay').textContent;
      navigator.clipboard.writeText(corrected);
      showToast('திருத்தப்பட்ட வாக்கியம் நகலெடுக்கப்பட்டது! 📋', 'success');
    });
  }

  // Speak AI Explanation
  if (speakAIBtn) {
    speakAIBtn.addEventListener('click', () => {
      const text = document.getElementById('aiExplanationText').textContent;
      speakText(text, speakAIBtn);
    });
  }

  // Analyze Button Trigger
  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', async () => {
      const sentence = input.value.trim();
      if (!sentence) {
        showToast('வாக்கியத்தை உள்ளிடவும்.', 'error');
        return;
      }

      analyzeBtn.disabled = true;
      analyzeBtn.innerHTML = '<span>⏳</span> ஆராய்கிறது...';

      try {
        const res = await fetch('/api/grammar/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sentence,
            customApiKey: AppState.user.apiKey,
            useAI: true
          })
        });

        const data = await res.json();
        if (data.success && data.analysis) {
          renderGrammarResults(data.analysis);
          awardXP(10);
        } else {
          showToast(data.error || 'பகுப்பாய்வு தோல்வியுற்றது.', 'error');
        }
      } catch (err) {
        console.error('Analysis error:', err);
        showToast('இலக்கணப் பகுப்பாய்வில் பிழை ஏற்பட்டது.', 'error');
      } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = '<span>🔍</span> சரிபார் (Analyze)';
      }
    });
  }
}

function renderGrammarResults(analysis) {
  const resultsContainer = document.getElementById('grammarResults');
  resultsContainer.style.display = 'flex';

  // 1. Status Banner
  const banner = document.getElementById('resultStatusBanner');
  const statusIcon = document.getElementById('statusIcon');
  const statusTitleText = document.getElementById('statusTitleText');
  const statusGradeText = document.getElementById('statusGradeText');

  banner.className = 'status-banner';
  if (analysis.isFlawless) {
    banner.classList.add('success');
    statusIcon.textContent = '🎉';
    statusTitleText.textContent = 'வாக்கியம் இலக்கணப் பிழையின்றிச் சிறப்பாக அமைந்துள்ளது!';
    statusGradeText.textContent = analysis.summary.overallGrade;
  } else {
    banner.classList.add(analysis.errorCount > 2 ? 'error' : 'warning');
    statusIcon.textContent = '⚠️';
    statusTitleText.textContent = `${analysis.errorCount} இலக்கணத் திருத்தங்கள் கண்டறியப்பட்டன`;
    statusGradeText.textContent = analysis.summary.overallGrade;
  }

  // 2. Sentences
  document.getElementById('originalSentenceDisplay').textContent = analysis.originalText;
  document.getElementById('originalWordCount').textContent = `${analysis.originalText.split(/\s+/).length} சொற்கள்`;
  document.getElementById('correctedSentenceDisplay').textContent = analysis.correctedText;

  // 3. Error Cards List
  const errorCardsList = document.getElementById('errorCardsList');
  errorCardsList.innerHTML = '';

  if (analysis.errors.length === 0) {
    errorCardsList.innerHTML = `
      <div style="color: #10b981; font-weight: 600; padding: 0.5rem 0;">
        ✔️ எந்தவொரு சந்திப் பிழையோ அல்லது பால்-எண் இயைபுப் பிழையோ இல்லை. நன்னூல் நெறிப்படி முழுமை பெற்றுள்ளது!
      </div>
    `;
  } else {
    analysis.errors.forEach(err => {
      const card = document.createElement('div');
      card.className = 'error-item-card';

      card.innerHTML = `
        <div class="error-header">
          <span class="error-rule">${err.rule}</span>
          <span class="error-badge">${err.category || err.type}</span>
        </div>
        <div class="error-explanation">${err.explanationTa}</div>
        <div style="font-size: 0.8rem; color: var(--text-muted);">${err.explanationEn}</div>
        ${err.original && err.replacement ? `
          <div class="error-diff">
            <span class="diff-wrong">${err.original}</span>
            <span>➔</span>
            <span class="diff-correct">${err.replacement}</span>
            <button class="btn btn-secondary btn-sm" style="margin-left: auto;" onclick="applySentenceFix('${err.original}', '${err.replacement}')">
              ஏற்றுக்கொள் (Apply)
            </button>
          </div>
        ` : ''}
      `;
      errorCardsList.appendChild(card);
    });
  }

  // 4. Mora & Phonological Metrics
  const m = analysis.moraStats;
  document.getElementById('totalMoraVal').textContent = m.totalMora;
  document.getElementById('letterCountVal').textContent = m.letterCount;
  document.getElementById('uyirCountVal').textContent = m.uyirCount;
  document.getElementById('meiCountVal').textContent = m.meiCount;
  document.getElementById('vallinamVal').textContent = m.vallinamCount;
  document.getElementById('mellinamVal').textContent = m.mellinamCount;
  document.getElementById('idaiyinamVal').textContent = m.idaiyinamCount;

  // 5. Parts of Speech Tags
  const posContainer = document.getElementById('posTagsContainer');
  posContainer.innerHTML = '';
  analysis.posTags.forEach(p => {
    const chip = document.createElement('div');
    chip.className = 'pos-tag-chip';
    chip.innerHTML = `
      <span class="pos-word">${p.word}</span>
      <span class="pos-type">${p.tag}</span>
    `;
    posContainer.appendChild(chip);
  });

  // 6. AI In-depth Explanation
  const aiBox = document.getElementById('aiExplanationText');
  aiBox.textContent = analysis.aiExplanation || 'பகுப்பாய்வு நிறைவு பெற்றது.';

  // Smooth scroll into results
  resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function applySentenceFix(original, replacement) {
  const input = document.getElementById('grammarInput');
  if (input && input.value.includes(original)) {
    input.value = input.value.replace(original, replacement);
    showToast(`திருத்தம் பயன்படுத்தப்பட்டது: "${replacement}"`, 'success');
    document.getElementById('analyzeSentenceBtn').click();
  }
}

/* ==========================================================================
   4. AI Tamil Tutor Chat
   ========================================================================== */

function initChat() {
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendChatBtn');
  const chatMessages = document.getElementById('chatMessages');
  const micBtn = document.getElementById('chatMicBtn');

  // Phonetic Tanglish support for chat input as well
  if (chatInput) {
    chatInput.addEventListener('keyup', (e) => {
      if (AppState.user.transliterateEnabled && (e.key === ' ' || e.key === 'Enter')) {
        const cursor = chatInput.selectionStart;
        const currentVal = chatInput.value;
        const converted = window.transliterateTamil(currentVal);
        if (converted !== currentVal) {
          chatInput.value = converted;
          chatInput.setSelectionRange(cursor, cursor);
        }
      }
      if (e.key === 'Enter') {
        sendBtn.click();
      }
    });
  }

  if (micBtn) {
    micBtn.addEventListener('click', () => {
      if (window.tamilSpeech) {
        window.tamilSpeech.startListening(
          (recognized) => {
            chatInput.value = recognized;
            micBtn.classList.remove('active');
            sendBtn.click();
          },
          (isListening) => {
            if (isListening) micBtn.classList.add('active');
            else micBtn.classList.remove('active');
          }
        );
      }
    });
  }

  if (sendBtn) {
    sendBtn.addEventListener('click', async () => {
      const msg = chatInput.value.trim();
      if (!msg) return;

      // Append user bubble
      appendChatBubble('user', msg);
      chatInput.value = '';
      sendBtn.disabled = true;

      // Add temporary typing indicator
      const typingBubble = appendChatBubble('tutor', 'ஆசான் யோசிக்கிறார்...');

      try {
        const res = await fetch('/api/chat/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: msg,
            conversationHistory: AppState.chatHistory,
            customApiKey: AppState.user.apiKey
          })
        });

        const data = await res.json();
        typingBubble.remove();

        if (data.success && data.reply) {
          appendChatBubble('tutor', data.reply);
          AppState.chatHistory.push({ role: 'user', text: msg });
          AppState.chatHistory.push({ role: 'tutor', text: data.reply });
          awardXP(5);
        } else {
          appendChatBubble('tutor', 'மன்னிக்கவும், பதிலை உருவாக்குவதில் பிழை ஏற்பட்டது.');
        }
      } catch (err) {
        typingBubble.remove();
        appendChatBubble('tutor', 'இணையத் தொடர்பு தடைபட்டது. தயவுசெய்து மீண்டும் முயலவும்.');
      } finally {
        sendBtn.disabled = false;
        chatInput.focus();
      }
    });
  }
}

function appendChatBubble(sender, text) {
  const container = document.getElementById('chatMessages');
  if (!container) return null;

  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${sender}`;

  bubble.innerHTML = `
    <div class="msg-header">
      <span>${sender === 'user' ? 'நீங்கள் (Learner)' : '🏛️ செந்தமிழ் ஆசான்'}</span>
      <button class="speaker-btn" title="ஒலிக்க">🔊</button>
    </div>
    <div class="msg-body">${text.replace(/\n/g, '<br>')}</div>
  `;

  const speakerBtn = bubble.querySelector('.speaker-btn');
  speakerBtn.addEventListener('click', (e) => {
    speakText(text, e.currentTarget);
  });

  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
  return bubble;
}

/* ==========================================================================
   5. Structured Learning Hub
   ========================================================================== */

function initLearning() {
  const btnAlpha = document.getElementById('subTabAlphabetBtn');
  const btnGrammar = document.getElementById('subTabGrammarBtn');
  const btnVocab = document.getElementById('subTabVocabBtn');

  const viewAlpha = document.getElementById('subViewAlphabet');
  const viewGrammar = document.getElementById('subViewGrammar');
  const viewVocab = document.getElementById('subViewVocab');

  btnAlpha.addEventListener('click', () => {
    btnAlpha.className = 'btn btn-primary';
    btnGrammar.className = 'btn btn-secondary';
    btnVocab.className = 'btn btn-secondary';
    viewAlpha.style.display = 'block';
    viewGrammar.style.display = 'none';
    viewVocab.style.display = 'none';
  });

  btnGrammar.addEventListener('click', () => {
    btnAlpha.className = 'btn btn-secondary';
    btnGrammar.className = 'btn btn-primary';
    btnVocab.className = 'btn btn-secondary';
    viewAlpha.style.display = 'none';
    viewGrammar.style.display = 'block';
    viewVocab.style.display = 'none';
    loadGrammarTopics();
  });

  btnVocab.addEventListener('click', () => {
    btnAlpha.className = 'btn btn-secondary';
    btnGrammar.className = 'btn btn-secondary';
    btnVocab.className = 'btn btn-primary';
    viewAlpha.style.display = 'none';
    viewGrammar.style.display = 'none';
    viewVocab.style.display = 'block';
    loadVocabulary();
  });

  // Load Alphabet Grid immediately
  loadAlphabet();

  // Vocab Filters
  const searchInput = document.getElementById('vocabSearchInput');
  const categoryFilter = document.getElementById('vocabCategoryFilter');

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      loadVocabulary(categoryFilter.value, searchInput.value);
    });
  }

  if (categoryFilter) {
    categoryFilter.addEventListener('change', () => {
      loadVocabulary(categoryFilter.value, searchInput.value);
    });
  }
}

async function loadAlphabet() {
  try {
    const res = await fetch('/api/learning/alphabet');
    const data = await res.json();
    if (!data.success) return;

    const uyirGrid = document.getElementById('uyirGrid');
    const meiGrid = document.getElementById('meiGrid');

    uyirGrid.innerHTML = '';
    meiGrid.innerHTML = '';

    // Uyir + Aytham
    [...data.data.uyir, ...data.data.aytham].forEach(u => {
      const card = document.createElement('div');
      card.className = 'letter-card';
      card.innerHTML = `
        <div class="letter-char">${u.letter}</div>
        <div class="letter-sound">${u.sound}</div>
        <div class="letter-mora">${u.type} (${u.mora} மாத்திரை)</div>
        <div class="letter-example">${u.example}</div>
      `;
      card.addEventListener('click', () => {
        speakText(`${u.letter}, ${u.example}`, card);
        card.style.transform = 'scale(0.95)';
        setTimeout(() => card.style.transform = '', 150);
      });
      uyirGrid.appendChild(card);
    });

    // Mei
    data.data.mei.forEach(m => {
      const card = document.createElement('div');
      card.className = 'letter-card';
      card.innerHTML = `
        <div class="letter-char">${m.letter}</div>
        <div class="letter-sound">${m.sound}</div>
        <div class="letter-mora">${m.group}</div>
        <div class="letter-example">${m.example}</div>
      `;
      card.addEventListener('click', () => {
        speakText(`${m.letter}, ${m.example}`, card);
        card.style.transform = 'scale(0.95)';
        setTimeout(() => card.style.transform = '', 150);
      });
      meiGrid.appendChild(card);
    });
  } catch (err) {
    console.warn('Alphabet load err:', err);
  }
}

async function loadGrammarTopics() {
  const container = document.getElementById('grammarTopicsAccordion');
  if (container.children.length > 0) return; // already loaded

  try {
    const res = await fetch('/api/learning/grammar-topics');
    const data = await res.json();
    if (!data.success) return;

    data.topics.forEach(topic => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div style="cursor: pointer;" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'block' : 'none'">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3 style="color: var(--accent-gold); font-size: 1.25rem;">${topic.title}</h3>
            <span style="font-size: 1.2rem;">▼</span>
          </div>
          <p style="color: var(--text-secondary); margin-top: 0.3rem;">${topic.subtitle}</p>
        </div>
        <div style="margin-top: 1rem; border-top: 1px solid var(--border-color); padding-top: 1rem; display: block;">
          <p style="margin-bottom: 1rem; line-height: 1.7;">${topic.summary}</p>
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            ${topic.sections.map(s => `
              <div style="background-color: var(--bg-card); padding: 0.85rem 1rem; border-radius: var(--radius-sm); border-left: 3px solid var(--accent-gold);">
                <div style="font-weight: 700; color: var(--text-primary); margin-bottom: 0.25rem;">${s.heading}</div>
                <div style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6; white-space: pre-line;">${s.content}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.warn('Grammar topics load err:', err);
  }
}

async function loadVocabulary(category = 'அனைத்தும்', search = '') {
  try {
    let url = `/api/learning/vocabulary?category=${encodeURIComponent(category)}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    const res = await fetch(url);
    const data = await res.json();
    if (!data.success) return;

    const grid = document.getElementById('vocabGrid');
    grid.innerHTML = '';

    if (data.words.length === 0) {
      grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem;">சொற்கள் எதுவும் காணப்படவில்லை.</div>';
      return;
    }

    data.words.forEach(w => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <span style="font-size: 0.75rem; color: var(--accent-gold); font-weight: 600;">${w.category}</span>
          <button class="speaker-btn" style="background: none; border: none; cursor: pointer; color: var(--accent-gold); font-size: 1rem;" onclick="speakText('${w.word}', this)">🔊</button>
        </div>
        <div style="font-family: var(--font-display); font-size: 1.6rem; font-weight: 700; color: var(--text-primary);">${w.word}</div>
        <div style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 0.5rem;">${w.transliteration}</div>
        <div style="font-weight: 600; color: #34d399; margin-bottom: 0.25rem;">${w.meaningEn}</div>
        <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.75rem;">${w.meaningTa}</div>
        ${w.exampleSentenceTa ? `
          <div style="background-color: var(--bg-card); padding: 0.5rem 0.75rem; border-radius: var(--radius-sm); font-size: 0.85rem;">
            <div style="font-family: var(--font-tamil); color: var(--text-primary);">${w.exampleSentenceTa}</div>
            <div style="color: var(--text-muted); font-size: 0.75rem;">${w.exampleSentenceEn}</div>
          </div>
        ` : ''}
      `;
      grid.appendChild(card);
    });
  } catch (err) {
    console.warn('Vocab load err:', err);
  }
}

/* ==========================================================================
   6. Thirukkural Explorer
   ========================================================================== */

async function initThirukkural() {
  const speakBtn = document.getElementById('speakKuralBtn');
  const nextBtn = document.getElementById('nextKuralBtn');

  try {
    const res = await fetch('/api/learning/thirukkural');
    const data = await res.json();
    if (data.success && data.kurals && data.kurals.length > 0) {
      AppState.thirukkuralList = data.kurals;
      renderCurrentKural();
    }
  } catch (err) {
    console.warn('Kural init err:', err);
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (AppState.thirukkuralList.length === 0) return;
      AppState.currentKuralIndex = (AppState.currentKuralIndex + 1) % AppState.thirukkuralList.length;
      renderCurrentKural();
    });
  }

  if (speakBtn) {
    speakBtn.addEventListener('click', () => {
      const kural = AppState.thirukkuralList[AppState.currentKuralIndex];
      if (kural) {
        speakText(`${kural.line1} ${kural.line2}`, speakBtn);
      }
    });
  }
}

function renderCurrentKural() {
  const kural = AppState.thirukkuralList[AppState.currentKuralIndex];
  if (!kural) return;

  document.getElementById('kuralNumberTag').textContent = `குறள் எண்: ${kural.number} | ${kural.chapter} (${kural.section})`;
  document.getElementById('kuralVerseLines').innerHTML = `${kural.line1}<br>${kural.line2}`;
  document.getElementById('kuralMeaningTa').textContent = kural.meaningTa;
  document.getElementById('kuralMeaningEn').textContent = kural.meaningEn;
  document.getElementById('kuralGrammarExp').textContent = kural.grammarExplanation || 'நன்னூல் இலக்கணக் குறிப்புகள் பொருந்தும்.';

  const tbody = document.getElementById('padhaUraiTableBody');
  tbody.innerHTML = '';
  if (kural.padhaUrai && kural.padhaUrai.length > 0) {
    kural.padhaUrai.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 700; font-family: var(--font-tamil); color: var(--accent-gold);">${p.word}</td>
        <td>${p.meaning}</td>
        <td style="color: var(--accent-blue);">${p.grammarNote}</td>
      `;
      tbody.appendChild(tr);
    });
  }
}

/* ==========================================================================
   7. Gamified Quizzes & Challenges
   ========================================================================== */

function initQuiz() {
  const catButtons = document.querySelectorAll('.quiz-cat-btn');
  const aiGenBtn = document.getElementById('aiGenerateQuizBtn');
  const nextBtn = document.getElementById('nextQuizQuestionBtn');
  const restartBtn = document.getElementById('restartQuizBtn');

  catButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      catButtons.forEach(b => {
        b.className = 'btn btn-secondary btn-sm quiz-cat-btn';
      });
      btn.className = 'btn btn-primary btn-sm quiz-cat-btn active';
      AppState.quiz.activeCategory = btn.dataset.cat;
      startQuiz(btn.dataset.cat);
    });
  });

  if (aiGenBtn) {
    aiGenBtn.addEventListener('click', () => {
      startQuiz(AppState.quiz.activeCategory, true);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      AppState.quiz.currentIndex++;
      if (AppState.quiz.currentIndex < AppState.quiz.questions.length) {
        renderQuizQuestion();
      } else {
        submitQuizResults();
      }
    });
  }

  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      document.getElementById('quizSummaryCard').style.display = 'none';
      document.getElementById('activeQuizCard').style.display = 'flex';
      startQuiz(AppState.quiz.activeCategory);
    });
  }

  // Load initial quiz
  startQuiz('all');
}

async function startQuiz(category = 'all', aiGenerated = false) {
  try {
    let url = `/api/quiz/questions?category=${category}`;
    if (aiGenerated) {
      url += `&aiGenerated=true&customApiKey=${encodeURIComponent(AppState.user.apiKey)}`;
      showToast('AI புதிய வினாவை உருவாக்குகிறது... ✨');
    }

    const res = await fetch(url);
    const data = await res.json();
    if (!data.success || data.questions.length === 0) return;

    AppState.quiz.questions = data.questions;
    AppState.quiz.currentIndex = 0;
    AppState.quiz.userAnswers = [];
    AppState.quiz.isAnswered = false;

    document.getElementById('quizSummaryCard').style.display = 'none';
    document.getElementById('activeQuizCard').style.display = 'flex';

    renderQuizQuestion();
  } catch (err) {
    console.warn('Quiz start err:', err);
  }
}

function renderQuizQuestion() {
  const q = AppState.quiz.questions[AppState.quiz.currentIndex];
  if (!q) return;

  AppState.quiz.isAnswered = false;
  const total = AppState.quiz.questions.length;
  const currentNum = AppState.quiz.currentIndex + 1;

  document.getElementById('quizCounterText').textContent = `வினா ${currentNum} / ${total}`;
  document.getElementById('quizCategoryBadge').textContent = q.category;
  document.getElementById('quizProgressBar').style.width = `${((currentNum - 1) / total) * 100}%`;

  document.getElementById('quizQuestionText').textContent = q.question;
  document.getElementById('quizQuestionEn').textContent = q.questionEn || '';

  const feedbackBox = document.getElementById('quizFeedbackBox');
  feedbackBox.classList.remove('active');
  document.getElementById('nextQuizQuestionBtn').style.display = 'none';

  const optionsContainer = document.getElementById('quizOptionsContainer');
  optionsContainer.innerHTML = '';

  q.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option-btn';
    btn.innerHTML = `
      <span>${opt}</span>
      <span class="opt-indicator">⭕</span>
    `;

    btn.addEventListener('click', () => {
      if (AppState.quiz.isAnswered) return;
      handleAnswerSelect(idx, btn, q);
    });

    optionsContainer.appendChild(btn);
  });
}

function handleAnswerSelect(selectedIndex, selectedBtn, question) {
  AppState.quiz.isAnswered = true;

  // Record user answer
  AppState.quiz.userAnswers.push({
    questionId: question.id,
    questionText: question.question,
    selectedIndex
  });

  // Enable Next button
  document.getElementById('nextQuizQuestionBtn').style.display = 'inline-flex';

  // Highlight selection
  selectedBtn.classList.add('active');
  selectedBtn.querySelector('.opt-indicator').textContent = '🔘';

  // Feedback display
  const feedbackBox = document.getElementById('quizFeedbackBox');
  const title = document.getElementById('quizFeedbackTitle');
  const desc = document.getElementById('quizFeedbackDesc');

  feedbackBox.classList.add('active');
  title.textContent = 'விடை பதிவு செய்யப்பட்டது!';
  desc.textContent = 'அனைத்து கேள்விகளுக்கும் விடையளித்த பின் விரிவான பகுப்பாய்வு காண்பிக்கப்படும்.';
}

async function submitQuizResults() {
  try {
    const res = await fetch('/api/quiz/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: AppState.quiz.activeCategory,
        answers: AppState.quiz.userAnswers
      })
    });

    const data = await res.json();
    if (data.success && data.summary) {
      document.getElementById('activeQuizCard').style.display = 'none';
      const summaryCard = document.getElementById('quizSummaryCard');
      summaryCard.style.display = 'block';

      const s = data.summary;
      document.getElementById('quizScoreSummaryText').innerHTML = `
        நீங்கள் <strong>${s.totalQuestions}</strong> வினாக்களுக்கு <strong>${s.correctAnswers}</strong> வினாக்களுக்குச் சரியான விடையளித்துள்ளீர்கள்.<br>
        மதிப்பெண்: <strong>${s.scorePercentage}%</strong> &bull; பெறப்பட்ட XP: <strong>+${s.xpEarned} XP</strong>!
      `;

      awardXP(s.xpEarned);
    }
  } catch (err) {
    console.error('Quiz submission error:', err);
    showToast('வினாடி வினா முடிவுகளைச் சமர்ப்பிப்பதில் பிழை.', 'error');
  }
}

/* ==========================================================================
   8. Settings Modal & Persistence
   ========================================================================== */

function initSettings() {
  const modal = document.getElementById('settingsModal');
  const openBtn = document.getElementById('openSettingsBtn');
  const closeBtn = document.getElementById('closeSettingsBtn');
  const cancelBtn = document.getElementById('cancelSettingsBtn');
  const saveBtn = document.getElementById('saveSettingsBtn');
  const apiKeyInput = document.getElementById('settingsApiKey');
  const usernameInput = document.getElementById('settingsUsername');
  const audioSpeedRange = document.getElementById('settingsAudioSpeed');
  const audioSpeedLabel = document.getElementById('audioSpeedVal');

  if (AppState.user.apiKey) {
    apiKeyInput.value = AppState.user.apiKey;
    document.getElementById('geminiStatusBadge').textContent = 'API விசை இயக்கத்தில் உள்ளது ✔️';
  }

  if (audioSpeedRange) {
    audioSpeedRange.value = AppState.user.audioSpeed;
    audioSpeedLabel.textContent = `${AppState.user.audioSpeed}x`;
    audioSpeedRange.addEventListener('input', () => {
      audioSpeedLabel.textContent = `${audioSpeedRange.value}x`;
      if (window.tamilSpeech) {
        window.tamilSpeech.speechRate = parseFloat(audioSpeedRange.value);
      }
    });
  }

  function openModal() {
    modal.classList.add('active');
  }

  function closeModal() {
    modal.classList.remove('active');
  }

  if (openBtn) openBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const newKey = apiKeyInput.value.trim();
      const newUsername = usernameInput.value.trim() || 'செந்தமிழ் மாணவன்';
      const newSpeed = parseFloat(audioSpeedRange.value) || 0.9;

      AppState.user.apiKey = newKey;
      AppState.user.username = newUsername;
      AppState.user.audioSpeed = newSpeed;

      localStorage.setItem('senthamil_gemini_api_key', newKey);
      localStorage.setItem('senthamil_audio_speed', newSpeed);

      if (window.tamilSpeech) {
        window.tamilSpeech.speechRate = newSpeed;
      }

      try {
        await fetch('/api/user/preferences', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: newUsername,
            audioSpeed: newSpeed,
            customApiKey: newKey
          })
        });
      } catch (e) {
        console.warn('Preferences update warning:', e);
      }

      document.getElementById('geminiStatusBadge').textContent = newKey ? 'API விசை இயக்கத்தில் உள்ளது ✔️' : 'உள்ளமைவு தயார்';
      showToast('அமைப்புகள் வெற்றிகரமாகச் சேமிக்கப்பட்டன! ✔️', 'success');
      closeModal();
    });
  }
}
