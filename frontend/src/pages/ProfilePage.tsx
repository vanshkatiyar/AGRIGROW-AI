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
            case 'farmer':
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Sprout/>Farm Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {profileData.crops && profileData.crops.length > 0 ? (
                                <div>
                                    <h4 className="font-semibold">Crops:</h4>
                                    <ul className="list-disc pl-5">
                                        {profileData.crops.map((crop: any) => (
                                            <li key={crop._id}>{crop.name} ({crop.areaInAcres} acres)</li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <p>No crops listed yet.</p>
                            )}
                            {/* Add more farmer-specific details here */}
                        </CardContent>
                    </Card>
                );
            case 'buyer':
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><ShoppingCart/>Business Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p><span className="font-semibold">Company:</span> {profileData.companyName || 'N/A'}</p>
                            <p><span className="font-semibold">Interests:</span> {profileData.buyingInterests?.join(', ') || 'N/A'}</p>
                            {/* Add more buyer-specific details here */}
                        </CardContent>
                    </Card>
                );
            case 'expert':
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><GraduationCap/>Expertise</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p><span className="font-semibold">Specialization:</span> {profileData.specialization || 'N/A'}</p>
                            <p><span className="font-semibold">Experience:</span> {profileData.experience || 'N/A'} years</p>
                            {profileData.articles && profileData.articles.length > 0 && (
                                <div>
                                    <h4 className="font-semibold">Recent Articles:</h4>
                                    <ul className="list-disc pl-5">
                                        {profileData.articles.map((article: any) => (
                                            <li key={article._id}>{article.title}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {/* Add more expert-specific details here */}
                        </CardContent>
                    </Card>
                );
            case 'serviceProvider':
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Briefcase/>Service Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p><span className="font-semibold">Business Name:</span> {profileData.serviceProviderProfile?.businessName || 'N/A'}</p>
                            <p><span className="font-semibold">Service Type:</span> {profileData.serviceProviderProfile?.serviceType || 'N/A'}</p>
                            {profileData.services && profileData.services.length > 0 && (
                                <div>
                                    <h4 className="font-semibold">Offered Services:</h4>
                                    <ul className="list-disc pl-5">
                                        {profileData.services.map((service: any) => (
                                            <li key={service._id}>{service.name}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {/* Add more serviceProvider-specific details here */}
                        </CardContent>
                    </Card>
                );
            default: return null;
        }
    };

    return (
        <Layout>
            <div className="container mx-auto p-4 sm:p-6 space-y-6">
                <Card className="overflow-hidden">
                    <div className="h-48 bg-cover bg-center relative" style={{ backgroundImage: `url(${profileData.coverPhoto || '/path/to/default-cover.jpg'})` }}>
                        <Avatar className="h-32 w-32 border-4 border-card absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                            <AvatarImage src={profileData.profileImage || '/path/to/default-avatar.jpg'} />
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
                            <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-muted-foreground" /> <span>{profileData.location || 'Not specified'}</span></div>
                            <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-muted-foreground" /> <span>{profileData.email}</span></div>
                            <div className="flex items-center gap-3"><Briefcase className="h-4 w-4 text-muted-foreground" /> <span>Joined {profileData.createdAt ? format(new Date(profileData.createdAt), 'MMMM yyyy') : 'N/A'}</span></div>
                        </CardContent></Card>
                        <Card><CardHeader><CardTitle>Stats</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between"><span>Followers</span><span className="font-bold">{(profileData.followers && profileData.followers.length) || 0}</span></div>
                            <div className="flex justify-between"><span>Following</span><span className="font-bold">{(profileData.following && profileData.following.length) || 0}</span></div>
                            {profileData.role === 'farmer' && <div className="flex justify-between"><span>Crops Listed</span><span className="font-bold">{(profileData.crops && profileData.crops.length) || 0}</span></div>}
                            {profileData.role === 'expert' && <div className="flex justify-between"><span>Articles Published</span><span className="font-bold">{(profileData.articles && profileData.articles.length) || 0}</span></div>}
                            {profileData.role === 'serviceProvider' && <div className="flex justify-between"><span>Services Offered</span><span className="font-bold">{(profileData.services && profileData.services.length) || 0}</span></div>}
                            {profileData.role === 'buyer' && <div className="flex justify-between"><span>Products Purchased</span><span className="font-bold">{(profileData.products && profileData.products.length) || 0}</span></div>}
                        </CardContent></Card>
                    </div>
                    <div className="md:col-span-2">
                        {renderRoleSpecificCard()}
                        {profileData.posts && profileData.posts.length > 0 && (
                            <Card className="mt-6">
                                <CardHeader><CardTitle>Recent Posts</CardTitle></CardHeader>
                                <CardContent>
                                    {/* Render a list of recent posts */}
                                    <p>Displaying {profileData.posts.length} posts.</p>
                                </CardContent>
                            </Card>
                        )}
                        {profileData.services && profileData.services.length > 0 && (
                            <Card className="mt-6">
                                <CardHeader><CardTitle>Services Offered</CardTitle></CardHeader>
                                <CardContent>
                                    {/* Render a list of services offered */}
                                    <p>Displaying {profileData.services.length} services.</p>
                                </CardContent>
                            </Card>
                        )}
                        {profileData.products && profileData.products.length > 0 && (
                            <Card className="mt-6">
                                <CardHeader><CardTitle>Products</CardTitle></CardHeader>
                                <CardContent>
                                    {/* Render a list of products */}
                                    <p>Displaying {profileData.products.length} products.</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ProfilePage;