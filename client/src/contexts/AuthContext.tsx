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
  hasPrivilege: (privilegeCode: string) => boolean;
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
      // Validate token locally and set user if valid
      validateTokenLocally(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  // Function to validate existing token locally
  const validateTokenLocally = async (token: string) => {
    try {
      // Try to decode the token to check if it's expired
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      if (payload.exp && payload.exp < currentTime) {
        // Token is expired, remove it
        console.log('Token expired, removing...');
        removeAuthToken();
        setIsLoading(false);
        return;
      }

      // Token is valid, set user from token payload
      const user: User = {
        id: payload.userId,
        email: payload.email || 'user@example.com',
        name: payload.name || 'User',
        role: payload.role || 'User',
        storeId: payload.storeId
      };
      
      setUser(user);
      console.log('User restored from token:', user);
    } catch (error) {
      console.error('Token validation error:', error);
      // On error, remove the token to be safe
      removeAuthToken();
    } finally {
      setIsLoading(false);
    }
  };

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
    console.log('AuthContext: User logged out');
  };

  // Check if user has a specific privilege based on their role
  const hasPrivilege = (privilegeCode: string): boolean => {
    if (!user) return false;

    // Define privilege mappings for each role
    const rolePrivileges: Record<string, string[]> = {
      'Administrator': [
        'VIEW_USERS', 'CREATE_USERS', 'EDIT_USERS', 'DELETE_USERS',
        'VIEW_INVENTORY', 'MANAGE_INVENTORY', 'ADJUST_STOCK',
        'VIEW_SALES', 'CREATE_SALES', 'MANAGE_SALES',
        'VIEW_PRESCRIPTIONS', 'MANAGE_PRESCRIPTIONS', 'DISPENSE_MEDICATIONS',
        'VIEW_REPORTS', 'GENERATE_REPORTS', 'SYSTEM_SETTINGS', 'DATABASE_MANAGEMENT'
      ],
      'Pharmacist': [
        'VIEW_USERS', 'VIEW_INVENTORY', 'MANAGE_INVENTORY', 'ADJUST_STOCK',
        'VIEW_SALES', 'CREATE_SALES', 'MANAGE_SALES',
        'VIEW_PRESCRIPTIONS', 'MANAGE_PRESCRIPTIONS', 'DISPENSE_MEDICATIONS',
        'VIEW_REPORTS', 'GENERATE_REPORTS'
      ],
      'Store Manager': [
        'VIEW_USERS', 'CREATE_USERS', 'EDIT_USERS',
        'VIEW_INVENTORY', 'MANAGE_INVENTORY', 'ADJUST_STOCK',
        'VIEW_SALES', 'CREATE_SALES', 'MANAGE_SALES',
        'VIEW_PRESCRIPTIONS', 'MANAGE_PRESCRIPTIONS', 'DISPENSE_MEDICATIONS',
        'VIEW_REPORTS', 'GENERATE_REPORTS'
      ],
      'Cashier': [
        'VIEW_INVENTORY', 'VIEW_SALES', 'CREATE_SALES',
        'VIEW_PRESCRIPTIONS', 'VIEW_REPORTS'
      ]
    };

    // Normalize user role to match the privilege mapping
    const normalizedRole = user.role === 'PHARMACIST' ? 'Pharmacist' : 
                          user.role === 'STORE MANAGER' ? 'Store Manager' : 
                          user.role === 'CASHIER' ? 'Cashier' : 
                          user.role === 'ADMINISTRATOR' ? 'Administrator' : 
                          user.role;
    
    const userPrivileges = rolePrivileges[normalizedRole] || [];
    return userPrivileges.includes(privilegeCode);
  };

  const value: AuthContextType = {
    user,
    dashboardInfo,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    hasPrivilege
  };

  // Debug logging (commented out to reduce console noise)
  // console.log('AuthContext: Current state - user:', user, 'isAuthenticated:', !!user, 'isLoading:', isLoading);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
