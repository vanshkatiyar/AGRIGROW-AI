const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { askPerplexity, askGemini, textToSpeech } = require('../controllers/aiController');

router.post('/ask', protect, askPerplexity);
router.post('/ask-gemini', protect, askGemini);
router.post('/text-to-speech', protect, textToSpeech);

module.exports = router;