/**
 * Tamil Speech Synthesis & Voice Recognition Service
 * Dual-layer architecture:
 * 1. Primary: High-fidelity Server-side Native Tamil Audio Stream (Works 100% on all Windows/Mac/Mobile browsers)
 * 2. Secondary Fallback: Browser Web Speech API (with Chromium resume bugfix)
 */

class TamilSpeechService {
  constructor() {
    this.synth = window.speechSynthesis;
    this.tamilVoice = null;
    this.speechRate = 1.0;
    this.currentAudio = null;
    this.isListening = false;
    this.recognition = null;
    this.activeSpeakerBtn = null;

    this.initVoices();
    this.initRecognition();
  }

  initVoices() {
    if (!this.synth) return;

    const findVoice = () => {
      const voices = this.synth.getVoices();
      this.tamilVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('ta')) ||
                        voices.find(v => v.name && v.name.toLowerCase().includes('tamil')) ||
                        null;
    };

    findVoice();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = findVoice;
    }
  }

  /**
   * Speak text in authentic Tamil
   * @param {string} text - Tamil text to pronounce
   * @param {HTMLElement|null} triggerButton - Optional button element for visual indicator
   * @param {Function|null} onEndCallback - Optional completion callback
   */
  speak(text, triggerButton = null, onEndCallback = null) {
    // 1. Stop any currently active speech
    this.stop();

    if (!text || text.trim() === '') return;

    // Clean text of markdown, asterisks, brackets
    const cleanText = text
      .replace(/[*_#`~[\]()]/g, ' ')
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return;

    // Visual indicator on button
    if (triggerButton) {
      this.setSpeakerIndicator(triggerButton, true);
    }

    const handleEnd = () => {
      if (triggerButton) {
        this.setSpeakerIndicator(triggerButton, false);
      }
      this.currentAudio = null;
      if (onEndCallback) onEndCallback();
    };

    // Primary: High-fidelity native Tamil speech audio endpoint
    try {
      const audioUrl = `/api/speech/synthesize?text=${encodeURIComponent(cleanText)}`;
      const audio = new Audio(audioUrl);
      audio.playbackRate = this.speechRate;

      audio.onended = handleEnd;
      audio.onerror = (e) => {
        console.warn('Audio endpoint playback error, falling back to Web Speech API:', e);
        this.speakWebSpeech(cleanText, triggerButton, handleEnd);
      };

      this.currentAudio = audio;
      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Audio play prevented or failed, falling back to Web Speech API:', err.message);
          this.speakWebSpeech(cleanText, triggerButton, handleEnd);
        });
      }
    } catch (err) {
      console.warn('Audio setup error, using Web Speech fallback:', err);
      this.speakWebSpeech(cleanText, triggerButton, handleEnd);
    }
  }

  /**
   * Fallback Web Speech API speech synthesis
   */
  speakWebSpeech(cleanText, triggerButton, onEnd) {
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }

    // Chromium bug fix: resume if paused
    if (this.synth.paused) {
      this.synth.resume();
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (this.tamilVoice) {
      utterance.voice = this.tamilVoice;
      utterance.lang = this.tamilVoice.lang;
    } else {
      utterance.lang = 'ta-IN';
    }

    utterance.rate = this.speechRate;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = (err) => {
      console.warn('SpeechSynthesis error:', err);
      if (onEnd) onEnd();
    };

    this.synth.speak(utterance);
  }

  /**
   * Stop any current speech playback
   */
  stop() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch (e) {}
      this.currentAudio = null;
    }

    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {}
    }

    if (this.activeSpeakerBtn) {
      this.setSpeakerIndicator(this.activeSpeakerBtn, false);
      this.activeSpeakerBtn = null;
    }
  }

  setSpeakerIndicator(btn, isPlaying) {
    if (!btn) return;
    if (isPlaying) {
      this.activeSpeakerBtn = btn;
      btn.dataset.originalHtml = btn.innerHTML;
      btn.classList.add('speaker-playing');
      btn.innerHTML = '🔊 <span class="speaking-wave">~</span>';
    } else {
      if (btn.dataset.originalHtml) {
        btn.innerHTML = btn.dataset.originalHtml;
      }
      btn.classList.remove('speaker-playing');
      if (this.activeSpeakerBtn === btn) {
        this.activeSpeakerBtn = null;
      }
    }
  }

  /**
   * Voice Input (Speech-to-Text in Tamil)
   */
  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'ta-IN';
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
  }

  startListening(onResult, onStatusChange) {
    if (!this.recognition) {
      alert('உங்கள் உலாவியில் குரல் அறிதல் (Speech Recognition) அம்சம் ஆதரிக்கப்படவில்லை. Chrome உலாவியைப் பயன்படுத்தவும்.');
      return;
    }

    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      if (onStatusChange) onStatusChange(false);
      return;
    }

    this.recognition.onstart = () => {
      this.isListening = true;
      if (onStatusChange) onStatusChange(true);
    };

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (onResult) onResult(transcript);
    };

    this.recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      this.isListening = false;
      if (onStatusChange) onStatusChange(false);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (onStatusChange) onStatusChange(false);
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.warn('Speech recognition start failed:', e);
    }
  }
}

window.tamilSpeech = new TamilSpeechService();
