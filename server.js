require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB, getDBStatus } = require('./src/config/db');
const { seedDatabase } = require('./src/seeds/seedData');

// Route imports
const grammarRoutes = require('./src/routes/grammarRoutes');
const learningRoutes = require('./src/routes/learningRoutes');
const quizRoutes = require('./src/routes/quizRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const userRoutes = require('./src/routes/userRoutes');
const speechRoutes = require('./src/routes/speechRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB and seed if fresh database
connectDB().then((conn) => {
  if (conn) {
    seedDatabase().catch((e) => console.warn('[Auto-seed notice]:', e.message));
  }
});

// Global Middlewares
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/grammar', grammarRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/user', userRoutes);
app.use('/api/speech', speechRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const db = getDBStatus();
  res.json({
    status: 'online',
    appName: 'செந்தமிழ் AI - Tamil Learning and Grammar Intelligence Assistant',
    version: '1.0.0',
    database: db,
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY),
    timestamp: new Date().toISOString()
  });
});

// Single Page Application Fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]:', err.stack);
  res.status(500).json({
    error: 'உள் சேவையகப் பிழை (Internal Server Error)',
    message: err.message
  });
});

const server = app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`  செந்தமிழ் AI (Senthamil AI Assistant) Server`);
  console.log(`  Server running on http://localhost:${PORT}`);
  console.log(`  Frontend UI: http://localhost:${PORT}`);
  console.log('====================================================');
});

module.exports = app;
