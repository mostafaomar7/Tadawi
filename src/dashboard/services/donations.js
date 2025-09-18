import api from './api';

// Donations API Services
export const donationsService = {
  // Get all donations with pagination
  getDonations: async (params = {}) => {
    const response = await api.get('/dashboard/donations', { 
      params: {
        per_page: 10,
        page: 1,
        ...params
      }
    });
    return response.data;
  },

  // Get donations statistics
  getDonationsStats: async () => {
    const response = await api.get('/dashboard/donations/stats');
    return response.data;
  },

  // Get my donations (for current user)
  getMyDonations: async (params = {}) => {
    const response = await api.get('/dashboard/donations/my', { params });
    return response.data;
  },

  // Get verified donations
  getVerifiedDonations: async (params = {}) => {
    const response = await api.get('/dashboard/donations/verified', { params });
    return response.data;
  },

  // Get single donation
  getDonation: async (id) => {
    const response = await api.get(`/dashboard/donations/${id}`);
    return response.data;
  },

  // Update donation (approve/reject/verify)
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