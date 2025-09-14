import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import axiosInstance from '@/api/axios';
import { ServiceProviderProfile, ServiceRequest } from '@/types';
import { mockServiceProviderStats, mockRecentActivities } from '@/services/mockData';
import { DollarSign, Briefcase, Star, CheckCircle, Zap, Calendar, TrendingUp, Users } from 'lucide-react';
import EarningsChart from '@/components/services/EarningsChart';
import ServiceRequestChart from '@/components/services/ServiceRequestChart';
import BookingCalendar from '@/components/services/BookingCalendar';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ElementType; trend?: number }> = ({ 
  title, 
  value, 
  icon: Icon, 
  trend 
}) => (
  <Card className="hover:shadow-md transition-shadow duration-200">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
      <Icon className="h-5 w-5 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {trend !== undefined && (
        <div className={`text-xs mt-1 flex items-center ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          <TrendingUp className={`h-3 w-3 mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
          {Math.abs(trend)}% from last month
        </div>
      )}
    </CardContent>
  </Card>
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
        console.error('Full error object:', err);
        console.error('Error details:', {
          message: err.message,
          code: err.code,
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          headers: err.response?.headers,
          config: err.config
        });
        
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
    return <div className="flex justify-center items-center min-h-screen"><LoadingSpinner size="lg" /></div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-500"><p>{error}</p></div>;
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6">
        <Card className="text-center p-8 max-w-md mx-auto">
          <CardTitle className="text-2xl mb-4">Complete Your Service Provider Profile</CardTitle>
          <CardDescription className="mb-6">
            It looks like you haven't set up your service provider profile yet.
            Please create one to start offering your services to farmers.
          </CardDescription>
          <Button asChild className="w-full"><Link to="/offer-service">Create Profile</Link></Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.name || 'Service Provider'}</p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link to="/offer-service" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Edit Profile
            </Link>
          </Button>
          <Button asChild>
            <Link to="/manage-services" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Manage Services
            </Link>
          </Button>
        </div>
      </div>

      {/* Key Metrics Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Monthly Earnings" 
          value={`₹${mockServiceProviderStats.monthlyEarnings.toLocaleString()}`} 
          icon={DollarSign} 
          trend={12}
        />
        <StatCard 
          title="Active Requests" 
          value={mockServiceProviderStats.activeRequests} 
          icon={Briefcase} 
          trend={-5}
        />
        <StatCard 
          title="Jobs Completed" 
          value={mockServiceProviderStats.jobsCompleted} 
          icon={CheckCircle} 
          trend={8}
        />
        <StatCard 
          title="Average Rating" 
          value={`${mockServiceProviderStats.averageRating} ⭐`} 
          icon={Star} 
        />
      </div>

      {/* Main Content Grid - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts and Calendar */}
        <div className="lg:col-span-2 space-y-6">
          {/* Earnings Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Monthly Earnings Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EarningsChart />
            </CardContent>
          </Card>

          {/* Service Request Status Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Service Request Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ServiceRequestChart />
            </CardContent>
          </Card>

          {/* Booking Calendar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BookingCalendar />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Quick Actions and Recent Activity */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button asChild className="w-full justify-start gap-2" variant="outline">
                <Link to="/service-requests">
                  <Briefcase className="h-4 w-4" />
                  View Requests
                </Link>
              </Button>
              <Button asChild className="w-full justify-start gap-2" variant="outline">
                <Link to="/earnings-history">
                  <DollarSign className="h-4 w-4" />
                  View Earnings
                </Link>
              </Button>
              <Button asChild className="w-full justify-start gap-2" variant="outline">
                <Link to="/availability">
                  <Calendar className="h-4 w-4" />
                  Set Availability
                </Link>
              </Button>
              <Button asChild className="w-full justify-start gap-2" variant="outline">
                <Link to="/analytics">
                  <TrendingUp className="h-4 w-4" />
                  View Analytics
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Service Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {serviceRequests && serviceRequests.length > 0 ? (
                <div className="space-y-3">
                  {serviceRequests.slice(0, 5).map(request => (
                    <div key={request.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-medium text-sm">{request.serviceType}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                          request.status === 'completed' ? 'bg-green-100 text-green-800' :
                          request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          request.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{request.farmer?.name || 'N/A'}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No new service requests.</p>
              )}
              <Button asChild variant="link" className="p-0 h-auto mt-4">
                <Link to="/service-requests">View All Requests →</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockRecentActivities.slice(0, 4).map(activity => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'payment_received' ? 'bg-green-500' :
                      activity.type === 'new_request' ? 'bg-blue-500' :
                      activity.type === 'review_added' ? 'bg-yellow-500' :
                      'bg-gray-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm">{activity.description}</p>
                      <p className="text-xs text-gray-500">
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
    </div>
  );
};

export default ServiceProviderDashboard;