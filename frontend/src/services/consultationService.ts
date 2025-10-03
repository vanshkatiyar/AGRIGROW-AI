import axios from 'axios';
import { Consultation } from '@/types';

const API_URL = import.meta.env.VITE_API_BASE_URL + '/api/consultations';

const getToken = () => localStorage.getItem('token');

const getAuthHeaders = () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const requestConsultation = async (data: FormData) => {
    const response = await axios.post(API_URL, data, {
        headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

const getConsultations = async (status?: string): Promise<Consultation[]> => {
    const response = await axios.get(API_URL, {
        headers: getAuthHeaders(),
        params: { status }
    });
    return response.data;
};

const getConsultationTypesByExpert = async (expertId: string) => {
    const response = await axios.get(`${API_URL}/types`, {
        headers: getAuthHeaders(),
        params: { expertId }
    });
    return response.data;
};

const acceptConsultation = async (consultationId: string, scheduled_datetime: string) => {
    const response = await axios.patch(`${API_URL}/${consultationId}/accept`, { scheduled_datetime }, { headers: getAuthHeaders() });
    return response.data;
};

const declineConsultation = async (consultationId: string, reason: string) => {
    const response = await axios.patch(`${API_URL}/${consultationId}/decline`, { reason }, { headers: getAuthHeaders() });
    return response.data;
};

const proposeNewTime = async (consultationId: string, new_datetime: string, message: string) => {
    const response = await axios.patch(`${API_URL}/${consultationId}/reschedule`, { new_datetime, message }, { headers: getAuthHeaders() });
    return response.data;
};

const completeConsultation = async (consultationId: string, notes: string) => {
    const response = await axios.patch(`${API_URL}/${consultationId}/complete`, { notes }, { headers: getAuthHeaders() });
    return response.data;
};

const cancelConsultation = async (consultationId: string) => {
    const response = await axios.patch(`${API_URL}/${consultationId}/cancel`, {}, { headers: getAuthHeaders() });
    return response.data;
};

const getConsultationTypes = async () => {
    const response = await axios.get(`${API_URL}/types`, { headers: getAuthHeaders() });
    return response.data;
};

const createConsultationType = async (data) => {
    const response = await axios.post(`${API_URL}/types`, data, { headers: getAuthHeaders() });
    return response.data;
};

const updateConsultationType = async (id, data) => {
    const response = await axios.put(`${API_URL}/types/${id}`, data, { headers: getAuthHeaders() });
    return response.data;
};

const deleteConsultationType = async (id) => {
    const response = await axios.delete(`${API_URL}/types/${id}`, { headers: getAuthHeaders() });
    return response.data;
};

const getAvailability = async () => {
    const response = await axios.get(`${API_URL}/availability`, { headers: getAuthHeaders() });
    return response.data;
};

const createAvailability = async (data) => {
    const response = await axios.post(`${API_URL}/availability`, data, { headers: getAuthHeaders() });
    return response.data;
};

const deleteAvailability = async (id) => {
    const response = await axios.delete(`${API_URL}/availability/${id}`, { headers: getAuthHeaders() });
    return response.data;
};

export const getConsultationRequests = async (): Promise<Consultation[]> => {
    const response = await axios.get(`${API_URL}/requests`, { headers: getAuthHeaders() });
    return response.data;
};

export const updateConsultationStatus = async ({ consultationId, status, scheduled_datetime }: { consultationId: string, status: string, scheduled_datetime?: string }): Promise<Consultation> => {
    const response = await axios.put(`${API_URL}/${consultationId}/status`, { status, scheduled_datetime }, { headers: getAuthHeaders() });
    return response.data;
};

export const consultationService = {
    requestConsultation,
    getConsultations,
    getConsultationTypesByExpert,
    acceptConsultation,
    declineConsultation,
    proposeNewTime,
    completeConsultation,
    cancelConsultation,
    getConsultationTypes,
    createConsultationType,
    updateConsultationType,
    deleteConsultationType,
    getAvailability,
    createAvailability,
    deleteAvailability
};