import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/posts';

const getConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
});

export const getPosts = async () => {
    const response = await axios.get(API_BASE_URL, getConfig());
    return response.data;
};

export const createPost = async (formData: FormData) => {
    const config = {
        headers: {
            'Content-Type': 'multipart/form-data',
            ...getConfig().headers,
        },
    };
    const response = await axios.post(API_BASE_URL, formData, config);
    return response.data;
};

// --- NEW: Function to delete a post ---
export const deletePost = async (postId: string) => {
    const response = await axios.delete(`${API_BASE_URL}/${postId}`, getConfig());
    return response.data;
};

// --- NEW: Function to update a post ---
export const updatePost = async ({ postId, content }: { postId: string, content: string }) => {
    const response = await axios.put(`${API_BASE_URL}/${postId}`, { content }, getConfig());
    return response.data;
};