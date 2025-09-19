const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const aiController = require('../controllers/aiController');

router.post('/ask', protect, aiController.askGemini);
router.post('/ask-gemini', protect, aiController.askGemini);
router.post('/text-to-speech', protect, aiController.textToSpeech);

module.exports = router;