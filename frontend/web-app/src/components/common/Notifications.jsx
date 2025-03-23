// frontend/web-app/src/components/common/Notifications.jsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaBell, FaCheck } from 'react-icons/fa';
import { addNotification, markAsRead } from '../../redux/slices/notificationSlice';
import socketService from '../../services/socketService';

const Notifications = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount } = useSelector(state => state.notification);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Setup socket listener for notifications
  useEffect(() => {
    const socket = socketService.getSocket();
    
    if (socket) {
      socket.on('notification', handleNewNotification);
    }
    
    return () => {
      if (socket) {
        socket.off('notification', handleNewNotification);
      }
    };
  }, []);
  
  // Handle new notification from socket
  const handleNewNotification = (notification) => {
    dispatch(addNotification(notification));
    
    // Show browser notification if enabled
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/logo192.png'
      });
    }
  };
  
  // Handle mark as read
  const handleMarkAsRead = (e, notificationId) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(markAsRead(notificationId));
  };
  
  // Toggle dropdown
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };
  
  // Get recent notifications for dropdown
  const recentNotifications = notifications.slice(0, 5);
  
  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="relative p-2 text-gray-600 hover:text-blue-500 focus:outline-none"
      >
        <FaBell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-10">
          <div className="px-4 py-2 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
              <Link
                to="/notifications"
                className="text-xs text-blue-600 hover:text-blue-800"
                onClick={() => setShowDropdown(false)}
              >
                View All
              </Link>
            </div>
          </div>
          
          {recentNotifications.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              No notifications
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {recentNotifications.map(notification => (
                <Link
                  key={notification._id}
                  to={notification.data?.bookingId ? `/bookings/${notification.data.bookingId}` : '/notifications'}
                  className={`block px-4 py-2 hover:bg-gray-50 ${!notification.isRead ? 'bg-blue-50' : ''}`}
                  onClick={() => setShowDropdown(false)}
                >
                  <div className="flex justify-between items-start">
                    <p className={`text-sm font-medium ${!notification.isRead ? 'text-blue-800' : 'text-gray-800'}`}>
                      {notification.title}
                    </p>
                    <span className="text-xs text-gray-500 ml-2">
                      {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 truncate mt-1">{notification.message}</p>
                  
                  {!notification.isRead && (
                    <button
                      onClick={(e) => handleMarkAsRead(e, notification._id)}
                      className="mt-1 text-xs text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <FaCheck className="mr-1" />
                      Mark as read
                    </button>
                  )}
                </Link>
              ))}
            </div>
          )}
          
          <div className="px-4 py-2 border-t border-gray-200">
            <Link
              to="/notifications/preferences"
              className="block text-xs text-gray-600 hover:text-gray-800"
              onClick={() => setShowDropdown(false)}
            >
              Notification Settings
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;