// backend/api-gateway/src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', apiLimiter);

// Service routes configuration
const SERVICES = {
  AUTH: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
  BOOKING: process.env.BOOKING_SERVICE_URL || 'http://booking-service:3002',
  TRACKING: process.env.TRACKING_SERVICE_URL || 'http://tracking-service:3003',
  PAYMENT: process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3004',
  NOTIFICATION: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3005'
};

// Authentication service proxy
app.use('/api/auth', createProxyMiddleware({
  target: SERVICES.AUTH,
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '/api'
  }
}));

// Booking service proxy
app.use('/api/bookings', createProxyMiddleware({
  target: SERVICES.BOOKING,
  changeOrigin: true,
  pathRewrite: {
    '^/api/bookings': '/api'
  }
}));

// Tracking service proxy
app.use('/api/tracking', createProxyMiddleware({
  target: SERVICES.TRACKING,
  changeOrigin: true,
  pathRewrite: {
    '^/api/tracking': '/api'
  }
}));

// Payment service proxy
app.use('/api/payments', createProxyMiddleware({
  target: SERVICES.PAYMENT,
  changeOrigin: true,
  pathRewrite: {
    '^/api/payments': '/api'
  }
}));

// Notification service proxy
app.use('/api/notifications', createProxyMiddleware({
  target: SERVICES.NOTIFICATION,
  changeOrigin: true,
  pathRewrite: {
    '^/api/notifications': '/api'
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});

module.exports = app;