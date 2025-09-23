const googleTTS = require('google-tts-api');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class TTSService {
    constructor() {
        this.supportedLanguages = {
            'en': 'en',
            'hi': 'hi',
            'ta': 'ta',
            'te': 'te',
            'kn': 'kn',
            'ml': 'ml',
            'bn': 'bn',
            'mr': 'mr',
            'gu': 'gu',
            'pa': 'pa',
            'or': 'or',
            'as': 'as',
            'ur': 'ur'
        };
        
        // Create temp directory if it doesn't exist
        this.tempDir = path.join(__dirname, 'temp');
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
    }

    // Get audio URL from Google TTS (free)
    async getAudioUrl(text, language = 'en') {
        try {
            const lang = this.supportedLanguages[language] || 'en';
            
            // Split long text into chunks (Google TTS has character limits)
            const chunks = this.splitText(text, 200); // 200 characters per chunk
            
            if (chunks.length > 1) {
                // For long text, generate multiple URLs
                const urls = [];
                for (const chunk of chunks) {
                    const url = await googleTTS.getAudioUrl(chunk, {
                        lang: lang,
                        slow: false,
                        host: 'https://translate.google.com',
                    });
                    urls.push(url);
                }
                return urls;
            } else {
                // Single chunk
                const url = await googleTTS.getAudioUrl(text, {
                    lang: lang,
                    slow: false,
                    host: 'https://translate.google.com',
                });
                return url;
            }
        } catch (error) {
            console.error('TTS Error:', error);
            throw new Error('Failed to generate speech');
        }
    }

    // Split text into chunks for TTS
    splitText(text, maxLength) {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const chunks = [];
        let currentChunk = '';

        for (const sentence of sentences) {
            if ((currentChunk + sentence).length <= maxLength) {
                currentChunk += sentence + '. ';
            } else {
                if (currentChunk) chunks.push(currentChunk.trim());
                currentChunk = sentence + '. ';
            }
        }
        
        if (currentChunk) chunks.push(currentChunk.trim());
        return chunks.length > 0 ? chunks : [text.substring(0, maxLength)];
    }

    // Download audio from URL
    async downloadAudio(url, filename) {
        try {
            const response = await axios({
                method: 'GET',
                url: url,
                responseType: 'stream'
            });

            const filePath = path.join(this.tempDir, filename);
            const writer = fs.createWriteStream(filePath);

            response.data.pipe(writer);

            return new Promise((resolve, reject) => {
                writer.on('finish', () => resolve(filePath));
                writer.on('error', reject);
            });
        } catch (error) {
            throw new Error(`Failed to download audio: ${error.message}`);
        }
    }

    // Main TTS function
    async synthesizeSpeech(text, language = 'en') {
        try {
            const audioUrls = await this.getAudioUrl(text, language);
            const audioFiles = [];

            if (Array.isArray(audioUrls)) {
                // Multiple chunks - download each
                for (let i = 0; i < audioUrls.length; i++) {
                    const filePath = await this.downloadAudio(audioUrls[i], `chunk_${i}_${Date.now()}.mp3`);
                    audioFiles.push(filePath);
                }

                // If multiple files, we should concatenate them (simplified version)
                if (audioFiles.length > 1) {
                    // For simplicity, we'll just use the first chunk for now
                    // In production, you'd want to concatenate audio files
                    const finalFile = audioFiles[0];
                    
                    // Cleanup other files
                    for (let i = 1; i < audioFiles.length; i++) {
                        this.cleanup(audioFiles[i]);
                    }
                    
                    return finalFile;
                } else {
                    return audioFiles[0];
                }
            } else {
                // Single URL
                const filePath = await this.downloadAudio(audioUrls, `tts_${Date.now()}.mp3`);
                return filePath;
            }
        } catch (error) {
            console.error('Speech synthesis error:', error);
            throw error;
        }
    }

    // Stream audio directly without saving to file
    async streamAudio(text, language = 'en', res) {
        try {
            const audioUrl = await this.getAudioUrl(text, language);
            
            if (Array.isArray(audioUrl)) {
                // For simplicity, use first chunk for streaming
                const response = await axios({
                    method: 'GET',
                    url: audioUrl[0],
                    responseType: 'stream'
                });

                res.setHeader('Content-Type', 'audio/mpeg');
                response.data.pipe(res);
            } else {
                const response = await axios({
                    method: 'GET',
                    url: audioUrl,
                    responseType: 'stream'
                });

                res.setHeader('Content-Type', 'audio/mpeg');
                response.data.pipe(res);
            }
        } catch (error) {
            throw error;
        }
    }

    // Clean up temporary files
    cleanup(filePath) {
        if (filePath && fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
            } catch (error) {
                console.warn('Could not delete temp file:', filePath);
            }
        }
    }
}

module.exports = new TTSService();