// backend/booking-service/src/app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bookingRoutes = require('./routes/booking.routes');

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongodb:27017/taxi-bookings', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api', bookingRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'booking-service', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Booking service running on port ${PORT}`);
});

module.exports = app;

// backend/booking-service/src/models/booking.model.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  passengerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  pickupLocation: {
    address: {
      type: String,
      required: true
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true
      }
    }
  },
  dropoffLocation: {
    address: {
      type: String,
      required: true
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true
      }
    }
  },
  pickupTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'driver_assigned', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  fareEstimate: {
    type: Number,
    required: true
  },
  actualFare: {
    type: Number,
    default: null
  },
  distance: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  vehicleType: {
    type: String,
    enum: ['economy', 'comfort', 'premium', 'van'],
    default: 'economy'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'wallet'],
    default: 'cash'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  specialRequirements: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  feedback: {
    type: String,
    default: ''
  },
  isScheduled: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create indexes for geospatial queries
bookingSchema.index({ 'pickupLocation.coordinates': '2dsphere' });
bookingSchema.index({ 'dropoffLocation.coordinates': '2dsphere' });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;

// backend/booking-service/src/controllers/booking.controller.js
const Booking = require('../models/booking.model');
const axios = require('axios');

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const {
      pickupLocation,
      dropoffLocation,
      pickupTime,
      vehicleType,
      paymentMethod,
      specialRequirements,
      isScheduled
    } = req.body;

    // Validate required fields
    if (!pickupLocation || !dropoffLocation || !pickupTime) {
      return res.status(400).json({
        message: 'Pickup location, dropoff location, and pickup time are required'
      });
    }

    // Calculate fare estimate, distance, and duration
    // In a real app, this would use a maps API
    const distance = 10; // placeholder for distance calculation in km
    const duration = 20; // placeholder for duration calculation in minutes
    
    // Calculate fare based on distance and vehicle type
    let fareMultiplier = 1;
    switch (vehicleType) {
      case 'comfort':
        fareMultiplier = 1.2;
        break;
      case 'premium':
        fareMultiplier = 1.5;
        break;
      case 'van':
        fareMultiplier = 1.7;
        break;
      default:
        fareMultiplier = 1;
    }
    
    const basePrice = 5; // Base price in dollars
    const perKmRate = 1.5; // Rate per km in dollars
    const fareEstimate = (basePrice + (distance * perKmRate)) * fareMultiplier;

    // Create booking
    const booking = new Booking({
      passengerId: req.user.id,
      pickupLocation,
      dropoffLocation,
      pickupTime: new Date(pickupTime),
      vehicleType: vehicleType || 'economy',
      paymentMethod: paymentMethod || 'cash',
      specialRequirements: specialRequirements || '',
      isScheduled: isScheduled || false,
      fareEstimate,
      distance,
      duration
    });

    await booking.save();

    // If booking is for immediate pickup, find nearby drivers
    if (!isScheduled && new Date(pickupTime) <= new Date()) {
      // In a real app, this would call the tracking service to find nearby drivers
      try {
        await axios.post(`${process.env.TRACKING_SERVICE_URL || 'http://tracking-service:3003'}/api/find-drivers`, {
          bookingId: booking._id,
          pickupLocation: booking.pickupLocation,
          vehicleType: booking.vehicleType
        });
      } catch (error) {
        console.error('Error finding drivers:', error);
        // Continue with booking creation even if driver finding fails
      }
    }

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      message: 'Failed to create booking',
      error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred'
    });
  }
};

// Get booking by ID
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found'
      });
    }

    // Check if user is authorized to view this booking
    if (booking.passengerId.toString() !== req.user.id && 
        booking.driverId?.toString() !== req.user.id && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Not authorized to view this booking'
      });
    }

    res.status(200).json({
      booking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      message: 'Failed to get booking',
      error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred'
    });
  }
};

// Get bookings for user (passenger or driver)
exports.getUserBookings = async (req, res) => {
  try {
    const { status, limit = 10, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    // Set filter based on user role
    let filter = {};
    if (req.user.role === 'passenger') {
      filter.passengerId = req.user.id;
    } else if (req.user.role === 'driver') {
      filter.driverId = req.user.id;
    }

    // Add status filter if provided
    if (status) {
      filter.status = status;
    }

    // Get bookings
    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Booking.countDocuments(filter);

    res.status(200).json({
      bookings,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      message: 'Failed to get bookings',
      error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred'
    });
  }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['driver_assigned', 'in_progress', 'completed', 'cancelled'];
    
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Valid status is required'
      });
    }

    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found'
      });
    }

    // Check if user is authorized to update this booking
    if (booking.passengerId.toString() !== req.user.id && 
        booking.driverId?.toString() !== req.user.id && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Not authorized to update this booking'
      });
    }

    // Validate status transitions
    if (booking.status === 'pending' && status !== 'driver_assigned' && status !== 'cancelled') {
      return res.status(400).json({
        message: 'Invalid status transition'
      });
    }

    if (booking.status === 'driver_assigned' && status !== 'in_progress' && status !== 'cancelled') {
      return res.status(400).json({
        message: 'Invalid status transition'
      });
    }

    if (booking.status === 'in_progress' && status !== 'completed' && status !== 'cancelled') {
      return res.status(400).json({
        message: 'Invalid status transition'
      });
    }

    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({
        message: 'Cannot update booking that is already completed or cancelled'
      });
    }

    // Update status
    booking.status = status;
    
    // If completing the ride, update actual fare
    if (status === 'completed') {
      booking.actualFare = booking.fareEstimate; // In a real app, this might be adjusted
      
      // Update payment status if payment method is cash
      if (booking.paymentMethod === 'cash') {
        booking.paymentStatus = 'completed';
      }
      
      // In a real app, if payment method is card or wallet, call payment service
      if (booking.paymentMethod === 'card' || booking.paymentMethod === 'wallet') {
        try {
          await axios.post(`${process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3004'}/api/process-payment`, {
            bookingId: booking._id,
            amount: booking.actualFare,
            passengerId: booking.passengerId,
            paymentMethod: booking.paymentMethod
          });
        } catch (error) {
          console.error('Payment processing error:', error);
          // Continue with booking update even if payment processing fails
        }
      }
    }

    await booking.save();

    // Notify user about booking status update
    try {
      await axios.post(`${process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3005'}/api/send-notification`, {
        userId: booking.passengerId,
        type: 'booking_update',
        title: `Booking ${status}`,
        message: `Your booking has been ${status}`,
        data: { bookingId: booking._id }
      });
    } catch (error) {
      console.error('Notification error:', error);
      // Continue with booking update even if notification fails
    }

    res.status(200).json({
      message: 'Booking status updated successfully',
      booking
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      message: 'Failed to update booking status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred'
    });
  }
};

// Assign driver to booking
exports.assignDriver = async (req, res) => {
  try {
    const { driverId } = req.body;
    
    if (!driverId) {
      return res.status(400).json({
        message: 'Driver ID is required'
      });
    }

    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found'
      });
    }

    // Only admins or the driver being assigned can call this
    if (req.user.role !== 'admin' && req.user.id !== driverId) {
      return res.status(403).json({
        message: 'Not authorized to assign driver'
      });
    }

    // Check if booking is in valid state for driver assignment
    if (booking.status !== 'pending') {
      return res.status(400).json({
        message: 'Booking is not in pending state'
      });
    }

    // Assign driver and update status
    booking.driverId = driverId;
    booking.status = 'driver_assigned';

    await booking.save();

    // Notify passenger about driver assignment
    try {
      await axios.post(`${process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3005'}/api/send-notification`, {
        userId: booking.passengerId,
        type: 'driver_assigned',
        title: 'Driver assigned',
        message: 'A driver has been assigned to your booking',
        data: { bookingId: booking._id, driverId }
      });
    } catch (error) {
      console.error('Notification error:', error);
      // Continue with assignment even if notification fails
    }

    res.status(200).json({
      message: 'Driver assigned successfully',
      booking
    });
  } catch (error) {
    console.error('Assign driver error:', error);
    res.status(500).json({
      message: 'Failed to assign driver',
      error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred'
    });
  }
};

// Rate and provide feedback for completed booking
exports.rateBooking = async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: 'Valid rating between 1 and 5 is required'
      });
    }

    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found'
      });
    }

    // Only the passenger can rate the booking
    if (booking.passengerId.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Not authorized to rate this booking'
      });
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({
        message: 'Can only rate completed bookings'
      });
    }

    // Check if already rated
    if (booking.rating) {
      return res.status(400).json({
        message: 'Booking already rated'
      });
    }

    // Update rating and feedback
    booking.rating = rating;
    booking.feedback = feedback || '';

    await booking.save();

    // Update driver's average rating
    if (booking.driverId) {
      try {
        await axios.post(`${process.env.AUTH_SERVICE_URL || 'http://auth-service:3001'}/api/users/update-driver-rating`, {
          driverId: booking.driverId,
          rating
        });
      } catch (error) {
        console.error('Update driver rating error:', error);
        // Continue with rating even if driver rating update fails
      }
    }

    res.status(200).json({
      message: 'Booking rated successfully',
      booking
    });
  } catch (error) {
    console.error('Rate booking error:', error);
    res.status(500).json({
      message: 'Failed to rate booking',
      error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred'
    });
  }
};

// backend/booking-service/src/routes/booking.routes.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// All routes require authentication
router.use(authMiddleware.authenticate);

// Booking routes
router.post('/bookings', bookingController.createBooking);
router.get('/bookings/:id', bookingController.getBooking);
router.get('/bookings', bookingController.getUserBookings);
router.put('/bookings/:id/status', bookingController.updateBookingStatus);
router.put('/bookings/:id/assign-driver', bookingController.assignDriver);
router.post('/bookings/:id/rate', bookingController.rateBooking);

module.exports = router;

// backend/booking-service/src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');
const axios = require('axios');

exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'Authentication required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret');
    
    // Add user to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token expired'
      });
    }
    
    res.status(401).json({
      message: 'Invalid token'
    });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    next();
  };
};