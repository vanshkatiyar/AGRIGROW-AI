import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Mail, Briefcase, Award, Users, UserPlus } from 'lucide-react';

const ProfilePage = () => {
    const { user } = useAuth();

    if (!user) {
        return <Layout><div>Loading user profile...</div></Layout>;
    }

    const renderRoleSpecificData = () => {
        switch (user.role) {
            case 'farmer':
                return (
                    <Card>
                        <CardHeader><CardTitle>Farm Details</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            <p><strong>Crops:</strong> {user.roleData.farmer?.crops.join(', ')}</p>
                            <p><strong>Farm Size:</strong> {user.roleData.farmer?.farmSize} acres</p>
                            <p><strong>Experience:</strong> {user.roleData.farmer?.experienceYears} years</p>
                            <p><strong>Certifications:</strong> {user.roleData.farmer?.certifications.join(', ')}</p>
                        </CardContent>
                    </Card>
                );
            case 'buyer':
                return (
                    <Card>
                        <CardHeader><CardTitle>Business Details</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            <p><strong>Company:</strong> {user.roleData.buyer?.companyName}</p>
                            <p><strong>Business Type:</strong> {user.roleData.buyer?.businessType}</p>
                            <p><strong>Purchase Volume:</strong> {user.roleData.buyer?.purchaseVolume}</p>
                        </CardContent>
                    </Card>
                );
            case 'expert':
                 return (
                    <Card>
                        <CardHeader><CardTitle>Expertise</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            <p><strong>Specializations:</strong> {user.roleData.expert?.specializations.join(', ')}</p>
                            <p><strong>Credentials:</strong> {user.roleData.expert?.credentials.join(', ')}</p>
                            <p><strong>Experience:</strong> {user.roleData.expert?.experienceYears} years</p>
                        </CardContent>
                    </Card>
                );
            default:
                return null;
        }
    }

    return (
        <Layout>
            <div className="container mx-auto p-4 sm:p-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <Avatar className="h-24 w-24 border-4 border-primary">
                                <AvatarImage src={user.profileImage} alt={user.name} />
                                <AvatarFallback className="text-3xl">{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-center sm:text-left">
                                <h1 className="text-3xl font-bold">{user.name}</h1>
                                <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                                    <Badge variant="secondary" className="capitalize">{user.role}</Badge>
                                    {user.verified && <Badge><Award className="h-3 w-3 mr-1"/>Verified</Badge>}
                                </div>
                                <p className="text-muted-foreground mt-2">{user.bio}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button><UserPlus className="h-4 w-4 mr-2" /> Follow</Button>
                                <Button variant="outline">Message</Button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {user.location}</div>
                            <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> {user.email}</div>
                            <div className="flex items-center gap-2"><Briefcase className="h-4 w-4" /> Joined August 2025</div>
                        </div>
                    </CardContent>
                </Card>
                <div className="mt-6 grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        {renderRoleSpecificData()}
                    </div>
                    <div>
                        <Card>
                            <CardHeader><CardTitle>Stats</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between"><span className="text-muted-foreground">Followers</span><span className="font-bold">150</span></div>
                                <div className="flex items-center justify-between"><span className="text-muted-foreground">Following</span><span className="font-bold">80</span></div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ProfilePage;