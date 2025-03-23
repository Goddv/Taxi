// frontend/web-app/src/services/driverService.js
import api from './api';

// Update driver availability
const updateDriverAvailability = async (isAvailable) => {
  const response = await api.put('/drivers/availability', { isAvailable });
  return response.data;
};

// Get driver location
const getDriverLocation = async () => {
  const response = await api.get('/drivers/location');
  return response.data;
};

// Get driver earnings
const getDriverEarnings = async (params = {}) => {
  const response = await api.get('/drivers/earnings', { params });
  return response.data;
};

// Get driver statistics
const getDriverStatistics = async () => {
  const response = await api.get('/drivers/statistics');
  return response.data;
};

// Accept booking
const acceptBooking = async (bookingId) => {
  const response = await api.put(`/bookings/${bookingId}/assign-driver`, {
    driverId: 'me' // 'me' is a placeholder that will be replaced with actual ID in the backend
  });
  return response.data;
};

// Get nearby bookings
const getNearbyBookings = async () => {
  const response = await api.get('/drivers/nearby-bookings');
  return response.data;
};

// Update driver profile
const updateDriverProfile = async (profileData) => {
  const response = await api.put('/drivers/profile', profileData);
  return response.data;
};

// Update vehicle details
const updateVehicleDetails = async (vehicleData) => {
  const response = await api.put('/drivers/vehicle', vehicleData);
  return response.data;
};

const driverService = {
  updateDriverAvailability,
  getDriverLocation,
  getDriverEarnings,
  getDriverStatistics,
  acceptBooking,
  getNearbyBookings,
  updateDriverProfile,
  updateVehicleDetails
};

export default driverService;