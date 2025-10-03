export interface User {
    _id: string;
    id: string;
    name: string;
    email: string;
    location: string;
    role: 'farmer' | 'buyer' | 'expert' | 'serviceProvider' | null;
    profileImage?: string;
    coverPhoto?: string;
    bio?: string;
    verified?: boolean;
    createdAt: string;
    posts?: Post[];
    services?: ServiceProviderProfile[];
    products?: Product[];
    [key: string]: any;
    expertDetails?: {
        specializations: string[];
        hourlyRate: number;
        ratings: {
            farmerId: string;
            rating: number;
            comment: string;
        }[];
    };
}

export interface Post {
    _id: string;
    author: User;
    content: string;
    images?: string[];
    likes: string[];
    comments: {
        user: User;
        content: string;
        createdAt: string;
    }[];
    createdAt: string;
    updatedAt: string;
}

export interface Product {
    _id: string;
    owner: User;
    name: string;
    category: string;
    price: number;
    unit: string;
    description?: string;
    images?: string[];
    inStock: boolean;
    createdAt: string;
    updatedAt: string;
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
  id: string;
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

export type Service = ServiceProviderProfile;
export interface ServiceProviderProfile {
    _id: string;
    owner: User;
    serviceType: 'tractor' | 'harvester' | 'supplier' | 'manufacturer';
    businessName: string;
    description: string;
    location: {
        address: string;
        coordinates: {
            latitude: number;
            longitude: number;
        };
    };
    contactInfo: {
        phone: string;
        email?: string;
        whatsapp?: string;
    };
    equipment?: {
        name: string;
        model?: string;
        year?: number;
        hourlyRate?: number;
        dailyRate?: number;
        availability?: boolean;
        images?: string[];
    }[];
    products?: {
        name: string;
        category?: string;
        price?: number;
        unit?: string;
        description?: string;
        images?: string[];
        inStock?: boolean;
    }[];
    serviceArea?: {
        radius?: number;
        districts?: string[];
    };
    ratings: {
        average: number;
        count: number;
    };
    isVerified: boolean;
    isActive: boolean;
    businessHours?: {
        monday: { open?: string; close?: string; isOpen: boolean };
        tuesday: { open?: string; close?: string; isOpen: boolean };
        wednesday: { open?: string; close?: string; isOpen: boolean };
        thursday: { open?: string; close?: string; isOpen: boolean };
        friday: { open?: string; close?: string; isOpen: boolean };
        saturday: { open?: string; close?: string; isOpen: boolean };
        sunday: { open?: string; close?: string; isOpen: boolean };
    };
    createdAt: string;
    updatedAt: string;
}

export interface ServiceRequest {
    id: string;
    _id: string;
    farmer: User;
    serviceProvider: ServiceProviderProfile;
    serviceType: 'tractor' | 'harvester' | 'supplier' | 'manufacturer';
    requestType: string; // e.g., 'rental', 'purchase', 'consultation'
    serviceDetails: string;
    description?: string; // Added optional description
    scheduledDate?: string; // Added optional scheduled date
    price?: number; // Added optional price
    status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
    messages: {
        sender: User;
        message: string;
        timestamp: string;
    }[];
    createdAt: string;
    updatedAt: string;
}

export interface Article {
    id: string;
    _id: string;
    title: string;
    content: string;
    author: User;
    tags: string[];
    status: 'draft' | 'published';
    likes: string[];
    comments: string[];
    createdAt: string;
    updatedAt: string;
}

export interface ConsultationType {
    _id: string;
    expert: string;
    title: string;
    description: string;
    duration_minutes: number;
    price: number;
    createdAt: string;
    updatedAt: string;
}

export interface Consultation {
    id: string;
    _id: string;
    farmer: User;
    expert: User;
    consultationType: ConsultationType;
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'RESCHEDULE_PROPOSED' | 'COMPLETED' | 'CANCELED' | 'CANCELED_BY_EXPERT';
    requested_datetime: string;
    scheduled_datetime?: string;
    farmer_notes?: string;
    expert_notes?: string;
    meeting_link?: string;
    attachments?: string[];
    createdAt: string;
    updatedAt: string;
}

export interface ExpertStats {
    totalConsultations: number;
    activeClients: number;
    monthlyEarnings: number;
    averageRating: number;
    monthlyRevenue: { name: string; revenue: number }[];
}

export interface AIResponse {
  answer: string;
}
