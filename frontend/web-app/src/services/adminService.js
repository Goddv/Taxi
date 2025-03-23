// frontend/web-app/src/services/adminService.js
import api from './api';

// Get all users
const getAllUsers = async (params = {}) => {
  const response = await api.get('/admin/users', { params });
  return response.data;
};

// Get all drivers
const getAllDrivers = async (params = {}) => {
  const response = await api.get('/admin/drivers', { params });
  return response.data;
};

// Get all bookings
const getAllBookings = async (params = {}) => {
  const response = await api.get('/admin/bookings', { params });
  return response.data;
};

// Get system statistics
const getSystemStatistics = async () => {
  const response = await api.get('/admin/statistics');
  return response.data;
};

// Update user status
const updateUserStatus = async (userId, status) => {
  const response = await api.put(`/admin/users/${userId}/status`, { status });
  return response.data;
};

// Verify driver
const verifyDriver = async (driverId) => {
  const response = await api.put(`/admin/drivers/${driverId}/verify`);
  return response.data;
};

// Get reports
const getReports = async (params = {}) => {
  const response = await api.get('/admin/reports', { params });
  return response.data;
};

// Generate report
const generateReport = async (reportData) => {
  const response = await api.post('/admin/reports/generate', reportData);
  return response.data;
};

const adminService = {
  getAllUsers,
  getAllDrivers,
  getAllBookings,
  getSystemStatistics,
  updateUserStatus,
  verifyDriver,
  getReports,
  generateReport
};

export default adminService;