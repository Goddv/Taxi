// frontend/web-app/src/components/chat/ChatInput.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaPaperPlane, FaSmile } from 'react-icons/fa';
import { sendMessage } from '../../redux/slices/chatSlice';

const ChatInput = ({ bookingId }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [messageText, setMessageText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle message submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!messageText.trim()) return;
    
    setIsSubmitting(true);
    
    const messageData = {
      bookingId,
      content: messageText.trim(),
      senderId: user._id,
      senderName: `${user.firstName} ${user.lastName}`,
      senderRole: user.role
    };
    
    try {
      await dispatch(sendMessage(messageData)).unwrap();
      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="flex items-center border-t border-gray-200 p-3">
      <button
        type="button"
        className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
      >
        <FaSmile className="h-5 w-5" />
      </button>
      
      <input
        type="text"
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
        placeholder="Type a message..."
        className="flex-grow mx-3 py-2 px-4 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={isSubmitting}
      />
      
      <button
        type="submit"
        disabled={!messageText.trim() || isSubmitting}
        className={`p-2 rounded-full ${
          messageText.trim() && !isSubmitting
            ? 'text-blue-600 hover:bg-blue-100'
            : 'text-gray-400 cursor-not-allowed'
        }`}
      >
        <FaPaperPlane className="h-5 w-5" />
      </button>
    </form>
  );
};

export default ChatInput;