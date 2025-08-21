// API Configuration
export const API_CONFIG = {
  // Base URL for the API
  BASE_URL: process.env.REACT_APP_API_URL || 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? 'http://localhost:5000/api' 
      : 'https://jelppharm-pms.onrender.com/api'),
  
  // Server URL
  SERVER_URL: process.env.REACT_APP_SERVER_URL || 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? 'http://localhost:5000' 
      : 'https://jelppharm-pms.onrender.com'),
  
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
  TIMEOUT: 15000, // Increased timeout for production
  
  // Default headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
};

// Debug logging only in development
if (process.env.NODE_ENV === 'development') {
  console.log('🔍 API Config Debug:');
  console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
  console.log('REACT_APP_SERVER_URL:', process.env.REACT_APP_SERVER_URL);
  console.log('window.location.hostname:', window.location.hostname);
  console.log('Final BASE_URL:', API_CONFIG.BASE_URL);
  console.log('Final SERVER_URL:', API_CONFIG.SERVER_URL);
}

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  const fullUrl = `${API_CONFIG.BASE_URL}${endpoint}`;
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔗 Building API URL: ${endpoint} -> ${fullUrl}`);
  }
  return fullUrl;
};

// Helper function to get auth token from localStorage
export const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem('token');
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    return null;
  }
};

// Helper function to set auth token in localStorage
export const setAuthToken = (token: string): void => {
  try {
    localStorage.setItem('token', token);
  } catch (error) {
    console.error('Error setting token in localStorage:', error);
  }
};

// Helper function to remove auth token from localStorage
export const removeAuthToken = (): void => {
  try {
    localStorage.removeItem('token');
  } catch (error) {
    console.error('Error removing token from localStorage:', error);
  }
};
