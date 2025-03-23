// frontend/web-app/src/services/notificationService.js
import api from './api';

// Get user notifications
const getUserNotifications = async (params = {}) => {
  const response = await api.get('/notifications', { params });
  return response.data;
};

// Mark notification as read
const markAsRead = async (notificationId) => {
  const response = await api.put(`/notifications/${notificationId}/read`);
  return response.data;
};

// Mark all notifications as read
const markAllAsRead = async () => {
  const response = await api.put('/notifications/read-all');
  return response.data;
};

// Update notification preferences
const updatePreferences = async (preferences) => {
  const response = await api.put('/preferences', preferences);
  return response.data;
};

// Get notification preferences
const getPreferences = async () => {
  const response = await api.get('/preferences');
  return response.data;
};

// Update push token
const updatePushToken = async (pushToken) => {
  const response = await api.put('/push-token', { pushToken });
  return response.data;
};

const notificationService = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  updatePreferences,
  getPreferences,
  updatePushToken
};

export default notificationService;