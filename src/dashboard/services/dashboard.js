import api from './api';

// Dashboard API Services
export const dashboardService = {
  // Get dashboard overview
  getOverview: async () => {
    const response = await api.get('/dashboard/');
    return response.data;
  },

  // Get dashboard summary
  getSummary: async () => {
    const response = await api.get('/dashboard/summary');
    return response.data;
  },

  // Get charts data
  getChartsData: async () => {
    const response = await api.get('/dashboard/charts');
    return response.data;
  },

  // Get medicine shortage chart
  getMedicineShortageChart: async () => {
    const response = await api.get('/dashboard/charts/medicine-shortage');
    return response.data;
  },

  // Get daily orders chart
  getDailyOrdersChart: async () => {
    const response = await api.get('/dashboard/charts/daily-orders');
    return response.data;
  },

  // Get user roles chart
  getUserRoleChart: async () => {
    const response = await api.get('/dashboard/charts/user-roles');
    return response.data;
  },

  // Global search
  globalSearch: async (query) => {
    const response = await api.get(`/dashboard/search?q=${query}`);
    return response.data;
  },

  // Search users
  searchUsers: async (query) => {
    const response = await api.get(`/dashboard/search/users?q=${query}`);
    return response.data;
  },

  // Search medicines
  searchMedicines: async (query) => {
    const response = await api.get(`/dashboard/search/medicines?q=${query}`);
    return response.data;
  },
};
