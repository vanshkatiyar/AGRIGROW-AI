import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/crop-doctor';

export const diagnoseCrop = async (imageFile: File): Promise<{ answer: string }> => {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error("User not authenticated.");

        // FormData is the standard way to send files to a server
        const formData = new FormData();
        formData.append('image', imageFile);
        
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`,
            },
        };

        const response = await axios.post(`${API_BASE_URL}/diagnose`, formData, config);
        return response.data;

    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || "An error occurred while diagnosing.");
        }
        throw new Error("An unknown error occurred.");
    }
};