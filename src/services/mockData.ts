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
export const mockWeatherData = { /* ... */ };