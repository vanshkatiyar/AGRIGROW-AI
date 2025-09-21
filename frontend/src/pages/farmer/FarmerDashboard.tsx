import React, { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Sprout, CheckCircle, Users, Tractor, Package, TrendingUp, DollarSign } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCrops, addCrop, harvestCrop } from '@/services/cropService';
import { getFinanceSummary, getExpenses, Expense, FinanceSummary } from '@/services/expenseService';
import { AddNewCropForm } from '@/components/farmer/AddNewCropForm';
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import ScrollToTop from '@/components/common/ScrollToTop';
import { format, differenceInDays, parseISO } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Crop, AddCropData } from '@/types';
import { Link } from 'react-router-dom';
import FarmerAIBot from '@/components/farmer/FarmerAIBot';
import '../../styles/animations.css';

const FarmerDashboard = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isAddCropOpen, setIsAddCropOpen] = useState(false);

    const { data: crops = [], isLoading: isLoadingCrops } = useQuery<Crop[]>({ 
        queryKey: ['crops', user?.id], 
        queryFn: getCrops 
    });
    
    const { data: summary, isLoading: isLoadingSummary } = useQuery<FinanceSummary>({ 
        queryKey: ['financeSummary', user?.id], 
        queryFn: getFinanceSummary 
    });
    
    const { data: expenses = [], isLoading: isLoadingExpenses } = useQuery<Expense[]>({ 
        queryKey: ['expenses', user?.id], 
        queryFn: getExpenses 
    });

    const addCropMutation = useMutation({
        mutationFn: (data: AddCropData) => {
            const cropData = {
                name: data.name,
                areaInAcres: data.areaInAcres,
                plantingDate: data.plantingDate,
                expectedYield: data.expectedYield,
                estimatedRevenue: data.estimatedRevenue,
            };
            return addCrop(cropData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['crops'] });
            toast({ title: "🌱 Crop Added!", description: "Your new crop is now being tracked." });
            setIsAddCropOpen(false);
        },
        onError: (err: any) => toast({ title: "❌ Error", description: err.response?.data?.message || err.message, variant: 'destructive' }),
    });

    const harvestCropMutation = useMutation({
        mutationFn: harvestCrop,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['crops'] });
            toast({ title: "🎉 Crop Harvested!", description: "Congratulations! The crop has been moved to your records." });
        },
        onError: (err: any) => toast({ title: "❌ Error", description: err.response?.data?.message || err.message, variant: 'destructive' }),
    });

    const expenseBreakdownData = useMemo(() => {
        if (!summary?.expenseBreakdown) return [];
        return Object.entries(summary.expenseBreakdown).map(([name, value]) => ({ name, value }));
    }, [summary]);
    
    const COLORS = ['#007bff', '#28a745', '#ffc107', '#6ee7b7', '#a7f3d0']; // Blue, Green, Yellow/Orange, and existing lighter greens

    const calculateGrowth = (plantingDateStr: string, daysToHarvest = 120) => {
        const plantingDate = parseISO(plantingDateStr);
        const daysSincePlanted = differenceInDays(new Date(), plantingDate);
        const progress = Math.min(Math.round((daysSincePlanted / daysToHarvest) * 100), 100);
        const daysRemaining = Math.max(0, daysToHarvest - daysSincePlanted);
        return { progress, daysRemaining };
    };

    const StatCard = ({ title, amount, color, icon: Icon, index }: {
        title: string;
        amount: number;
        color: string;
        icon: any;
        index: number;
    }) => (
        <Card className={`card-animated hover-glow animate-scale-in animate-stagger-${index + 1}`}>
            <CardHeader className="bg-gradient-to-r from-green-50 to-white">
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800">
                    <Icon className={`h-6 w-6 ${color}`} />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <p className={`text-3xl font-bold ${color}`}>
                    ₹{amount?.toLocaleString() ?? 0}
                </p>
            </CardContent>
        </Card>
    );

    const ServiceButton = ({ to, icon: Icon, label, index }: {
        to: string;
        icon: any;
        label: string;
        index: number;
    }) => (
        <Button 
            asChild 
            variant="outline" 
            className={`h-24 flex-col space-y-3 border-green-200 hover:border-green-400 hover:bg-green-50 transition-all duration-300 animate-scale-in animate-stagger-${index + 1}`}
        >
            <Link to={to}>
                <Icon className="h-8 w-8 text-green-600" />
                <span className="text-sm font-semibold text-gray-700">{label}</span>
            </Link>
        </Button>
    );

    const isLoading = isLoadingCrops || isLoadingSummary || isLoadingExpenses;
    if (isLoading) {
        return (
            <Layout>
                <div className="flex h-screen items-center justify-center">
                    <div className="text-center">
                        <LoadingSpinner />
                        <p className="mt-4 text-xl font-medium text-gray-600">Loading your dashboard...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container mx-auto p-4 sm:p-6 space-y-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in-up">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                            Farmer Dashboard
                        </h1>
                        <p className="text-xl text-gray-600 font-medium mt-2">
                            Complete overview of your farm's performance and growth
                        </p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <Button asChild variant="outline" className="hover-lift animate-slide-in-right animate-stagger-1">
                            <Link to="/service-discovery" className="flex items-center gap-2">
                                <Tractor className="h-5 w-5" />
                                Find Services
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="hover-lift animate-slide-in-right animate-stagger-2">
                            <Link to="/find-experts" className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Consult Expert
                            </Link>
                        </Button>
                        <Dialog open={isAddCropOpen} onOpenChange={setIsAddCropOpen}>
                            <DialogTrigger asChild>
                                <Button className="btn-primary text-lg px-6 py-3 rounded-xl animate-slide-in-right animate-stagger-3">
                                    <Sprout className="h-5 w-5 mr-2" />
                                    Add New Crop
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="animate-scale-in">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-bold text-gray-800">Add a New Crop</DialogTitle>
                                    <DialogDescription className="text-lg text-gray-600">
                                        Enter details for your new planting to track its progress
                                    </DialogDescription>
                                </DialogHeader>
                                <AddNewCropForm 
                                    onSubmit={addCropMutation.mutate} 
                                    onClose={() => setIsAddCropOpen(false)} 
                                    isPending={addCropMutation.isPending} 
                                />
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <StatCard
                        title="Total Farm Income"
                        amount={summary?.totalIncome ?? 0}
                        color="text-green-600"
                        icon={TrendingUp}
                        index={0}
                    />
                    <StatCard
                        title="Total Farm Expenses"
                        amount={summary?.totalExpenses ?? 0}
                        color="text-red-500"
                        icon={DollarSign}
                        index={1}
                    />
                    <StatCard
                        title="Net Income"
                        amount={summary?.netIncome ?? 0}
                        color={summary?.netIncome && summary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}
                        icon={DollarSign}
                        index={2}
                    />
                </div>

                <Card className="card-animated animate-fade-in-up animate-stagger-4">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-white">
                        <CardTitle className="flex items-center space-x-2 text-2xl font-bold text-gray-800">
                            <Package className="h-6 w-6 text-green-600" />
                            <span>Quick Service Access</span>
                        </CardTitle>
                        <CardDescription className="text-lg text-gray-600">
                            Find nearby agricultural services with one click
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <ServiceButton to="/services/tractor" icon={Tractor} label="Tractor Owners" index={0} />
                            <ServiceButton to="/services/harvester" icon={Package} label="Harvesters" index={1} />
                            <ServiceButton to="/services/supplier" icon={Package} label="Suppliers" index={2} />
                            <ServiceButton to="/services/manufacturer" icon={Package} label="Manufacturers" index={3} />
                            <ServiceButton to="/interactive-map" icon={Package} label="Interactive Map" index={4} />
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="card-animated animate-fade-in-up animate-stagger-5">
                            <CardHeader className="bg-gradient-to-r from-green-50 to-white">
                                <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                    <Sprout className="h-6 w-6 text-green-600" />
                                    Active Crops
                                </CardTitle>
                                <CardDescription className="text-lg text-gray-600">
                                    Monitor your active crops' growth and expected harvest
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 p-6">
                                {crops.filter(c => c.status === 'active').length === 0 ? (
                                    <div className="text-center py-12">
                                        <Sprout className="h-16 w-16 text-green-400 mx-auto mb-4 animate-bounce" />
                                        <p className="text-xl text-gray-600 font-medium">
                                            No active crops yet. Add your first crop to start tracking!
                                        </p>
                                    </div>
                                ) : (
                                    crops.filter(c => c.status === 'active').map((crop, index) => {
                                        const { progress, daysRemaining } = calculateGrowth(crop.plantingDate);
                                        return (
                                            <Card
                                                key={crop.id}
                                                className={`p-6 bg-gradient-to-r from-green-50 to-white border-green-200 hover-lift animate-slide-in-left animate-stagger-${Math.min(index + 1, 5)}`}
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h4 className="font-bold text-xl text-gray-800 mb-1">{crop.name}</h4>
                                                        <p className="text-gray-600 font-medium">{crop.areaInAcres} acres planted</p>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => harvestCropMutation.mutate(crop.id)}
                                                        disabled={harvestCropMutation.isPending}
                                                        className="btn-primary border-0 hover-scale"
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-2"/>
                                                        Mark as Harvested
                                                    </Button>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between text-sm font-medium text-gray-600">
                                                        <span>Planted: {format(parseISO(crop.plantingDate), 'dd MMM, yyyy')}</span>
                                                        <span className="text-green-600">~{daysRemaining} days to harvest</span>
                                                    </div>
                                                    <Progress value={progress} className="h-3 progress-bar" />
                                                    <div className="text-right text-sm font-bold text-green-600">
                                                        {progress}% Complete
                                                    </div>
                                                </div>
                                            </Card>
                                        );
                                    })
                                )}
                            </CardContent>
                        </Card>

                        <Card className="card-animated animate-fade-in-up animate-stagger-6">
                            <CardHeader className="bg-gradient-to-r from-green-50 to-white">
                                <CardTitle className="text-2xl font-bold text-gray-800">Revenue Trends</CardTitle>
                                <CardDescription className="text-lg text-gray-600">
                                    Monthly income over the last 6 months
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={summary?.monthlyRevenue}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
                                        <YAxis tick={{ fill: '#6b7280' }} />
                                        <Tooltip 
                                            formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                                            contentStyle={{ 
                                                backgroundColor: '#f9fafb', 
                                                border: '1px solid #d1d5db',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="revenue" 
                                            stroke="#10b981" 
                                            strokeWidth={3} 
                                            activeDot={{ r: 8, fill: '#059669' }} 
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-8">
                        <Card className="card-animated animate-slide-in-right animate-stagger-1">
                            <CardHeader className="bg-gradient-to-r from-green-50 to-white">
                                <CardTitle className="text-xl font-bold text-gray-800">Expense Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie 
                                            data={expenseBreakdownData} 
                                            cx="50%" 
                                            cy="50%" 
                                            labelLine={false} 
                                            outerRadius={80} 
                                            fill="#8884d8" 
                                            dataKey="value" 
                                            nameKey="name"
                                        >
                                            {expenseBreakdownData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="card-animated animate-slide-in-right animate-stagger-2">
                            <CardHeader className="bg-gradient-to-r from-green-50 to-white">
                                <CardTitle className="text-xl font-bold text-gray-800">Recent Sales</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 p-6">
                                {expenses.filter(e => e.type === 'income').length === 0 ? (
                                    <div className="text-center py-8">
                                        <DollarSign className="h-12 w-12 text-green-400 mx-auto mb-3" />
                                        <p className="text-gray-600 font-medium">No income recorded yet</p>
                                    </div>
                                ) : (
                                    expenses.filter(e => e.type === 'income').slice(0, 4).map((sale, index) => (
                                       <div 
                                           key={sale._id} 
                                           className={`flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200 hover-lift animate-fade-in-up animate-stagger-${index + 1}`}
                                       >
                                            <div>
                                                <p className="font-semibold text-gray-800">{sale.title}</p>
                                                <p className="text-sm text-gray-600">{format(parseISO(sale.date), 'dd MMM, yyyy')}</p>
                                            </div>
                                            <p className="font-bold text-lg text-green-600">+₹{sale.amount.toLocaleString()}</p>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>

                        <div className="animate-slide-in-right animate-stagger-3">
                            <FarmerAIBot />
                        </div>
                    </div>
                </div>
            </div>
            <ScrollToTop />
        </Layout>
    );
};

export default FarmerDashboard;