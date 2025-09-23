const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const aiController = require('../controllers/aiController');

router.post('/ask', protect, aiController.ask);

module.exports = router;