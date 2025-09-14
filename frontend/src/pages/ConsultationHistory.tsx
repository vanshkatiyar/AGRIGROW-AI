import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { getConsultationHistory } from '@/services/consultationService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Clock } from 'lucide-react';
import { Consultation } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils'; // <-- THIS IS THE FIX: Import the 'cn' utility

const ConsultationHistory = () => {
    const { user } = useAuth();
    const { data: history = [], isLoading, isError, error } = useQuery<Consultation[]>({
        queryKey: ['consultationHistory', user?.id],
        queryFn: getConsultationHistory,
        enabled: !!user,
    });

    const statusColors: { [key: string]: string } = {
        accepted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        completed: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        rejected: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        'in-progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    };

    const renderContent = () => {
        if (isLoading) {
            return <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>;
        }
        if (isError) {
            return (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{(error as any)?.message || "Failed to load history."}</AlertDescription>
                </Alert>
            );
        }
        if (history.length === 0) {
            return <p className="text-center text-muted-foreground py-12">You have no past consultations.</p>;
        }
        return history.map((item) => {
            const otherParty = user?.role === 'farmer' ? item.expert : item.farmer;
            return (
                <Card key={item.id}>
                    <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex gap-4">
                            <Avatar className="h-12 w-12 hidden sm:flex">
                                <AvatarImage src={otherParty.profileImage} />
                                <AvatarFallback>{otherParty.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    {user?.role === 'farmer' ? 'Expert' : 'Farmer'}: <span className="font-semibold text-foreground">{otherParty.name}</span>
                                </p>
                                <p className="font-medium mt-1">Issue: {item.issue}</p>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Last updated: {format(new Date(item.updatedAt), 'dd MMM, yyyy')}
                                </p>
                            </div>
                        </div>
                        {/* The 'cn' function is used here */}
                        <Badge className={cn("capitalize", statusColors[item.status])}>
                            {item.status.replace('-', ' ')}
                        </Badge>
                    </CardContent>
                </Card>
            );
        });
    };

    return (
        <Layout>
            <div className="container mx-auto p-4 sm:p-6 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Clock /> Consultation History</CardTitle>
                        <CardDescription>A record of all your past consultations.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {renderContent()}
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
};

export default ConsultationHistory;