import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? 'http://localhost:5000/api' 
      : 'https://jelppharm-5vcm.onrender.com/api'),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Dashboard API calls
export const dashboardAPI = {
  // Get dashboard statistics
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  // Get alerts and notifications
  getAlerts: async () => {
    const response = await api.get('/dashboard/alerts');
    return response.data;
  },

  // Get recent activities
  getRecentActivities: async () => {
    const response = await api.get('/dashboard/recent-activities');
    return response.data;
  },
};

// Auth API calls
export const authAPI = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: { name: string; email: string; password: string; role: string }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string) => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },
};

// Drugs API calls
export const drugsAPI = {
  getAll: async () => {
    const response = await api.get('/drugs');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/drugs/${id}`);
    return response.data;
  },

  create: async (drugData: any) => {
    const response = await api.post('/drugs', drugData);
    return response.data;
  },

  update: async (id: string, drugData: any) => {
    const response = await api.put(`/drugs/${id}`, drugData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/drugs/${id}`);
    return response.data;
  },
};

// Inventory API calls
export const inventoryAPI = {
  getInventory: async () => {
    const response = await api.get('/inventory');
    return response.data;
  },

  updateStock: async (id: string, quantity: number) => {
    const response = await api.put(`/inventory/${id}/stock`, { quantity });
    return response.data;
  },

  getLowStock: async () => {
    const response = await api.get('/inventory/low-stock');
    return response.data;
  },

  getExpiringSoon: async () => {
    const response = await api.get('/inventory/expiring-soon');
    return response.data;
  },
};

// Sales API calls
export const salesAPI = {
  getAll: async () => {
    const response = await api.get('/sales');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/sales/${id}`);
    return response.data;
  },

  create: async (saleData: any) => {
    const response = await api.post('/sales', saleData);
    return response.data;
  },

  update: async (id: string, saleData: any) => {
    const response = await api.put(`/sales/${id}`, saleData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/sales/${id}`);
    return response.data;
  },
};

// Prescriptions API calls
export const prescriptionsAPI = {
  getAll: async () => {
    const response = await api.get('/prescriptions');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/prescriptions/${id}`);
    return response.data;
  },

  create: async (prescriptionData: any) => {
    const response = await api.post('/prescriptions', prescriptionData);
    return response.data;
  },

  update: async (id: string, prescriptionData: any) => {
    const response = await api.put(`/prescriptions/${id}`, prescriptionData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/prescriptions/${id}`);
    return response.data;
  },

  fill: async (id: string) => {
    const response = await api.put(`/prescriptions/${id}/fill`);
    return response.data;
  },
};

// Users API calls
export const usersAPI = {
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  create: async (userData: any) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  update: async (id: string, userData: any) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

// Reports API calls
export const reportsAPI = {
  getSalesReport: async (startDate: string, endDate: string) => {
    const response = await api.get('/reports/sales', { params: { startDate, endDate } });
    return response.data;
  },

  getInventoryReport: async () => {
    const response = await api.get('/reports/inventory');
    return response.data;
  },

  getPrescriptionReport: async (startDate: string, endDate: string) => {
    const response = await api.get('/reports/prescriptions', { params: { startDate, endDate } });
    return response.data;
  },
};

export default api;
