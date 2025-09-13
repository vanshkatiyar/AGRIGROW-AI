import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import axiosInstance from '@/api/axios'; // Corrected import
import { ServiceProviderProfile, ServiceRequest } from '@/types'; // Assuming these types exist or will be created

const ServiceProviderDashboard: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ServiceProviderProfile | null>(null);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch service provider profile
        const profileRes = await axiosInstance.get('/api/services/my-profile');
        setProfile(profileRes.data);

        // Fetch service requests for this provider
        const requestsRes = await axiosInstance.get('/api/services/requests/provider');
        setServiceRequests(requestsRes.data.requests);
      } catch (err: any) {
        console.error('Error fetching service provider dashboard data:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard data.');
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
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-4">
        <Card className="text-center p-8">
          <CardTitle className="text-2xl mb-4">Complete Your Service Provider Profile</CardTitle>
          <CardDescription className="mb-6">
            It looks like you haven't set up your service provider profile yet.
            Please create one to start offering your services to farmers.
          </CardDescription>
          <Button asChild>
            <Link to="/offer-service">Create Profile</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Service Provider Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Business Name:</strong> {profile.businessName}</p>
            <p><strong>Service Type:</strong> {profile.serviceType}</p>
            <p><strong>Location:</strong> {profile.location.address}</p>
            <Button asChild className="mt-4">
              <Link to="/offer-service">Edit Profile</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Services/Products</CardTitle>
          </CardHeader>
          <CardContent>
            {profile.equipment && profile.equipment.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Equipment:</h3>
                <ul>
                  {profile.equipment.map((eq, index) => (
                    <li key={index}>{eq.name} ({eq.model})</li>
                  ))}
                </ul>
              </div>
            )}
            {profile.products && profile.products.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Products:</h3>
                <ul>
                  {profile.products.map((prod, index) => (
                    <li key={index}>{prod.name} ({prod.category})</li>
                  ))}
                </ul>
              </div>
            )}
            {(profile.equipment.length === 0 && profile.products.length === 0) && (
              <p>No services or products listed yet.</p>
            )}
            <Button asChild className="mt-4">
              <Link to="/manage-services">Manage Services</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {serviceRequests.length > 0 ? (
              <ul>
                {serviceRequests.slice(0, 3).map(request => (
                  <li key={request._id} className="mb-2">
                    Request from {request.farmer.name} for {request.serviceType} - Status: {request.status}
                  </li>
                ))}
                {serviceRequests.length > 3 && (
                  <li className="text-sm text-muted-foreground">... {serviceRequests.length - 3} more requests</li>
                )}
              </ul>
            ) : (
              <p>No new service requests.</p>
            )}
            <Button asChild className="mt-4">
              <Link to="/service-requests">View All Requests</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Additional sections can be added here */}
    </div>
  );
};

export default ServiceProviderDashboard;