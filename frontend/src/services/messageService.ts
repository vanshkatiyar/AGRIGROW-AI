import api from '@/api/axios';
import { Conversation, Message } from '@/types';

export const getConversations = async (): Promise<{ conversations: Conversation[], groups: any[] }> => {
    const { data } = await api.get('/messages/conversations');
    return data;
};

export const getMessages = async (id: string, type?: 'group'): Promise<Message[]> => {
    const { data } = await api.get(`/messages/${id}`, { params: { type } });
    return data;
};