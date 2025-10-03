const axios = require('axios');
const ttsService = require('./ttsService');

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`;

const ask = async (req, res) => {
    // Validate request method
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed. Use POST.' });
    }

    const { prompt, language } = req.body;

    if (!prompt) {
        return res.status(400).json({
            message: 'A prompt is required.',
            example: { prompt: "Your question here", language: "en" }
        });
    }

    const languageInstruction = language ? `Please respond in ${language}.` : '';
    const fullPrompt = `${languageInstruction}\n\n${prompt}`.trim();

    // Validate API key
    if (!process.env.GEMINI_API_KEY) {
        console.error('GEMINI_API_KEY is not configured');
        return res.status(500).json({ 
            message: 'Server configuration error.' 
        });
    }

    try {
        const payload = {
            contents: [{ 
                parts: [{ text: fullPrompt }]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            }
        };

        const response = await axios.post(
            `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
            payload,
            {
                headers: { 
                    'Content-Type': 'application/json',
                    'User-Agent': 'Your-App-Name/1.0.0'
                },
                timeout: 30000 // 30 second timeout
            }
        );

        // More robust response handling
        if (!response.data) {
            throw new Error('No data received from API');
        }

        const candidate = response.data.candidates?.[0];
        if (!candidate) {
            throw new Error('No candidates in response');
        }

        const answer = candidate.content?.parts?.[0]?.text || 
                      "I'm sorry, I couldn't generate a response for that prompt.";

        res.json({ 
            answer,
            usage: response.data.usageMetadata // Include usage stats if available
        });

    } catch (error) {
        console.error('Gemini API Error:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url
        });

        // More specific error messages
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({ 
                message: 'Service temporarily unavailable.' 
            });
        }

        if (error.response) {
            // Handle different HTTP status codes from Gemini API
            const status = error.response.status;
            const errorData = error.response.data;
            
            if (status === 401) {
                return res.status(500).json({ 
                    message: 'Invalid API key configuration.' 
                });
            } else if (status === 429) {
                return res.status(429).json({ 
                    message: 'Rate limit exceeded. Please try again later.' 
                });
            } else if (status === 400) {
                return res.status(400).json({ 
                    message: 'Invalid request: ' + (errorData.error?.message || 'Bad request')
                });
            } else if (status >= 500) {
                return res.status(502).json({ 
                    message: 'AI service is currently unavailable.' 
                });
            }
        }

        res.status(500).json({ 
            message: 'Failed to get a response from the AI assistant.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Optional: Add a health check endpoint
const healthCheck = async (req, res) => {
    res.json({ 
        status: 'OK', 
        service: 'Gemini AI API',
        timestamp: new Date().toISOString()
    });
};

// Enhanced text-to-speech endpoint
const textToSpeech = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed. Use POST.' });
    }

    const { text, language = 'en' } = req.body;

    if (!text) {
        return res.status(400).json({
            message: 'Text is required.',
            example: { text: "Your text here", language: "hi" }
        });
    }

    // Validate language
    const supportedLanguages = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'gu', 'pa', 'or', 'as', 'ur'];
    if (!supportedLanguages.includes(language)) {
        return res.status(400).json({
            message: 'Unsupported language.',
            supportedLanguages: supportedLanguages
        });
    }

    // Limit text length
    if (text.length > 1000) {
        return res.status(400).json({
            message: 'Text too long. Maximum 1000 characters allowed.'
        });
    }

    try {
        // Stream audio directly to response
        await ttsService.streamAudio(text, language, res);
        
    } catch (error) {
        console.error('TTS Service Error:', error);
        
        // Specific error handling
        if (error.message.includes('Failed to generate speech')) {
            return res.status(400).json({
                message: 'Unable to generate speech for this text.'
            });
        }
        
        if (error.message.includes('network') || error.message.includes('ECONNREFUSED')) {
            return res.status(503).json({
                message: 'TTS service temporarily unavailable.'
            });
        }

        res.status(500).json({
            message: 'Failed to synthesize speech.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    ask,
    healthCheck,
    textToSpeech,
};