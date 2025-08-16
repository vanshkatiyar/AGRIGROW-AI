import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  profileImage: string;
  location: string;
  bio: string;
  crops: string[];
  followers: number;
  following: number;
  verified: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  location: string;
  bio?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock authentication - check for stored user
  useEffect(() => {
    const storedUser = localStorage.getItem('smartfarm_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Mock login - simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email === 'farmer@smartfarm.com' && password === 'password') {
      const userData: User = {
        id: 'user_001',
        name: 'Ravi Kumar',
        email: 'farmer@smartfarm.com',
        profileImage: '/api/placeholder/100/100',
        location: 'Punjab, India',
        bio: 'Wheat and rice farmer with 15 years experience',
        crops: ['wheat', 'rice', 'sugarcane'],
        followers: 250,
        following: 180,
        verified: true
      };
      
      setUser(userData);
      localStorage.setItem('smartfarm_user', JSON.stringify(userData));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    
    // Mock registration
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: `user_${Date.now()}`,
      name: userData.name,
      email: userData.email,
      profileImage: '/api/placeholder/100/100',
      location: userData.location,
      bio: userData.bio || '',
      crops: [],
      followers: 0,
      following: 0,
      verified: false
    };
    
    setUser(newUser);
    localStorage.setItem('smartfarm_user', JSON.stringify(newUser));
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('smartfarm_user');
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};