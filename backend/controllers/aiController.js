const axios = require('axios');

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`;

const askPerplexity = async (req, res) => {
    const { query } = req.body;
    if (!query) {
        return res.status(400).json({ message: 'Query is required' });
    }
    try {
        const payload = {
            model: "sonar-medium-8x7b-chat",
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
};

const askGemini = async (req, res) => {
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

        const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response text found.";
        res.json({ answer });

    } catch (error) {
        console.error('Gemini API Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Failed to get a response from the Gemini assistant.' });
    }
};

const textToSpeech = async (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ message: 'Text is required.' });
    }

    try {
        const payload = {
            model: 'elevenlabs/elevenmultilingual-v2',
            input: text,
        };

        const headers = {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
        };

        const { data } = await axios.post('https://openrouter.ai/api/v1/audio/speech', payload, {
            headers,
            responseType: 'arraybuffer'
        });

        res.set('Content-Type', 'audio/mpeg');
        res.send(data);
    } catch (error) {
        console.error('OpenRouter TTS Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Failed to process text-to-speech.' });
    }
};
module.exports = {
    askPerplexity,
    askGemini,
    textToSpeech,
};