import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getExpertStats } from '@/services/expertService';
import { getArticlesByAuthor } from '@/services/articleService';
import { getConsultationRequests, updateConsultationStatus } from '@/services/consultationService'; // Import consultation services
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText, Users, Clock, DollarSign, Star, Heart, MessageSquare, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react'; // Import necessary icons
import { format } from 'date-fns';
import { Article, Consultation } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Import Avatar
import { Badge } from '@/components/ui/badge'; // Import Badge
import { LoadingSpinner } from '@/components/common/LoadingSpinner'; // Import LoadingSpinner
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // Import Alert
import { useToast } from '@/hooks/use-toast'; // Import useToast

const Skeleton = ({ className }: { className?: string }) => (<div className={`animate-pulse rounded-md bg-muted ${className}`} />);

const ExpertDashboard = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: statsData, isLoading: isLoadingStats } = useQuery({
        queryKey: ['expertStats', user?.id],
        queryFn: getExpertStats,
        enabled: !!user,
    });

    const { data: articles = [], isLoading: isLoadingArticles } = useQuery<Article[]>({
        queryKey: ['expertArticles', user?.id],
        queryFn: () => getArticlesByAuthor(user!.id),
        enabled: !!user,
    });

    // --- Data fetching for pending requests ---
    const { 
        data: consultationRequests = [], 
        isLoading: isLoadingRequests,
        isError: isErrorRequests,
        error: errorRequests,
    } = useQuery<Consultation[]>({
        queryKey: ['consultationRequests', user?.id],
        queryFn: getConsultationRequests,
        enabled: !!user,
    });
    
    // --- Mutation for updating status ---
    const statusUpdateMutation = useMutation({
        mutationFn: updateConsultationStatus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['consultationRequests'] });
            queryClient.invalidateQueries({ queryKey: ['expertStats'] });
            toast({ title: "Request Accepted!" });
        },
        onError: (err: any) => toast({ title: "Error", description: err.message, variant: 'destructive' }),
    });

    const handleAccept = (consultationId: string) => {
        statusUpdateMutation.mutate({ consultationId, status: 'accepted' });
    };

    const stats = [
        { label: 'Total Consultations', value: statsData?.totalConsultations ?? 0, icon: Users, color: 'text-blue-600' },
        { label: 'Active Clients', value: statsData?.activeClients ?? 0, icon: Clock, color: 'text-green-600' },
        { label: 'Monthly Earnings', value: `₹${(statsData?.monthlyEarnings ?? 0).toLocaleString()}`, icon: DollarSign, color: 'text-purple-600' },
        { label: 'Average Rating', value: (statsData?.averageRating ?? 0).toFixed(1), icon: Star, color: 'text-yellow-600' }
    ];

    const urgencyColors: { [key: string]: string } = {
        low: 'text-green-600 bg-green-50 dark:bg-green-950/20',
        medium: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20',
        high: 'text-orange-600 bg-orange-50 dark:bg-orange-950/20',
        critical: 'text-red-600 bg-red-50 dark:bg-red-950/20'
    };
    
    const renderRequests = () => {
        if (isLoadingRequests) return <div className="flex justify-center p-8"><LoadingSpinner /></div>;
        if (isErrorRequests) return <Alert variant="destructive" className="mx-6"><AlertTriangle className="h-4 w-4" /><AlertTitle>Failed to load requests</AlertTitle><AlertDescription>{(errorRequests as any)?.message || "An error occurred."}</AlertDescription></Alert>;
        if (consultationRequests.length === 0) return <p className="text-center text-muted-foreground py-8">No pending requests at the moment.</p>;
        
        return consultationRequests.map((consultation) => (
            <div key={consultation.id} className="border-b last:border-b-0 px-6 py-4">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                    <div className="flex items-start gap-3"><Avatar className="h-10 w-10"><AvatarImage src={consultation.farmer.profileImage} /><AvatarFallback>{consultation.farmer.name.charAt(0)}</AvatarFallback></Avatar><div><h4 className="font-semibold">{consultation.farmer.name}</h4><p className="text-sm text-muted-foreground">{consultation.farmer.location} • {consultation.cropType}</p><p className="text-sm mt-1">{consultation.issue}</p></div></div>
                    <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto"><Badge className={urgencyColors[consultation.urgency]}>{consultation.urgency}</Badge><div className="flex items-center justify-end gap-2 w-full"><Button size="sm" variant="outline"><AlertCircle className="h-4 w-4 mr-1" />Details</Button><Button size="sm" onClick={() => handleAccept(consultation._id)} disabled={statusUpdateMutation.isPending}><CheckCircle className="h-4 w-4 mr-1" />Accept</Button></div></div>
                </div>
            </div>
        ));
    };

    return (
        <Layout>
            <div className="container mx-auto p-4 sm:p-6 space-y-6">
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-xl p-6"><div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"><div><h1 className="text-3xl font-bold text-foreground">Expert Dashboard</h1><p className="text-muted-foreground mt-1">Welcome back, {user?.name}!</p></div><Button asChild className="bg-orange-600 hover:bg-orange-700"><Link to="/create-article"><FileText className="h-4 w-4 mr-2" />Write Article</Link></Button></div></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{stats.map((stat, index) => (<Card key={index}><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">{stat.label}</p>{isLoadingStats ? <Skeleton className="h-8 w-24 mt-1" /> : <p className="text-2xl font-bold">{stat.value}</p>}</div><stat.icon className={`h-8 w-8 ${stat.color}`} /></div></CardContent></Card>))}</div>
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <Card><CardHeader><CardTitle>Revenue Trends</CardTitle><CardDescription>Monthly earnings from consultations</CardDescription></CardHeader><CardContent>{isLoadingStats ? <div className="h-[300px] flex items-center justify-center"><Skeleton className="h-full w-full" /></div> : <ResponsiveContainer width="100%" height={300}><LineChart data={statsData?.monthlyRevenue}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" fontSize={12} /><YAxis fontSize={12} tickFormatter={(value) => `₹${value}`} /><Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} /><Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} /></LineChart></ResponsiveContainer>}</CardContent></Card>

                        {/* --- THIS IS THE MISSING SECTION, NOW ADDED BACK --- */}
                        <Card>
                            <CardHeader><CardTitle>Pending Consultation Requests</CardTitle><CardDescription>Manage incoming farmer consultation requests.</CardDescription></CardHeader>
                            <CardContent className="p-0">{renderRequests()}</CardContent>
                        </Card>
                    </div>
                    <div className="md:col-span-1 space-y-6">
                        <Card><CardHeader><CardTitle>Knowledge Base</CardTitle><CardDescription>Your published articles</CardDescription></CardHeader><CardContent className="space-y-4">{isLoadingArticles ? <Skeleton className="h-20 w-full" /> : articles.length === 0 ? <p className="text-sm text-center text-muted-foreground py-4">You haven't published any articles yet.</p> : articles.slice(0, 4).map(article => (<div key={article._id} className="border-b last:border-b-0 pb-3"><h5 className="font-semibold text-sm line-clamp-2">{article.title}</h5><div className="flex items-center justify-between text-xs text-muted-foreground mt-2"><span>{format(new Date(article.createdAt), 'dd MMM, yyyy')}</span><div className="flex items-center gap-3"><span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {article.likes.length}</span><span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {article.comments.length}</span></div></div></div>))}</CardContent></Card>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ExpertDashboard;