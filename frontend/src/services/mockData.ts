// src/services/mockData.ts

// Using a more reliable image placeholder service
const getStableImage = (seed: string, width: number = 800, height: number = 600) => {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
};

export interface Post {
  id: string; userName: string; userImage: string; userLocation: string;
  timestamp: string; // Must be a valid ISO 8601 string for `new Date()`
  content: string; images: string[]; likes: number; comments: number; isLiked: boolean;
  forSale?: boolean; price?: number; quantity?: string; cropType?: string;
}

export interface MarketplaceProduct {
  id: string; cropName: string; description: string; price: number; unit: 'quintal' | 'kg' | 'tonne';
  quantity: number; location: string; harvestDate: string; // Must be a valid ISO 8601 string
  qualityGrade: 'A' | 'B' | 'C'; images: string[]; sellerName: string; sellerImage: string;
}

// --- MOCK POSTS with CORRECTED TIMESTAMPS ---
export const mockPosts: Post[] = [
  {
    id: 'post_1',
    userName: 'Ravi Kumar',
    userImage: getStableImage('farmer1', 100, 100),
    userLocation: 'Punjab, India',
    timestamp: '2025-08-22T09:00:00Z', // CORRECT ISO 8601 Format
    content: "The wheat harvest is looking fantastic this year! Golden fields as far as the eye can see.",
    images: [getStableImage('wheatfield', 800, 600)],
    likes: 124, comments: 18, isLiked: false, forSale: true, price: 2200, quantity: '50 quintals', cropType: 'wheat',
  },
  {
    id: 'post_2',
    userName: 'Priya Sharma',
    userImage: getStableImage('farmer2', 100, 100),
    userLocation: 'Maharashtra, India',
    timestamp: '2025-08-21T15:30:00Z', // CORRECT ISO 8601 Format
    content: "Just finished planting the new batch of sugarcane. Hoping for a sweet season ahead!",
    images: [getStableImage('sugarcane', 800, 600), getStableImage('farmwork', 800, 600)],
    likes: 88, comments: 12, isLiked: true,
  },
];

// --- MOCK MARKETPLACE with CORRECTED DATES ---
export const mockMarketplaceProducts: MarketplaceProduct[] = [
  {
    id: 'prod_1', cropName: 'Organic Wheat', description: 'High-quality organic wheat from the fields of Punjab.',
    price: 2250, unit: 'quintal', quantity: 50, location: 'Amritsar, Punjab',
    harvestDate: '2025-08-15T00:00:00Z', // CORRECT ISO 8601 Format
    qualityGrade: 'A', images: [getStableImage('wheatgrain', 800, 600)],
    sellerName: 'Ravi Kumar', sellerImage: getStableImage('farmer1', 100, 100),
  },
  {
    id: 'prod_2', cropName: 'Fresh Tomatoes', description: 'Juicy, farm-fresh tomatoes grown using organic methods.',
    price: 35, unit: 'kg', quantity: 200, location: 'Nashik, Maharashtra',
    harvestDate: '2025-08-20T00:00:00Z', // CORRECT ISO 8601 Format
    qualityGrade: 'A', images: [getStableImage('freshtomatoes', 800, 600)],
    sellerName: 'Priya Sharma', sellerImage: getStableImage('farmer2', 100, 100),
  },
  {
    id: 'prod_3', cropName: 'Basmati Rice', description: 'Premium quality, long-grain Basmati rice.',
    price: 8500, unit: 'quintal', quantity: 100, location: 'Karnal, Haryana',
    harvestDate: '2025-07-30T00:00:00Z', // CORRECT ISO 8601 Format
    qualityGrade: 'A', images: [getStableImage('basmatirice', 800, 600)],
    sellerName: 'Anil Singh', sellerImage: getStableImage('farmer4', 100, 100),
  },
];

// Mock Weather data (remains unused for now but kept for consistency)
export const mockWeatherData = {
  current: {
    icon: "☀️",
    temperature: 28,
    condition: "Sunny",
  },
  location: "Punjab, India",
  farmingTips: [
    "Irrigate crops in the early morning to reduce evaporation.",
    "Apply organic fertilizers to improve soil health.",
    "Monitor for pests during this warm weather.",
    "Harvest before the expected rainfall next week."
  ]
};
// --- SERVICE PROVIDER DATA ---
export const mockServiceProviderStats = {
  totalServices: 15,
  activeRequests: 5,
  monthlyEarnings: 45000,
  averageRating: 4.7,
  jobsCompleted: 32,
  responseRate: 95, // in percentage
};

export const mockRecentActivities = [
  { id: 'act1', type: 'new_request', description: 'New service request from Ravi Kumar for Tractor Rental.', timestamp: '2025-08-23T10:00:00Z' },
  { id: 'act2', type: 'payment_received', description: 'Payment of ₹5000 received from Anjali Desai.', timestamp: '2025-08-22T18:30:00Z' },
  { id: 'act3', type: 'review_added', description: 'Suresh Patel left a 5-star review for your Harvesting service.', timestamp: '2025-08-22T14:00:00Z' },
  { id: 'act4', type: 'service_completed', description: 'Marked "Soil Testing" for Priya Sharma as completed.', timestamp: '2025-08-21T16:45:00Z' },
];
export const mockMonthlyEarnings = [
  { month: 'Mar', earnings: 32000 },
  { month: 'Apr', earnings: 41000 },
  { month: 'May', earnings: 38000 },
  { month: 'Jun', earnings: 45000 },
  { month: 'Jul', earnings: 48000 },
  { month: 'Aug', earnings: 52000 },
];

export const mockServiceRequestStatus = [
  { name: 'Pending', value: 5, fill: '#FFBB28' },
  { name: 'Active', value: 8, fill: '#00C49F' },
  { name: 'Completed', value: 32, fill: '#0088FE' },
  { name: 'Cancelled', value: 2, fill: '#FF8042' },
];

export const mockCalendarEvents = [
  {
    title: 'Tractor Rental - Ravi Kumar',
    start: new Date(2025, 8, 25, 9, 0, 0),
    end: new Date(2025, 8, 25, 17, 0, 0),
  },
  {
    title: 'Harvesting Service - Anjali Desai',
    start: new Date(2025, 8, 27, 8, 0, 0),
    end: new Date(2025, 8, 28, 18, 0, 0),
  },
  {
    title: 'Soil Testing - Priya Sharma',
    start: new Date(2025, 9, 2, 10, 0, 0),
    end: new Date(2025, 9, 2, 12, 0, 0),
  },
];

export interface Booking {
  id: string;
  serviceType: string;
  date: string; // ISO 8601 format
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  customerName: string;
}

export const mockBookings: Booking[] = [
  {
    id: 'booking_1',
    serviceType: 'Tractor Rental',
    date: '2025-09-25',
    time: '09:00 - 17:00',
    status: 'confirmed',
    customerName: 'Ravi Kumar',
  },
  {
    id: 'booking_2',
    serviceType: 'Harvesting Service',
    date: '2025-09-27',
    time: '08:00 - 18:00',
    status: 'confirmed',
    customerName: 'Anjali Desai',
  },
  {
    id: 'booking_3',
    serviceType: 'Soil Testing',
    date: '2025-10-02',
    time: '10:00 - 12:00',
    status: 'pending',
    customerName: 'Priya Sharma',
  },
  {
    id: 'booking_4',
    serviceType: 'Pest Control',
    date: '2025-09-26',
    time: '14:00 - 16:00',
    status: 'completed',
    customerName: 'Suresh Patel',
  },
  {
    id: 'booking_5',
    serviceType: 'Irrigation Setup',
    date: '2025-09-28',
    time: '07:00 - 15:00',
    status: 'confirmed',
    customerName: 'Meena Devi',
  },
];