// frontend/web-app/src/redux/slices/driverSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import driverService from '../../services/driverService';
import { toast } from 'react-toastify';

// Update driver availability
export const updateDriverAvailability = createAsyncThunk(
  'driver/updateAvailability',
  async (isAvailable, thunkAPI) => {
    try {
      return await driverService.updateDriverAvailability(isAvailable);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get driver current location
export const getDriverLocation = createAsyncThunk(
  'driver/getLocation',
  async (_, thunkAPI) => {
    try {
      return await driverService.getDriverLocation();
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get driver earnings
export const getDriverEarnings = createAsyncThunk(
  'driver/getEarnings',
  async (params, thunkAPI) => {
    try {
      return await driverService.getDriverEarnings(params);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get driver statistics
export const getDriverStatistics = createAsyncThunk(
  'driver/getStatistics',
  async (_, thunkAPI) => {
    try {
      return await driverService.getDriverStatistics();
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Accept booking
export const acceptBooking = createAsyncThunk(
  'driver/acceptBooking',
  async (bookingId, thunkAPI) => {
    try {
      return await driverService.acceptBooking(bookingId);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get nearby bookings
export const getNearbyBookings = createAsyncThunk(
  'driver/getNearbyBookings',
  async (_, thunkAPI) => {
    try {
      return await driverService.getNearbyBookings();
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  isAvailable: false,
  location: null,
  currentBooking: null,
  nearbyBookings: [],
  earnings: {
    today: 0,
    week: 0,
    month: 0,
    total: 0
  },
  statistics: {
    totalRides: 0,
    completionRate: 0,
    acceptanceRate: 0,
    averageRating: 0,
    cancelledRides: 0
  },
  earningsHistory: [],
  pagination: {
    total: 0,
    page: 1,
    pages: 1
  },
  isLoading: false,
  error: null
};

const driverSlice = createSlice({
  name: 'driver',
  initialState,
  reducers: {
    setLocation: (state, action) => {
      state.location = action.payload;
    },
    setCurrentBooking: (state, action) => {
      state.currentBooking = action.payload;
    },
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
    },
    resetDriverState: (state) => {
      state.isLoading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Update driver availability
      .addCase(updateDriverAvailability.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateDriverAvailability.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAvailable = action.payload.isAvailable;
      })
      .addCase(updateDriverAvailability.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get driver location
      .addCase(getDriverLocation.fulfilled, (state, action) => {
        state.location = action.payload.location;
      })
      // Get driver earnings
      .addCase(getDriverEarnings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getDriverEarnings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.earnings = action.payload.earnings;
        state.earningsHistory = action.payload.history;
        state.pagination = action.payload.pagination;
      })
      .addCase(getDriverEarnings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get driver statistics
      .addCase(getDriverStatistics.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getDriverStatistics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.statistics = action.payload.statistics;
      })
      .addCase(getDriverStatistics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Accept booking
      .addCase(acceptBooking.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(acceptBooking.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBooking = action.payload.booking;
        toast.success('Booking accepted successfully');
      })
      .addCase(acceptBooking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get nearby bookings
      .addCase(getNearbyBookings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getNearbyBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.nearbyBookings = action.payload.bookings;
      })
      .addCase(getNearbyBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { setLocation, setCurrentBooking, clearCurrentBooking, resetDriverState } = driverSlice.actions;
export default driverSlice.reducer;
