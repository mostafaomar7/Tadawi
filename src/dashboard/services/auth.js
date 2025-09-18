import api from './api';

// Auth API Services - Based on Postman Collection
export const authService = {
  // Admin login
  login: async (credentials) => {
    const response = await api.post('/login', credentials);
    return response.data;
  },

  // Register new user
  register: async (userData) => {
    const response = await api.post('/v1/auth/register', userData);
    return response.data;
  },

  // Verify OTP
  verifyOtp: async (otpData) => {
    const response = await api.post('/v1/auth/verify-otp', otpData);
    return response.data;
  },

  // Resend OTP
  resendOtp: async (email) => {
    const response = await api.post('/v1/auth/resend-otp', { email });
    return response.data;
  },

  // Send password reset OTP
  sendPasswordResetOtp: async (email) => {
    const response = await api.post('/v1/auth/send-password-reset-otp', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (resetData) => {
    const response = await api.post('/v1/auth/reset-password', resetData);
    return response.data;
  },

  // Google OAuth redirect
  googleRedirect: async () => {
    const response = await api.get('/v1/auth/google/redirect');
    return response.data;
  },

  // Google OAuth callback
  googleCallback: async (code) => {
    const response = await api.get(`/v1/auth/google/callback?code=${code}`);
    return response.data;
  },

  // Get current user
  getMe: async () => {
    const response = await api.get('/dashboard/me');
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post('/dashboard/logout');
    return response.data;
  },

  // Update user role
  updateRole: async (roleData) => {
    const response = await api.post('/v1/auth/update-role', roleData);
    return response.data;
  },
};