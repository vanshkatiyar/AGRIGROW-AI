const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protect } = require('../middleware/authMiddleware');

// --- Existing Perplexity AI Route ---
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

router.post('/ask', protect, async (req, res) => {
    const { query } = req.body;
    if (!query) {
        return res.status(400).json({ message: 'Query is required' });
    }
    try {
        const payload = {
            model: "sonar",
            messages: [
                { role: "system", content: "You are an expert agricultural assistant for Indian farmers. Provide clear, concise, and actionable advice. If you mention prices, use Indian Rupees (₹)." },
                { role: "user", content: query }
            ],
        };
        const headers = {
            'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
        const { data } = await axios.post(PERPLEXITY_API_URL, payload, { headers });
        res.json({ answer: data.choices[0].message.content });
    } catch (error) {
        console.error('Perplexity API Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Failed to get a response from the AI assistant.' });
    }
});


// --- NEW GOOGLE GEMINI AI ROUTE ---
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;

router.post('/ask-gemini', protect, async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).json({ message: 'A prompt is required.' });
    }

    try {
        const payload = {
            contents: [{ parts: [{ text: prompt }] }]
        };

        const { data } = await axios.post(
            `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`, 
            payload, 
            {
                headers: { 'Content-Type': 'application/json' }
            }
        );

        // Safely access the response text
        const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response text found.";
        res.json({ answer });

    } catch (error) {
        console.error('Gemini API Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Failed to get a response from the Gemini assistant.' });
    }
});


module.exports = router;