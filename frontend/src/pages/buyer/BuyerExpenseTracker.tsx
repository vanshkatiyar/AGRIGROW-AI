// This is the new, dedicated page for buyers
import React, { useState, useMemo } from 'react';
// ... (All other imports are the same as the old ExpenseTrackerPage)
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getExpenses, addExpense, deleteExpense, Expense } from '@/services/expenseService';
import { AddBuyerExpenseForm } from '@/components/expenses/AddBuyerExpenseForm'; // Use the buyer form
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { Wallet, TrendingUp, TrendingDown, Plus, Trash2 } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';


const BuyerExpenseTracker = () => {
    // This component's logic is identical to the old ExpenseTrackerPage,
    // but it imports and uses the AddBuyerExpenseForm.
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const { data: expenses = [], isLoading } = useQuery<Expense[]>({ queryKey: ['expenses'], queryFn: getExpenses });
    
        const addMutation = useMutation({
            mutationFn: addExpense,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['expenses'] });
                toast({ title: "Transaction added!" });
                setIsAddDialogOpen(false);
            },
            onError: (err) => toast({ title: "Error", description: err.message, variant: 'destructive' })
        });
    const deleteMutation = useMutation({ mutationFn: deleteExpense, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['expenses'] }); toast({ title: "Transaction deleted!" }); setDeletingId(null); }, onError: (err) => toast({ title: "Error", description: err.message, variant: 'destructive' }) });

    const summary = useMemo(() => expenses.reduce((acc, curr) => { if (curr.type === 'income') acc.totalRevenue += curr.amount; else acc.totalCosts += curr.amount; acc.netProfit = acc.totalRevenue - acc.totalCosts; return acc; }, { totalRevenue: 0, totalCosts: 0, netProfit: 0 }), [expenses]);
    const categoryData = useMemo(() => { const map = expenses.filter(e => e.type === 'expense').reduce((acc, curr) => { acc[curr.category] = (acc[curr.category] || 0) + curr.amount; return acc; }, {} as Record<string, number>); return Object.entries(map).map(([name, value]) => ({ name, value })); }, [expenses]);
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <Layout>
            <div className="container mx-auto p-4 sm:p-6 space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div><h1 className="text-3xl font-bold flex items-center gap-2"><Wallet /> Business Finances</h1><p className="text-muted-foreground">Track your revenue from sales and business costs.</p></div>
                                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button><Plus className="h-4 w-4 mr-2" /> Add Transaction</Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader><DialogTitle>Add New Transaction</DialogTitle></DialogHeader>
                                                <AddBuyerExpenseForm
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
                <div className="grid gap-4 md:grid-cols-3">
                    <Card><CardHeader><CardTitle className="flex items-center justify-between text-green-500">Total Revenue <TrendingUp/></CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">₹{summary.totalRevenue.toLocaleString()}</p></CardContent></Card>
                    <Card><CardHeader><CardTitle className="flex items-center justify-between text-red-500">Total Costs <TrendingDown/></CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">₹{summary.totalCosts.toLocaleString()}</p></CardContent></Card>
                    <Card><CardHeader><CardTitle className="flex items-center justify-between">Net Profit <Wallet/></CardTitle></CardHeader><CardContent><p className={`text-2xl font-bold ${summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>₹{summary.netProfit.toLocaleString()}</p></CardContent></Card>
                </div>
                <div className="grid gap-6 lg:grid-cols-5">
                                        <Card className="lg:col-span-3">
                                            <CardHeader><CardTitle>Recent Transactions</CardTitle></CardHeader>
                                            <CardContent>
                                                {isLoading ? (
                                                    <div className="flex justify-center h-40"><LoadingSpinner /></div>
                                                ) : (
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Title</TableHead>
                                                                <TableHead>Category</TableHead>
                                                                <TableHead>Date</TableHead>
                                                                <TableHead className="text-right">Amount</TableHead>
                                                                <TableHead></TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {expenses.slice(0, 10).map(exp => (
                                                                <TableRow key={exp._id}>
                                                                    <TableCell className="font-medium">{exp.title}</TableCell>
                                                                    <TableCell><Badge variant="outline">{exp.category}</Badge></TableCell>
                                                                    <TableCell>{format(new Date(exp.date), 'dd MMM, yyyy')}</TableCell>
                                                                    <TableCell className={`text-right font-semibold ${exp.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                                                                        {exp.type === 'income' ? '+' : '-'}₹{exp.amount.toLocaleString()}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Button variant="ghost" size="icon" onClick={() => setDeletingId(exp._id)}>
                                                                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                                                                        </Button>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                )}
                                            </CardContent>
                                        </Card>
                    <Card className="lg:col-span-2"><CardHeader><CardTitle>Cost Breakdown</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={300}><PieChart><Pie data={categoryData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>{categoryData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`}/></PieChart></ResponsiveContainer></CardContent></Card>
                </div>
                <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete this transaction.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteMutation.mutate(deletingId!)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
            </div>
        </Layout>
    );
};
export default BuyerExpenseTracker;