import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext'; // Assuming you have AuthContext to get user info

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const useSocket = () => {
  return useContext(SocketContext);
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useAuth(); // Get the logged-in user

  useEffect(() => {
    if (user) {
      // --- THIS IS THE FIX ---
      // Explicitly connect to your backend server URL
      const newSocket = io('http://localhost:5000');

      setSocket(newSocket);

      // Tell the server who we are by emitting 'addUser'
      newSocket.emit('addUser', user.id);

      // Clean up the connection when the component unmounts or user logs out
      return () => {
        newSocket.disconnect();
      };
    } else {
      // If there's no user, disconnect any existing socket
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [user]); // Re-run this effect when the user logs in or out

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};