// frontend/web-app/src/redux/slices/notificationSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import notificationService from '../../services/notificationService';

// Get user notifications
export const getUserNotifications = createAsyncThunk(
  'notification/getUserNotifications',
  async (params, thunkAPI) => {
    try {
      return await notificationService.getUserNotifications(params);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Mark notification as read
export const markAsRead = createAsyncThunk(
  'notification/markAsRead',
  async (notificationId, thunkAPI) => {
    try {
      return await notificationService.markAsRead(notificationId);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Mark all notifications as read
export const markAllAsRead = createAsyncThunk(
  'notification/markAllAsRead',
  async (_, thunkAPI) => {
    try {
      return await notificationService.markAllAsRead();
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update notification preferences
export const updatePreferences = createAsyncThunk(
  'notification/updatePreferences',
  async (preferences, thunkAPI) => {
    try {
      return await notificationService.updatePreferences(preferences);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get notification preferences
export const getPreferences = createAsyncThunk(
  'notification/getPreferences',
  async (_, thunkAPI) => {
    try {
      return await notificationService.getPreferences();
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  notifications: [],
  unreadCount: 0,
  preferences: null,
  pagination: {
    total: 0,
    page: 1,
    pages: 1
  },
  isLoading: false,
  error: null
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    resetNotificationState: (state) => {
      state.isLoading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get user notifications
      .addCase(getUserNotifications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
        state.pagination = action.payload.pagination;
      })
      .addCase(getUserNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(n => n._id === action.payload.notification._id);
        if (index !== -1) {
          state.notifications[index] = action.payload.notification;
        }
        state.unreadCount = state.unreadCount > 0 ? state.unreadCount - 1 : 0;
      })
      // Mark all as read
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map(n => ({ ...n, isRead: true, readAt: new Date() }));
        state.unreadCount = 0;
      })
      // Get notification preferences
      .addCase(getPreferences.fulfilled, (state, action) => {
        state.preferences = action.payload.preferences;
      })
      // Update notification preferences
      .addCase(updatePreferences.fulfilled, (state, action) => {
        state.preferences = action.payload.preferences;
      });
  }
});

export const { addNotification, resetNotificationState } = notificationSlice.actions;
export default notificationSlice.reducer;