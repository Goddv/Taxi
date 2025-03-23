// frontend/web-app/src/components/admin/DriverVerificationModal.jsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { 
  FaTimes, 
  FaIdCard, 
  FaCar, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaExclamationCircle 
} from 'react-icons/fa';
import { verifyDriver } from '../../redux/slices/adminSlice';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * Modal component for admin to verify driver documents and approve driver accounts
 * Displays driver license and vehicle information with verification controls
 */
const DriverVerificationModal = ({ driver, onClose }) => {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  
  // Handle verify driver
  const handleVerifyDriver = () => {
    setIsSubmitting(true);
    dispatch(verifyDriver(driver._id))
      .then(() => {
        setIsSubmitting(false);
        onClose();
      })
      .catch(() => {
        setIsSubmitting(false);
      });
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Driver Verification</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>
        
        <div className="px-6 py-4">
          {/* Driver Info */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Driver Information</h3>
            <div className="flex items-center mb-4">
              <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                {driver.user.profileImage ? (
                  <img
                    src={driver.user.profileImage}
                    alt={`${driver.user.firstName} ${driver.user.lastName}`}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400 text-2xl">
                    {driver.user.firstName[0]}{driver.user.lastName[0]}
                  </div>
                )}
              </div>
              <div>
                <div className="text-lg font-medium text-gray-900">
                  {driver.user.firstName} {driver.user.lastName}
                </div>
                <div className="text-sm text-gray-500">
                  {driver.user.email} • {driver.user.phone}
                </div>
                {driver.isVerified ? (
                  <div className="flex items-center text-green-600 text-sm">
                    <FaCheckCircle className="mr-1" />
                    <span>Verified Driver</span>
                  </div>
                ) : (
                  <div className="flex items-center text-orange-600 text-sm">
                    <FaExclamationCircle className="mr-1" />
                    <span>Pending Verification</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* License Information */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <FaIdCard className="mr-2 text-blue-600" />
              Driving License
            </h3>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">License Number</p>
                  <p className="text-base font-medium">{driver.drivingLicense.number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expiry Date</p>
                  <p className="text-base font-medium">
                    {formatDate(driver.drivingLicense.expiryDate)}
                  </p>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-500 mb-2">License Image</p>
                
                {driver.drivingLicense.image ? (
                  <img 
                    src={driver.drivingLicense.image} 
                    alt="Driver License"
                    className="max-w-full h-auto max-h-64 rounded-lg" 
                  />
                ) : (
                  <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-500">
                    No license image available
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Vehicle Information */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <FaCar className="mr-2 text-blue-600" />
              Vehicle Information
            </h3>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Vehicle Type</p>
                  <p className="text-base font-medium capitalize">
                    {driver.vehicle.type}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Make & Model</p>
                  <p className="text-base font-medium">
                    {driver.vehicle.make} {driver.vehicle.model}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Year</p>
                  <p className="text-base font-medium">{driver.vehicle.year}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Color</p>
                  <p className="text-base font-medium">{driver.vehicle.color}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">License Plate</p>
                  <p className="text-base font-medium">{driver.vehicle.licensePlate}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Verification Notes */}
          <div className="mb-6">
            <label htmlFor="verificationNotes" className="block text-sm font-medium text-gray-700 mb-1">
              Verification Notes
            </label>
            <textarea
              id="verificationNotes"
              rows={3}
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
              placeholder="Add notes about the verification process"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
        
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          
          {!driver.isVerified && (
            <button
              type="button"
              onClick={handleVerifyDriver}
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {isSubmitting ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                <>
                  <FaCheckCircle className="mr-2" />
                  Verify Driver
                </>
              )}
            </button>
          )}
          
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <FaTimesCircle className="mr-2" />
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default DriverVerificationModal;