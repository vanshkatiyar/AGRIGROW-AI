// src/context/SocketContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

// Your backend server URL
const SOCKET_SERVER_URL = 'http://localhost:5000';

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // If a user is logged in, create a new socket connection
      const newSocket = io(SOCKET_SERVER_URL, {
        query: {
          userId: user.id, // Send user ID to the backend for room joining
        },
      });
      setSocket(newSocket);

      // Cleanup function to close the connection when the component unmounts or user logs out
      return () => {
        newSocket.close();
      };
    } else {
      // If there's no user, make sure there's no active socket connection
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};