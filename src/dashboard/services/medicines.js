import api from './api';

// Medicines API Services
export const medicinesService = {
  // Get all medicines with pagination
  getMedicines: async (params = {}) => {
    const response = await api.get('/dashboard/medicines', { 
      params: {
        per_page: 10,
        page: 1,
        ...params
      }
    });
    return response.data;
  },

  // Get medicines statistics
  getMedicinesStats: async () => {
    const response = await api.get('/dashboard/medicines/stats');
    return response.data;
  },

  // Get single medicine
  getMedicine: async (id) => {
    const response = await api.get(`/dashboard/medicines/${id}`);
    return response.data;
  },

  // Create new medicine
  createMedicine: async (data) => {
    const response = await api.post('/dashboard/medicines', data);
    return response.data;
  },

  // Update medicine
  updateMedicine: async (id, data) => {
    const response = await api.put(`/dashboard/medicines/${id}`, data);
    return response.data;
  },

  // Delete medicine (soft delete)
  deleteMedicine: async (id) => {
    const response = await api.delete(`/dashboard/medicines/${id}`);
    return response.data;
  },

  // Restore medicine
  restoreMedicine: async (id) => {
    const response = await api.post(`/dashboard/medicines/${id}/restore`);
    return response.data;
  },
};
