// backend/payment-service/src/app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const paymentRoutes = require('./routes/payment.routes');

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongodb:27017/taxi-payments', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api', paymentRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'payment-service', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`Payment service running on port ${PORT}`);
});

module.exports = app;

// backend/payment-service/src/models/payment.model.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Booking'
  },
  passengerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'wallet'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    default: null
  },
  paymentGateway: {
    type: String,
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  refundReason: {
    type: String,
    default: ''
  },
  receipt: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;

// backend/payment-service/src/models/wallet.model.js
const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    unique: true
  },
  balance: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  transactions: [{
    type: {
      type: String,
      enum: ['credit', 'debit'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    reference: {
      type: String,
      default: null
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;

// backend/payment-service/src/models/payment-method.model.js
const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['card', 'bank_account'],
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Card specific fields
  cardDetails: {
    cardType: {
      type: String,
      enum: ['visa', 'mastercard', 'amex', 'discover', 'other'],
      default: null
    },
    lastFour: {
      type: String,
      default: null
    },
    expiryMonth: {
      type: String,
      default: null
    },
    expiryYear: {
      type: String,
      default: null
    },
    cardholderName: {
      type: String,
      default: null
    },
    tokenizedCard: {
      type: String,
      default: null
    }
  },
  // Bank account specific fields
  bankDetails: {
    bankName: {
      type: String,
      default: null
    },
    accountType: {
      type: String,
      enum: ['checking', 'savings'],
      default: null
    },
    lastFour: {
      type: String,
      default: null
    },
    tokenizedAccount: {
      type: String,
      default: null
    }
  }
}, {
  timestamps: true
});

// Create compound index to ensure a user doesn't have duplicate default payment methods
paymentMethodSchema.index({ userId: 1, isDefault: 1 }, {
  partialFilterExpression: { isDefault: true }
});

const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema);

module.exports = PaymentMethod;

// backend/payment-service/src/controllers/payment.controller.js
const Payment = require('../models/payment.model');
const Wallet = require('../models/wallet.model');
const PaymentMethod = require('../models/payment-method.model');
const axios = require('axios');
const crypto = require('crypto');

// Process payment
exports.processPayment = async (req, res) => {
  try {
    const { bookingId, amount, passengerId, driverId, paymentMethod } = req.body;
    
    if (!bookingId || !amount || !passengerId || !paymentMethod) {
      return res.status(400).json({
        message: 'BookingId, amount, passengerId, and paymentMethod are required'
      });
    }

    // Create payment record
    const payment = new Payment({
      bookingId,
      passengerId,
      driverId: driverId || null,
      amount,
      paymentMethod,
      status: 'processing'
    });

    await payment.save();

    // Process payment based on method
    let paymentResult;
    
    switch (paymentMethod) {
      case 'cash':
        // For cash, just mark as completed
        payment.status = 'completed';
        payment.notes = 'Cash payment';
        paymentResult = { success: true };
        break;

      case 'wallet':
        // Process wallet payment
        paymentResult = await processWalletPayment(passengerId, amount, bookingId);
        break;

      case 'card':
        // Process card payment
        paymentResult = await processCardPayment(passengerId, amount, bookingId);
        break;

      default:
        return res.status(400).json({
          message: 'Invalid payment method'
        });
    }

    // Update payment status based on result
    if (paymentResult.success) {
      payment.status = 'completed';
      payment.transactionId = paymentResult.transactionId || crypto.randomUUID();
      payment.paymentGateway = paymentResult.paymentGateway || 'internal';
      
      // Update booking payment status
      try {
        await axios.put(`${process.env.BOOKING_SERVICE_URL || 'http://booking-service:3002'}/api/bookings/${bookingId}/payment-status`, {
          status: 'completed'
        }, {
          headers: {
            Authorization: req.headers.authorization
          }
        });
      } catch (error) {
        console.error('Update booking payment status error:', error);
        // Continue even if booking update fails
      }

      // Send payment confirmation notification
      try {
        await axios.post(`${process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3005'}/api/send-notification`, {
          userId: passengerId,
          type: 'payment_confirmation',
          title: 'Payment Confirmation',
          message: `Your payment of $${amount.toFixed(2)} for booking #${bookingId} has been processed successfully.`,
          data: { bookingId, amount, paymentMethod }
        });
      } catch (error) {
        console.error('Payment notification error:', error);
        // Continue even if notification fails
      }
    } else {
      payment.status = 'failed';
      payment.notes = paymentResult.error || 'Payment processing failed';

      // Send payment failure notification
      try {
        await axios.post(`${process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3005'}/api/send-notification`, {
          userId: passengerId,
          type: 'payment_failed',
          title: 'Payment Failed',
          message: `Your payment of $${amount.toFixed(2)} for booking #${bookingId} has failed. Please try again.`,
          data: { bookingId, amount, paymentMethod, error: paymentResult.error }
        });
      } catch (error) {
        console.error('Payment notification error:', error);
        // Continue even if notification fails
      }
    }

    await payment.save();

    res.status(200).json({
      message: 'Payment processed',
      success: paymentResult.success,
      payment
    });
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({
      message: 'Failed to process payment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred'
    });
  }
};

// Process wallet payment
async function processWalletPayment(userId, amount, bookingId) {
  try {
    // Find or create wallet
    let wallet = await Wallet.findOne({ userId });
    
    if (!wallet) {
      wallet = new Wallet({ userId });
      await wallet.save();
    }

    // Check if wallet has sufficient balance
    if (wallet.balance < amount) {
      return {
        success: false,
        error: 'Insufficient wallet balance'
      };
    }

    // Deduct amount from wallet
    wallet.balance -= amount;
    wallet.transactions.push({
      type: 'debit',
      amount,
      description: `Payment for booking #${bookingId}`,
      reference: bookingId.toString()
    });

    await wallet.save();

    return {
      success: true,
      transactionId: crypto.randomUUID(),
      paymentGateway: 'wallet'
    };
  } catch (error) {
    console.error('Wallet payment error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Process card payment
async function processCardPayment(userId, amount, bookingId) {
  try {
    // Find default payment method
    const paymentMethod = await PaymentMethod.findOne({
      userId,
      type: 'card',
      isDefault: true,
      isActive: true
    });

    if (!paymentMethod) {
      return {
        success: false,
        error: 'No default payment method found'
      };
    }

    // In a real app, this would call a payment gateway API
    // For this example, we'll simulate a successful payment
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      transactionId: crypto.randomUUID(),
      paymentGateway: 'stripe'
    };
  } catch (error) {
    console.error('Card payment error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Get payment by ID
exports.getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({
        message: 'Payment not found'
      });
    }

    // Check if user is authorized to view this payment
    if (payment.passengerId.toString() !== req.user.id && 
        payment.driverId?.toString() !== req.user.id && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Not authorized to view this payment'
      });
    }

    res.status(200).json({
      payment
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      message: 'Failed to get payment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred'
    });
  }
};

// Get user payments
exports.getUserPayments = async (req, res) => {
  try {
    const { limit = 10, page = 1, status } = req.query;
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

    // Get payments
    const payments = await Payment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Payment.countDocuments(filter);

    res.status(200).json({
      payments,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user payments error:', error);
    res.status(500).json({
      message: 'Failed to get payments',
      error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred'
    });
  }
};

// Get user wallet
exports.getUserWallet = async (req, res) => {
  try {
    // Find or create wallet
    let wallet = await Wallet.findOne({ userId: req.user.id });
    
    if (!wallet) {
      wallet = new Wallet({ userId: req.user.id });
      await wallet.save();
    }

    // Get recent transactions
    const recentTransactions = wallet.transactions
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);

    res.status(200).json({
      wallet: {
        balance: wallet.balance,
        currency: wallet.currency,
        isActive: wallet.isActive,
        recentTransactions
      }
    });
  } catch (error) {
    console.error('Get user wallet error:', error);
    res.status(500).json({
      message: 'Failed to get wallet',
      error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred'
    });
  }
};

// Add funds to wallet
exports.addWalletFunds = async (req, res) => {
  try {
    const { amount, paymentMethodId } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        message: 'Valid amount is required'
      });
    }

    // Find payment method if ID is provided
    let paymentMethod = null;
    if (paymentMethodId) {
      paymentMethod = await PaymentMethod.findOne({
        _id: paymentMethodId,
        userId: req.user.id,
        isActive: true
      });

      if (!paymentMethod) {
        return res.status(404).json({
          message: 'Payment method not found'
        });
      }
    } else {
      // Use default payment method
      paymentMethod = await PaymentMethod.findOne({
        userId: req.user.id,
        isDefault: true,
        isActive: true
      });

      if (!paymentMethod) {
        return res.status(400).json({
          message: 'No default payment method found'
        });
      }
    }

    // In a real app, this would call a payment gateway API
    // For this example, we'll simulate a successful payment
    
    // Find or create wallet
    let wallet = await Wallet.findOne({ userId: req.user.id });
    
    if (!wallet) {
      wallet = new Wallet({ userId: req.user.id });
    }

    // Add funds to wallet
    wallet.balance += amount;
    wallet.transactions.push({
      type: 'credit',
      amount,
      description: 'Wallet top-up',
      reference: crypto.randomUUID()
    });

    await wallet.save();

    res.status(200).json({
      message: 'Funds added to wallet successfully',
      wallet: {
        balance: wallet.balance,
        currency: wallet.currency
      }
    });
  } catch (error) {
    console.error('Add wallet funds error:', error);
    res.status(500).json({
      message: 'Failed to add funds to wallet',
      error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred'
    });
  }
};

// Add payment method
exports.addPaymentMethod = async (req, res) => {
  try {
    const { type, isDefault, cardDetails, bankDetails } = req.body;
    
    if (!type || (type === 'card' && !cardDetails) || (type === 'bank_account' && !bankDetails)) {
      return res.status(400).json({
        message: 'Valid payment method details are required'
      });
    }

    // Create payment method
    const paymentMethod = new PaymentMethod({
      userId: req.user.id,
      type,
      isDefault: isDefault || false,
      cardDetails: type === 'card' ? cardDetails : undefined,
      bankDetails: type === 'bank_account' ? bankDetails : undefined
    });

    // If setting as default, update any existing default methods
    if (isDefault) {
      await PaymentMethod.updateMany(
        { userId: req.user.id, isDefault: true },
        { $set: { isDefault: false } }
      );
    }

    await paymentMethod.save();

    res.status(201).json({
      message: 'Payment method added successfully',
      paymentMethod
    });
  } catch (error) {
    console.error('Add payment method error:', error);
    res.status(500).json({
      message: 'Failed to add payment method',
      error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred'
    });
  }
};

// Get user payment methods
exports.getUserPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = await PaymentMethod.find({
      userId: req.user.id,
      isActive: true
    });

    res.status(200).json({
      paymentMethods
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({
      message: 'Failed to get payment methods',
      error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred'
    });
  }
};

// Request refund
exports.requestRefund = async (req, res) => {
  try {
    const { paymentId, amount, reason } = req.body;
    
    if (!paymentId || !amount || !reason) {
      return res.status(400).json({
        message: 'PaymentId, amount, and reason are required'
      });
    }

    const payment = await Payment.findById(paymentId);
    
    if (!payment) {
      return res.status(404).json({
        message: 'Payment not found'
      });
    }

    // Check if user is authorized to request refund
    if (payment.passengerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Not authorized to request refund for this payment'
      });
    }

    // Check if payment is eligible for refund
    if (payment.status !== 'completed') {
      return res.status(400).json({
        message: 'Only completed payments can be refunded'
      });
    }

    if (payment.refundAmount > 0) {
      return res.status(400).json({
        message: 'This payment has already been refunded'
      });
    }

    // Validate refund amount
    if (amount <= 0 || amount > payment.amount) {
      return res.status(400).json({
        message: 'Invalid refund amount'
      });
    }

    // In a real app, this would call a payment gateway API for refunds
    // For this example, we'll simulate a successful refund
    
    // Update payment
    payment.refundAmount = amount;
    payment.refundReason = reason;
    payment.status = 'refunded';

    await payment.save();

    // If payment was from wallet, refund to wallet
    if (payment.paymentMethod === 'wallet') {
      const wallet = await Wallet.findOne({ userId: payment.passengerId });
      
      if (wallet) {
        wallet.balance += amount;
        wallet.transactions.push({
          type: 'credit',
          amount,
          description: `Refund for booking #${payment.bookingId}`,
          reference: payment._id.toString()
        });

        await wallet.save();
      }
    }

    // Send refund notification
    try {
      await axios.post(`${process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3005'}/api/send-notification`, {
        userId: payment.passengerId,
        type: 'payment_refund',
        title: 'Payment Refunded',
        message: `Your payment of $${amount.toFixed(2)} for booking #${payment.bookingId} has been refunded.`,
        data: { bookingId: payment.bookingId, amount, reason }
      });
    } catch (error) {
      console.error('Refund notification error:', error);
      // Continue even if notification fails
    }

    res.status(200).json({
      message: 'Refund processed successfully',
      payment
    });
  } catch (error) {
    console.error('Request refund error:', error);
    res.status(500).json({
      message: 'Failed to process refund',
      error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred'
    });
  }
};

// backend/payment-service/src/routes/payment.routes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// All routes require authentication
router.use(authMiddleware.authenticate);

// Payment routes
router.post('/process-payment', paymentController.processPayment);
router.get('/payments/:id', paymentController.getPayment);
router.get('/payments', paymentController.getUserPayments);
router.get('/wallet', paymentController.getUserWallet);
router.post('/wallet/add-funds', paymentController.addWalletFunds);
router.post('/payment-methods', paymentController.addPaymentMethod);
router.get('/payment-methods', paymentController.getUserPaymentMethods);
router.post('/refund', paymentController.requestRefund);

module.exports = router;

// backend/payment-service/src/middlewares/auth.middleware.js
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