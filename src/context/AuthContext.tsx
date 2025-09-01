import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Interfaces remain the same
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

  // This effect now correctly handles re-authentication from localStorage
  useEffect(() => {
    const checkUserSession = async () => {
      const storedUser = localStorage.getItem('smartfarm_user');
      const token = localStorage.getItem('authToken');

      if (storedUser && token) {
        // --- THIS IS THE FIRST PART OF THE FIX ---
        // We must re-apply the auth token to axios headers on every app load.
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(JSON.parse(storedUser));
      }
      setIsLoading(false);
    };
    checkUserSession();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      const { token, user: loggedInUser } = response.data;
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('authToken', token);
      localStorage.setItem('smartfarm_user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
      const { token, user: registeredUser } = response.data;
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('authToken', token);
      localStorage.setItem('smartfarm_user', JSON.stringify(registeredUser));
      setUser(registeredUser);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (role: 'farmer' | 'buyer' | 'expert') => {
    try {
      // --- THIS IS THE SECOND PART OF THE FIX ---
      // Although the useEffect now handles it, making the API call self-sufficient
      // by explicitly setting its own headers is a more robust pattern.
      const token = localStorage.getItem('authToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.put(`${API_BASE_URL}/user/role`, { role }, config);
      const updatedUser = response.data.user;
      
      setUser(updatedUser);
      localStorage.setItem('smartfarm_user', JSON.stringify(updatedUser));
      
    } catch (error) {
      console.error("Failed to update user role", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('smartfarm_user');
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