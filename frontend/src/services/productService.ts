import axios from 'axios';

const API_BASE_URL = 'http://VITE_API_BASE_URL/api/products';

const getConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
});

export const getProducts = async () => {
    const response = await axios.get(API_BASE_URL, getConfig());
    return response.data;
};

export const createProduct = async (formData: FormData) => {
    const config = {
        headers: { 'Content-Type': 'multipart/form-data', ...getConfig().headers },
    };
    const response = await axios.post(API_BASE_URL, formData, config);
    return response.data;
};

// --- NEW: Function to delete a product ---
export const deleteProduct = async (productId: string) => {
    const response = await axios.delete(`${API_BASE_URL}/${productId}`, getConfig());
    return response.data;
};

// --- NEW: Function to update a product ---
export const updateProduct = async ({ productId, productData }: { productId: string, productData: any }) => {
    const response = await axios.put(`${API_BASE_URL}/${productId}`, productData, getConfig());
    return response.data;
};