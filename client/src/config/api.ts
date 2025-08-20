// API Configuration
export const API_CONFIG = {
  // Base URL for the API
  BASE_URL: process.env.REACT_APP_API_URL || 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? 'http://localhost:5000/api' 
      : 'https://jelppharm-pms.onrender.com/api'), // Point to your new server service
  
  // Server URL
  SERVER_URL: process.env.REACT_APP_SERVER_URL || 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? 'http://localhost:5000' 
      : 'https://jelppharm-pms.onrender.com'), // Point to your new server service
  
  // API Endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      SIGNUP: '/auth/signup',
      LOGOUT: '/auth/logout',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
    },
    USERS: '/users',
    DRUGS: '/drugs',
    INVENTORY: '/inventory',
    SALES: '/sales',
    PRESCRIPTIONS: '/prescriptions',
    REPORTS: '/reports',
    STORES: '/stores',
    DASHBOARD: '/dashboard',
  },
  
  // Request timeout (in milliseconds)
  TIMEOUT: 10000,
  
  // Default headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get auth token from localStorage
export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Helper function to set auth token in localStorage
export const setAuthToken = (token: string): void => {
  localStorage.setItem('token', token);
};

// Helper function to remove auth token from localStorage
export const removeAuthToken = (): void => {
  localStorage.removeItem('token');
};
