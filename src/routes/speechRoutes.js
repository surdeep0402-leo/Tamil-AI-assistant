const express = require('express');
const router = express.Router();
const https = require('https');

// In-memory audio buffer cache to make playback lightning fast
const audioCache = new Map();

/**
 * Fetch TTS audio chunk from Google TTS (ta-IN)
 */
function fetchTTSAudio(text) {
  return new Promise((resolve, reject) => {
    const encodedText = encodeURIComponent(text);
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ta&client=tw-ob&q=${encodedText}`;

    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com/'
      }
    };

    https.get(url, options, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`TTS Service returned status ${res.statusCode}`));
      }

      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', (err) => reject(err));
    }).on('error', (err) => reject(err));
  });
}

/**
 * GET /api/speech/synthesize
 * Native Tamil Speech Synthesis Audio Stream
 */
router.get('/synthesize', async (req, res) => {
  try {
    const rawText = req.query.text;
    if (!rawText || typeof rawText !== 'string' || rawText.trim() === '') {
      return res.status(400).json({ error: 'Text query parameter is required.' });
    }

    // Clean text of markdown, emoji, and formatting characters
    const cleanText = rawText
      .replace(/[*_#`~[\]()]/g, ' ')
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) {
      return res.status(400).json({ error: 'Valid Tamil text is required.' });
    }

    // If cached, return immediately
    if (audioCache.has(cleanText)) {
      const cached = audioCache.get(cleanText);
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': cached.length,
        'Cache-Control': 'public, max-age=86400'
      });
      return res.send(cached);
    }

    // Google TTS accepts up to ~200 characters per request. If text is long, chunk it.
    if (cleanText.length <= 180) {
      const audioBuffer = await fetchTTSAudio(cleanText);

      // Cache small words & sentences (limit cache size to 500 items)
      if (audioCache.size < 500) {
        audioCache.set(cleanText, audioBuffer);
      }

      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length,
        'Cache-Control': 'public, max-age=86400'
      });
      return res.send(audioBuffer);
    }

    // For longer paragraphs, split by sentence punctuation or ~150 char chunks
    const sentences = cleanText.split(/([.?!,;\n]+)/).filter(Boolean);
    const chunks = [];
    let currentChunk = '';

    for (const part of sentences) {
      if ((currentChunk + part).length > 150) {
        if (currentChunk.trim()) chunks.push(currentChunk.trim());
        currentChunk = part;
      } else {
        currentChunk += part;
      }
    }
    if (currentChunk.trim()) chunks.push(currentChunk.trim());

    // Fetch and concatenate MP3 frames
    const audioBuffers = [];
    for (const chunk of chunks.slice(0, 6)) { // Limit to first 6 chunks to prevent excessive duration
      try {
        const buf = await fetchTTSAudio(chunk);
        audioBuffers.push(buf);
      } catch (chunkErr) {
        console.warn('Chunk TTS warning:', chunkErr.message);
      }
    }

    if (audioBuffers.length === 0) {
      return res.status(500).json({ error: 'Failed to synthesize speech audio.' });
    }

    const combinedBuffer = Buffer.concat(audioBuffers);

    if (audioCache.size < 500) {
      audioCache.set(cleanText, combinedBuffer);
    }

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': combinedBuffer.length,
      'Cache-Control': 'public, max-age=86400'
    });
    return res.send(combinedBuffer);

  } catch (error) {
    console.error('[Speech Synthesize Error]:', error.message);
    res.status(500).json({
      error: 'பேச்சு உருவாக்கத்தில் பிழை ஏற்பட்டது (Speech synthesis error).',
      details: error.message
    });
  }
});

module.exports = router;
