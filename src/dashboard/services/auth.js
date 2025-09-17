import api from './api';

// Auth API Services - Based on Postman Collection
export const authService = {
  // Admin login
  login: async (credentials) => {
    const response = await api.post('/login', credentials);
    return response.data;
  },

  // Get current user
  getMe: async () => {
    const response = await api.get('/dashboard/me');
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post('/dashboard/logout');
    return response.data;
  },
};