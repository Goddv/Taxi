// backend/notification-service/src/app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');
const notificationRoutes = require('./routes/notification.routes');
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
mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongodb:27017/taxi-notifications', {
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
app.use('/api', notificationRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'notification-service', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

const PORT = process.env.PORT || 3005;
server.listen(PORT, () => {
  console.log(`Notification service running on port ${PORT}`);
});

module.exports = { app, io };

// backend/notification-service/src/models/notification.model.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  type: {
    type: String,
    enum: [
      'booking_created',
      'booking_update',
      'driver_assigned',
      'driver_arrived',
      'trip_started',
      'trip_completed',
      'trip_cancelled',
      'payment_confirmation',
      'payment_failed',
      'payment_refund',
      'promo_code',
      'system'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    type: Object,
    default: {}
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;

// backend/notification-service/src/models/user-preferences.model.js
const mongoose = require('mongoose');

const userPreferencesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
    ref: 'User'
  },
  pushEnabled: {
    type: Boolean,
    default: true
  },
  emailEnabled: {
    type: Boolean,
    default: true
  },
  smsEnabled: {
    type: Boolean,
    default: true
  },
  pushToken: {
    type: String,
    default: null
  },
  notificationTypes: {
    bookings: {
      type: Boolean,
      default: true
    },
    payments: {
      type: Boolean,
      default: true
    },
    promotions: {
      type: Boolean,
      default: true
    },
    system: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

const UserPreferences = mongoose.model('UserPreferences', userPreferencesSchema);

module.exports = UserPreferences;

// backend/notification-service/src/controllers/notification.controller.js
const Notification = require('../models/notification.model');
const UserPreferences = require('../models/user-preferences.model');
const axios = require('axios');

// Send notification
exports.sendNotification = async (req, res) => {
  try {
    const { userId, type, title, message, data } = req.body;
    
    if (!userId || !type || !title || !message) {
      return res.status(400).json({
        message: 'UserId, type, title, and message are required'
      });
    }

    // Check if user has disabled this type of notification
    const userPrefs = await UserPreferences.findOne({ userId });
    
    if (userPrefs) {
      // Check notification type preferences
      if (type.includes('booking') && !userPrefs.notificationTypes.bookings) {
        return res.status(200).json({
          message: 'User has disabled booking notifications',
          sent: false
        });
      }

      if (type.includes('payment') && !userPrefs.notificationTypes.payments) {
        return res.status(200).json({
          message: 'User has disabled payment notifications',
          sent: false
        });
      }

      if (type.includes('promo') && !userPrefs.notificationTypes.promotions) {
        return res.status(200).json({
          message: 'User has disabled promotion notifications',
          sent: false
        });
      }

      if (type === 'system' && !userPrefs.notificationTypes.system) {
        return res.status(200).json({
          message: 'User has disabled system notifications',
          sent: false
        });
      }
    }

    // Create notification in database
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      data: data || {}
    });

    await notification.save();

    // Send real-time notification via socket
    req.io.to(`user_${userId}`).emit('notification', {
      id: notification._id,
      type,
      title,
      message,
      data: data || {},
      createdAt: notification.createdAt
    });

    // Get user device tokens and send push notification
    if (userPrefs && userPrefs.pushEnabled && userPrefs.pushToken) {
      // In a real app, this would call a push notification service
      console.log(`Sending push notification to user ${userId}`);
      // sendPushNotification(userPrefs.pushToken, title, message, data);
    }

    // Send email notification if enabled
    if (userPrefs && userPrefs.emailEnabled) {
      // In a real app, this would call an email service
      console.log(`Sending email notification to user ${userId}`);
      // sendEmailNotification(userId, title, message, data);
    }

    // Send SMS notification if enabled
    if (userPrefs && userPrefs.smsEnabled) {
      // In a real app, this would call an SMS service
      console.log(`Sending SMS notification to user ${userId}`);
      // sendSmsNotification(userId, message);
    }

    res.status(201).json({
      message: 'Notification sent successfully',
      notification,
      sent: true
    });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({
      message: 'Failed to send notification',
      error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred'
    });
  }
};

// Get user notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const { limit = 20, page = 1, unreadOnly = false } = req.query;
    const skip = (page - 1) * limit;

    // Set filter
    const filter = { userId: req.user.id };
    
    if (unreadOnly === 'true') {
      filter.isRead = false;
    }

    // Get notifications
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Notification.countDocuments(filter);

    // Get unread count
    const unreadCount = await Notification.countDocuments({
      userId: req.user.id,
      isRead: false
    });

    res.status(200).json({
      notifications,
      unreadCount,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user notifications error:', error);
    res.status(500).json({
      message: 'Failed to get notifications',
      error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred'
    });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findById(id);
    
    if (!notification) {
      return res.status(404).json({
        message: 'Notification not found'
      });
    }

    // Check if user is authorized
    if (notification.userId.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Not authorized to update this notification'
      });
    }

    // Mark as read
    notification.isRead = true;
    notification.readAt = new Date();

    await notification.save();

    res.status(200).json({
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      message: 'Failed to mark notification as read',
      error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred'
    });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.status(200).json({
      message: 'All notifications marked as read',
      count: result.nModified
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      message: 'Failed to mark all notifications as read',
      error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred'
    });
  }
};

// Update notification preferences
exports.updatePreferences = async (req, res) => {
  try {
    const { pushEnabled, emailEnabled, smsEnabled, notificationTypes } = req.body;
    
    // Find or create preferences
    let preferences = await UserPreferences.findOne({ userId: req.user.id });
    
    if (preferences) {
      // Update existing preferences
      if (pushEnabled !== undefined) preferences.pushEnabled = pushEnabled;
      if (emailEnabled !== undefined) preferences.emailEnabled = emailEnabled;
      if (smsEnabled !== undefined) preferences.smsEnabled = smsEnabled;
      
      if (notificationTypes) {
        if (notificationTypes.bookings !== undefined) {
          preferences.notificationTypes.bookings = notificationTypes.bookings;
        }
        if (notificationTypes.payments !== undefined) {
          preferences.notificationTypes.payments = notificationTypes.payments;
        }
        if (notificationTypes.promotions !== undefined) {
          preferences.notificationTypes.promotions = notificationTypes.promotions;
        }
        if (notificationTypes.system !== undefined) {
          preferences.notificationTypes.system = notificationTypes.system;
        }
      }
    } else {
      // Create new preferences
      preferences = new UserPreferences({
        userId: req.user.id,
        pushEnabled: pushEnabled !== undefined ? pushEnabled : true,
        emailEnabled: emailEnabled !== undefined ? emailEnabled : true,
        smsEnabled: smsEnabled !== undefined ? smsEnabled : true,
        notificationTypes: {
          bookings: notificationTypes?.bookings !== undefined ? notificationTypes.bookings : true,
          payments: notificationTypes?.payments !== undefined ? notificationTypes.payments : true,
          promotions: notificationTypes?.promotions !== undefined ? notificationTypes.promotions : true,
          system: notificationTypes?.system !== undefined ? notificationTypes.system : true
        }
      });
    }

    await preferences.save();

    res.status(200).json({
      message: 'Notification preferences updated successfully',
      preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      message: 'Failed to update notification preferences',
      error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred'
    });
  }
};

// Update push token
exports.updatePushToken = async (req, res) => {
  try {
    const { pushToken } = req.body;
    
    if (!pushToken) {
      return res.status(400).json({
        message: 'Push token is required'
      });
    }

    // Find or create preferences
    let preferences = await UserPreferences.findOne({ userId: req.user.id });
    
    if (preferences) {
      // Update existing preferences
      preferences.pushToken = pushToken;
    } else {
      // Create new preferences
      preferences = new UserPreferences({
        userId: req.user.id,
        pushToken
      });
    }

    await preferences.save();

    res.status(200).json({
      message: 'Push token updated successfully'
    });
  } catch (error) {
    console.error('Update push token error:', error);
    res.status(500).json({
      message: 'Failed to update push token',
      error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred'
    });
  }
};

// Get notification preferences
exports.getPreferences = async (req, res) => {
  try {
    // Find preferences
    let preferences = await UserPreferences.findOne({ userId: req.user.id });
    
    // If no preferences found, return default values
    if (!preferences) {
      preferences = {
        pushEnabled: true,
        emailEnabled: true,
        smsEnabled: true,
        notificationTypes: {
          bookings: true,
          payments: true,
          promotions: true,
          system: true
        }
      };
    }

    res.status(200).json({
      preferences
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({
      message: 'Failed to get notification preferences',
      error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred'
    });
  }
};

// backend/notification-service/src/utils/socket.handler.js
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
    console.log(`User connected to notifications: ${socket.user.id}`);

    // Join user's private room
    socket.join(`user_${socket.user.id}`);

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected from notifications: ${socket.user.id}`);
    });
  });
};

// backend/notification-service/src/routes/notification.routes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Routes that require authentication
router.get('/notifications', authMiddleware.authenticate, notificationController.getUserNotifications);
router.put('/notifications/:id/read', authMiddleware.authenticate, notificationController.markAsRead);
router.put('/notifications/read-all', authMiddleware.authenticate, notificationController.markAllAsRead);
router.put('/preferences', authMiddleware.authenticate, notificationController.updatePreferences);
router.put('/push-token', authMiddleware.authenticate, notificationController.updatePushToken);
router.get('/preferences', authMiddleware.authenticate, notificationController.getPreferences);

// Send notification route (internal service route)
router.post('/send-notification', notificationController.sendNotification);

module.exports = router;

// backend/notification-service/src/middlewares/auth.middleware.js
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