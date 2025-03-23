// frontend/web-app/src/services/paymentService.js
import api from './api';

// Process payment
const processPayment = async (paymentData) => {
  const response = await api.post('/payments/process-payment', paymentData);
  return response.data;
};

// Get user wallet
const getUserWallet = async () => {
  const response = await api.get('/payments/wallet');
  return response.data;
};

// Add funds to wallet
const addWalletFunds = async (fundData) => {
  const response = await api.post('/payments/wallet/add-funds', fundData);
  return response.data;
};

// Get user payment methods
const getUserPaymentMethods = async () => {
  const response = await api.get('/payments/payment-methods');
  return response.data;
};

// Add payment method
const addPaymentMethod = async (methodData) => {
  const response = await api.post('/payments/payment-methods', methodData);
  return response.data;
};

// Get user payments
const getUserPayments = async (params = {}) => {
  const response = await api.get('/payments', { params });
  return response.data;
};

// Get payment by id
const getPayment = async (paymentId) => {
  const response = await api.get(`/payments/${paymentId}`);
  return response.data;
};

// Request refund
const requestRefund = async (refundData) => {
  const response = await api.post('/payments/refund', refundData);
  return response.data;
};

const paymentService = {
  processPayment,
  getUserWallet,
  addWalletFunds,
  getUserPaymentMethods,
  addPaymentMethod,
  getUserPayments,
  getPayment,
  requestRefund
};

export default paymentService;