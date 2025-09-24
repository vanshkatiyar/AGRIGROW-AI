import { Request, Response } from 'express';
import axios from 'axios';

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`;

export const analyzePlantImage = async (req: Request, res: Response) => {
    const { imageData, prompt } = req.body;

    if (!imageData) {
        return res.status(400).json({ message: 'Image data is required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
            message: 'Gemini API key not configured.'
        });
    }

    try {
        // Remove data URL prefix if present
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');

        const payload = {
            contents: [{
                parts: [
                    {
                        text: prompt || `You are an expert plant pathologist. Analyze this plant image and provide a diagnosis in JSON format with these exact keys: "disease", "cause", "prevention", "treatment". If healthy, set "disease" to "Healthy".`
                    },
                    {
                        inline_data: {
                            mime_type: "image/jpeg",
                            data: base64Data
                        }
                    }
                ]
            }],
            generationConfig: {
                temperature: 0.1,
                topK: 32,
                topP: 0.8,
                maxOutputTokens: 1024,
            }
        };

        const response = await axios.post(
            `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
            payload,
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000
            }
        );

        // Extract text from response
        const responseText = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!responseText) {
            throw new Error('No response text from Gemini API');
        }

        // Clean and parse JSON response
        const cleanedText = responseText.replace(/```json|```/g, '').trim();
        let jsonResponse;

        try {
            jsonResponse = JSON.parse(cleanedText);
        } catch (parseError) {
            // Try to extract JSON if it's wrapped in text
            const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                jsonResponse = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('Could not parse JSON from response');
            }
        }

        res.json({
            success: true,
            result: jsonResponse,
            rawResponse: responseText
        });

    } catch (error: any) {
        console.error('Gemini API Error:', error.response?.data || error.message);

        let errorMessage = 'Failed to analyze image';
        if (error.response?.status === 401) {
            errorMessage = 'Invalid API key';
        } else if (error.response?.status === 429) {
            errorMessage = 'Rate limit exceeded. Please try again later.';
        }

        res.status(500).json({
            success: false,
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};