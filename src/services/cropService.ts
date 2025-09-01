import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/crops';

const getConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
});

export interface Crop {
    _id: string;
    name: string;
    areaInAcres: number;
    plantingDate: string;
    expectedYield: string;
    estimatedRevenue: number;
    status: 'active' | 'harvested';
    harvestDate?: string;
}

export const getCrops = async (): Promise<Crop[]> => {
    const response = await axios.get(API_BASE_URL, getConfig());
    return response.data;
};

export const addCrop = async (data: any): Promise<Crop> => {
    const response = await axios.post(API_BASE_URL, data, getConfig());
    return response.data;
};

export const harvestCrop = async (cropId: string): Promise<Crop> => {
    const response = await axios.put(`${API_BASE_URL}/${cropId}/harvest`, {}, getConfig());
    return response.data;
};