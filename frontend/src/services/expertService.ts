import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL + '/api/experts';

const getToken = () => localStorage.getItem('token');
const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const getAllExperts = async () => {
  const response = await axios.get(API_URL, { headers: getAuthHeaders() });
  return response.data;
};

const getExpertById = async (id: string) => {
  const response = await axios.get(`${API_URL}/${id}`, { headers: getAuthHeaders() });
  return response.data;
};

/**
 * @desc    Fetches the dashboard statistics for the logged-in expert
 * @route   GET /api/experts/stats
 */
const getExpertStats = async () => {
  const response = await axios.get(`${API_URL}/stats`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const expertService = {
  getAllExperts,
  getExpertById,
};

export { getExpertStats };