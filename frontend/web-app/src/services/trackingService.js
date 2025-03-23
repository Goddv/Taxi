// frontend/web-app/src/services/trackingService.js
import api from './api';

// Start tracking session
const startTracking = async (trackingData) => {
  const response = await api.post('/tracking/tracking/start', trackingData);
  return response.data;
};

// End tracking session
const endTracking = async (endData) => {
  const response = await api.post('/tracking/tracking/end', endData);
  return response.data;
};

// Get tracking session
const getTrackingSession = async (bookingId) => {
  const response = await api.get(`/tracking/tracking/${bookingId}`);
  return response.data;
};

// Update driver location
const updateDriverLocation = async (locationData) => {
  const response = await api.post('/tracking/location', locationData);
  return response.data;
};

// Record tracking event
const recordTrackingEvent = async (eventData) => {
  const response = await api.post('/tracking/tracking/event', eventData);
  return response.data;
};

// Find nearby drivers
const findNearbyDrivers = async (locationData) => {
  const response = await api.post('/tracking/nearby-drivers', locationData);
  return response.data;
};

const trackingService = {
  startTracking,
  endTracking,
  getTrackingSession,
  updateDriverLocation,
  recordTrackingEvent,
  findNearbyDrivers
};

export default trackingService;