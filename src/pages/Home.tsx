import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  CloudSun, 
  MessageCircle,
  Plus,
  Heart,
  MessageSquare,
  Share2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { mockPosts, mockWeatherData } from '@/services/mockData';

const Home = () => {
  const { user } = useAuth();

  // Redirect to role-specific dashboard
  if (user?.role === 'farmer') {
    window.location.href = '/farmer-dashboard';
    return null;
  }
  if (user?.role === 'buyer') {
    window.location.href = '/buyer-dashboard';
    return null;
  }
  if (user?.role === 'expert') {
    window.location.href = '/expert-dashboard';
    return null;
  }

  const stats = [
    { label: 'Posts', value: '156', icon: Users, trend: '+12%' },
    { label: 'Sales', value: '₹45,600', icon: ShoppingBag, trend: '+8%' },
    { label: 'Followers', value: user?.roleData?.farmer?.followers || user?.roleData?.buyer?.totalPurchases || user?.roleData?.expert?.totalConsultations || 0, icon: TrendingUp, trend: '+15%' },
    { label: 'Messages', value: '23', icon: MessageCircle, trend: '+5%' }
  ];

  const recentPosts = mockPosts.slice(0, 3);

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary/10 via-primary-glow/10 to-accent/10 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
              <AvatarImage src={user?.profileImage} alt={user?.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {user?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">
                Welcome back, {user?.name}! 👋
              </h1>
              <p className="text-muted-foreground">
                {user?.location} • {user?.roleData?.farmer?.crops?.join(', ') || user?.roleData?.buyer?.companyName || user?.roleData?.expert?.specializations?.join(', ') || 'No specialization'}
              </p>
               {user?.verified && (
                 <Badge variant="secondary" className="mt-2">
                   ✓ Verified {user?.role === 'farmer' ? 'Farmer' : user?.role === 'buyer' ? 'Buyer' : 'Expert'}
                 </Badge>
               )}
            </div>
            <Button className="bg-gradient-to-r from-primary to-primary-glow">
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-xl font-bold">{stat.value}</p>
                    <p className="text-xs text-success">{stat.trend}</p>
                  </div>
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest posts and interactions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentPosts.map((post) => (
                  <div key={post.id} className="border-b border-border pb-4 last:border-0">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={post.userImage} />
                        <AvatarFallback>{post.userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{post.userName}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {post.content}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
                            <Heart className="h-3 w-3" />
                            {post.likes}
                          </button>
                          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
                            <MessageSquare className="h-3 w-3" />
                            {post.comments}
                          </button>
                          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
                            <Share2 className="h-3 w-3" />
                            Share
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Weather & Quick Info */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CloudSun className="h-5 w-5" />
                  Weather
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl mb-2">{mockWeatherData.current.icon}</div>
                  <p className="text-2xl font-bold">{mockWeatherData.current.temperature}°C</p>
                  <p className="text-sm text-muted-foreground">{mockWeatherData.current.condition}</p>
                  <p className="text-xs text-muted-foreground mt-2">{mockWeatherData.location}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <h4 className="font-medium mb-2">Farming Tips</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {mockWeatherData.farmingTips.slice(0, 2).map((tip, index) => (
                      <li key={index}>• {tip}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  List Crop for Sale
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Ask Community
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Check Prices
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;