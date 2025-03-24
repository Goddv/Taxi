// frontend/web-app/src/services/socketService.js
import io from 'socket.io-client';
import { store } from '../redux/store';
import { addMessage } from '../redux/slices/chatSlice';
import { addNotification } from '../redux/slices/notificationSlice';

let socket = null;

// Initialize socket connection
const initializeSocket = (token) => {
  const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3000';
  
  if (socket) {
    socket.disconnect();
  }
  
  socket = io(SOCKET_URL, {
    auth: {
      token
    }
  });
  
  // Connection events
  socket.on('connect', () => {
    console.log('Socket connected');
  });
  
  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });
  
  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });
  
  // Chat events
  socket.on('new_message', (messageData) => {
    // Dispatch to Redux
    store.dispatch(addMessage(messageData));
    
    // Create notification for new messages if not in active chat
    const state = store.getState();
    if (state.chat.activeChat !== messageData.bookingId) {
      const notificationData = {
        title: 'New Message',
        message: `You have a new message from ${messageData.senderName}`,
        type: 'message',
        data: {
          bookingId: messageData.bookingId
        },
        createdAt: new Date().toISOString(),
        isRead: false
      };
      store.dispatch(addNotification(notificationData));
    }
  });
  
  // Other existing event listeners

  return socket;
};

// Get socket instance
const getSocket = () => {
  if (!socket) {
    const token = localStorage.getItem('token');
    if (token) {
      return initializeSocket(token);
    }
    return null;
  }
  return socket;
};

// Disconnect socket
const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

const socketService = {
  initializeSocket,
  getSocket,
  disconnectSocket
};

export default socketService;