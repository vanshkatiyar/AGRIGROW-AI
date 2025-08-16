import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  GraduationCap, 
  TrendingUp, 
  Clock, 
  Star,
  Users,
  FileText,
  AlertCircle,
  CheckCircle,
  DollarSign
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { 
  mockExpertStats, 
  mockConsultationRequests,
  mockArticles,
  mockFinancialData 
} from '@/services/roleBasedData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ExpertDashboard = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Total Consultations', value: mockExpertStats.totalConsultations, icon: Users, color: 'text-blue-600' },
    { label: 'Active Clients', value: mockExpertStats.activeClients, icon: Clock, color: 'text-green-600' },
    { label: 'Monthly Earnings', value: `₹${mockExpertStats.monthlyEarnings.toLocaleString()}`, icon: DollarSign, color: 'text-purple-600' },
    { label: 'Average Rating', value: mockExpertStats.averageRating, icon: Star, color: 'text-yellow-600' }
  ];

  const urgencyColors = {
    low: 'text-green-600 bg-green-50 dark:bg-green-950/20',
    medium: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20',
    high: 'text-orange-600 bg-orange-50 dark:bg-orange-950/20',
    critical: 'text-red-600 bg-red-50 dark:bg-red-950/20'
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-400',
    'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-950/20 dark:text-blue-400',
    completed: 'bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-400'
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Expert Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Welcome back, {user?.name}! Manage consultations and share knowledge.
              </p>
              <div className="flex items-center gap-2 mt-2">
                {user?.roleData?.expert?.specializations?.map((spec, index) => (
                  <Badge key={index} variant="secondary">{spec}</Badge>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="bg-orange-600 hover:bg-orange-700">
                <FileText className="h-4 w-4 mr-2" />
                Write Article
              </Button>
              <Button variant="outline">
                <GraduationCap className="h-4 w-4 mr-2" />
                Update Profile
              </Button>
            </div>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Consultation Requests */}
          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Consultation Requests</CardTitle>
                <CardDescription>Manage farmer consultation requests</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockConsultationRequests.map((consultation) => (
                  <div key={consultation.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="/api/placeholder/40/40" />
                          <AvatarFallback>{consultation.farmerName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{consultation.farmerName}</h4>
                          <p className="text-sm text-muted-foreground">{consultation.location} • {consultation.cropType}</p>
                          <p className="text-sm mt-1">{consultation.issue}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex gap-2">
                          <Badge className={urgencyColors[consultation.urgency]}>
                            {consultation.urgency}
                          </Badge>
                          <Badge className={statusColors[consultation.status]}>
                            {consultation.status}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium mt-2">₹{consultation.consultationFee}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Submitted: {new Date(consultation.submittedDate).toLocaleDateString()}</span>
                        {consultation.images.length > 0 && (
                          <span>{consultation.images.length} images attached</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {consultation.status === 'pending' && (
                          <>
                            <Button size="sm" variant="outline">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                            <Button size="sm">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Accept
                            </Button>
                          </>
                        )}
                        {consultation.status === 'in-progress' && (
                          <Button size="sm">
                            Continue
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Earnings Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Earnings Trends</CardTitle>
                <CardDescription>Monthly earnings from consultations and articles</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockFinancialData.expert.monthlyEarnings}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value}`, 'Earnings']} />
                    <Line type="monotone" dataKey="earnings" stroke="#f97316" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Success Rate</span>
                    <span className="font-bold text-green-600">{mockExpertStats.successRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Response Time</span>
                    <span className="font-bold">{mockExpertStats.responseTime}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="font-bold">{mockExpertStats.averageRating}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Experience</span>
                    <span className="font-bold">{user?.roleData?.expert?.experienceYears} years</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Knowledge Base */}
            <Card>
              <CardHeader>
                <CardTitle>Knowledge Base</CardTitle>
                <CardDescription>Your published articles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockArticles.map((article) => (
                  <div key={article.id} className="border-b border-border pb-3 last:border-0">
                    <h5 className="font-medium text-sm line-clamp-2">{article.title}</h5>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span>{article.views} views</span>
                      <span>{article.likes} likes</span>
                      <span>{new Date(article.publishedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Service Revenue Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={mockFinancialData.expert.serviceBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      dataKey="amount"
                    >
                      {mockFinancialData.expert.serviceBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value}`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 space-y-1">
                  {mockFinancialData.expert.serviceBreakdown.map((service, index) => (
                    <div key={service.type} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="capitalize">{service.type.replace('_', ' ')}</span>
                      </div>
                      <span>₹{service.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ExpertDashboard;