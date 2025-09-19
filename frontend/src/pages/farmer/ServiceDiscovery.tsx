import React from 'react';
import { useServiceSocket } from '../../hooks/useServiceSocket';
import ServiceCard from '../../components/services/ServiceCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const ServiceDiscovery: React.FC = () => {
  const { services, loading, error } = useServiceSocket();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Service Discovery</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <ServiceCard key={service._id} service={service} />
        ))}
      </div>
    </div>
  );
};

export default ServiceDiscovery;