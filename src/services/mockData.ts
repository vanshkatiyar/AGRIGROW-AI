export interface Post {
  id: string;
  userId: string;
  userName: string;
  userImage: string;
  userLocation: string;
  content: string;
  images: string[];
  timestamp: string;
  likes: number;
  comments: number;
  forSale: boolean;
  cropType?: string;
  price?: number;
  quantity?: string;
  isLiked: boolean;
}

export interface MarketplaceProduct {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerImage: string;
  cropName: string;
  price: number;
  unit: string;
  quantity: number;
  location: string;
  images: string[];
  description: string;
  harvestDate: string;
  qualityGrade: string;
  category: string;
}

export interface WeatherData {
  location: string;
  current: {
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    icon: string;
  };
  forecast: Array<{
    date: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
    precipitation: number;
  }>;
  farmingTips: string[];
}

export const mockPosts: Post[] = [
  {
    id: 'post_001',
    userId: 'user_002',
    userName: 'Priya Sharma',
    userImage: '/api/placeholder/50/50',
    userLocation: 'Haryana, India',
    content: 'Excellent tomato harvest this season! Using organic methods really paid off. 🍅',
    images: ['/api/placeholder/400/300'],
    timestamp: '2025-08-16T08:30:00Z',
    likes: 45,
    comments: 12,
    forSale: true,
    cropType: 'tomatoes',
    price: 40,
    quantity: '200kg available',
    isLiked: false
  },
  {
    id: 'post_002',
    userId: 'user_003',
    userName: 'Suresh Patel',
    userImage: '/api/placeholder/50/50',
    userLocation: 'Gujarat, India',
    content: 'Cotton fields looking great after the monsoon. Perfect conditions for growth.',
    images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
    timestamp: '2025-08-16T06:15:00Z',
    likes: 67,
    comments: 8,
    forSale: false,
    isLiked: true
  },
  {
    id: 'post_003',
    userId: 'user_004',
    userName: 'Anjali Verma',
    userImage: '/api/placeholder/50/50',
    userLocation: 'Maharashtra, India',
    content: 'Fresh sugarcane ready for harvest. Sweet and juicy! Available for bulk orders.',
    images: ['/api/placeholder/400/300'],
    timestamp: '2025-08-15T16:45:00Z',
    likes: 89,
    comments: 23,
    forSale: true,
    cropType: 'sugarcane',
    price: 25,
    quantity: '500kg available',
    isLiked: false
  },
  {
    id: 'post_004',
    userId: 'user_005',
    userName: 'Vikram Singh',
    userImage: '/api/placeholder/50/50',
    userLocation: 'Punjab, India',
    content: 'Wheat fields ready for harvesting season. This year\'s yield looks promising!',
    images: ['/api/placeholder/400/300'],
    timestamp: '2025-08-15T14:20:00Z',
    likes: 123,
    comments: 34,
    forSale: true,
    cropType: 'wheat',
    price: 22,
    quantity: '1000kg available',
    isLiked: true
  }
];

export const mockMarketplaceProducts: MarketplaceProduct[] = [
  {
    id: 'prod_001',
    sellerId: 'user_002',
    sellerName: 'Priya Sharma',
    sellerImage: '/api/placeholder/50/50',
    cropName: 'Organic Tomatoes',
    price: 40,
    unit: 'kg',
    quantity: 200,
    location: 'Haryana, India',
    images: ['/api/placeholder/300/200', '/api/placeholder/300/200'],
    description: 'Fresh organic tomatoes grown without pesticides. Perfect for cooking and salads.',
    harvestDate: '2025-08-10',
    qualityGrade: 'A+',
    category: 'vegetables'
  },
  {
    id: 'prod_002',
    sellerId: 'user_003',
    sellerName: 'Suresh Patel',
    sellerImage: '/api/placeholder/50/50',
    cropName: 'Premium Cotton',
    price: 55,
    unit: 'kg',
    quantity: 500,
    location: 'Gujarat, India',
    images: ['/api/placeholder/300/200'],
    description: 'High-quality cotton fiber suitable for textile manufacturing.',
    harvestDate: '2025-08-08',
    qualityGrade: 'A',
    category: 'cotton'
  },
  {
    id: 'prod_003',
    sellerId: 'user_004',
    sellerName: 'Anjali Verma',
    sellerImage: '/api/placeholder/50/50',
    cropName: 'Fresh Sugarcane',
    price: 25,
    unit: 'kg',
    quantity: 800,
    location: 'Maharashtra, India',
    images: ['/api/placeholder/300/200', '/api/placeholder/300/200'],
    description: 'Sweet and juicy sugarcane perfect for juice extraction and processing.',
    harvestDate: '2025-08-12',
    qualityGrade: 'A+',
    category: 'sugarcane'
  }
];

export const mockWeatherData: WeatherData = {
  location: 'Punjab, India',
  current: {
    temperature: 28,
    condition: 'Partly Cloudy',
    humidity: 65,
    windSpeed: 12,
    icon: '🌤️'
  },
  forecast: [
    {
      date: '2025-08-17',
      high: 32,
      low: 24,
      condition: 'Sunny',
      icon: '☀️',
      precipitation: 0
    },
    {
      date: '2025-08-18',
      high: 30,
      low: 22,
      condition: 'Cloudy',
      icon: '☁️',
      precipitation: 10
    },
    {
      date: '2025-08-19',
      high: 27,
      low: 20,
      condition: 'Light Rain',
      icon: '🌧️',
      precipitation: 70
    }
  ],
  farmingTips: [
    'Good conditions for wheat irrigation today',
    'Monitor crops for pest activity after recent humidity',
    'Consider harvesting tomatoes before expected rain'
  ]
};