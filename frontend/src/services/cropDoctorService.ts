// frontend/src/services/cropDoctorService.ts

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
  } | null;
}