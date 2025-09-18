import api from './api';

// Reviews API Services
export const reviewsService = {
  // Get all reviews with pagination
  getReviews: async (params = {}) => {
    const response = await api.get('/dashboard/reviews', { 
      params: {
        per_page: 10,
        page: 1,
        ...params
      }
    });
    return response.data;
  },

  // Get reviews statistics
  getReviewsStats: async () => {
    const response = await api.get('/dashboard/reviews/stats');
    return response.data;
  },

  // Get single review
  getReview: async (id) => {
    const response = await api.get(`/dashboard/reviews/${id}`);
    return response.data;
  },

  // Create new review
  createReview: async (data) => {
    const response = await api.post('/dashboard/reviews', data);
    return response.data;
  },

  // Update review
  updateReview: async (id, data) => {
    const response = await api.put(`/dashboard/reviews/${id}`, data);
    return response.data;
  },

  // Delete review (soft delete)
  deleteReview: async (id) => {
    const response = await api.delete(`/dashboard/reviews/${id}`);
    return response.data;
  },

  // Restore review
  restoreReview: async (id) => {
    const response = await api.post(`/dashboard/reviews/${id}/restore`);
    return response.data;
  },
};