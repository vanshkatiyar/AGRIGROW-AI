import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sprout, TrendingUp, Calendar, DollarSign, Users, AlertTriangle, Droplets, Thermometer } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { mockFarmerStats, mockCropStatus, mockRecentSales, mockFinancialData, CropStatus } from '@/services/roleBasedData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AddNewCropForm } from '@/components/farmer/AddNewCropForm';
import { useToast } from "@/hooks/use-toast";

const FarmerDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // --- CHANGE #1: Initialize state from Local Storage ---
  // We provide a function to useState that runs only once on component mount.
  // It tries to load 'farmerCrops' from localStorage. If it doesn't exist, it uses the default mock data.
  const [crops, setCrops] = useState<CropStatus[]>(() => {
    const savedCrops = localStorage.getItem('farmerCrops');
    return savedCrops ? JSON.parse(savedCrops) : mockCropStatus;
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // --- CHANGE #2: Save to Local Storage whenever crops change ---
  // This useEffect hook will run every time the `crops` state variable is updated.
  // It saves the current list of crops to localStorage.
  useEffect(() => {
    localStorage.setItem('farmerCrops', JSON.stringify(crops));
  }, [crops]);


  const stats = [
    { label: 'Total Crops', value: crops.length, icon: Sprout, color: 'text-green-600' },
    { label: 'Active Crops', value: mockFarmerStats.activeCrops, icon: Calendar, color: 'text-blue-600' },
    { label: 'Monthly Revenue', value: `₹${mockFarmerStats.monthlyRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600' },
    { label: 'Credit Score', value: mockFarmerStats.creditScore, icon: TrendingUp, color: 'text-purple-600' }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const handleAddNewCrop = (data: any) => {
    const newCrop: CropStatus = {
      id: `crop_${Date.now()}`,
      name: data.name,
      areaInAcres: data.areaInAcres,
      plantingDate: data.plantingDate.toISOString(),
      daysToHarvest: 120,
      currentStage: 'sowing',
      healthStatus: 'good',
      progress: 5,
      expectedYield: data.expectedYield,
      estimatedRevenue: data.estimatedRevenue,
      nextAction: 'First irrigation cycle',
    };
    
    // This updates the state, which will trigger the useEffect hook to save the new list.
    setCrops(prevCrops => [newCrop, ...prevCrops]);
    toast({
        title: "Crop Added Successfully!",
        description: `${data.name} has been added to your dashboard.`,
    });
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Farmer Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Welcome back, {user?.name}! Track your farm's performance.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Sprout className="h-4 w-4 mr-2" />
                    Add New Crop
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add a New Crop</DialogTitle>
                    <DialogDescription>
                      Enter the details of the new crop you are planting.
                    </DialogDescription>
                  </DialogHeader>
                  <AddNewCropForm onSubmit={handleAddNewCrop} onClose={() => setIsDialogOpen(false)} />
                </DialogContent>
              </Dialog>
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Consult Expert
              </Button>
            </div>
          </div>
        </div>

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
          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Crop Management</CardTitle>
                <CardDescription>Monitor your crops' growth and health</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {crops.length > 0 ? (
                    crops.map((crop) => (
                    <div key={crop.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                            <Sprout className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{crop.name}</h4>
                            <p className="text-sm text-muted-foreground">{crop.areaInAcres} acres</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={crop.healthStatus === 'excellent' ? 'default' : crop.healthStatus === 'good' ? 'secondary' : 'destructive'}>
                            {crop.healthStatus}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">{crop.daysToHarvest} days to harvest</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm"><span>Growth Progress</span><span>{crop.progress}%</span></div>
                        <Progress value={crop.progress} className="h-2" />
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                        <div><p className="text-muted-foreground">Current Stage</p><p className="font-medium capitalize">{crop.currentStage}</p></div>
                        <div><p className="text-muted-foreground">Expected Yield</p><p className="font-medium">{crop.expectedYield}</p></div>
                        <div><p className="text-muted-foreground">Estimated Revenue</p><p className="font-medium text-green-600">₹{crop.estimatedRevenue.toLocaleString()}</p></div>
                        <div><p className="text-muted-foreground">Next Action</p><p className="font-medium">{crop.nextAction}</p></div>
                      </div>
                    </div>
                  ))
                ) : (
                    <p className="text-center text-muted-foreground py-8">No crops added yet. Click "Add New Crop" to get started.</p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader><CardTitle>Revenue Trends</CardTitle><CardDescription>Monthly revenue performance</CardDescription></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockFinancialData.farmer.monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis />
                    <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-500" />Weather Alert</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2"><Thermometer className="h-4 w-4 text-red-500" /><span className="text-sm">High temperature expected</span></div>
                  <div className="flex items-center gap-2"><Droplets className="h-4 w-4 text-blue-500" /><span className="text-sm">Light rain in 2 days</span></div>
                  <p className="text-xs text-muted-foreground mt-2">Consider increasing irrigation for wheat crops</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader><CardTitle>Recent Sales</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {mockRecentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between">
                    <div><p className="font-medium text-sm">{sale.crop}</p><p className="text-xs text-muted-foreground">{sale.quantity} to {sale.buyer}</p></div>
                    <div className="text-right"><p className="font-medium text-sm">₹{sale.amount.toLocaleString()}</p><Badge variant={sale.status === 'completed' ? 'default' : 'secondary'} className="text-xs">{sale.status}</Badge></div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Expense Breakdown</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={mockFinancialData.farmer.expenseBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="amount">
                      {mockFinancialData.farmer.expenseBreakdown.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value}`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 space-y-1">
                  {mockFinancialData.farmer.expenseBreakdown.map((expense, index) => (
                    <div key={expense.category} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} /><span>{expense.category}</span></div>
                      <span>₹{expense.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FarmerDashboard;