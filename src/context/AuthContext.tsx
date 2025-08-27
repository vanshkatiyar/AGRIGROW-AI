import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string; name: string; email: string; profileImage: string; location: string; bio: string;
  role: 'farmer' | 'buyer' | 'expert' | null; verified: boolean;
  roleData: { farmer?: any; buyer?: any; expert?: any; };
}
interface RegisterData { name: string; email: string; password: string; location: string; }

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  updateUserRole: (role: 'farmer' | 'buyer' | 'expert') => Promise<void>;
}

const API_BASE_URL = 'http://localhost:5000/api'; 

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserSession = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const response = await axios.get(`${API_BASE_URL}/auth/me`);
          setUser(response.data.user);
        } catch (error) {
          localStorage.removeItem('authToken');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setIsLoading(false);
    };
    checkUserSession();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      const { token, user } = response.data;
      localStorage.setItem('authToken', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
      const { token, user } = response.data;
      localStorage.setItem('authToken', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (role: 'farmer' | 'buyer' | 'expert') => {
    try {
      const response = await axios.put(`${API_BASE_URL}/user/role`, { role });
      setUser(response.data.user);
    } catch (error) {
      console.error("Failed to update user role", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    delete axios.defaults.headers.common['Authorization'];
  };

  const value: AuthContextType = {
    user, login, register, logout, isLoading,
    isAuthenticated: !!user,
    updateUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};