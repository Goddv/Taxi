// frontend/web-app/src/services/socketService.js
import io from 'socket.io-client';

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