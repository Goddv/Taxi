// frontend/web-app/src/redux/slices/bookingSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import bookingService from '../../services/bookingService';
import { toast } from 'react-toastify';

// Create booking
export const createBooking = createAsyncThunk(
  'booking/create',
  async (bookingData, thunkAPI) => {
    try {
      return await bookingService.createBooking(bookingData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get booking by id
export const getBooking = createAsyncThunk(
  'booking/getById',
  async (bookingId, thunkAPI) => {
    try {
      return await bookingService.getBooking(bookingId);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get user bookings
export const getUserBookings = createAsyncThunk(
  'booking/getUserBookings',
  async (params, thunkAPI) => {
    try {
      return await bookingService.getUserBookings(params);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update booking status
export const updateBookingStatus = createAsyncThunk(
  'booking/updateStatus',
  async ({ bookingId, status }, thunkAPI) => {
    try {
      return await bookingService.updateBookingStatus(bookingId, status);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Rate booking
export const rateBooking = createAsyncThunk(
  'booking/rate',
  async ({ bookingId, rating, feedback }, thunkAPI) => {
    try {
      return await bookingService.rateBooking(bookingId, rating, feedback);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  bookings: [],
  currentBooking: null,
  fareEstimate: null,
  pagination: {
    total: 0,
    page: 1,
    pages: 1
  },
  isLoading: false,
  error: null
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setFareEstimate: (state, action) => {
      state.fareEstimate = action.payload;
    },
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
    },
    resetBookingState: (state) => {
      state.isLoading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create booking
      .addCase(createBooking.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBooking = action.payload.booking;
        toast.success('Booking created successfully');
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get booking
      .addCase(getBooking.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getBooking.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBooking = action.payload.booking;
      })
      .addCase(getBooking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get user bookings
      .addCase(getUserBookings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bookings = action.payload.bookings;
        state.pagination = action.payload.pagination;
      })
      .addCase(getUserBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update booking status
      .addCase(updateBookingStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBooking = action.payload.booking;
        toast.success(`Booking ${action.payload.booking.status}`);
      })
      .addCase(updateBookingStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Rate booking
      .addCase(rateBooking.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(rateBooking.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBooking = action.payload.booking;
        toast.success('Booking rated successfully');
      })
      .addCase(rateBooking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { setFareEstimate, clearCurrentBooking, resetBookingState } = bookingSlice.actions;
export default bookingSlice.reducer;