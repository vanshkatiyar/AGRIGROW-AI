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
    lastActivity: string;
    unreadCount?: number;
    createdAt: string;
    updatedAt: string;
}

export interface Message {
    _id: string;
    senderId: User | string;
    recipientId: User | string;
    conversationId: string;
    content: string;
    messageType: 'text' | 'image' | 'file';
    isRead: boolean;
    isDelivered: boolean;
    editedAt?: string;
    deletedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface OnlineStatus {
    userId: string;
    isOnline: boolean;
    lastSeen?: string;
}

export interface TypingIndicator {
    conversationId: string;
    userId: string;
    isTyping: boolean;
}

export interface Crop {
  _id: string;
  name: string;
  areaInAcres: number;
  plantingDate: string;
  status: 'active' | 'harvested';
  expectedYield: string;
  estimatedRevenue: number;
}

export interface AddCropData {
  name: string;
  areaInAcres: number;
  plantingDate: Date;
  expectedYield: string;
  estimatedRevenue: number;
}