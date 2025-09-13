import React, { useState } from 'react';
import OfferServiceForm from '@/components/services/OfferServiceForm';
import { Layout } from '@/components/layout/Layout';
import { useToast } from '@/hooks/use-toast';
import { services } from '@/services/serviceService';

const OfferHarvesterServicePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await services.createServiceProvider(data);
      toast({
        title: 'Success',
        description: 'Your harvester service has been listed successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to list your service. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <OfferServiceForm
          serviceType="harvester"
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </Layout>
  );
};

export default OfferHarvesterServicePage;