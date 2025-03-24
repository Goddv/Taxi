// frontend/web-app/src/components/chat/ChatModal.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaTimes, FaAngleDown, FaCircle } from 'react-icons/fa';
import { getChatHistory, markMessagesAsRead, clearChat } from '../../redux/slices/chatSlice';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import LoadingSpinner from '../common/LoadingSpinner';

const ChatModal = ({ bookingId, recipientName, onClose, minimized = false }) => {
  const dispatch = useDispatch();
  const { messages, isLoading, activeChat } = useSelector(state => state.chat);
  const [isMinimized, setIsMinimized] = useState(minimized);
  const messagesEndRef = useRef(null);
  
  // Fetch chat history
  useEffect(() => {
    if (bookingId) {
      dispatch(getChatHistory(bookingId));
    }
    
    return () => {
      dispatch(clearChat());
    };
  }, [dispatch, bookingId]);
  
  // Mark messages as read
  useEffect(() => {
    if (bookingId && !isMinimized) {
      dispatch(markMessagesAsRead(bookingId));
    }
  }, [dispatch, bookingId, isMinimized, messages]);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && !isMinimized) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isMinimized]);
  
  // Toggle minimized state
  const toggleMinimized = () => {
    setIsMinimized(!isMinimized);
  };
  
  // Close chat modal
  const handleClose = () => {
    dispatch(clearChat());
    onClose();
  };
  
  // Determine if there are unread messages (for minimized state)
  const hasUnreadMessages = messages.some(message => !message.isRead && message.senderId !== 'user');
  
  return (
    <div 
      className={`fixed bottom-5 right-5 bg-white rounded-lg shadow-lg w-full max-w-md flex flex-col transition-all duration-300 ${
        isMinimized ? 'h-14' : 'h-96'
      }`}
      style={{ zIndex: 1000 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between bg-blue-600 text-white p-3 rounded-t-lg">
        <div className="flex items-center">
          {hasUnreadMessages && (
            <FaCircle className="h-2 w-2 text-red-500 mr-2" />
          )}
          <span className="font-medium">{recipientName || 'Chat'}</span>
        </div>
        <div className="flex items-center">
          <button
            onClick={toggleMinimized}
            className="p-1 text-white hover:text-gray-200 focus:outline-none"
          >
            <FaAngleDown className={`h-5 w-5 transform ${isMinimized ? 'rotate-180' : 'rotate-0'}`} />
          </button>
          <button
            onClick={handleClose}
            className="ml-2 p-1 text-white hover:text-gray-200 focus:outline-none"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Messages */}
      {!isMinimized && (
        <div className="flex-grow overflow-y-auto p-4">
          {isLoading && messages.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <LoadingSpinner size="md" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-24">
              <p>No messages yet</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <ChatMessage key={message._id || index} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      )}
      
      {/* Input */}
      {!isMinimized && (
        <ChatInput bookingId={bookingId} />
      )}
    </div>
  );
};

export default ChatModal;