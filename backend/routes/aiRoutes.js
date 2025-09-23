const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const aiController = require('../controllers/aiController');

router.post('/ask', protect, aiController.ask);
router.post('/text-to-speech', protect, aiController.textToSpeech);

module.exports = router;