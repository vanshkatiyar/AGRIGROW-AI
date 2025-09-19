import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { getServices } from '../services/serviceService';
import { Service } from '../types';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useServiceSocket = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
    });

    const fetchServices = async () => {
      try {
        setLoading(true);
        const fetchedServices = await getServices();
        setServices(fetchedServices);
        setError(null);
      } catch (err) {
        setError('Failed to fetch services');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();

    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    socket.on('serviceCreated', (newService: Service) => {
      setServices((prevServices) => [...prevServices, newService]);
    });

    socket.on('serviceUpdated', (updatedService: Service) => {
      setServices((prevServices) =>
        prevServices.map((service) =>
          service._id === updatedService._id ? updatedService : service
        )
      );
    });

    socket.on('serviceDeleted', (serviceId: string) => {
      setServices((prevServices) =>
        prevServices.filter((service) => service._id !== serviceId)
      );
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return { services, loading, error };
};