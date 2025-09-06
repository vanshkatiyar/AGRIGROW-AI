export interface User {
    _id: string;
    id: string;
    name: string;
    email: string;
    location: string;
    role: 'farmer' | 'buyer' | 'expert' | null;
    profileImage?: string;
    [key: string]: any; 
}

export interface Conversation {
    _id: string;
    participants: User[];
    lastMessage?: Message;
    // ... other properties
}

export interface Message {
    _id: string;
    senderId: any; // Can be a string or a User object if populated
    recipientId?: string;
    groupId?: string;
    content: string;
    type: 'text' | 'voice' | 'image';
    createdAt: string;
    conversationId?: string;
}