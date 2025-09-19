import api from '../api/axios';

const createServiceProvider = async (data: any) => {
  const formData = new FormData();

  Object.keys(data).forEach(key => {
    if (key === 'images' || key === 'equipmentImages' || key === 'productImages') {
      if (data[key] && data[key].length > 0) {
        data[key].forEach((file: File) => {
          formData.append(key, file);
        });
      }
    } else if (typeof data[key] === 'object' && data[key] !== null) {
      formData.append(key, JSON.stringify(data[key]));
    } else {
      formData.append(key, data[key]);
    }
  });

  const response = await api.post('/services', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const getServices = async () => {
  const response = await api.get('/services');
  return response.data;
};

export const services = {
  createServiceProvider,
  getServices,
};