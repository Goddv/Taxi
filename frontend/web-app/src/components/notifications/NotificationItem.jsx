// frontend/web-app/src/components/notifications/NotificationItem.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaBell, 
  FaCar, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaMoneyBillWave, 
  FaUserAlt,
  FaCheck,
  FaTag
} from 'react-icons/fa';

const NotificationItem = ({ notification, onMarkAsRead }) => {
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((now - date) / 1000);
    
    if (diffSeconds < 60) {
      return 'Just now';
    }
    
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    }
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
    
    return date.toLocaleDateString();
  };
  
  // Get notification icon
  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'booking_created':
      case 'booking_update':
        return <FaCar className="text-blue-600" />;
      case 'driver_assigned':
      case 'driver_arrived':
        return <FaUserAlt className="text-blue-600" />;
      case 'trip_started':
      case 'trip_completed':
        return <FaCheckCircle className="text-green-600" />;
      case 'trip_cancelled':
        return <FaTimesCircle className="text-red-600" />;
      case 'payment_confirmation':
      case 'payment_refund':
        return <FaMoneyBillWave className="text-green-600" />;
      case 'payment_failed':
        return <FaMoneyBillWave className="text-red-600" />;
      case 'promo_code':
        return <FaTag className="text-purple-600" />;
      default:
        return <FaBell className="text-gray-600" />;
    }
  };
  
  // Get notification link
  const getNotificationLink = () => {
    if (notification.data?.bookingId) {
      return `/bookings/${notification.data.bookingId}`;
    }
    
    return null;
  };
  
  const notificationLink = getNotificationLink();
  
  return (
    <div className={`border ${notification.isRead ? 'border-gray-200' : 'border-blue-200 bg-blue-50'} rounded-lg p-4 hover:shadow-sm transition-shadow`}>
      <div className="flex">
        <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
          {getNotificationIcon()}
        </div>
        
        <div className="flex-grow min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h3 className={`text-sm font-medium ${notification.isRead ? 'text-gray-800' : 'text-blue-800'}`}>
              {notification.title}
            </h3>
            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
              {formatDate(notification.createdAt)}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
          
          <div className="flex items-center justify-between">
            {notificationLink && (
              <Link
                to={notificationLink}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View Details
              </Link>
            )}
            
            {!notification.isRead && (
              <button
                onClick={() => onMarkAsRead(notification._id)}
                className="inline-flex items-center text-xs text-gray-500 hover:text-gray-700"
              >
                <FaCheck className="mr-1" />
                Mark as read
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;