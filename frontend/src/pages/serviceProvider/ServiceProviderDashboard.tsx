import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import ScrollToTop from '@/components/common/ScrollToTop';
import axiosInstance from '@/api/axios';
import { ServiceProviderProfile, ServiceRequest } from '@/types';
import { mockServiceProviderStats, mockRecentActivities } from '@/services/mockData';
import { DollarSign, Briefcase, Star, CheckCircle, Zap, Calendar, TrendingUp, Users, Activity } from 'lucide-react';
import EarningsChart from '@/components/services/EarningsChart';
import ServiceRequestChart from '@/components/services/ServiceRequestChart';
import BookingCalendar from '@/components/services/BookingCalendar';
// Global styles for animations. Consider if this can be scoped if only used in specific components.
import '../../styles/animations.css';

const StatCard: React.FC<{ 
  title: string; 
  value: string | number; 
  icon: React.ElementType; 
  trend?: number;
  index: number;
  color: string;
}> = ({ title, value, icon: Icon, trend, index, color }) => (
  <Card className={`card-animated hover-glow animate-scale-in animate-stagger-${index + 1}`}>
    <CardHeader className="bg-gradient-to-r from-green-50 to-white flex flex-row items-center justify-between space-y-0 pb-3">
      <CardTitle className="text-lg font-bold text-gray-800">{title}</CardTitle>
      <Icon className={`h-6 w-6 ${color}`} />
    </CardHeader>
    <CardContent className="p-6">
      <div className={`text-3xl font-bold mb-2 ${color}`}>{value}</div>
      {trend !== undefined && (
        <div className={`text-sm mt-2 flex items-center ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          <TrendingUp className={`h-4 w-4 mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
          {Math.abs(trend)}% from last month
        </div>
      )}
    </CardContent>
  </Card>
);

const QuickActionButton: React.FC<{
  to: string;
  icon: React.ElementType;
  label: string;
  index: number;
}> = ({ to, icon: Icon, label, index }) => (
  <Button 
    asChild 
    className={`w-full justify-start gap-3 text-left py-4 h-auto hover-lift animate-slide-in-left animate-stagger-${index + 1}`}
    variant="outline"
  >
    <Link to={to} className="flex items-center">
      <Icon className="h-5 w-5 text-green-600" />
      <span className="font-semibold">{label}</span>
    </Link>
  </Button>
);

const ServiceProviderDashboard: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ServiceProviderProfile | null>(null);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const profileRes = await axiosInstance.get('/services/my-profile');
        setProfile(profileRes.data);
        const requestsRes = await axiosInstance.get('/services/requests/provider');
        setServiceRequests(requestsRes.data.requests);
      } catch (err: any) {
        console.error('Dashboard data fetch error:', err);
        
        if (err.response?.status === 401) {
          setError('Unauthorized: Please login again');
        } else if (err.response?.status === 404) {
          setError('Resource not found: Please check the API endpoint');
        } else if (err.response?.status === 500) {
          setError('Server error: Please try again later');
        } else {
          setError(err.response?.data?.message || 'Failed to load dashboard data.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.role === 'serviceProvider') {
      fetchDashboardData();
    } else {
      setIsLoading(false);
      setError('You are not authorized to view this page.');
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-xl font-medium text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="text-center p-8 max-w-md mx-auto animate-scale-in">
          <CardContent>
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Dashboard</h2>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6">
        <Card className="text-center p-8 max-w-lg mx-auto card-animated">
          <CardContent className="space-y-6">
            <div className="text-green-500 text-6xl mb-4">🚀</div>
            <CardTitle className="text-3xl font-bold text-gray-800">Complete Your Service Provider Profile</CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Set up your service provider profile to start offering your services to farmers and grow your business.
            </CardDescription>
            <Button asChild className="btn-primary w-full text-lg py-3">
              <Link to="/offer-service">Create Profile Now</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center animate-fade-in-up">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
            Service Provider Dashboard
          </h1>
          <p className="text-xl text-gray-600 font-medium mt-2">
            Welcome back, {user?.name || 'Service Provider'}! 👋
          </p>
        </div>
        <div className="flex gap-4">
          <Button asChild variant="outline" className="hover-lift animate-slide-in-right animate-stagger-1">
            <Link to="/offer-service" className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Edit Profile
            </Link>
          </Button>
          <Button asChild className="btn-primary animate-slide-in-right animate-stagger-2">
            <Link to="/manage-services" className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Manage Services
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Monthly Earnings" 
          value={`₹${mockServiceProviderStats.monthlyEarnings.toLocaleString()}`} 
          icon={DollarSign} 
          trend={12}
          index={0}
          color="text-green-600"
        />
        <StatCard 
          title="Active Requests" 
          value={mockServiceProviderStats.activeRequests} 
          icon={Briefcase} 
          trend={-5}
          index={1}
          color="text-blue-600"
        />
        <StatCard 
          title="Jobs Completed" 
          value={mockServiceProviderStats.jobsCompleted} 
          icon={CheckCircle} 
          trend={8}
          index={2}
          color="text-purple-600"
        />
        <StatCard 
          title="Average Rating" 
          value={`${mockServiceProviderStats.averageRating} ⭐`} 
          icon={Star}
          index={3}
          color="text-yellow-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="card-animated animate-fade-in-up animate-stagger-2">
            <CardHeader className="bg-gradient-to-r from-green-50 to-white">
              <CardTitle className="flex items-center gap-2 text-2xl font-bold text-gray-800">
                <TrendingUp className="h-6 w-6 text-green-600" />
                Monthly Earnings Trend
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <EarningsChart />
            </CardContent>
          </Card>

          <Card className="card-animated animate-fade-in-up animate-stagger-3">
            <CardHeader className="bg-gradient-to-r from-green-50 to-white">
              <CardTitle className="flex items-center gap-2 text-2xl font-bold text-gray-800">
                <Users className="h-6 w-6 text-green-600" />
                Service Request Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ServiceRequestChart />
            </CardContent>
          </Card>

          <Card className="card-animated animate-fade-in-up animate-stagger-4">
            <CardHeader className="bg-gradient-to-r from-green-50 to-white">
              <CardTitle className="flex items-center gap-2 text-2xl font-bold text-gray-800">
                <Calendar className="h-6 w-6 text-green-600" />
                Upcoming Bookings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <BookingCalendar />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="card-animated animate-slide-in-right animate-stagger-1">
            <CardHeader className="bg-gradient-to-r from-green-50 to-white">
              <CardTitle className="text-xl font-bold text-gray-800">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 p-6">
              <QuickActionButton to="/service-requests" icon={Briefcase} label="View All Requests" index={0} />
              <QuickActionButton to="/earnings-history" icon={DollarSign} label="Earnings History" index={1} />
              <QuickActionButton to="/availability" icon={Calendar} label="Set Availability" index={2} />
              <QuickActionButton to="/analytics" icon={TrendingUp} label="View Analytics" index={3} />
            </CardContent>
          </Card>

          <Card className="card-animated animate-slide-in-right animate-stagger-2">
            <CardHeader className="bg-gradient-to-r from-green-50 to-white">
              <CardTitle className="text-xl font-bold text-gray-800">Recent Requests</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {serviceRequests && serviceRequests.length > 0 ? (
                <div className="space-y-4">
                  {serviceRequests.slice(0, 5).map((request, index) => (
                    <div 
                      key={request.id} 
                      className={`p-4 bg-green-50 rounded-lg border border-green-200 hover-lift animate-fade-in-up animate-stagger-${index + 1}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold text-gray-800">{request.serviceType}</p>
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                          request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                          request.status === 'completed' ? 'bg-green-100 text-green-800' :
                          request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          request.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {request.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-600 font-medium">{request.farmer?.name || 'N/A'}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-green-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">No new service requests</p>
                </div>
              )}
              <Button asChild variant="link" className="p-0 h-auto mt-6 text-green-600 font-semibold">
                <Link to="/service-requests">View All Requests →</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="card-animated animate-slide-in-right animate-stagger-3">
            <CardHeader className="bg-gradient-to-r from-green-50 to-white">
              <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-800">
                <Activity className="h-5 w-5 text-green-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {mockRecentActivities.slice(0, 4).map((activity, index) => (
                  <div 
                    key={activity.id} 
                    className={`flex items-start gap-3 animate-fade-in-up animate-stagger-${index + 1}`}
                  >
                    <div className={`w-3 h-3 rounded-full mt-2 ${
                      activity.type === 'payment_received' ? 'bg-green-500' :
                      activity.type === 'new_request' ? 'bg-blue-500' :
                      activity.type === 'review_added' ? 'bg-yellow-500' :
                      'bg-gray-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <ScrollToTop />
    </div>
  );
};

export default ServiceProviderDashboard;