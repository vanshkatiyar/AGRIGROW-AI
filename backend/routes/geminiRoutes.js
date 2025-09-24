const express = require('express');
const { analyzePlantImage } = require('../controllers/geminiController');
const memoryUpload = require('../middleware/memoryUploadMiddleware');
const router = express.Router();

router.post('/analyze-plant', memoryUpload.single('image'), analyzePlantImage);

module.exports = router;