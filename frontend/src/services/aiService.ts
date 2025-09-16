import api from '../api/axios';

interface AIResponse {
  answer: string;
}

export const askAIAssistant = async (query: string): Promise<AIResponse> => {
  try {
    const response = await api.post('/ai/ask', { query });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || "An error occurred while contacting the AI.");
    }
    throw new Error("An unknown error occurred.");
  }
};


export const textToSpeech = async (text: string): Promise<Blob> => {
  try {
    const response = await api.post('/ai/text-to-speech', { text }, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || "An error occurred during text-to-speech conversion.");
    }
    throw new Error("An unknown error occurred.");
  }
};