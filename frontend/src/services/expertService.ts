import axios from 'axios';

const API_URL = 'http://localhost:5000/api/experts';

const getToken = () => localStorage.getItem('token');
const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * @desc    Fetches the dashboard statistics for the logged-in expert
 * @route   GET /api/experts/stats
 */
export const getExpertStats = async () => {
  const response = await axios.get(`${API_URL}/stats`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};