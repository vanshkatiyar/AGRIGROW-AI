// backend/routes/cropDoctorRoutes.js

const express = require('express');
const router = express.Router();
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data'); // <-- Add this line
const { protect } = require('../middleware/authMiddleware');

// Use memory storage to handle the file as a buffer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// The URL of your Python Flask microservice
const PYTHON_AI_SERVICE_URL = 'http://localhost:5001/predict';

/**
 * @route   POST /api/crop-doctor/diagnose
 * @desc    Receives an image, forwards it to the Python AI service, and returns the diagnosis.
 * @access  Private
 */
router.post('/diagnose', protect, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'An image file is required for diagnosis.' });
  }

  try {
    // Create a new FormData instance to send to the Python service
    const form = new FormData();
    // Append the image buffer from multer
    form.append('image', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    // --- THIS IS THE CHANGE ---
    // Make a POST request to the Python service with the image data
    const { data } = await axios.post(PYTHON_AI_SERVICE_URL, form, {
      headers: {
        ...form.getHeaders(),
      },
    });
    
    // The 'data' received from Python is already in the correct JSON format.
    // We just forward it directly to the frontend.
    res.json(data);

  } catch (error) {
    console.error('AI service communication error:', error.message);
    // Provide a more informative error to the frontend
    res.status(502).json({ message: 'The Crop Doctor AI service is currently unavailable. Please try again later.' });
  }
});

module.exports = router;