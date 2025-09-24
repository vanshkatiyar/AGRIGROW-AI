import api from '../api/axios';

export const getProducts = async () => {
    const response = await api.get('/products');
    return response.data;
};

export const createProduct = async (formData: FormData) => {
    const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
    };
    const response = await api.post('/products', formData, config);
    return response.data;
};

// Function to delete a product
export const deleteProduct = async (productId: string) => {
    const response = await api.delete(`/products/${productId}`);
    return response.data;
};

// Function to update a product
export const updateProduct = async ({ productId, productData }: { productId: string, productData: any }) => {
    const response = await api.put(`/products/${productId}`, productData);
    return response.data;
};