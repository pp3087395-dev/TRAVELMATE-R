const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { askTMChatbot } = require('../controllers/tmChatbotController');

// Rate limiting: 20 requests per minute per IP to protect public Gemini quota
const chatbotLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many queries from this IP, please wait a minute before trying again.'
  }
});

const MAX_QUERY_LENGTH = 1000;

// POST /api/chatbot/query - Main AI Chatbot query endpoint
router.post('/query', chatbotLimiter, async (req, res, next) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        success: false,
        error: 'Gemini AI service unavailable: GEMINI_API_KEY is not configured in backend environment.'
      });
    }

    const { query, traveler_context } = req.body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter is required.'
      });
    }

    if (query.trim().length > MAX_QUERY_LENGTH) {
      return res.status(400).json({
        success: false,
        error: `Query exceeds maximum allowed length of ${MAX_QUERY_LENGTH} characters.`
      });
    }

    const result = await askTMChatbot({ query: query.trim(), traveler_context });

    return res.json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error('[Chatbot Route Error]:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate chatbot response.',
      details: err.message
    });
  }
});

// Support POST /api/chatbot as an alias to /query
router.post('/', chatbotLimiter, (req, res, next) => {
  req.url = '/query';
  router.handle(req, res, next);
});

module.exports = router;
