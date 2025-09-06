import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';

export const useSocketChat = () => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!user) return;
    const newSocket = io(import.meta.env.VITE_API_BASE_URL, {
      auth: { token: localStorage.getItem('token') },
    });
    setSocket(newSocket);
    
    return () => {
        newSocket.disconnect();
    };
  }, [user]);

  return { socket };
};