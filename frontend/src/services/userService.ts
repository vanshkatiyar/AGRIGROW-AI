import axios from 'axios';
import { User } from '@/types'; // Assuming you have a User type defined in a types file

const API_URL = import.meta.env.VITE_API_BASE_URL + '/api/user';

// Helper to get the auth token from localStorage
const getToken = () => localStorage.getItem('token');

// Helper to construct the authorization headers for API requests
const getAuthHeaders = (isFormData = false) => {
  const token = getToken();
  if (!token) return {};

  return {
    'Authorization': `Bearer ${token}`,
    // Do not set Content-Type for FormData, the browser does it automatically with the boundary
    'Content-Type': isFormData ? undefined : 'application/json',
  };
};

/**
 * @desc    Fetch all users with the role of 'expert' for the "Find an Expert" page.
 * @route   GET /api/user?role=expert
 */
export const getExperts = async (): Promise<User[]> => {
    const response = await axios.get(`${API_URL}?role=expert`, {
        headers: getAuthHeaders(),
    });
    return response.data;
};

/**
 * @desc    Get a specific user's public profile by their ID.
 * @route   GET /api/user/:id
 */
export const getUserProfile = async (userId: string): Promise<User> => {
  const response = await axios.get(`${API_URL}/${userId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

/**
 * @desc    Update the logged-in user's profile information (name, bio, images).
 * @route   PUT /api/user/profile
 */
export const updateUserProfile = async (formData: FormData): Promise<User> => {
  const response = await axios.put(`${API_URL}/profile`, formData, {
    // Note: We pass true because we are sending FormData
    headers: getAuthHeaders(true),
  });
  return response.data;
};

/**
 * @desc    Update the logged-in user's role after registration.
 * @route   PUT /api/user/role
 */
export const updateUserRole = async (role: string): Promise<User> => {
  const response = await axios.put(`${API_URL}/role`, { role }, {
    headers: getAuthHeaders(),
  });
  return response.data;
};