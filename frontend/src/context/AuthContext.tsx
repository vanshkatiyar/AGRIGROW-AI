import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { User } from '@/types'; 

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  // --- CHANGE: The login function will now return the user ---
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  // Add other functions for completeness based on your app's needs
  register: (userData: any) => Promise<void>;
  updateUserRole: (role: string) => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('http://localhost:5000/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(response.data.user);
        } catch (error) {
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    validateToken();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      setUser(userData);
      setIsLoading(false);
      // --- CHANGE: Return the user data ---
      return userData;
    } catch (error) {
      setIsLoading(false);
      // Re-throw the error so the component can catch it
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    // Redirect to login page after logout
    window.location.href = '/auth/login';
  };
  
  // You would implement these functions as needed
  const register = async (userData: any) => { /* ... */ };
  const updateUserRole = async (role: string) => { /* ... */ };

  const value = { isAuthenticated: !!user, user, isLoading, login, logout, register, updateUserRole, setUser };

  return <AuthContext.Provider value={value}>{!isLoading && children}</AuthContext.Provider>;
};