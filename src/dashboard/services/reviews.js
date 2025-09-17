import api from './api';

const reviewsService = {
  // Get all reviews
  getReviews: async () => {
    const response = await api.get('/dashboard/reviews');
    return response.data;
  },

  // Get review by ID
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

  // Delete review
  deleteReview: async (id) => {
    const response = await api.delete(`/dashboard/reviews/${id}`);
    return response.data;
  },

  // Get reviews by rating
  getReviewsByRating: async (rating) => {
    const response = await api.get(`/dashboard/reviews/rating/${rating}`);
    return response.data;
  },

  // Get reviews by medicine
  getReviewsByMedicine: async (medicineId) => {
    const response = await api.get(`/dashboard/reviews/medicine/${medicineId}`);
    return response.data;
  },

  // Get reviews by user
  getReviewsByUser: async (userId) => {
    const response = await api.get(`/dashboard/reviews/user/${userId}`);
    return response.data;
  },

  // Search reviews
  searchReviews: async (query) => {
    const response = await api.get(`/dashboard/reviews/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Get reviews statistics
  getReviewsStats: async () => {
    const response = await api.get('/dashboard/reviews/stats');
    return response.data;
  }
};

export default reviewsService;
