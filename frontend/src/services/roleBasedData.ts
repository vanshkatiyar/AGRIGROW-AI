export interface CropStatus {
    id: string;
    name: string;
    areaInAcres: number;
    plantingDate: string;
    daysToHarvest: number;
    currentStage: 'sowing' | 'vegetative' | 'flowering' | 'harvesting';
    healthStatus: 'excellent' | 'good' | 'poor';
    progress: number;
    expectedYield: string;
    estimatedRevenue: number;
    nextAction: string;
}

// --- FARMER DATA ---
export const mockFarmerStats = {
    totalCrops: 5,
    activeCrops: 3,
    monthlyRevenue: 56200,
    creditScore: 720,
};

export const mockCropStatus: CropStatus[] = [
    { id: 'crop_1', name: 'Wheat', areaInAcres: 10, plantingDate: '2025-05-15T00:00:00Z', daysToHarvest: 30, currentStage: 'flowering', healthStatus: 'excellent', progress: 75, expectedYield: '50 quintals/acre', estimatedRevenue: 250000, nextAction: 'Pest control check' },
    { id: 'crop_2', name: 'Tomato', areaInAcres: 5, plantingDate: '2025-07-01T00:00:00Z', daysToHarvest: 45, currentStage: 'vegetative', healthStatus: 'good', progress: 40, expectedYield: '10 tonnes/acre', estimatedRevenue: 300000, nextAction: 'Apply fertilizer' },
];

export const mockRecentSales = [
    { id: 'sale1', crop: 'Wheat', quantity: '10 quintals', buyer: 'Arjun Traders', amount: 22500, status: 'completed' },
    { id: 'sale2', crop: 'Tomato', quantity: '50 kg', buyer: 'Local Market', amount: 1750, status: 'completed' },
];


// --- BUYER DATA ---
export const mockBuyerStats = {
    totalPurchases: 25,
    activeFarmers: 12,
    monthlySpending: 125000,
    creditLimit: 500000,
    usedCredit: 150000,
    paymentDue: 25000,
};

export const mockPurchaseHistory = [
    { id: 'buy1', crop: 'Wheat', farmer: 'Ravi Kumar', quantity: '20 quintals', pricePerKg: 22.5, totalAmount: 45000, orderDate: '2025-08-15T00:00:00Z', status: 'delivered', quality: 'A Grade', rating: 5 },
    { id: 'buy2', crop: 'Cotton', farmer: 'Suresh Patel', quantity: '15 quintals', pricePerKg: 65, totalAmount: 97500, orderDate: '2025-08-20T00:00:00Z', status: 'shipped', quality: 'B Grade', rating: 4 },
];


// --- EXPERT DATA ---
export const mockExpertStats = {
    totalConsultations: 152,
    activeClients: 18,
    monthlyEarnings: 35000,
    averageRating: 4.8,
    successRate: 92,
    responseTime: '12 hours',
};

export const mockConsultationRequests = [
    { id: 'con1', farmerName: 'Ravi Kumar', location: 'Punjab', cropType: 'Wheat', issue: 'Yellow rust spotted on leaves.', submittedDate: '2025-08-22T00:00:00Z', urgency: 'high', status: 'pending', images: [1,2], consultationFee: 500 },
    { id: 'con2', farmerName: 'Anjali Desai', location: 'Maharashtra', cropType: 'Sugarcane', issue: 'Stunted growth in section B.', submittedDate: '2025-08-21T00:00:00Z', urgency: 'medium', status: 'in-progress', images: [], consultationFee: 500 },
];

export const mockArticles = [
    { id: 'art1', title: 'Managing Soil pH for Optimal Crop Yield', publishedDate: '2025-08-10T00:00:00Z', views: 1200, likes: 250 },
    { id: 'art2', title: 'Top 5 Organic Pesticides You Can Make at Home', publishedDate: '2025-07-25T00:00:00Z', views: 3500, likes: 800 },
];


// --- SHARED FINANCIAL DATA ---
export const mockFinancialData = {
    farmer: {
        monthlyRevenue: [ { month: 'Jan', revenue: 30000 }, { month: 'Feb', revenue: 45000 }, { month: 'Mar', revenue: 42000 }, { month: 'Apr', revenue: 60000 }, { month: 'May', revenue: 55000 }, { month: 'Jun', revenue: 75000 }, ],
        expenseBreakdown: [ { category: 'Seeds', amount: 12000 }, { category: 'Fertilizer', amount: 18000 }, { category: 'Labor', amount: 25000 }, { category: 'Other', amount: 7000 }, ],
    },
    buyer: {
        monthlySpending: [ { month: 'Jan', amount: 80000 }, { month: 'Feb', amount: 95000 }, { month: 'Mar', amount: 110000 }, { month: 'Apr', amount: 85000 }, { month: 'May', amount: 120000 }, { month: 'Jun', amount: 150000 }, ],
        categoryBreakdown: [ { category: 'Grains', amount: 250000 }, { category: 'Vegetables', amount: 150000 }, { category: 'Fruits', amount: 80000 }, { category: 'Other', amount: 50000 }, ],
    },
    expert: {
        monthlyEarnings: [ { month: 'Jan', earnings: 25000 }, { month: 'Feb', earnings: 30000 }, { month: 'Mar', earnings: 28000 }, { month: 'Apr', earnings: 35000 }, { month: 'May', earnings: 32000 }, { month: 'Jun', earnings: 40000 }, ],
        serviceBreakdown: [ { type: 'consultations', amount: 150000 }, { type: 'articles', amount: 30000 }, { type: 'other', amount: 10000 }, ],
    }
};