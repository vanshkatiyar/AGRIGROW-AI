import axios from 'axios';

// The base URL should match where your backend is running
const API_BASE_URL = 'http://localhost:5000/api';

interface AIResponse {
  answer: string;
}

export const askAIAssistant = async (query: string): Promise<AIResponse> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
        throw new Error("User not authenticated.");
    }
    
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.post(
      `${API_BASE_URL}/ai/ask`,
      { query },
      config
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || "An error occurred while contacting the AI.");
    }
    throw new Error("An unknown error occurred.");
  }
};