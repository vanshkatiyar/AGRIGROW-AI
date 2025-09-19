import api from '@/api/axios';

interface AIResponse {
  answer: string;
}

export const askAIAssistant = async (query: string): Promise<AIResponse> => {
  try {
    const response = await api.post('/ai/ask', { prompt: query });
    return response.data;
  } catch (error: any) {
    console.error("Error in askAIAssistant:", error);
    throw new Error(`An unexpected error occurred: ${error.response?.data?.message || error.message}`);
  }
};

export const textToSpeech = async (text: string): Promise<HTMLAudioElement> => {
  try {
    const response = await api.post('/ai/text-to-speech', { text }, {
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'audio/mpeg' }));
    return new Audio(url);
  } catch (error: any) {
    console.error("Error in textToSpeech:", error);
    throw new Error(`An unexpected error occurred: ${error.response?.data?.message || error.message}`);
  }
};