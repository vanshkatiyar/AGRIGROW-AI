import axios from 'axios';
import { Consultation } from '@/types'; 

const API_URL = 'http://localhost:5000/api/consultations';

// Helper function to get the token from localStorage
const getToken = () => localStorage.getItem('token');

// Helper function to create authorization headers
const getAuthHeaders = () => {
    const token = getToken();
    // Return an object with the Authorization header if the token exists, otherwise an empty object
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// --- INTERFACE FOR BOOKING DATA ---
interface BookConsultationData {
    expertId: string;
    issue: string;
    cropType: string;
    urgency?: 'low' | 'medium' | 'high' | 'critical';
    consultationFee?: number;
}

/**
 * @desc    Book a consultation with an expert
 * @route   POST /api/consultations
 */
export const bookConsultation = async (data: BookConsultationData): Promise<any> => {
    const response = await axios.post(API_URL, data, { headers: getAuthHeaders() });
    return response.data;
};

/**
 * @desc    Get pending consultation requests for the logged-in expert
 * @route   GET /api/consultations/requests
 */
export const getConsultationRequests = async (): Promise<Consultation[]> => {
    const response = await axios.get(`${API_URL}/requests`, { headers: getAuthHeaders() });
    return response.data;
};

/**
 * @desc    Update the status of a consultation
 * @route   PUT /api/consultations/:id/status
 */
export const updateConsultationStatus = async ({ consultationId, status }: { consultationId: string, status: string }): Promise<Consultation> => {
    const response = await axios.put(`${API_URL}/${consultationId}/status`, { status }, { headers: getAuthHeaders() });
    return response.data;
};

// --- THIS IS THE MISSING EXPORTED FUNCTION ---
/**
 * @desc    Get consultation history for the logged-in user
 * @route   GET /api/consultations/history
 */
export const getConsultationHistory = async (): Promise<Consultation[]> => {
    const response = await axios.get(`${API_URL}/history`, { headers: getAuthHeaders() });
    return response.data;
};