import api from './api';

// Users API Services
export const usersService = {
  // Get all users with pagination
  getUsers: async (params = {}) => {
    const response = await api.get('/dashboard/users', { 
      params: {
        per_page: 10,
        page: 1,
        ...params
      }
    });
    return response.data;
  },

  // Get single user
  getUser: async (id) => {
    const response = await api.get(`/dashboard/users/${id}`);
    return response.data;
  },

  // Create new user
  createUser: async (userData) => {
    const response = await api.post('/dashboard/users', userData);
    return response.data;
  },

  // Update user
  updateUser: async (id, userData) => {
    const response = await api.put(`/dashboard/users/${id}`, userData);
    return response.data;
  },

  // Soft delete user
  deleteUser: async (id) => {
    const response = await api.delete(`/dashboard/users/${id}`);
    return response.data;
  },

  // Restore user
  restoreUser: async (id) => {
    const response = await api.post(`/dashboard/users/${id}/restore`);
    return response.data;
  },


};