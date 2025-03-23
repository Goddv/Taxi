// frontend/web-app/src/services/authService.js
import api from './api';

// Register user
const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  
  return response.data;
};

// Login user
const login = async (userData) => {
  const response = await api.post('/auth/login', userData);
  
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  
  return response.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
};

// Refresh token
const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!refreshToken) {
    return { user: null, token: null };
  }
  
  const response = await api.post('/auth/refresh-token', { refreshToken });
  
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  
  return response.data;
};

// Get user profile
const getProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};

// Update user profile
const updateProfile = async (profileData) => {
  const response = await api.put('/users/profile', profileData);
  return response.data;
};

// Update password
const updatePassword = async (passwordData) => {
  const response = await api.put('/users/password', passwordData);
  return response.data;
};

const authService = {
  register,
  login,
  logout,
  refreshToken,
  getProfile,
  updateProfile,
  updatePassword
};

export default authService;