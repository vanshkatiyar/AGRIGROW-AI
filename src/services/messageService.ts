import api from '@/api/axios';

export const getConversations = async () => {
    const { data } = await api.get('/messages/conversations');
    return data;
};

export const getMessages = async (conversationId: string) => {
    const { data } = await api.get(`/messages/${conversationId}`);
    return data;
};