// frontend/web-app/src/components/chat/ChatButton.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { FaComments, FaCircle } from 'react-icons/fa';

const ChatButton = ({ onClick, bookingId, recipientName }) => {
  const { messages, activeChat, unreadCount } = useSelector(state => state.chat);
  
  // Check if there are unread messages for this specific booking
  const hasUnreadMessages = bookingId ? 
    messages.some(m => m.bookingId === bookingId && !m.isRead && m.senderId !== 'user') : 
    unreadCount > 0;
  
  return (
    <button
      onClick={onClick}
      className="relative inline-flex items-center p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
      aria-label="Open chat"
    >
      <FaComments className="h-5 w-5" />
      
      {hasUnreadMessages && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500">
            {unreadCount > 1 && (
              <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </span>
        </span>
      )}
      
      <span className="sr-only">
        {hasUnreadMessages ? 'You have unread messages' : 'Chat'}
      </span>
    </button>
  );
};

export default ChatButton;