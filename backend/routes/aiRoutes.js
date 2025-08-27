const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protect } = require('../middleware/authMiddleware');

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

module.exports = router;