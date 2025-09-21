import React, { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getExpenses, addExpense, deleteExpense, Expense } from '@/services/expenseService';
import { AddExpenseForm } from '@/components/expenses/AddExpenseForm';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import ScrollToTop from '@/components/common/ScrollToTop';
import { useToast } from '@/hooks/use-toast';
import { Wallet, TrendingUp, TrendingDown, Plus, Trash2, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import '../styles/animations.css';

const ExpenseTrackerPage = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const { data: expenses = [], isLoading, isError } = useQuery<Expense[]>({
        queryKey: ['expenses'],
        queryFn: getExpenses,
    });
    
    const addMutation = useMutation({
        mutationFn: addExpense,
        onSuccess: () => { 
            queryClient.invalidateQueries({ queryKey: ['expenses'] }); 
            toast({ title: "✅ Transaction Added!", description: "Your transaction has been recorded successfully." }); 
            setIsAddDialogOpen(false); 
        },
        onError: (err) => toast({ title: "❌ Error", description: err.message, variant: 'destructive' }),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteExpense,
        onSuccess: () => { 
            queryClient.invalidateQueries({ queryKey: ['expenses'] }); 
            toast({ title: "🗑️ Transaction Deleted!", description: "Transaction removed from records." }); 
            setDeletingId(null); 
        },
        onError: (err) => toast({ title: "❌ Error", description: err.message, variant: 'destructive' }),
    });

    const summary = useMemo(() => {
        return expenses.reduce((acc, curr) => {
            if (curr.type === 'income') acc.totalIncome += curr.amount;
            else acc.totalExpense += curr.amount;
            acc.netBalance = acc.totalIncome - acc.totalExpense;
            return acc;
        }, { totalIncome: 0, totalExpense: 0, netBalance: 0 });
    }, [expenses]);
    
    const categoryData = useMemo(() => {
        const categoryMap = expenses
            .filter(e => e.type === 'expense')
            .reduce((acc, curr) => {
                acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
                return acc;
            }, {} as Record<string, number>);
        return Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
    }, [expenses]);

    const COLORS = ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#16a34a'];

    const StatCard = ({ title, amount, icon: Icon, trend, color, index }: {
        title: string;
        amount: number;
        icon: any;
        trend?: number;
        color: string;
        index: number;
    }) => (
        <Card className={`card-animated hover-glow animate-scale-in animate-stagger-${index + 1}`}>
            <CardHeader className="bg-gradient-to-r from-green-50 to-white">
                <CardTitle className={`flex items-center justify-between text-lg font-bold ${color}`}>
                    {title}
                    <Icon className="h-6 w-6" />
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <p className={`text-3xl font-bold mb-2 ${color}`}>
                    ₹{amount.toLocaleString()}
                </p>
                {trend !== undefined && (
                    <div className={`text-sm flex items-center ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        <TrendingUp className={`h-4 w-4 mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
                        {Math.abs(trend)}% from last month
                    </div>
                )}
            </CardContent>
        </Card>
    );

    return (
        <Layout>
            <div className="container mx-auto p-4 sm:p-6 space-y-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in-up">
                    <div>
                        <h1 className="text-4xl font-bold flex items-center gap-3 bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                            <Wallet className="h-10 w-10 text-green-600" />
                            Expense Tracker
                        </h1>
                        <p className="text-xl text-gray-600 font-medium mt-2">
                            Monitor your farm's financial health with detailed insights
                        </p>
                    </div>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="btn-primary text-lg px-6 py-3 rounded-xl animate-slide-in-right">
                                <Plus className="h-5 w-5 mr-2" />
                                Add Transaction
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md mx-auto animate-scale-in">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold text-gray-800">Add New Transaction</DialogTitle>
                            </DialogHeader>
                            <AddExpenseForm
                                onSubmit={(data) => {
                                    addMutation.mutate({
                                        ...data,
                                        date: data.date.toISOString(),
                                    } as Omit<Expense, '_id'>);
                                }}
                                onClose={() => setIsAddDialogOpen(false)}
                                isPending={addMutation.isPending}
                            />
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <StatCard
                        title="Total Income"
                        amount={summary.totalIncome}
                        icon={TrendingUp}
                        trend={12}
                        color="text-green-600"
                        index={0}
                    />
                    <StatCard
                        title="Total Expenses"
                        amount={summary.totalExpense}
                        icon={TrendingDown}
                        trend={-5}
                        color="text-red-500"
                        index={1}
                    />
                    <StatCard
                        title="Net Balance"
                        amount={summary.netBalance}
                        icon={DollarSign}
                        color={summary.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}
                        index={2}
                    />
                </div>
                
                <div className="grid gap-8 lg:grid-cols-5">
                    <Card className="lg:col-span-3 card-animated animate-fade-in-up animate-stagger-3">
                        <CardHeader className="bg-gradient-to-r from-green-50 to-white">
                            <CardTitle className="text-2xl font-bold text-gray-800">Recent Transactions</CardTitle>
                            <CardDescription className="text-lg text-gray-600">
                                Your latest financial activities
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            {isLoading ? (
                                <div className="flex justify-center h-40">
                                    <LoadingSpinner />
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-green-50">
                                                <TableHead className="font-bold text-gray-800">Title</TableHead>
                                                <TableHead className="font-bold text-gray-800">Category</TableHead>
                                                <TableHead className="font-bold text-gray-800">Date</TableHead>
                                                <TableHead className="text-right font-bold text-gray-800">Amount</TableHead>
                                                <TableHead className="font-bold text-gray-800">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {expenses.slice(0, 10).map((exp, index) => (
                                                <TableRow 
                                                    key={exp._id}
                                                    className={`hover:bg-green-50 transition-colors duration-200 animate-slide-in-left animate-stagger-${Math.min(index + 1, 5)}`}
                                                >
                                                    <TableCell className="font-semibold text-gray-800">{exp.title}</TableCell>
                                                    <TableCell>
                                                        <Badge 
                                                            variant="outline" 
                                                            className="bg-green-100 text-green-700 border-green-300 font-medium"
                                                        >
                                                            {exp.category}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-gray-600">
                                                        {format(new Date(exp.date), 'dd MMM, yyyy')}
                                                    </TableCell>
                                                    <TableCell className={`text-right font-bold text-lg ${
                                                        exp.type === 'income' ? 'text-green-600' : 'text-red-500'
                                                    }`}>
                                                        {exp.type === 'income' ? '+' : '-'}₹{exp.amount.toLocaleString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm" 
                                                            onClick={() => setDeletingId(exp._id)}
                                                            className="hover:bg-red-100 hover:text-red-600 transition-colors duration-200"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    
                    <Card className="lg:col-span-2 card-animated animate-fade-in-up animate-stagger-4">
                        <CardHeader className="bg-gradient-to-r from-green-50 to-white">
                            <CardTitle className="text-2xl font-bold text-gray-800">Expense Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie 
                                        data={categoryData} 
                                        cx="50%" 
                                        cy="50%" 
                                        labelLine={false} 
                                        outerRadius={80} 
                                        fill="#8884d8" 
                                        dataKey="value" 
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
                    <AlertDialogContent className="animate-scale-in">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-2xl font-bold text-gray-800">
                                Delete Transaction?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-lg text-gray-600">
                                This action cannot be undone. This will permanently delete the transaction from your records.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="gap-3">
                            <AlertDialogCancel className="px-6 py-2 rounded-lg">Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                                onClick={() => deleteMutation.mutate(deletingId!)} 
                                className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded-lg text-white font-semibold"
                            >
                                Delete Transaction
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
            <ScrollToTop />
        </Layout>
    );
};

export default ExpenseTrackerPage;