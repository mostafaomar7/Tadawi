import api from './api';

// Donations API Services
export const donationsService = {
  // Get all donations
  getDonations: async (params = {}) => {
    const response = await api.get('/dashboard/donations', { params });
    return response.data;
  },

  // Get single donation
  getDonation: async (id) => {
    const response = await api.get(`/dashboard/donations/${id}`);
    return response.data;
  },

  // Update donation
  updateDonation: async (id, donationData) => {
    const response = await api.put(`/dashboard/donations/${id}`, donationData);
    return response.data;
  },

  // Soft delete donation
  deleteDonation: async (id) => {
    const response = await api.delete(`/dashboard/donations/${id}`);
    return response.data;
  },

  // Restore donation
  restoreDonation: async (id) => {
    const response = await api.post(`/dashboard/donations/${id}/restore`);
    return response.data;
  },

};