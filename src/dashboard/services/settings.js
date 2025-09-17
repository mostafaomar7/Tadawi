import api from './api';

// Settings API Services - Based on Postman Collection
export const settingsService = {
  // Get settings
  getSettings: async () => {
    const response = await api.get('/dashboard/settings');
    return response.data;
  },

  // Update settings
  updateSettings: async (settingsData) => {
    const response = await api.put('/dashboard/settings', settingsData);
    return response.data;
  },

  // Get permissions
  getPermissions: async () => {
    const response = await api.get('/dashboard/settings/permissions');
    return response.data;
  },

  // Update permissions
  updatePermissions: async (permissionsData) => {
    const response = await api.post('/dashboard/settings/permissions', permissionsData);
    return response.data;
  },

  // Get reports
  getReports: async (type) => {
    const response = await api.get(`/dashboard/settings/reports/${type}`);
    return response.data;
  },

  // Get shortages report
  getShortagesReport: async () => {
    const response = await api.get('/dashboard/settings/reports/shortages');
    return response.data;
  },

  // Get user stats report
  getUserStatsReport: async () => {
    const response = await api.get('/dashboard/settings/reports/user_stats');
    return response.data;
  },
};