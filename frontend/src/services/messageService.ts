import api from '@/api/axios';
import { Conversation, Message, User } from '@/types';

export interface ConversationsResponse {
    conversations: Conversation[];
    pagination: {
        page: number;
        limit: number;
        hasMore: boolean;
    };
}

export interface MessagesResponse {
    messages: Message[];
    pagination: {
        page: number;
        limit: number;
        hasMore: boolean;
    };
}

export interface SearchResponse {
    messages: Message[];
    query: string;
    pagination: {
        page: number;
        limit: number;
        hasMore: boolean;
    };
}

export interface UsersResponse {
    users: User[];
    pagination: {
        page: number;
        limit: number;
        hasMore: boolean;
    };
}

// Get user's conversations
export const getConversations = async (page = 1, limit = 20): Promise<ConversationsResponse> => {
    const { data } = await api.get('/messages/conversations', {
        params: { page, limit }
    });
    return data;
};

// Get messages for a conversation
export const getConversationMessages = async (
    conversationId: string, 
    page = 1, 
    limit = 50
): Promise<MessagesResponse> => {
    const { data } = await api.get(`/messages/conversations/${conversationId}/messages`, {
        params: { page, limit }
    });
    return data;
};

// Create a new conversation
export const createConversation = async (recipientId: string): Promise<Conversation> => {
    const { data } = await api.post('/messages/conversations', { recipientId });
    return data;
};

// Mark message as read
export const markMessageAsRead = async (messageId: string): Promise<void> => {
    await api.put(`/messages/messages/${messageId}/read`);
};

// Mark conversation as read
export const markConversationAsRead = async (conversationId: string): Promise<void> => {
    await api.put(`/messages/conversations/${conversationId}/read`);
};

// Delete a message
export const deleteMessage = async (messageId: string): Promise<void> => {
    await api.delete(`/messages/messages/${messageId}`);
};

// Search messages
export const searchMessages = async (
    query: string, 
    page = 1, 
    limit = 20
): Promise<SearchResponse> => {
    const { data } = await api.get('/messages/search', {
        params: { query, page, limit }
    });
    return data;
};

// Get users for messaging
export const getUsersForMessaging = async (
    search = '', 
    page = 1, 
    limit = 20
): Promise<UsersResponse> => {
    console.log('📡 API call: getUsersForMessaging', { search, page, limit });
    
    try {
        const { data } = await api.get('/messages/users', {
            params: { search, page, limit }
        });
        console.log('✅ API response:', data);
        return data;
    } catch (error) {
        console.error('❌ API error:', error);
        throw error;
    }
};

// Legacy support for existing code
export const getMessages = async (id: string, type?: 'group'): Promise<Message[]> => {
    if (type === 'group') {
        // Handle group messages if needed
        return [];
    }
    
    const response = await getConversationMessages(id);
    return response.messages;
};