// frontend/web-app/src/components/chat/ChatMessage.jsx
import React from 'react';
import { useSelector } from 'react-redux';

const ChatMessage = ({ message }) => {
  const { user } = useSelector(state => state.auth);
  const isCurrentUser = message.senderId === user?._id;
  
  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div 
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isCurrentUser 
            ? 'bg-blue-600 text-white rounded-br-none' 
            : 'bg-gray-200 text-gray-800 rounded-bl-none'
        }`}
      >
        {!isCurrentUser && (
          <p className="text-xs font-medium mb-1">{message.senderName}</p>
        )}
        <p className="text-sm">{message.content}</p>
        <p className={`text-xs mt-1 text-right ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
          {formatTime(message.timestamp)}
          {isCurrentUser && message.isRead && (
            <span className="ml-1">✓</span>
          )}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;