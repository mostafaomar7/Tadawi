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

  // Get users statistics
  getUsersStats: async () => {
    const response = await api.get('/dashboard/users/stats');
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

  // Get doctors
  getDoctors: async (params = {}) => {
    const response = await api.get('/dashboard/users/doctors', { params });
    return response.data;
  },

  // Get pharmacies
  getPharmacies: async (params = {}) => {
    const response = await api.get('/dashboard/users/pharmacies', { params });
    return response.data;
  },

  // Upload profile picture
  uploadProfilePicture: async (file) => {
    const formData = new FormData();
    formData.append('profile_picture', file);
    
    const response = await api.post('/dashboard/users/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};