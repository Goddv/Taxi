// frontend/web-app/src/components/booking/BookingSummary.jsx
import React from 'react';
import { FaMapMarkerAlt, FaLocationArrow, FaCar, FaMoneyBillWave, FaCalendarAlt } from 'react-icons/fa';

const BookingSummary = ({
  pickupLocation,
  dropoffLocation,
  vehicleType,
  fareEstimate,
  isScheduled,
  pickupTime
}) => {
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
        return 'Economy';
    }
  };
  
  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };
  
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="space-y-3">
        <div className="flex items-start">
          <FaMapMarkerAlt className="mt-1 mr-3 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-gray-700">Pickup</p>
            <p className="text-sm text-gray-500">{pickupLocation}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <FaLocationArrow className="mt-1 mr-3 text-red-600" />
          <div>
            <p className="text-sm font-medium text-gray-700">Dropoff</p>
            <p className="text-sm text-gray-500">{dropoffLocation}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <FaCar className="mt-1 mr-3 text-gray-600" />
          <div>
            <p className="text-sm font-medium text-gray-700">Vehicle Type</p>
            <p className="text-sm text-gray-500">{getVehicleTypeLabel(vehicleType)}</p>
          </div>
        </div>
        
        {isScheduled && (
          <div className="flex items-start">
            <FaCalendarAlt className="mt-1 mr-3 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-700">Pickup Time</p>
              <p className="text-sm text-gray-500">{formatDate(pickupTime)}</p>
            </div>
          </div>
        )}
        
        {fareEstimate && (
          <>
            <div className="flex items-start">
              <FaMoneyBillWave className="mt-1 mr-3 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-700">Fare Estimate</p>
                <p className="text-sm text-gray-500">${fareEstimate.fare}</p>
              </div>
            </div>
            
            <div className="bg-white p-3 rounded-md border border-gray-200 mt-3">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500">Distance</span>
                <span className="text-sm font-medium">{fareEstimate.distance} km</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500">Estimated Duration</span>
                <span className="text-sm font-medium">{fareEstimate.duration} min</span>
              </div>
              <div className="border-t border-gray-200 my-2"></div>
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>${fareEstimate.fare}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingSummary;