import api from './api';

// Orders API Services
export const ordersService = {
  // Get all orders
  getOrders: async (params = {}) => {
    const response = await api.get('/dashboard/orders', { params });
    return response.data;
  },

  // Get single order
  getOrder: async (id) => {
    const response = await api.get(`/dashboard/orders/${id}`);
    return response.data;
  },

  // Update order
  updateOrder: async (id, orderData) => {
    const response = await api.put(`/dashboard/orders/${id}`, orderData);
    return response.data;
  },

  // Soft delete order
  deleteOrder: async (id) => {
    const response = await api.delete(`/dashboard/orders/${id}`);
    return response.data;
  },

  // Restore order
  restoreOrder: async (id) => {
    const response = await api.post(`/dashboard/orders/${id}/restore`);
    return response.data;
  },

};