import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OfferServiceForm from '@/components/services/OfferServiceForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button'; // Added Button import
import { useAuth } from '@/context/AuthContext';
import axiosInstance from '@/api/axios'; // Corrected import
import { ServiceProviderProfile } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';

const OfferServicePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [existingProfile, setExistingProfile] = useState<ServiceProviderProfile | null>(null);
  const [selectedServiceType, setSelectedServiceType] = useState<'tractor' | 'harvester' | 'supplier' | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user && user.role === 'serviceProvider') {
        try {
          const res = await axiosInstance.get('/api/services/my-profile');
          setExistingProfile(res.data);
          setSelectedServiceType(res.data.serviceType);
        } catch (error) {
          console.error('Error fetching service provider profile:', error);
          // If profile not found, it's okay, user will create one
        } finally {
          setProfileLoading(false);
        }
      } else {
        setProfileLoading(false);
        toast({
          title: "Unauthorized",
          description: "You must be a service provider to access this page.",
          variant: "destructive",
        });
        navigate('/');
      }
    };
    fetchProfile();
  }, [user, navigate, toast]);

  const handleSubmit = async (formData: any) => {
    setIsLoading(true);
    try {
      await axiosInstance.post('/api/services', formData);
      toast({
        title: "Success",
        description: "Service provider profile saved successfully!",
      });
      navigate('/service-provider-dashboard');
    } catch (error: any) {
      console.error('Error submitting service offer:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save service provider profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!selectedServiceType) {
    return (
      <div className="container mx-auto p-4">
        <Card className="text-center p-8">
          <CardTitle className="text-2xl mb-4">Select Your Service Type</CardTitle>
          <CardContent className="flex flex-wrap justify-center gap-4">
            <Button onClick={() => setSelectedServiceType('tractor')}>Tractor Service</Button>
            <Button onClick={() => setSelectedServiceType('harvester')}>Harvester Service</Button>
            <Button onClick={() => setSelectedServiceType('supplier')}>Supplier Service</Button>
            {/* Add other service types as needed */}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>{existingProfile ? 'Edit Your Service Profile' : 'Create Your Service Profile'}</CardTitle>
        </CardHeader>
        <CardContent>
          <OfferServiceForm
            serviceType={selectedServiceType}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default OfferServicePage;