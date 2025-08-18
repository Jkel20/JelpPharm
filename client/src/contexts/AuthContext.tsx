import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  storeId?: string;
}

interface AuthContextType {
  user: User | null;
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token');
    if (token) {
      // TODO: Validate token with backend
      // For now, just set a mock user
      setUser({
        id: '1',
        email: 'admin@jelppharm.com',
        name: 'Admin User',
        role: 'Administrator'
      });
    }
    setIsLoading(false);
  }, []);

  const login = async (identifier: string, password: string) => {
    try {
      console.log('AuthContext: Starting login process...');
      setIsLoading(true);
      // TODO: Implement actual login API call
      // For now, simulate successful login
      const mockUser: User = {
        id: '1',
        email: identifier,
        name: 'Test User',
        role: 'Pharmacist'
      };
      
      console.log('AuthContext: Setting user:', mockUser);
      setUser(mockUser);
      localStorage.setItem('token', 'mock-token');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('AuthContext: Login completed successfully');
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      throw new Error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  const register = async (userData: any) => {
    try {
      setIsLoading(true);
      // TODO: Implement actual registration API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      throw new Error('Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
