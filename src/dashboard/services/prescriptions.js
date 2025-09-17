import api from './api';

// Prescriptions API Services
export const prescriptionsService = {
  // Get all prescriptions
  getPrescriptions: async (params = {}) => {
    const response = await api.get('/dashboard/prescriptions', { params });
    return response.data;
  },

  // Get single prescription
  getPrescription: async (id) => {
    const response = await api.get(`/dashboard/prescriptions/${id}`);
    return response.data;
  },

  // Update prescription
  updatePrescription: async (id, prescriptionData) => {
    const response = await api.put(`/dashboard/prescriptions/${id}`, prescriptionData);
    return response.data;
  },

  // Delete prescription
  deletePrescription: async (id) => {
    const response = await api.delete(`/dashboard/prescriptions/${id}`);
    return response.data;
  },

};