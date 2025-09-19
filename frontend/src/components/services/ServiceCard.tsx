import React from 'react';
import { Service } from '../../types';

interface ServiceCardProps {
  service: Service;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 m-2">
      <h3 className="text-xl font-bold">{service.businessName}</h3>
      <p>{service.description}</p>
      <p>Service Type: {service.serviceType}</p>
      <p>Location: {service.location.address}</p>
    </div>
  );
};

export default ServiceCard;