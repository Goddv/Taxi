// frontend/web-app/src/services/bookingService.js
import api from './api';

// Create booking
const createBooking = async (bookingData) => {
  const response = await api.post('/bookings', bookingData);
  return response.data;
};

// Get booking by id
const getBooking = async (bookingId) => {
  const response = await api.get(`/bookings/${bookingId}`);
  return response.data;
};

// Get user bookings
const getUserBookings = async (params = {}) => {
  const response = await api.get('/bookings', { params });
  return response.data;
};

// Update booking status
const updateBookingStatus = async (bookingId, status) => {
  const response = await api.put(`/bookings/${bookingId}/status`, { status });
  return response.data;
};

// Rate booking
const rateBooking = async (bookingId, rating, feedback) => {
  const response = await api.post(`/bookings/${bookingId}/rate`, { rating, feedback });
  return response.data;
};

// Calculate fare estimate
const calculateFareEstimate = async (pickupLocation, dropoffLocation, vehicleType) => {
  const response = await api.post('/bookings/estimate', {
    pickupLocation,
    dropoffLocation,
    vehicleType
  });
  return response.data;
};

const bookingService = {
  createBooking,
  getBooking,
  getUserBookings,
  updateBookingStatus,
  rateBooking,
  calculateFareEstimate
};

export default bookingService;
