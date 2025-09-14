import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { User } from '@/types';
import { useToast } from '@/hooks/use-toast'; // Import useToast

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  // --- CHANGE: The login function will now return the user ---
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  // Add other functions for completeness based on your app's needs
  register: (userData: any) => Promise<void>;
  updateUserRole: (userId: string, role: 'farmer' | 'buyer' | 'expert' | 'serviceProvider') => Promise<void>;
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
  const { toast } = useToast(); // Initialize useToast

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const response = await axios.get('http://localhost:5000/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(response.data.user);
        } catch (error) {
          localStorage.removeItem('authToken');
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
      localStorage.setItem('authToken', token);
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
    localStorage.removeItem('authToken');
    setUser(null);
    // Redirect to login page after logout
    window.location.href = '/auth/login';
  };
  
  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', userData);
      const { token, user: userDataResponse } = response.data;
      localStorage.setItem('authToken', token);
      setUser(userDataResponse);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const updateUserRole = async (userId: string, role: 'farmer' | 'buyer' | 'expert' | 'serviceProvider') => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.put(
        `http://localhost:5000/api/users/${userId}/role`,
        { role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(response.data);
      toast({
        title: "Role Updated",
        description: `Your role has been updated to ${role}.`,
      });
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update role.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = { isAuthenticated: !!user, user, isLoading, login, logout, register, updateUserRole, setUser };

  return <AuthContext.Provider value={value}>{!isLoading && children}</AuthContext.Provider>;
};