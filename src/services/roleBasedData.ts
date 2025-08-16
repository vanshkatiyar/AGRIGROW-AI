// Role-based dashboard data structures and mock data

export interface FarmerStats {
  totalCrops: number;
  activeCrops: number;
  readyToHarvest: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingPayments: number;
  creditScore: number;
}

export interface CropStatus {
  id: string;
  name: string;
  plantedDate: string;
  expectedHarvest: string;
  currentStage: string;
  progress: number;
  areaInAcres: number;
  expectedYield: string;
  estimatedRevenue: number;
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
  nextAction: string;
  daysToHarvest: number;
}

export interface Sale {
  id: string;
  crop: string;
  quantity: string;
  price: number;
  buyer: string;
  date: string;
  status: 'completed' | 'pending' | 'cancelled';
  amount: number;
}

export interface BuyerStats {
  totalPurchases: number;
  monthlySpending: number;
  activeFarmers: number;
  savedAmount: number;
  creditLimit: number;
  usedCredit: number;
  paymentDue: number;
}

export interface Purchase {
  id: string;
  farmer: string;
  crop: string;
  quantity: string;
  pricePerKg: number;
  totalAmount: number;
  orderDate: string;
  deliveryDate: string;
  status: 'delivered' | 'shipped' | 'pending' | 'cancelled';
  quality: string;
  rating: number;
}

export interface ExpertStats {
  totalConsultations: number;
  activeClients: number;
  monthlyEarnings: number;
  averageRating: number;
  responseTime: string;
  successRate: number;
  specializations: string[];
}

export interface ConsultationRequest {
  id: string;
  farmerId: string;
  farmerName: string;
  issue: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  submittedDate: string;
  cropType: string;
  location: string;
  images: string[];
  consultationFee: number;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
}

export interface Article {
  id: string;
  title: string;
  views: number;
  likes: number;
  publishedDate: string;
  category: string;
  content?: string;
}

// Mock data for farmer dashboard
export const mockFarmerStats: FarmerStats = {
  totalCrops: 15,
  activeCrops: 8,
  readyToHarvest: 3,
  totalRevenue: 125000,
  monthlyRevenue: 25000,
  pendingPayments: 15000,
  creditScore: 750
};

export const mockCropStatus: CropStatus[] = [
  {
    id: "crop1",
    name: "Wheat",
    plantedDate: "2025-01-15",
    expectedHarvest: "2025-04-15",
    currentStage: "flowering",
    progress: 65,
    areaInAcres: 5,
    expectedYield: "2500kg",
    estimatedRevenue: 62500,
    healthStatus: "good",
    nextAction: "Apply fertilizer",
    daysToHarvest: 45
  },
  {
    id: "crop2",
    name: "Rice",
    plantedDate: "2025-02-01",
    expectedHarvest: "2025-05-01",
    currentStage: "grain filling",
    progress: 80,
    areaInAcres: 3,
    expectedYield: "1800kg",
    estimatedRevenue: 54000,
    healthStatus: "excellent",
    nextAction: "Monitor moisture",
    daysToHarvest: 20
  },
  {
    id: "crop3",
    name: "Sugarcane",
    plantedDate: "2024-10-15",
    expectedHarvest: "2025-03-15",
    currentStage: "maturation",
    progress: 95,
    areaInAcres: 2,
    expectedYield: "5000kg",
    estimatedRevenue: 125000,
    healthStatus: "good",
    nextAction: "Prepare for harvest",
    daysToHarvest: 5
  }
];

export const mockRecentSales: Sale[] = [
  {
    id: "sale1",
    crop: "Rice",
    quantity: "500kg",
    price: 30,
    buyer: "ABC Traders",
    date: "2025-08-10",
    status: "completed",
    amount: 15000
  },
  {
    id: "sale2",
    crop: "Tomatoes",
    quantity: "200kg",
    price: 40,
    buyer: "Fresh Mart",
    date: "2025-08-12",
    status: "pending",
    amount: 8000
  }
];

// Mock data for buyer dashboard
export const mockBuyerStats: BuyerStats = {
  totalPurchases: 50,
  monthlySpending: 85000,
  activeFarmers: 12,
  savedAmount: 15000,
  creditLimit: 200000,
  usedCredit: 45000,
  paymentDue: 25000
};

export const mockPurchaseHistory: Purchase[] = [
  {
    id: "purchase1",
    farmer: "Ravi Kumar",
    crop: "Organic Tomatoes",
    quantity: "200kg",
    pricePerKg: 40,
    totalAmount: 8000,
    orderDate: "2025-08-12",
    deliveryDate: "2025-08-15",
    status: "delivered",
    quality: "A+",
    rating: 5
  },
  {
    id: "purchase2",
    farmer: "Priya Sharma",
    crop: "Fresh Wheat",
    quantity: "1000kg",
    pricePerKg: 25,
    totalAmount: 25000,
    orderDate: "2025-08-10",
    deliveryDate: "2025-08-13",
    status: "delivered",
    quality: "A",
    rating: 4
  }
];

// Mock data for expert dashboard
export const mockExpertStats: ExpertStats = {
  totalConsultations: 150,
  activeClients: 25,
  monthlyEarnings: 45000,
  averageRating: 4.7,
  responseTime: "2 hours",
  successRate: 92,
  specializations: ["crop diseases", "soil management", "organic farming"]
};

export const mockConsultationRequests: ConsultationRequest[] = [
  {
    id: "consult1",
    farmerId: "farmer1",
    farmerName: "Suresh Patel",
    issue: "Wheat crop yellowing and stunted growth",
    urgency: "high",
    submittedDate: "2025-08-15",
    cropType: "wheat",
    location: "Gujarat",
    images: ["/api/placeholder/300/200"],
    consultationFee: 500,
    status: "pending"
  },
  {
    id: "consult2",
    farmerId: "farmer2",
    farmerName: "Anjali Verma",
    issue: "Soil pH imbalance affecting crop yield",
    urgency: "medium",
    submittedDate: "2025-08-14",
    cropType: "tomatoes",
    location: "Maharashtra",
    images: ["/api/placeholder/300/200", "/api/placeholder/300/200"],
    consultationFee: 600,
    status: "in-progress"
  }
];

export const mockArticles: Article[] = [
  {
    id: "article1",
    title: "Managing Wheat Rust Disease: A Comprehensive Guide",
    views: 1250,
    likes: 89,
    publishedDate: "2025-08-01",
    category: "disease_management"
  },
  {
    id: "article2",
    title: "Optimizing Soil Health for Better Crop Yields",
    views: 892,
    likes: 76,
    publishedDate: "2025-07-28",
    category: "soil_management"
  }
];

// Dashboard analytics data
export const mockFinancialData = {
  farmer: {
    monthlyRevenue: [
      { month: "Jan", revenue: 45000 },
      { month: "Feb", revenue: 52000 },
      { month: "Mar", revenue: 38000 },
      { month: "Apr", revenue: 65000 },
      { month: "May", revenue: 48000 },
      { month: "Jun", revenue: 55000 }
    ],
    expenseBreakdown: [
      { category: "Seeds", amount: 15000 },
      { category: "Fertilizers", amount: 12000 },
      { category: "Labor", amount: 20000 },
      { category: "Equipment", amount: 8000 }
    ]
  },
  buyer: {
    monthlySpending: [
      { month: "Jun", amount: 75000 },
      { month: "Jul", amount: 80000 },
      { month: "Aug", amount: 85000 }
    ],
    categoryBreakdown: [
      { category: "Grains", amount: 45000 },
      { category: "Vegetables", amount: 25000 },
      { category: "Fruits", amount: 15000 }
    ]
  },
  expert: {
    monthlyEarnings: [
      { month: "Jun", earnings: 38000 },
      { month: "Jul", earnings: 42000 },
      { month: "Aug", earnings: 45000 }
    ],
    serviceBreakdown: [
      { type: "consultations", amount: 35000 },
      { type: "articles", amount: 5000 },
      { type: "premium_advice", amount: 5000 }
    ]
  }
};