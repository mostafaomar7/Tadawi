import api from './api';

// Active Ingredients API Services
export const activeIngredientsService = {
  // Get all active ingredients with pagination
  getActiveIngredients: async (params = {}) => {
    const response = await api.get('/dashboard/active-ingredients', { 
      params: {
        per_page: 10,
        page: 1,
        ...params
      }
    });
    return response.data;
  },

  // Get single active ingredient
  getActiveIngredient: async (id) => {
    const response = await api.get(`/dashboard/active-ingredients/${id}`);
    return response.data;
  },

  // Create new active ingredient
  createActiveIngredient: async (data) => {
    const response = await api.post('/dashboard/active-ingredients', data);
    return response.data;
  },

  // Update active ingredient
  updateActiveIngredient: async (id, data) => {
    const response = await api.put(`/dashboard/active-ingredients/${id}`, data);
    return response.data;
  },

  // Delete active ingredient (soft delete)
  deleteActiveIngredient: async (id) => {
    const response = await api.delete(`/dashboard/active-ingredients/${id}`);
    return response.data;
  },

  // Restore active ingredient
  restoreActiveIngredient: async (id) => {
    const response = await api.post(`/dashboard/active-ingredients/${id}/restore`);
    return response.data;
  },
};
