// backend/tracking-service/src/app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');
const trackingRoutes = require('./routes/tracking.routes');
const socketHandler = require('./utils/socket.handler');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongodb:27017/taxi-tracking', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Initialize socket handlers
socketHandler(io);

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api', trackingRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'tracking-service', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

const PORT = process.env.PORT || 3003;
server.listen(PORT, () => {
  console.log(`Tracking service running on port ${PORT}`);
});

module.exports = { app, io };

// backend/tracking-service/src/models/location.model.js
const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  userType: {
    type: String,
    enum: ['driver', 'passenger'],
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  heading: {
    type: Number,
    default: 0
  },
  speed: {
    type: Number,
    default: 0
  },
  accuracy: {
    type: Number,
    default: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  vehicleType: {
    type: String,
    enum: ['economy', 'comfort', 'premium', 'van'],
    default: 'economy'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes for geospatial queries
locationSchema.index({ location: '2dsphere' });

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;

// backend/tracking-service/src/models/tracking.model.js
const mongoose = require('mongoose');

const trackingSessionSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  passengerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date,
    default: null
  },
  route: [{
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    speed: {
      type: Number,
      default: 0
    },
    heading: {
      type: Number,
      default: 0
    }
  }],
  events: [{
    type: {
      type: String,
      enum: ['pickup_arrived', 'pickup_started', 'dropoff_arrived', 'trip_completed', 'trip_cancelled'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },
    description: {
      type: String,
      default: ''
    }
  }]
}, {
  timestamps: true
});

const TrackingSession = mongoose.model('TrackingSession', trackingSessionSchema);

module.exports = TrackingSession;

// backend/tracking-service/src/controllers/tracking.controller.js
const Location = require('../models/location.model');
const TrackingSession = require('../models/tracking.model');
const axios = require('axios');

// Update driver location
exports.updateLocation = async (req, res) => {
  try {
    const { location, heading, speed, accuracy, isAvailable } = req.body;
    
    if (!location || !location.coordinates) {
      return res.status(400).json({
        message: 'Valid location coordinates are required'
      });
    }

    // Only drivers can update their location
    if (req.user.role !== 'driver') {
      return res.status(403).json({
        message: 'Only drivers can update location'
      });
    }

    // Find existing location or create new one
    let driverLocation = await Location.findOne({
      userId: req.user.id,
      userType: 'driver'
    });

    if (driverLocation) {
      // Update existing location
      driverLocation.location = location;
      driverLocation.heading = heading || driverLocation.heading;
      driverLocation.speed = speed || driverLocation.speed;
      driverLocation.accuracy = accuracy || driverLocation.accuracy;
      driverLocation.isAvailable = isAvailable !== undefined ? isAvailable : driverLocation.isAvailable;
      driverLocation.lastUpdated = new Date();
    } else {
      // Get driver details to set vehicle type
      let vehicleType = 'economy';
      try {
        const response = await axios.get(`${process.env.AUTH_SERVICE_URL || 'http://auth-service:3001'}/api/users/${req.user.id}/driver-details`);
        if (response.data && response.data.vehicle && response.data.vehicle.type) {
          vehicleType = response.data.vehicle.type;
        }
      } catch (error) {
        console.error('Error getting driver details:', error);
        // Continue with default vehicle type
      }

      // Create new location
      driverLocation = new Location({
        userId: req.user.id,
        userType: 'driver',
        location,
        heading: heading || 0,
        speed: speed || 0,
        accuracy: accuracy || 0,
        isAvailable: isAvailable !== undefined ? isAvailable : true,
        vehicleType
      });
    }

    await driverLocation.save();

    // Update active tracking sessions for this driver
    const activeSessions = await TrackingSession.find({
      driverId: req.user.id,
      status: 'active'
    });

    // Broadcast location update to all active sessions
    activeSessions.forEach(async (session) => {
      // Add location to route
      session.route.push({
        location,
        timestamp: new Date(),
        speed: speed || 0,
        heading: heading || 0
      });

      await session.save();

      // Broadcast to connected clients
      req.io.to(`booking_${session.bookingId}`).emit('driver_location_update', {
        bookingId: session.bookingId,
        driverId: req.user.id,
        location,
        heading: heading || 0,
        speed: speed || 0
      });
    });

    res.status(200).json({
      message: 'Location updated successfully',
      location: driverLocation
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      message: 'Failed to update location',
      error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred'
    });
  }
};

// Find nearby drivers
exports.findNearbyDrivers = async (req, res) => {
  try {
    const { latitude, longitude, radius = 5000, vehicleType } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        message: 'Valid coordinates are required'
      });
    }

    // Find available drivers within the given radius
    const query = {
      userType: 'driver',
      isAvailable: true,
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: radius // in meters
        }
      }
    };

    // Add vehicle type filter if provided
    if (vehicleType) {
      query.vehicleType = vehicleType;
    }

    const drivers = await Location.find(query);

    res.status(200).json({
      drivers: drivers.map(driver => ({
        driverId: driver.userId,
        location: driver.location,
        vehicleType: driver.vehicleType,
        lastUpdated: driver.lastUpdated
      }))
    });
  } catch (error) {
    console.error('Find nearby drivers error:', error);
    res.status(500).json({
      message: 'Failed to find nearby drivers',
      error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred'
    });
  }
};

// Start tracking session
exports.startTracking = async (req, res) => {
  try {
    const { bookingId, driverId, passengerId, initialLocation } = req.body;
    
    if (!bookingId || !driverId || !passengerId || !initialLocation) {
      return res.status(400).json({
        message: 'BookingId, driverId, passengerId, and initialLocation are required'
      });
    }

    // Check if session already exists
    const existingSession = await TrackingSession.findOne({
      bookingId,
      status: 'active'
    });

    if (existingSession) {
      return res.status(400).json({
        message: 'Active tracking session already exists for this booking'
      });
    }

    // Create new tracking session
    const session = new TrackingSession({
      bookingId,
      driverId,
      passengerId,
      route: [{
        location: initialLocation,
        timestamp: new Date()
      }],
      events: [{
        type: 'pickup_started',
        timestamp: new Date(),
        location: initialLocation,
        description: 'Driver started journey to pickup point'
      }]
    });

    await session.save();

    // Create a socket room for this booking
    req.io.to(`user_${driverId}`).socketsJoin(`booking_${bookingId}`);
    req.io.to(`user_${passengerId}`).socketsJoin(`booking_${bookingId}`);

    res.status(201).json({
      message: 'Tracking session started successfully',
      session
    });
  } catch (error) {
    console.error('Start tracking error:', error);
    res.status(500).json({
      message: 'Failed to start tracking session',
      error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred'
    });
  }
};

// End tracking session
exports.endTracking = async (req, res) => {
  try {
    const { bookingId, finalLocation, type = 'trip_completed' } = req.body;
    
    if (!bookingId || !finalLocation) {
      return res.status(400).json({
        message: 'BookingId and finalLocation are required'
      });
    }

    // Find session
    const session = await TrackingSession.findOne({
      bookingId,
      status: 'active'
    });

    if (!session) {
      return res.status(404).json({
        message: 'Active tracking session not found for this booking'
      });
    }

    // Add final location to route
    session.route.push({
      location: finalLocation,
      timestamp: new Date()
    });

    // Add event
    session.events.push({
      type,
      timestamp: new Date(),
      location: finalLocation,
      description: type === 'trip_completed' ? 'Trip completed successfully' : 'Trip cancelled'
    });

    // Update session status and end time
    session.status = type === 'trip_completed' ? 'completed' : 'cancelled';
    session.endTime = new Date();

    await session.save();

    // Broadcast session end to connected clients
    req.io.to(`booking_${bookingId}`).emit('tracking_ended', {
      bookingId,
      type,
      finalLocation,
      timestamp: new Date()
    });

    // Remove clients from the booking room
    req.io.in(`booking_${bookingId}`).socketsLeave(`booking_${bookingId}`);

    res.status(200).json({
      message: 'Tracking session ended successfully',
      session
    });
  } catch (error) {
    console.error('End tracking error:', error);
    res.status(500).json({
      message: 'Failed to end tracking session',
      error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred'
    });
  }
};

// Record tracking event
exports.recordEvent = async (req, res) => {
  try {
    const { bookingId, type, location, description } = req.body;
    
    if (!bookingId || !type || !location) {
      return res.status(400).json({
        message: 'BookingId, type, and location are required'
      });
    }

    // Validate event type
    const validTypes = ['pickup_arrived', 'pickup_started', 'dropoff_arrived', 'trip_completed', 'trip_cancelled'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        message: 'Invalid event type'
      });
    }

    // Find session
    const session = await TrackingSession.findOne({
      bookingId,
      status: 'active'
    });

    if (!session) {
      return res.status(404).json({
        message: 'Active tracking session not found for this booking'
      });
    }

    // Add event
    session.events.push({
      type,
      timestamp: new Date(),
      location,
      description: description || ''
    });

    // Add location to route as well
    session.route.push({
      location,
      timestamp: new Date()
    });

    // If completing or cancelling trip, end session
    if (type === 'trip_completed' || type === 'trip_cancelled') {
      session.status = type === 'trip_completed' ? 'completed' : 'cancelled';
      session.endTime = new Date();

      // Broadcast session end to connected clients
      req.io.to(`booking_${bookingId}`).emit('tracking_ended', {
        bookingId,
        type,
        location,
        timestamp: new Date()
      });

      // Remove clients from the booking room
      req.io.in(`booking_${bookingId}`).socketsLeave(`booking_${bookingId}`);
    } else {
      // Broadcast event to connected clients
      req.io.to(`booking_${bookingId}`).emit('tracking_event', {
        bookingId,
        type,
        location,
        timestamp: new Date(),
        description: description || ''
      });
    }

    await session.save();

    res.status(200).json({
      message: 'Event recorded successfully',
      event: session.events[session.events.length - 1]
    });
  } catch (error) {
    console.error('Record event error:', error);
    res.status(500).json({
      message: 'Failed to record event',
      error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred'
    });
  }
};

// Get tracking session
exports.getTrackingSession = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    // Find session
    const session = await TrackingSession.findOne({ bookingId });

    if (!session) {
      return res.status(404).json({
        message: 'Tracking session not found for this booking'
      });
    }

    // Check if user is authorized to view this session
    if (session.passengerId.toString() !== req.user.id && 
        session.driverId.toString() !== req.user.id && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Not authorized to view this tracking session'
      });
    }

    res.status(200).json({
      session
    });
  } catch (error) {
    console.error('Get tracking session error:', error);
    res.status(500).json({
      message: 'Failed to get tracking session',
      error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred'
    });
  }
};

// backend/tracking-service/src/utils/socket.handler.js
const jwt = require('jsonwebtoken');

module.exports = (io) => {
  // Middleware for authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret');
      socket.user = {
        id: decoded.id,
        role: decoded.role
      };
      next();
    } catch (error) {
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.id}`);

    // Join user's private room
    socket.join(`user_${socket.user.id}`);

    // Handle client joining a booking room
    socket.on('join_booking', (bookingId) => {
      socket.join(`booking_${bookingId}`);
      console.log(`User ${socket.user.id} joined booking ${bookingId}`);
    });

    // Handle client leaving a booking room
    socket.on('leave_booking', (bookingId) => {
      socket.leave(`booking_${bookingId}`);
      console.log(`User ${socket.user.id} left booking ${bookingId}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.id}`);
    });
  });
};

// backend/tracking-service/src/routes/tracking.routes.js
const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/tracking.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// All routes require authentication
router.use(authMiddleware.authenticate);

// Tracking routes
router.post('/location', trackingController.updateLocation);
router.post('/nearby-drivers', trackingController.findNearbyDrivers);
router.post('/tracking/start', trackingController.startTracking);
router.post('/tracking/end', trackingController.endTracking);
router.post('/tracking/event', trackingController.recordEvent);
router.get('/tracking/:bookingId', trackingController.getTrackingSession);

module.exports = router;

// backend/tracking-service/src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');

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