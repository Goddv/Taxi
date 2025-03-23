// frontend/web-app/src/components/notifications/NotificationPreferencesModal.jsx
import React, { useState } from 'react';
import { FaBell, FaEnvelope, FaMobile, FaTimes, FaCheck } from 'react-icons/fa';
import LoadingSpinner from '../common/LoadingSpinner';

const NotificationPreferencesModal = ({ preferences, onClose, onSave }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    pushEnabled: preferences?.pushEnabled ?? true,
    emailEnabled: preferences?.emailEnabled ?? true,
    smsEnabled: preferences?.smsEnabled ?? true,
    notificationTypes: {
      bookings: preferences?.notificationTypes?.bookings ?? true,
      payments: preferences?.notificationTypes?.payments ?? true,
      promotions: preferences?.notificationTypes?.promotions ?? true,
      system: preferences?.notificationTypes?.system ?? true
    }
  });
  
  // Handle checkbox change
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    }
  };
  
  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      onSave(formData);
      setIsSubmitting(false);
    }, 1000);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Notification Preferences</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Notification Channels</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="pushEnabled"
                    name="pushEnabled"
                    type="checkbox"
                    checked={formData.pushEnabled}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="pushEnabled" className="ml-2 flex items-center text-sm text-gray-900">
                    <FaBell className="mr-2 text-blue-600" />
                    Push Notifications
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="emailEnabled"
                    name="emailEnabled"
                    type="checkbox"
                    checked={formData.emailEnabled}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="emailEnabled" className="ml-2 flex items-center text-sm text-gray-900">
                    <FaEnvelope className="mr-2 text-blue-600" />
                    Email Notifications
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="smsEnabled"
                    name="smsEnabled"
                    type="checkbox"
                    checked={formData.smsEnabled}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="smsEnabled" className="ml-2 flex items-center text-sm text-gray-900">
                    <FaMobile className="mr-2 text-blue-600" />
                    SMS Notifications
                  </label>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Notification Types</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="bookings"
                    name="notificationTypes.bookings"
                    type="checkbox"
                    checked={formData.notificationTypes.bookings}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="bookings" className="ml-2 text-sm text-gray-900">
                    Booking Updates
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="payments"
                    name="notificationTypes.payments"
                    type="checkbox"
                    checked={formData.notificationTypes.payments}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="payments" className="ml-2 text-sm text-gray-900">
                    Payment Notifications
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="promotions"
                    name="notificationTypes.promotions"
                    type="checkbox"
                    checked={formData.notificationTypes.promotions}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="promotions" className="ml-2 text-sm text-gray-900">
                    Promotions and Offers
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="system"
                    name="notificationTypes.system"
                    type="checkbox"
                    checked={formData.notificationTypes.system}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="system" className="ml-2 text-sm text-gray-900">
                    System Updates
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isSubmitting ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                <>
                  <FaCheck className="mr-2" />
                  Save Preferences
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NotificationPreferencesModal;