import api from './api';

// Therapeutic Classes API Services
export const therapeuticClassesService = {
  // Get all therapeutic classes with pagination
  getTherapeuticClasses: async (params = {}) => {
    const response = await api.get('/dashboard/therapeutic-classes', { 
      params: {
        per_page: 10,
        page: 1,
        ...params
      }
    });
    return response.data;
  },

  // Get single therapeutic class
  getTherapeuticClass: async (id) => {
    const response = await api.get(`/dashboard/therapeutic-classes/${id}`);
    return response.data;
  },

  // Create new therapeutic class
  createTherapeuticClass: async (data) => {
    const response = await api.post('/dashboard/therapeutic-classes', data);
    return response.data;
  },

  // Update therapeutic class
  updateTherapeuticClass: async (id, data) => {
    const response = await api.put(`/dashboard/therapeutic-classes/${id}`, data);
    return response.data;
  },

  // Delete therapeutic class (soft delete)
  deleteTherapeuticClass: async (id) => {
    const response = await api.delete(`/dashboard/therapeutic-classes/${id}`);
    return response.data;
  },

  // Restore therapeutic class
  restoreTherapeuticClass: async (id) => {
    const response = await api.post(`/dashboard/therapeutic-classes/${id}/restore`);
    return response.data;
  },
};
