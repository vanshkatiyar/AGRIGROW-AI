import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/user';

const getConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
});

export const getUserProfile = async (userId: string) => {
    const response = await axios.get(`${API_BASE_URL}/${userId}`, getConfig());
    return response.data;
};

// --- NEW: Function to update the user profile ---
export const updateUserProfile = async (formData: FormData) => {
    const config = {
        headers: {
            'Content-Type': 'multipart/form-data',
            ...getConfig().headers,
        },
    };
    const response = await axios.put(`${API_BASE_URL}/profile`, formData, config);
    return response.data;
};