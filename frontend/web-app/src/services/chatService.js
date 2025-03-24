// frontend/web-app/src/services/chatService.js
import api from './api';
import socketService from './socketService';

// Get chat history for a booking
const getChatHistory = async (bookingId) => {
  const response = await api.get(`/chats/${bookingId}`);
  return response.data;
};

// Send message
const sendMessage = async (messageData) => {
  const response = await api.post('/chats/messages', messageData);
  
  // Emit message through socket
  const socket = socketService.getSocket();
  if (socket) {
    socket.emit('send_message', {
      bookingId: messageData.bookingId,
      message: response.data.message
    });
  }
  
  return response.data;
};

// Mark messages as read
const markMessagesAsRead = async (bookingId) => {
  const response = await api.put(`/chats/${bookingId}/read`);
  return response.data;
};

const chatService = {
  getChatHistory,
  sendMessage,
  markMessagesAsRead
};

export default chatService;