import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  profileImage: string;
  location: string;
  bio: string;
  role: 'farmer' | 'buyer' | 'expert';
  verified: boolean;
  // Role-specific data
  roleData: {
    farmer?: {
      crops: string[];
      farmSize: number;
      experienceYears: number;
      certifications: string[];
      followers: number;
      following: number;
    };
    buyer?: {
      companyName: string;
      businessType: string;
      creditLimit: number;
      purchaseVolume: string;
      totalPurchases: number;
      monthlySpending: number;
    };
    expert?: {
      credentials: string[];
      specializations: string[];
      experienceYears: number;
      consultationRate: number;
      rating: number;
      totalConsultations: number;
    };
  };
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
  role: 'farmer' | 'buyer' | 'expert';
  roleSpecificData?: any;
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
    
    // Demo users for different roles
    const demoUsers = {
      'farmer@smartfarm.com': {
        id: 'user_001',
        name: 'Ravi Kumar',
        email: 'farmer@smartfarm.com',
        profileImage: '/api/placeholder/100/100',
        location: 'Punjab, India',
        bio: 'Wheat and rice farmer with 15 years experience',
        role: 'farmer' as const,
        verified: true,
        roleData: {
          farmer: {
            crops: ['wheat', 'rice', 'sugarcane'],
            farmSize: 10,
            experienceYears: 15,
            certifications: ['Organic Certified'],
            followers: 250,
            following: 180
          }
        }
      },
      'buyer@smartfarm.com': {
        id: 'user_002',
        name: 'Arjun Traders',
        email: 'buyer@smartfarm.com',
        profileImage: '/api/placeholder/100/100',
        location: 'Delhi, India',
        bio: 'Agricultural produce wholesale business',
        role: 'buyer' as const,
        verified: true,
        roleData: {
          buyer: {
            companyName: 'Arjun Agricultural Traders',
            businessType: 'wholesale',
            creditLimit: 500000,
            purchaseVolume: 'high',
            totalPurchases: 50,
            monthlySpending: 85000
          }
        }
      },
      'expert@smartfarm.com': {
        id: 'user_003',
        name: 'Dr. Priya Sharma',
        email: 'expert@smartfarm.com',
        profileImage: '/api/placeholder/100/100',
        location: 'Bangalore, India',
        bio: 'Agricultural scientist and crop consultant',
        role: 'expert' as const,
        verified: true,
        roleData: {
          expert: {
            credentials: ['PhD Agriculture', 'Plant Pathologist'],
            specializations: ['crop diseases', 'soil management', 'organic farming'],
            experienceYears: 20,
            consultationRate: 500,
            rating: 4.7,
            totalConsultations: 150
          }
        }
      }
    };

    const userData = demoUsers[email as keyof typeof demoUsers];
    if (userData && password === 'password') {
      
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
      role: userData.role,
      verified: false,
      roleData: userData.role === 'farmer' ? {
        farmer: {
          crops: [],
          farmSize: 0,
          experienceYears: 0,
          certifications: [],
          followers: 0,
          following: 0
        }
      } : userData.role === 'buyer' ? {
        buyer: {
          companyName: '',
          businessType: 'retail',
          creditLimit: 50000,
          purchaseVolume: 'low',
          totalPurchases: 0,
          monthlySpending: 0
        }
      } : {
        expert: {
          credentials: [],
          specializations: [],
          experienceYears: 0,
          consultationRate: 300,
          rating: 0,
          totalConsultations: 0
        }
      }
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