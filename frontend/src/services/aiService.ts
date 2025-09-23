import api from '@/api/axios';

interface AIResponse {
  answer: string;
}

export const askAIAssistant = async (query: string, language: string): Promise<AIResponse> => {
  try {
    const response = await api.post('/ai/ask', { prompt: query, language });
    return response.data;
  } catch (error: any) {
    console.error("Error in askAIAssistant:", error);
    throw new Error(`An unexpected error occurred: ${error.response?.data?.message || error.message}`);
  }
};

export const textToSpeech = async (text: string, language: string = 'en'): Promise<HTMLAudioElement> => {
  try {
    const response = await api.post('/ai/text-to-speech',
      {
        text: text.substring(0, 1000), // Limit text length
        language
      },
      {
        responseType: 'blob',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000 // 30 second timeout
      }
    );

    if (response.status !== 200) {
      throw new Error(`Request failed with status code ${response.status}`);
    }

    // Create audio URL from blob
    const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    return audio;
  } catch (error: any) {
    console.error('Error in textToSpeech:', error);
    
    // Provide specific error messages
    if (error.response?.status === 400) {
      throw new Error('Text too long or language not supported');
    } else if (error.response?.status === 503) {
      throw new Error('Speech service temporarily unavailable');
    } else {
      throw new Error(error.response?.data?.message || 'Failed to convert text to speech');
    }
  }
};