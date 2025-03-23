// frontend/web-app/src/redux/slices/paymentSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import paymentService from '../../services/paymentService';
import { toast } from 'react-toastify';

// Process payment
export const processPayment = createAsyncThunk(
  'payment/process',
  async (paymentData, thunkAPI) => {
    try {
      return await paymentService.processPayment(paymentData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get user wallet
export const getUserWallet = createAsyncThunk(
  'payment/getUserWallet',
  async (_, thunkAPI) => {
    try {
      return await paymentService.getUserWallet();
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Add funds to wallet
export const addWalletFunds = createAsyncThunk(
  'payment/addWalletFunds',
  async (fundData, thunkAPI) => {
    try {
      return await paymentService.addWalletFunds(fundData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get user payment methods
export const getUserPaymentMethods = createAsyncThunk(
  'payment/getUserPaymentMethods',
  async (_, thunkAPI) => {
    try {
      return await paymentService.getUserPaymentMethods();
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Add payment method
export const addPaymentMethod = createAsyncThunk(
  'payment/addPaymentMethod',
  async (methodData, thunkAPI) => {
    try {
      return await paymentService.addPaymentMethod(methodData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get user payments
export const getUserPayments = createAsyncThunk(
  'payment/getUserPayments',
  async (params, thunkAPI) => {
    try {
      return await paymentService.getUserPayments(params);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  wallet: null,
  paymentMethods: [],
  payments: [],
  currentPayment: null,
  pagination: {
    total: 0,
    page: 1,
    pages: 1
  },
  isLoading: false,
  error: null
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    resetPaymentState: (state) => {
      state.isLoading = false;
      state.error = null;
    },
    clearCurrentPayment: (state) => {
      state.currentPayment = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Process payment
      .addCase(processPayment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPayment = action.payload.payment;
        if (action.payload.success) {
          toast.success('Payment processed successfully');
        } else {
          toast.error('Payment failed');
        }
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get user wallet
      .addCase(getUserWallet.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserWallet.fulfilled, (state, action) => {
        state.isLoading = false;
        state.wallet = action.payload.wallet;
      })
      .addCase(getUserWallet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add wallet funds
      .addCase(addWalletFunds.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addWalletFunds.fulfilled, (state, action) => {
        state.isLoading = false;
        state.wallet = action.payload.wallet;
        toast.success('Funds added to wallet successfully');
      })
      .addCase(addWalletFunds.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get user payment methods
      .addCase(getUserPaymentMethods.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserPaymentMethods.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paymentMethods = action.payload.paymentMethods;
      })
      .addCase(getUserPaymentMethods.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add payment method
      .addCase(addPaymentMethod.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addPaymentMethod.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paymentMethods.push(action.payload.paymentMethod);
        toast.success('Payment method added successfully');
      })
      .addCase(addPaymentMethod.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get user payments
      .addCase(getUserPayments.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserPayments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.payments = action.payload.payments;
        state.pagination = action.payload.pagination;
      })
      .addCase(getUserPayments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { resetPaymentState, clearCurrentPayment } = paymentSlice.actions;
export default paymentSlice.reducer;