import api from '@/api/axios';
import { Crop } from '@/types'; // Assuming you have a Crop type defined

export const getCrops = async (): Promise<Crop[]> => {
  const { data } = await api.get('/crops');
  return data;
};

export const addCrop = async (cropData: Omit<Crop, '_id' | 'user' | 'status'>): Promise<Crop> => {
  const { data } = await api.post('/crops', cropData);
  return data;
};

export const harvestCrop = async (cropId: string): Promise<Crop> => {
  const { data } = await api.put(`/crops/${cropId}/harvest`);
  return data;
};