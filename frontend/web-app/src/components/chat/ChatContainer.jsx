// frontend/web-app/src/components/chat/ChatContainer.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import ChatButton from './ChatButton';
import ChatModal from './ChatModal';
import socketService from '../../services/socketService';

const ChatContainer = ({ bookingId, recipientId, recipientName, bookingStatus }) => {
  const [showChat, setShowChat] = useState(false);
  const { unreadCount } = useSelector(state => state.chat);
  
  // Connect to socket chat room when component mounts
  useEffect(() => {
    const socket = socketService.getSocket();
    
    if (socket && bookingId) {
      // Join chat room for this booking
      socket.emit('join_chat', { bookingId });
      
      return () => {
        // Leave chat room when component unmounts
        socket.emit('leave_chat', { bookingId });
      };
    }
  }, [bookingId]);
  
  // Check if chat should be enabled based on booking status
  const isChatEnabled = ['pending', 'driver_assigned', 'in_progress'].includes(bookingStatus);
  
  // Toggle chat modal
  const toggleChat = () => {
    setShowChat(!showChat);
  };
  
  if (!isChatEnabled) {
    return null;
  }
  
  return (
    <>
      <ChatButton 
        onClick={toggleChat} 
        bookingId={bookingId}
        recipientName={recipientName}
      />
      
      {showChat && (
        <ChatModal
          bookingId={bookingId}
          recipientName={recipientName}
          onClose={() => setShowChat(false)}
        />
      )}
    </>
  );
};

export default ChatContainer;