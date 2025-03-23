// frontend/web-app/src/components/admin/DriverCard.jsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { 
  FaStar, 
  FaCar, 
  FaUserCheck, 
  FaUserSlash,
  FaIdCard,
  FaEllipsisV,
  FaCheckCircle,
  FaExclamationCircle
} from 'react-icons/fa';
import { format } from 'date-fns';
import { verifyDriver, updateUserStatus } from '../../redux/slices/adminSlice';

const DriverCard = ({ driver, onVerify }) => {
  const dispatch = useDispatch();
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Format date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Get vehicle type label
  const getVehicleTypeLabel = (type) => {
    switch (type) {
      case 'economy':
        return 'Economy';
      case 'comfort':
        return 'Comfort';
      case 'premium':
        return 'Premium';
      case 'van':
        return 'Van';
      default:
        return type;
    }
  };

  // Get verification badge
  const getVerificationBadge = () => {
    if (driver.isVerified) {
      return (
        <div className="flex items-center text-green-600 text-sm">
          <FaCheckCircle className="mr-1" />
          <span>Verified</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-orange-600 text-sm">
          <FaExclamationCircle className="mr-1" />
          <span>Pending Verification</span>
        </div>
      );
    }
  };

  // Handle status update
  const handleStatusUpdate = (status) => {
    dispatch(updateUserStatus({ userId: driver.user._id, status }));
    setShowDropdown(false);
  };

  // Handle driver verification
  const handleVerifyDriver = () => {
    dispatch(verifyDriver(driver._id));
    setShowDropdown(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div className="h-12 w-12 flex-shrink-0">
              {driver.user.profileImage ? (
                <img
                  className="h-12 w-12 rounded-full object-cover"
                  src={driver.user.profileImage}
                  alt={`${driver.user.firstName} ${driver.user.lastName}`}
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-800 font-medium">
                    {driver.user.firstName[0]}{driver.user.lastName[0]}
                  </span>
                </div>
              )}
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900">
                {driver.user.firstName} {driver.user.lastName}
              </h3>
              <div className="flex items-center text-sm text-gray-500">
                <FaStar className="text-yellow-500 mr-1" /> {driver.rating.toFixed(1)} ({driver.totalRides})
              </div>
            </div>
          </div>
          
          <div className="relative">
            <button
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <FaEllipsisV />
            </button>
            
            {showDropdown && (
              <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <button
                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => onVerify()}
                  >
                    <FaIdCard className="inline-block mr-2 text-blue-500" />
                    View Documents
                  </button>
                  {!driver.isVerified && (
                    <button
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={handleVerifyDriver}
                    >
                      <FaCheckCircle className="inline-block mr-2 text-green-500" />
                      Verify Driver
                    </button>
                  )}
                  <button
                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => handleStatusUpdate('active')}
                    disabled={driver.user.status === 'active'}
                  >
                    <FaUserCheck className="inline-block mr-2 text-green-500" />
                    Activate
                  </button>
                  <button
                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => handleStatusUpdate('suspended')}
                    disabled={driver.user.status === 'suspended'}
                  >
                    <FaUserSlash className="inline-block mr-2 text-red-500" />
                    Suspend
                  </button>
                  <a
                    href={`/admin/drivers/${driver._id}`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    View Details
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4">
          {getVerificationBadge()}
          
          <div className="flex items-center mt-2">
            <FaCar className="text-gray-500 mr-2" />
            <span className="text-sm text-gray-700">
              {driver.vehicle.make} {driver.vehicle.model} ({driver.vehicle.year})
            </span>
          </div>
          
          <div className="flex justify-between mt-2">
            <div className="text-sm text-gray-500">
              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                {getVehicleTypeLabel(driver.vehicle.type)}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {driver.vehicle.licensePlate}
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm">
            <div className="text-gray-500">Joined:</div>
            <div className="text-gray-900">{formatDate(driver.createdAt)}</div>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <div className="text-gray-500">Status:</div>
            <div className={`${
              driver.user.status === 'active' ? 'text-green-600' :
              driver.user.status === 'suspended' ? 'text-red-600' :
              'text-orange-600'
            } capitalize`}>
              {driver.user.status}
            </div>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <div className="text-gray-500">Available:</div>
            <div className={`${driver.isAvailable ? 'text-green-600' : 'text-gray-600'}`}>
              {driver.isAvailable ? 'Yes' : 'No'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverCard;