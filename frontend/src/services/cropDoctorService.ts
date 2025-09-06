// frontend/src/services/cropDoctorService.ts

import api from '@/api/axios'; // Assuming a shared axios instance

export interface DiagnosisResult {
  crop: string;
  disease: string;
  status: 'healthy' | 'diseased';
  confidence: number;
  remedy: {
    cause?: string;
    chemical?: string;
    biological?: string;
    cultural?: string;
  };
}

/**
 * Sends the crop image to the backend for diagnosis.
 * @param imageFile The image file to be diagnosed.
 * @returns A promise that resolves to the diagnosis result.
 */
export const diagnoseCrop = async (imageFile: File): Promise<DiagnosisResult> => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const { data } = await api.post('/crop-doctor/diagnose', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};