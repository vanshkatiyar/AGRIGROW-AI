import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import { getUserProfile, updateUserProfile } from '@/services/userService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { EditProfileForm } from '@/components/profile/EditProfileForm';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { MapPin, Mail, Briefcase, Award, UserPlus, Edit, Sprout, ShoppingCart, GraduationCap } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const ProfilePage = () => {
    const { userId } = useParams<{ userId: string }>();
    const { user: loggedInUser } = useAuth();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    const { data: profileData, isLoading, isError } = useQuery({
        queryKey: ['userProfile', userId],
        queryFn: () => getUserProfile(userId!),
        enabled: !!userId,
    });

    const updateMutation = useMutation({
        mutationFn: updateUserProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });
            setIsEditDialogOpen(false);
            toast({ title: "Profile updated successfully!" });
        },
        onError: (err) => toast({ title: "Error", description: err.message, variant: 'destructive' }),
    });

    if (isLoading) return <Layout><div className="flex justify-center items-center h-screen"><LoadingSpinner size="lg" /></div></Layout>;
    if (isError || !profileData) return <Layout><div className="text-center p-12">Could not load user profile.</div></Layout>;

    const isOwnProfile = loggedInUser?.id === profileData._id;

    const renderRoleSpecificCard = () => {
        switch (profileData.role) {
            case 'farmer': return <Card><CardHeader><CardTitle className="flex items-center gap-2"><Sprout/>Farm Details</CardTitle></CardHeader><CardContent><p>Crops: Wheat, Rice</p></CardContent></Card>;
            case 'buyer': return <Card><CardHeader><CardTitle className="flex items-center gap-2"><ShoppingCart/>Business Info</CardTitle></CardHeader><CardContent><p>Company: Arjun Traders</p></CardContent></Card>;
            case 'expert': return <Card><CardHeader><CardTitle className="flex items-center gap-2"><GraduationCap/>Expertise</CardTitle></CardHeader><CardContent><p>Specialization: Crop Diseases</p></CardContent></Card>;
            default: return null;
        }
    };

    return (
        <Layout>
            <div className="container mx-auto p-4 sm:p-6 space-y-6">
                <Card className="overflow-hidden">
                    <div className="h-48 bg-cover bg-center relative" style={{ backgroundImage: `url(${profileData.coverPhoto})` }}>
                        <Avatar className="h-32 w-32 border-4 border-card absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                            <AvatarImage src={profileData.profileImage} />
                            <AvatarFallback className="text-4xl">{profileData.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </div>
                    <CardContent className="pt-20 pb-6 text-center">
                        <h1 className="text-3xl font-bold">{profileData.name}</h1>
                        <div className="flex items-center justify-center gap-2 mt-2">
                            <Badge variant="secondary" className="capitalize">{profileData.role}</Badge>
                            {profileData.verified && <Badge><Award className="h-3 w-3 mr-1"/>Verified</Badge>}
                        </div>
                        <p className="text-muted-foreground mt-4 max-w-xl mx-auto">{profileData.bio || "This user hasn't written a bio yet."}</p>
                        
                        <div className="flex justify-center gap-2 mt-6">
                            {isOwnProfile ? (
                                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                                    <DialogTrigger asChild><Button><Edit className="h-4 w-4 mr-2"/>Edit Profile</Button></DialogTrigger>
                                    <DialogContent><DialogHeader><DialogTitle>Edit Your Profile</DialogTitle></DialogHeader><EditProfileForm initialData={profileData} onSubmit={updateMutation.mutate} onClose={() => setIsEditDialogOpen(false)} isPending={updateMutation.isPending} /></DialogContent>
                                </Dialog>
                            ) : (
                                <><Button><UserPlus className="h-4 w-4 mr-2" /> Follow</Button><Button variant="outline">Message</Button></>
                            )}
                        </div>
                    </CardContent>
                </Card>
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 space-y-6">
                        <Card><CardHeader><CardTitle>About</CardTitle></CardHeader><CardContent className="space-y-3 text-sm">
                            <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-muted-foreground" /> <span>{profileData.location}</span></div>
                            <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-muted-foreground" /> <span>{profileData.email}</span></div>
                            <div className="flex items-center gap-3"><Briefcase className="h-4 w-4 text-muted-foreground" /> <span>Joined {format(new Date(profileData.createdAt), 'MMMM yyyy')}</span></div>
                        </CardContent></Card>
                        <Card><CardHeader><CardTitle>Stats</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between"><span>Followers</span><span className="font-bold">150</span></div>
                            <div className="flex justify-between"><span>Following</span><span className="font-bold">82</span></div>
                            <div className="flex justify-between"><span>Crops Listed</span><span className="font-bold">12</span></div>
                        </CardContent></Card>
                    </div>
                    <div className="md:col-span-2">
                        {renderRoleSpecificCard()}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ProfilePage;