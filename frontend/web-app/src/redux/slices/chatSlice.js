// frontend/web-app/src/redux/slices/chatSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import chatService from '../../services/chatService';
import { toast } from 'react-toastify';

// Get chat history
export const getChatHistory = createAsyncThunk(
  'chat/getChatHistory',
  async (bookingId, thunkAPI) => {
    try {
      return await chatService.getChatHistory(bookingId);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Send message
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (messageData, thunkAPI) => {
    try {
      return await chatService.sendMessage(messageData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Mark messages as read
export const markMessagesAsRead = createAsyncThunk(
  'chat/markMessagesAsRead',
  async (bookingId, thunkAPI) => {
    try {
      return await chatService.markMessagesAsRead(bookingId);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  activeChat: null,
  messages: [],
  unreadCount: 0,
  isLoading: false,
  error: null
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
      if (action.payload.sender !== 'user' && state.activeChat !== action.payload.bookingId) {
        state.unreadCount += 1;
      }
    },
    clearChat: (state) => {
      state.messages = [];
      state.activeChat = null;
    },
    resetChatState: (state) => {
      state.isLoading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get chat history
      .addCase(getChatHistory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getChatHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload.messages;
        state.activeChat = action.payload.bookingId;
      })
      .addCase(getChatHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages.push(action.payload.message);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error('Failed to send message');
      })
      // Mark messages as read
      .addCase(markMessagesAsRead.fulfilled, (state) => {
        state.unreadCount = 0;
        state.messages = state.messages.map(message => ({
          ...message,
          isRead: true
        }));
      });
  }
});

export const { setActiveChat, addMessage, clearChat, resetChatState } = chatSlice.actions;
export default chatSlice.reducer;