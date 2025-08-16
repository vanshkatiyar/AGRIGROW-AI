import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ShoppingCart, 
  TrendingDown, 
  Users, 
  CreditCard,
  Package,
  Star,
  MapPin,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { 
  mockBuyerStats, 
  mockPurchaseHistory,
  mockFinancialData 
} from '@/services/roleBasedData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const BuyerDashboard = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Total Orders', value: mockBuyerStats.totalPurchases, icon: Package, color: 'text-blue-600' },
    { label: 'Active Suppliers', value: mockBuyerStats.activeFarmers, icon: Users, color: 'text-green-600' },
    { label: 'Monthly Spending', value: `₹${mockBuyerStats.monthlySpending.toLocaleString()}`, icon: ShoppingCart, color: 'text-purple-600' },
    { label: 'Credit Available', value: `₹${(mockBuyerStats.creditLimit - mockBuyerStats.usedCredit).toLocaleString()}`, icon: CreditCard, color: 'text-emerald-600' }
  ];

  const creditUtilization = (mockBuyerStats.usedCredit / mockBuyerStats.creditLimit) * 100;

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Buyer Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Welcome back, {user?.name}! Manage your purchases and suppliers.
              </p>
            </div>
            <div className="flex gap-2">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Browse Marketplace
              </Button>
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Find Suppliers
              </Button>
            </div>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Purchases</CardTitle>
                <CardDescription>Your latest orders and delivery status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockPurchaseHistory.map((purchase) => (
                  <div key={purchase.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                          <Package className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{purchase.crop}</h4>
                          <p className="text-sm text-muted-foreground">from {purchase.farmer}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={purchase.status === 'delivered' ? 'default' : purchase.status === 'shipped' ? 'secondary' : 'outline'}>
                          {purchase.status}
                        </Badge>
                        <p className="text-sm font-medium mt-1">₹{purchase.totalAmount.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Quantity</p>
                        <p className="font-medium">{purchase.quantity}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Price per kg</p>
                        <p className="font-medium">₹{purchase.pricePerKg}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Order Date</p>
                        <p className="font-medium">{new Date(purchase.orderDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Quality</p>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{purchase.quality}</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-3 w-3 ${i < purchase.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Spending Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Spending Trends</CardTitle>
                <CardDescription>Monthly spending analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockFinancialData.buyer.monthlySpending}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value}`, 'Spending']} />
                    <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Credit Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-blue-500" />
                  Credit Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Credit Utilization</span>
                      <span>{creditUtilization.toFixed(1)}%</span>
                    </div>
                    <Progress value={creditUtilization} className="h-2" />
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Credit Limit</span>
                      <span className="font-medium">₹{mockBuyerStats.creditLimit.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Used Credit</span>
                      <span className="font-medium">₹{mockBuyerStats.usedCredit.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Available</span>
                      <span className="font-medium text-green-600">
                        ₹{(mockBuyerStats.creditLimit - mockBuyerStats.usedCredit).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  {mockBuyerStats.paymentDue > 0 && (
                    <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">
                      <p className="text-sm font-medium text-red-600">Payment Due</p>
                      <p className="text-lg font-bold text-red-600">₹{mockBuyerStats.paymentDue.toLocaleString()}</p>
                      <Button size="sm" className="mt-2 w-full">Pay Now</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top Suppliers */}
            <Card>
              <CardHeader>
                <CardTitle>Favorite Suppliers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "Ravi Kumar", location: "Punjab", orders: 15, rating: 4.8 },
                  { name: "Priya Sharma", location: "Haryana", orders: 12, rating: 4.6 },
                  { name: "Suresh Patel", location: "Gujarat", orders: 8, rating: 4.7 }
                ].map((supplier, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{supplier.name}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {supplier.location}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{supplier.rating}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{supplier.orders} orders</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Category Spending */}
            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={mockFinancialData.buyer.categoryBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip formatter={(value) => `₹${value}`} />
                    <Bar dataKey="amount" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BuyerDashboard;