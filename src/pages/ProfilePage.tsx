import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import { getUserProfile, updateUserProfile } from '@/services/userService';
import { EditProfileForm } from '@/components/profile/EditProfileForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { MapPin, Mail, Briefcase, Award, UserPlus, Edit, Rss } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const ProfilePage = () => {
    const { userId } = useParams<{ userId: string }>();
    const { user: loggedInUser } = useAuth();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    const { data: profile, isLoading, isError } = useQuery({
        queryKey: ['userProfile', userId],
        queryFn: () => getUserProfile(userId!),
        enabled: !!userId,
    });

    const updateMutation = useMutation({
        mutationFn: updateUserProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });
            toast({ title: "Profile updated successfully!" });
            setIsEditDialogOpen(false);
        },
        onError: (err) => toast({ title: "Error", description: err.message, variant: 'destructive' }),
    });

    if (isLoading) return <Layout><div className="flex justify-center items-center h-screen"><LoadingSpinner size="lg" /></div></Layout>;
    if (isError || !profile) return <Layout><div className="text-center p-12">Could not load user profile.</div></Layout>;
    
    const isOwnProfile = loggedInUser?.id === profile._id;

    const renderRoleSpecificData = () => { /* ... (same function as before) ... */ };

    return (
        <Layout>
            <div className="container mx-auto p-4 sm:p-6 space-y-6">
                <Card className="overflow-hidden">
                    <div className="relative h-48 bg-muted">
                        <img src={profile.coverPhoto} alt="Cover" className="h-full w-full object-cover" />
                        <div className="absolute -bottom-12 left-6">
                            <Avatar className="h-28 w-28 border-4 border-background bg-muted">
                                <AvatarImage src={profile.profileImage} />
                                <AvatarFallback className="text-4xl">{profile.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                    <CardContent className="pt-16 pb-6 px-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div>
                                <h1 className="text-3xl font-bold">{profile.name}</h1>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="secondary" className="capitalize">{profile.role}</Badge>
                                    {profile.verified && <Badge><Award className="h-3 w-3 mr-1"/>Verified</Badge>}
                                </div>
                                <p className="text-muted-foreground mt-2 max-w-xl">{profile.bio || "This user hasn't written a bio yet."}</p>
                            </div>
                            <div>
                                {isOwnProfile ? (
                                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                                        <DialogTrigger asChild><Button variant="outline"><Edit className="h-4 w-4 mr-2"/>Edit Profile</Button></DialogTrigger>
                                        <DialogContent><DialogHeader><DialogTitle>Edit Your Profile</DialogTitle></DialogHeader><EditProfileForm onSubmit={updateMutation.mutate} onClose={() => setIsEditDialogOpen(false)} isPending={updateMutation.isPending} /></DialogContent>
                                    </Dialog>
                                ) : (
                                    <div className="flex gap-2"><Button><UserPlus className="h-4 w-4 mr-2" /> Follow</Button><Button variant="outline">Message</Button></div>
                                )}
                            </div>
                        </div>
                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t text-sm text-muted-foreground">
                            <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {profile.location}</div>
                            <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> {profile.email}</div>
                            <div className="flex items-center gap-2"><Briefcase className="h-4 w-4" /> Joined {format(new Date(profile.createdAt), 'MMMM yyyy')}</div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">{renderRoleSpecificData()}</div>
                    <div><Card><CardHeader><CardTitle className="flex items-center gap-2"><Rss/>Activity</CardTitle></CardHeader><CardContent className="space-y-4"><div className="flex items-center justify-between"><span className="text-muted-foreground">Followers</span><span className="font-bold">150</span></div><div className="flex items-center justify-between"><span className="text-muted-foreground">Following</span><span className="font-bold">80</span></div></CardContent></Card></div>
                </div>
            </div>
        </Layout>
    );
};

export default ProfilePage;