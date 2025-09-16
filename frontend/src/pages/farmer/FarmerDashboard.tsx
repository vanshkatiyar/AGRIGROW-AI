import React, { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Sprout, CheckCircle, Users, Tractor, Bot, Package } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCrops, addCrop, harvestCrop } from '@/services/cropService';
import { getFinanceSummary, getExpenses, Expense, FinanceSummary } from '@/services/expenseService';
import { AddNewCropForm } from '@/components/farmer/AddNewCropForm';
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { format, differenceInDays, parseISO } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Crop, AddCropData } from '@/types';
import { Link } from 'react-router-dom';
import FarmerAIBot from '@/components/farmer/FarmerAIBot';

const FarmerDashboard = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isAddCropOpen, setIsAddCropOpen] = useState(false);

    // --- Data Fetching ---
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

    // --- Mutations ---
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
            toast({ title: "Crop Added!", description: "Your new crop is now being tracked." });
            setIsAddCropOpen(false);
        },
        onError: (err: any) => toast({ title: "Error", description: err.response?.data?.message || err.message, variant: 'destructive' }),
    });

    const harvestCropMutation = useMutation({
        mutationFn: harvestCrop,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['crops'] });
            toast({ title: "Crop Harvested!", description: "The crop has been moved to your records." });
        },
        onError: (err: any) => toast({ title: "Error", description: err.response?.data?.message || err.message, variant: 'destructive' }),
    });

    // --- Memoized Data for Charts ---
    const expenseBreakdownData = useMemo(() => {
        if (!summary?.expenseBreakdown) return [];
        return Object.entries(summary.expenseBreakdown).map(([name, value]) => ({ name, value }));
    }, [summary]);
    
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

    // --- Helper Functions ---
    const calculateGrowth = (plantingDateStr: string, daysToHarvest = 120) => {
        const plantingDate = parseISO(plantingDateStr); // Use parseISO for reliability
        const daysSincePlanted = differenceInDays(new Date(), plantingDate);
        const progress = Math.min(Math.round((daysSincePlanted / daysToHarvest) * 100), 100);
        const daysRemaining = Math.max(0, daysToHarvest - daysSincePlanted);
        return { progress, daysRemaining };
    };

    // --- Loading State ---
    const isLoading = isLoadingCrops || isLoadingSummary || isLoadingExpenses;
    if (isLoading) {
        return <Layout><div className="flex h-screen items-center justify-center"><LoadingSpinner size="lg"/></div></Layout>;
    }

    return (
        <Layout>
            <div className="container-responsive mx-auto p-4 sm:p-6 space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Farmer Dashboard</h1>
                        <p className="text-muted-foreground">A complete overview of your farm's performance.</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Button asChild variant="outline">
                            <Link to="/service-discovery"><Tractor className="h-4 w-4 mr-2" />Find Services</Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link to="/find-experts"><Users className="h-4 w-4 mr-2" />Consult Expert</Link>
                        </Button>
                        <Dialog open={isAddCropOpen} onOpenChange={setIsAddCropOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-green-600 hover:bg-green-700"><Sprout className="h-4 w-4 mr-2" />Add New Crop</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>Add a New Crop</DialogTitle><DialogDescription>Enter details for your new planting to track its progress.</DialogDescription></DialogHeader>
                                <AddNewCropForm onSubmit={addCropMutation.mutate} onClose={() => setIsAddCropOpen(false)} isPending={addCropMutation.isPending} />
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card key="income-card"><CardHeader><CardTitle>Total Farm Income</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-green-600">₹{summary?.totalIncome?.toLocaleString() ?? 0}</p></CardContent></Card>
                    <Card key="expenses-card"><CardHeader><CardTitle>Total Farm Expenses</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-red-500">₹{summary?.totalExpenses?.toLocaleString() ?? 0}</p></CardContent></Card>
                    <Card key="net-income-card"><CardHeader><CardTitle>Net Income</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">₹{summary?.netIncome?.toLocaleString() ?? 0}</p></CardContent></Card>
                </div>

                {/* Quick Service Access */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Package className="h-5 w-5" />
                            <span>Quick Service Access</span>
                        </CardTitle>
                        <CardDescription>Find nearby agricultural services with one click</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Button asChild variant="outline" className="h-20 flex-col space-y-2">
                                <Link to="/services/tractor">
                                    <Tractor className="h-6 w-6" />
                                    <span className="text-sm">Tractor Owners</span>
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="h-20 flex-col space-y-2">
                                <Link to="/services/harvester">
                                    <Package className="h-6 w-6" />
                                    <span className="text-sm">Harvesters</span>
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="h-20 flex-col space-y-2">
                                <Link to="/services/supplier">
                                    <Package className="h-6 w-6" />
                                    <span className="text-sm">Suppliers</span>
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="h-20 flex-col space-y-2">
                                <Link to="/services/manufacturer">
                                    <Package className="h-6 w-6" />
                                    <span className="text-sm">Manufacturers</span>
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="h-20 flex-col space-y-2">
                                <Link to="/interactive-map">
                                    <Package className="h-6 w-6" /> {/* Using Package icon for now, can be changed */}
                                    <span className="text-sm">Interactive Map</span>
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader><CardTitle>Active Crops</CardTitle><CardDescription>Monitor your active crops' growth and expected harvest.</CardDescription></CardHeader>
                            <CardContent className="space-y-4">
                                {crops.filter(c => c.status === 'active').length === 0 ? (
                                    <p className="text-center text-muted-foreground py-8">No active crops. Add one to get started!</p>
                                ) : (
                                    crops.filter(c => c.status === 'active').map((crop) => {
                                        const { progress, daysRemaining } = calculateGrowth(crop.plantingDate);
                                        return (
                                            <Card key={crop.id} className="p-4 bg-muted/20">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-semibold text-lg">{crop.name}</h4>
                                                        <p className="text-sm text-muted-foreground">{crop.areaInAcres} acres</p>
                                                    </div>
                                                    <Button size="sm" variant="outline" onClick={() => harvestCropMutation.mutate(crop.id)} disabled={harvestCropMutation.isPending}><CheckCircle className="h-4 w-4 mr-2"/>Mark as Harvested</Button>
                                                </div>
                                                <div className="mt-4 space-y-1">
                                                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                                        <span>Planted: {format(parseISO(crop.plantingDate), 'dd MMM, yyyy')}</span>
                                                        <span>~{daysRemaining} days to harvest</span>
                                                    </div>
                                                    <Progress value={progress} />
                                                </div>
                                            </Card>
                                        )
                                    })
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle>Revenue Trends</CardTitle><CardDescription>Monthly income over the last 6 months.</CardDescription></CardHeader>
                            <CardContent><ResponsiveContainer width="100%" height={300}><LineChart data={summary?.monthlyRevenue}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} /><Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} activeDot={{ r: 8 }} /></LineChart></ResponsiveContainer></CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader><CardTitle>Expense Breakdown</CardTitle></CardHeader>
                            <CardContent><ResponsiveContainer width="100%" height={250}><PieChart><Pie data={expenseBreakdownData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" nameKey="name">{expenseBreakdownData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} /><Legend /></PieChart></ResponsiveContainer></CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle>Recent Sales</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                {expenses.filter(e => e.type === 'income').length === 0 ? (
                                    <p className="text-sm text-center text-muted-foreground">No income recorded yet.</p>
                                ) : (
                                    expenses.filter(e => e.type === 'income').slice(0, 4).map(sale => (
                                       <div key={sale._id} className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-sm">{sale.title}</p>
                                                <p className="text-xs text-muted-foreground">{format(parseISO(sale.date), 'dd MMM, yyyy')}</p>
                                            </div>
                                            <p className="font-medium text-sm text-green-600">+₹{sale.amount.toLocaleString()}</p>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>

                        {/* AI Assistant */}
                        <FarmerAIBot />
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default FarmerDashboard;