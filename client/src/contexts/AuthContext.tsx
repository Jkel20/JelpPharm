import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { buildApiUrl, setAuthToken, removeAuthToken, getAuthToken } from '../config/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  storeId?: string;
}

interface DashboardInfo {
  route: string;
  type: string;
  requiredPrivilege: string | null;
  title: string;
  description: string;
}

interface AuthContextType {
  user: User | null;
  dashboardInfo: DashboardInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [dashboardInfo, setDashboardInfo] = useState<DashboardInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const token = getAuthToken();
    if (token) {
      // TODO: Validate token with backend
      // For now, just set a mock user
      setUser({
        id: '1',
        email: 'admin@jelppharm.com',
        name: 'Kwame Addo',
        role: 'Administrator'
      });
    }
    setIsLoading(false);
  }, []);

  const login = async (identifier: string, password: string) => {
    try {
      console.log('AuthContext: Starting login process...');
      setIsLoading(true);
      
      // Validate input
      if (!identifier || !password) {
        throw new Error('Email/username and password are required');
      }
      
      // Make API call to server
      const response = await fetch(buildApiUrl('/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.success && data.data) {
        const userData = data.data.user;
        const token = data.data.token;
        
        // Use dashboard info from login response
        const dashboard = data.data.dashboard;
        
        const user: User = {
          id: userData.id,
          email: userData.email,
          name: userData.fullName,
          role: userData.role,
          storeId: userData.storeId
        };
        
        console.log('AuthContext: Setting user:', user);
        console.log('AuthContext: Dashboard info:', dashboard);
        setUser(user);
        setDashboardInfo(dashboard);
        setAuthToken(token);
        console.log('AuthContext: Login completed successfully with dashboard routing');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      throw error; // Re-throw the actual error
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setDashboardInfo(null);
    removeAuthToken();
  };

  const register = async (userData: any) => {
    try {
      setIsLoading(true);
      
      // Make API call to server
      const response = await fetch(buildApiUrl('/auth/signup'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: userData.fullName,
          username: userData.email.split('@')[0], // Generate username from email
          email: userData.email,
          phone: userData.phone,
          password: userData.password,
          role: userData.role,
          storeName: userData.storeName,
          storeAddress: userData.storeAddress
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      if (data.success) {
        console.log('Registration successful:', data);
        // Don't automatically log in the user after registration
        // They need to verify their email first
        // The registration success will be handled in the Signup component
      } else {
        throw new Error('Registration failed');
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    dashboardInfo,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register
  };

  // Debug logging
  console.log('AuthContext: Current state - user:', user, 'isAuthenticated:', !!user, 'isLoading:', isLoading);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
