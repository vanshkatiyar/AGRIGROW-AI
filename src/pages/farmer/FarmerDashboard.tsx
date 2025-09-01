import React, { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress'; // Import Progress component
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Sprout, Calendar, DollarSign, Users, CheckCircle, Wheat, AlertTriangle, Thermometer, Droplets } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCrops, addCrop, harvestCrop, Crop } from '@/services/cropService';
import { mockRecentSales, mockFinancialData } from '@/services/roleBasedData';
import { AddNewCropForm } from '@/components/farmer/AddNewCropForm';
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const FarmerDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddCropOpen, setIsAddCropOpen] = useState(false);

  const { data: crops = [], isLoading } = useQuery<Crop[]>({ queryKey: ['crops'], queryFn: getCrops });
  
  const addCropMutation = useMutation({
    mutationFn: addCrop,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['crops'] }); toast({ title: "Crop Added!" }); setIsAddCropOpen(false); },
    onError: (err) => toast({ title: "Error", description: err.message, variant: 'destructive' }),
  });

  const harvestCropMutation = useMutation({
    mutationFn: harvestCrop,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['crops'] }); toast({ title: "Crop marked as harvested!" }); },
    onError: (err) => toast({ title: "Error", description: err.message, variant: 'destructive' }),
  });

  const stats = useMemo(() => {
    const totalCrops = crops.length;
    const activeCrops = crops.filter(c => c.status === 'active').length;
    const monthlyRevenue = 56200; 
    return [
      { label: 'Total Crops', value: totalCrops, icon: Sprout, color: 'text-green-600' },
      { label: 'Active Crops', value: activeCrops, icon: Calendar, color: 'text-blue-600' },
      { label: 'Monthly Revenue', value: `₹${monthlyRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600' },
    ];
  }, [crops]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // --- Helper function to calculate growth progress ---
  const calculateGrowth = (plantingDate: string, daysToHarvest: number) => {
      const planted = new Date(plantingDate);
      const daysSincePlanted = differenceInDays(new Date(), planted);
      const progress = Math.min(Math.round((daysSincePlanted / daysToHarvest) * 100), 100);
      return { progress, daysRemaining: Math.max(0, daysToHarvest - daysSincePlanted) };
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Farmer Dashboard</h1>
              <p className="text-muted-foreground mt-1">Welcome back, {user?.name}! Track your farm's performance.</p>
            </div>
            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
              <Dialog open={isAddCropOpen} onOpenChange={setIsAddCropOpen}>
                <DialogTrigger asChild><Button className="bg-green-600 hover:bg-green-700"><Sprout className="h-4 w-4 mr-2" />Add New Crop</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add a New Crop</DialogTitle><DialogDescription>Enter details for the new crop you are planting.</DialogDescription></DialogHeader>
                  <AddNewCropForm onSubmit={addCropMutation.mutate} onClose={() => setIsAddCropOpen(false)} isPending={addCropMutation.isPending} />
                </DialogContent>
              </Dialog>
              <Button variant="outline"><Users className="h-4 w-4 mr-2" />Consult Expert</Button>
            </div>
          </div>
        </div>
        
        {/* Key Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label}><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">{stat.label}</p><p className="text-2xl font-bold">{stat.value}</p></div><stat.icon className={`h-8 w-8 ${stat.color}`} /></div></CardContent></Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* --- THIS IS THE NEW "CROP MANAGEMENT" SECTION --- */}
            <Card>
              <CardHeader>
                <CardTitle>Crop Management</CardTitle>
                <CardDescription>Monitor your crops' growth and health</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? <div className="flex justify-center p-8"><LoadingSpinner /></div> :
                 crops.filter(c => c.status === 'active').length === 0 ? <p className="text-center text-muted-foreground py-8">No active crops. Add a new crop to get started.</p> :
                 crops.filter(c => c.status === 'active').map((crop) => {
                    const { progress, daysRemaining } = calculateGrowth(crop.plantingDate, 120); // Assuming 120 days harvest cycle
                    return (
                        <Card key={crop._id} className="p-4">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center"><Sprout className="h-6 w-6 text-green-600"/></div>
                                    <div><h4 className="font-semibold text-lg">{crop.name}</h4><p className="text-sm text-muted-foreground">{crop.areaInAcres} acres</p></div>
                                </div>
                                <div className="text-right">
                                    <Badge variant="secondary">good</Badge>
                                    <p className="text-sm text-muted-foreground mt-1">{daysRemaining} days to harvest</p>
                                </div>
                            </div>
                            <div className="mt-4 space-y-1">
                                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                                    <span>Growth Progress</span>
                                    <span>{progress}%</span>
                                </div>
                                <Progress value={progress} />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                                <div><p className="text-sm text-muted-foreground">Current Stage</p><p className="font-medium">Sowing</p></div>
                                <div><p className="text-sm text-muted-foreground">Expected Yield</p><p className="font-medium">{crop.expectedYield}</p></div>
                                <div><p className="text-sm text-muted-foreground">Estimated Revenue</p><p className="font-medium text-green-600">₹{crop.estimatedRevenue.toLocaleString()}</p></div>
                                <div><p className="text-sm text-muted-foreground">Next Action</p><p className="font-medium">First irrigation cycle</p></div>
                            </div>
                            <div className="flex justify-end mt-4">
                                <Button size="sm" onClick={() => harvestCropMutation.mutate(crop._id)} disabled={harvestCropMutation.isPending}><CheckCircle className="h-4 w-4 mr-2"/> Mark as Harvested</Button>
                            </div>
                        </Card>
                    )
                 })}
              </CardContent>
            </Card>
            {/* Revenue Trends */}
            <Card>
              <CardHeader><CardTitle>Revenue Trends</CardTitle><CardDescription>Monthly revenue performance.</CardDescription></CardHeader>
              <CardContent><ResponsiveContainer width="100%" height={300}><LineChart data={mockFinancialData.farmer.monthlyRevenue}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} /><Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} /></LineChart></ResponsiveContainer></CardContent>
            </Card>
          </div>

          {/* Right Sidebar Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-500" />Weather Alert</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2"><Thermometer className="h-4 w-4 text-red-500" /><span className="text-sm">High temperature expected</span></div>
                <div className="flex items-center gap-2"><Droplets className="h-4 w-4 text-blue-500" /><span className="text-sm">Light rain in 2 days</span></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Recent Sales</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {mockRecentSales.map((sale) => (<div key={sale.id} className="flex items-center justify-between"><div><p className="font-medium text-sm">{sale.crop}</p><p className="text-xs text-muted-foreground">{sale.quantity} to {sale.buyer}</p></div><div className="text-right"><p className="font-medium text-sm">₹{sale.amount.toLocaleString()}</p><Badge variant={sale.status === 'completed' ? 'default' : 'secondary'} className="text-xs">{sale.status}</Badge></div></div>))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Expense Breakdown</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart><Pie data={mockFinancialData.farmer.expenseBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="amount">{mockFinancialData.farmer.expenseBreakdown.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip formatter={(value) => `₹${value}`} /></PieChart>
                </ResponsiveContainer>
                <div className="mt-2 space-y-1">{mockFinancialData.farmer.expenseBreakdown.map((expense, index) => (<div key={expense.category} className="flex items-center justify-between text-sm"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} /><span>{expense.category}</span></div><span>₹{expense.amount.toLocaleString()}</span></div>))}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FarmerDashboard;