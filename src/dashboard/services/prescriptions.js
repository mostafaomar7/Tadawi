import api from './api';

// Prescriptions API Services
export const prescriptionsService = {
  // Get all prescriptions with pagination
  getPrescriptions: async (params = {}) => {
    const response = await api.get('/dashboard/prescriptions', { 
      params: {
        per_page: 10,
        page: 1,
        ...params
      }
    });
    return response.data;
  },

  // Get prescriptions statistics
  getPrescriptionsStats: async () => {
    const response = await api.get('/dashboard/prescriptions/stats');
    return response.data;
  },

  // Get prescriptions by order
  getPrescriptionsByOrder: async (orderId) => {
    const response = await api.get(`/dashboard/prescriptions/order/${orderId}`);
    return response.data;
  },

  // Upload prescription image
  uploadPrescription: async (file) => {
    const formData = new FormData();
    formData.append('prescription_image', file);
    
    const response = await api.post('/dashboard/prescriptions/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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

  // Delete prescription (soft delete)
  deletePrescription: async (id) => {
    const response = await api.delete(`/dashboard/prescriptions/${id}`);
    return response.data;
  },

  // Restore prescription
  restorePrescription: async (id) => {
    const response = await api.post(`/dashboard/prescriptions/${id}/restore`);
    return response.data;
  },

  // Get prescription image URL
  getPrescriptionImageUrl: async (id) => {
    const response = await api.get(`/dashboard/prescriptions/${id}/image-url`);
    return response.data;
  },
};