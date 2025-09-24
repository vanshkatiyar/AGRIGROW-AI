import axios from 'axios';

const API_URL = '/api/gemini';

export const analyzePlantImage = async (imageFile: File, prompt?: string, model?: string) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    if (prompt) formData.append('prompt', prompt);
    if (model) formData.append('model', model);

    const response = await axios.post(`${API_URL}/analyze-plant`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'An error occurred during analysis.');
    }
    throw new Error('Network error or server is not responding.');
  }
};