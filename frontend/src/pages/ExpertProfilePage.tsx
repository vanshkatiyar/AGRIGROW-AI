import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { bookConsultation } from '@/services/consultationService';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

// This is a simplified example component.
// The `expertId` would come from the page params or props.
const ExpertProfilePage = ({ expertId, expertName }: { expertId: string; expertName: string }) => {
    const { toast } = useToast();
    const [issue, setIssue] = useState('');
    const [crop, setCrop] = useState('');

    const mutation = useMutation({
        mutationFn: bookConsultation,
        onSuccess: () => {
            toast({ title: "Success!", description: "Your consultation request has been sent." });
            // Close dialog, reset form, etc.
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.response?.data?.message || "Could not book consultation.", variant: "destructive" });
        },
    });

    const handleSubmit = () => {
        if (issue && crop) {
            mutation.mutate({ expertId, issue, cropType: crop });
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>Book Consultation with {expertName}</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader><DialogTitle>Request a Consultation</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Crop Type</Label>
                        <Input placeholder="e.g., Wheat" value={crop} onChange={(e) => setCrop(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Describe your issue</Label>
                        <Textarea placeholder="Describe the problem you are facing with your crop..." value={issue} onChange={(e) => setIssue(e.target.value)} />
                    </div>
                    <Button onClick={handleSubmit} disabled={mutation.isPending} className="w-full">
                        {mutation.isPending ? "Sending Request..." : "Send Request"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ExpertProfilePage;