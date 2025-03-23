// frontend/web-app/src/redux/slices/trackingSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import trackingService from '../../services/trackingService';

// Start tracking session
export const startTracking = createAsyncThunk(
  'tracking/start',
  async (trackingData, thunkAPI) => {
    try {
      return await trackingService.startTracking(trackingData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// End tracking session
export const endTracking = createAsyncThunk(
  'tracking/end',
  async (endData, thunkAPI) => {
    try {
      return await trackingService.endTracking(endData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get tracking session
export const getTrackingSession = createAsyncThunk(
  'tracking/getSession',
  async (bookingId, thunkAPI) => {
    try {
      return await trackingService.getTrackingSession(bookingId);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update driver location
export const updateDriverLocation = createAsyncThunk(
  'tracking/updateDriverLocation',
  async (locationData, thunkAPI) => {
    try {
      return await trackingService.updateDriverLocation(locationData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Record tracking event
export const recordTrackingEvent = createAsyncThunk(
  'tracking/recordEvent',
  async (eventData, thunkAPI) => {
    try {
      return await trackingService.recordTrackingEvent(eventData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Find nearby drivers
export const findNearbyDrivers = createAsyncThunk(
  'tracking/findNearbyDrivers',
  async (locationData, thunkAPI) => {
    try {
      return await trackingService.findNearbyDrivers(locationData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  currentSession: null,
  driverLocation: null,
  lastEvent: null,
  nearbyDrivers: [],
  isTracking: false,
  isLoading: false,
  error: null
};

const trackingSlice = createSlice({
  name: 'tracking',
  initialState,
  reducers: {
    setDriverLocation: (state, action) => {
      state.driverLocation = action.payload;
    },
    addTrackingEvent: (state, action) => {
      if (state.currentSession) {
        state.currentSession.events.push(action.payload);
        state.lastEvent = action.payload;
      }
    },
    resetTrackingState: (state) => {
      state.isLoading = false;
      state.error = null;
    },
    clearTracking: (state) => {
      state.currentSession = null;
      state.driverLocation = null;
      state.lastEvent = null;
      state.isTracking = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Start tracking
      .addCase(startTracking.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(startTracking.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSession = action.payload.session;
        state.isTracking = true;
      })
      .addCase(startTracking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // End tracking
      .addCase(endTracking.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(endTracking.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSession = action.payload.session;
        state.isTracking = false;
      })
      .addCase(endTracking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get tracking session
      .addCase(getTrackingSession.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTrackingSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSession = action.payload.session;
        state.isTracking = action.payload.session.status === 'active';
        
        // Get the last event
        if (action.payload.session.events && action.payload.session.events.length > 0) {
          state.lastEvent = action.payload.session.events[action.payload.session.events.length - 1];
        }
        
        // Get the last driver location
        if (action.payload.session.route && action.payload.session.route.length > 0) {
          state.driverLocation = action.payload.session.route[action.payload.session.route.length - 1].location;
        }
      })
      .addCase(getTrackingSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update driver location
      .addCase(updateDriverLocation.fulfilled, (state, action) => {
        state.driverLocation = action.payload.location.location;
      })
      // Record tracking event
      .addCase(recordTrackingEvent.fulfilled, (state, action) => {
        state.lastEvent = action.payload.event;
        if (state.currentSession) {
          state.currentSession.events.push(action.payload.event);
        }
      })
      // Find nearby drivers
      .addCase(findNearbyDrivers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(findNearbyDrivers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.nearbyDrivers = action.payload.drivers;
      })
      .addCase(findNearbyDrivers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { setDriverLocation, addTrackingEvent, resetTrackingState, clearTracking } = trackingSlice.actions;
export default trackingSlice.reducer;
