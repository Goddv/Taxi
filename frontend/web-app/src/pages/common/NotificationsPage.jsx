// frontend/web-app/src/pages/common/NotificationsPage.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaBell, FaCheck, FaCheckDouble, FaTrash } from 'react-icons/fa';
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getPreferences,
  updatePreferences
} from '../../redux/slices/notificationSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import NotificationItem from '../../components/notifications/NotificationItem';
import NotificationPreferencesModal from '../../components/notifications/NotificationPreferencesModal';
import Pagination from '../../components/common/Pagination';

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount, preferences, pagination, isLoading } = useSelector(state => state.notification);
  
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  
  // Fetch notifications and preferences
  useEffect(() => {
    let params = {
      page: currentPage,
      limit: 10
    };
    
    if (filter === 'unread') {
      params.unreadOnly = true;
    }
    
    dispatch(getUserNotifications(params));
    dispatch(getPreferences());
  }, [dispatch, filter, currentPage]);
  
  // Handle filter change
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1); // Reset to first page when filter changes
  };
  
  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };
  
  // Handle mark as read
  const handleMarkAsRead = (notificationId) => {
    dispatch(markAsRead(notificationId));
  };
  
  // Handle update preferences
  const handleUpdatePreferences = (newPreferences) => {
    dispatch(updatePreferences(newPreferences))
      .then(() => {
        setShowPreferencesModal(false);
      });
  };
  
  return (
    <div className="container mx-auto px-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 md:mb-0">Notifications</h2>
          
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="flex space-x-2">
              <button
                onClick={() => handleFilterChange('all')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleFilterChange('unread')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  filter === 'unread'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
                className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaCheckDouble className="mr-1" />
                Mark All as Read
              </button>
              
              <button
                onClick={() => setShowPreferencesModal(true)}
                className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaBell className="mr-1" />
                Preferences
              </button>
            </div>
          </div>
        </div>
        
        {isLoading && !notifications.length ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FaBell className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-500">
              {filter === 'all'
                ? "You don't have any notifications yet."
                : "You don't have any unread notifications."}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {notifications.map(notification => (
                <NotificationItem
                  key={notification._id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                />
              ))}
            </div>
            
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.pages}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}
      </div>
      
      {/* Notification Preferences Modal */}
      {showPreferencesModal && (
        <NotificationPreferencesModal
          preferences={preferences}
          onClose={() => setShowPreferencesModal(false)}
          onSave={handleUpdatePreferences}
        />
      )}
    </div>
  );
};

export default NotificationsPage;