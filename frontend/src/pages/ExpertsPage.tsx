import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { bookConsultation } from '@/services/consultationService'; 
import { getExperts } from '@/services/userService'; // <-- IMPORT THE REAL SERVICE
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { User } from '@/types';

const ExpertsPage = () => {
    const { toast } = useToast();
    const [selectedExpert, setSelectedExpert] = useState<User | null>(null);
    const [issue, setIssue] = useState('');
    const [crop, setCrop] = useState('');

    // --- THIS NOW FETCHES REAL DATA ---
    const { data: experts = [], isLoading } = useQuery<User[]>({ 
        queryKey: ['experts'], 
        queryFn: getExperts 
    });

    const mutation = useMutation({
        mutationFn: bookConsultation,
        onSuccess: () => {
            toast({ title: "Success!", description: `Your consultation request has been sent to ${selectedExpert?.name}.` });
            setSelectedExpert(null);
            setIssue('');
            setCrop('');
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.response?.data?.message || "Could not book consultation.", variant: "destructive" });
        },
    });

    const handleSubmit = () => {
        if (issue && crop && selectedExpert) {
            mutation.mutate({ expertId: selectedExpert._id, issue, cropType: crop });
        } else {
            toast({ title: "Missing Information", description: "Please describe your issue and the crop type.", variant: "destructive" });
        }
    };

    return (
        <Layout>
            <div className="container mx-auto p-4 sm:p-6 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Find an Expert</CardTitle>
                        <CardDescription>Book a one-on-one consultation with a registered agricultural expert.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div> :
                        experts.length === 0 ? <p className="text-center text-muted-foreground py-12">No experts are currently available.</p> :
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {experts.map(expert => (
                                <Card key={expert._id}>
                                    <CardContent className="p-6 text-center">
                                        <Avatar className="h-24 w-24 mx-auto mb-4">
                                            <AvatarImage src={expert.profileImage} />
                                            <AvatarFallback className="text-3xl">{expert.name?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <h3 className="text-xl font-semibold">{expert.name}</h3>
                                        <p className="text-muted-foreground">{expert.location}</p>
                                        {/* Use the new expertDetails field */}
                                        <p className="text-sm mt-2 h-10">{expert.expertDetails?.specializations?.join(', ')}</p>
                                        <Button className="mt-4 w-full" onClick={() => setSelectedExpert(expert)}>Book Consultation</Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>}
                    </CardContent>
                </Card>

                <Dialog open={!!selectedExpert} onOpenChange={() => setSelectedExpert(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Request Consultation with {selectedExpert?.name}</DialogTitle>
                            <DialogDescription>Fill out the details below to submit your request.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2"><Label htmlFor="crop-type">Crop Type</Label><Input id="crop-type" placeholder="e.g., Wheat" value={crop} onChange={(e) => setCrop(e.target.value)} /></div>
                            <div className="space-y-2"><Label htmlFor="issue-description">Describe your issue</Label><Textarea id="issue-description" placeholder="Describe the problem..." value={issue} onChange={(e) => setIssue(e.target.value)} /></div>
                            <Button onClick={handleSubmit} disabled={mutation.isPending} className="w-full">{mutation.isPending ? "Sending..." : "Send Request"}</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </Layout>
    );
};

export default ExpertsPage;