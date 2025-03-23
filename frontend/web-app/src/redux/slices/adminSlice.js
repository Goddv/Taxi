// frontend/web-app/src/redux/slices/adminSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminService from '../../services/adminService';
import { toast } from 'react-toastify';

// Get all users
export const getAllUsers = createAsyncThunk(
  'admin/getAllUsers',
  async (params, thunkAPI) => {
    try {
      return await adminService.getAllUsers(params);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get all drivers
export const getAllDrivers = createAsyncThunk(
  'admin/getAllDrivers',
  async (params, thunkAPI) => {
    try {
      return await adminService.getAllDrivers(params);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get all bookings
export const getAllBookings = createAsyncThunk(
  'admin/getAllBookings',
  async (params, thunkAPI) => {
    try {
      return await adminService.getAllBookings(params);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get system statistics
export const getSystemStatistics = createAsyncThunk(
  'admin/getSystemStatistics',
  async (_, thunkAPI) => {
    try {
      return await adminService.getSystemStatistics();
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update user status
export const updateUserStatus = createAsyncThunk(
  'admin/updateUserStatus',
  async ({ userId, status }, thunkAPI) => {
    try {
      return await adminService.updateUserStatus(userId, status);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Verify driver
export const verifyDriver = createAsyncThunk(
  'admin/verifyDriver',
  async (driverId, thunkAPI) => {
    try {
      return await adminService.verifyDriver(driverId);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get reports
export const getReports = createAsyncThunk(
  'admin/getReports',
  async (params, thunkAPI) => {
    try {
      return await adminService.getReports(params);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  users: [],
  drivers: [],
  bookings: [],
  reports: [],
  statistics: {
    totalUsers: 0,
    totalDrivers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeUsers: 0,
    activeDrivers: 0,
    pendingBookings: 0,
    completedBookings: 0,
    recentBookings: []
  },
  usersPagination: {
    total: 0,
    page: 1,
    pages: 1
  },
  driversPagination: {
    total: 0,
    page: 1,
    pages: 1
  },
  bookingsPagination: {
    total: 0,
    page: 1,
    pages: 1
  },
  reportsPagination: {
    total: 0,
    page: 1,
    pages: 1
  },
  isLoading: false,
  error: null
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    resetAdminState: (state) => {
      state.isLoading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all users
      .addCase(getAllUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.users;
        state.usersPagination = action.payload.pagination;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get all drivers
      .addCase(getAllDrivers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllDrivers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.drivers = action.payload.drivers;
        state.driversPagination = action.payload.pagination;
      })
      .addCase(getAllDrivers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get all bookings
      .addCase(getAllBookings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bookings = action.payload.bookings;
        state.bookingsPagination = action.payload.pagination;
      })
      .addCase(getAllBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get system statistics
      .addCase(getSystemStatistics.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSystemStatistics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.statistics = action.payload.statistics;
      })
      .addCase(getSystemStatistics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update user status
      .addCase(updateUserStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.users.findIndex(u => u._id === action.payload.user._id);
        if (index !== -1) {
          state.users[index] = action.payload.user;
        }
        toast.success('User status updated successfully');
      })
      .addCase(updateUserStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Verify driver
      .addCase(verifyDriver.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyDriver.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.drivers.findIndex(d => d._id === action.payload.driver._id);
        if (index !== -1) {
          state.drivers[index] = action.payload.driver;
        }
        toast.success('Driver verified successfully');
      })
      .addCase(verifyDriver.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get reports
      .addCase(getReports.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getReports.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reports = action.payload.reports;
        state.reportsPagination = action.payload.pagination;
      })
      .addCase(getReports.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { resetAdminState } = adminSlice.actions;
export default adminSlice.reducer;