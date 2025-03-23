// frontend/web-app/src/components/driver/NearbyBookingCard.jsx
import React from 'react';
import { FaMapMarkerAlt, FaLocationArrow, FaClock, FaMoneyBillWave, FaRoute } from 'react-icons/fa';

const NearbyBookingCard = ({ booking, onAccept }) => {
  const formatDistance = (distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`;
    }
    return `${distance.toFixed(1)} km`;
  };
  
  const formatTime = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} hr ${mins} min`;
  };
  
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:bg-blue-50 transition-colors">
      <div className="flex justify-between mb-3">
        <div className="flex items-center">
          <FaRoute className="text-blue-600 mr-2" />
          <span className="font-medium text-gray-800">
            {formatDistance(booking.distance)}
          </span>
        </div>
        <div className="flex items-center">
          <FaMoneyBillWave className="text-green-600 mr-2" />
          <span className="font-medium text-gray-800">
            ${booking.fareEstimate.toFixed(2)}
          </span>
        </div>
      </div>
      
      <div className="space-y-2 mb-3">
        <div className="flex items-start">
          <FaMapMarkerAlt className="mt-1 mr-2 text-blue-600 flex-shrink-0" />
          <div className="text-sm text-gray-800 flex-grow">
            {booking.pickupLocation.address}
          </div>
        </div>
        
        <div className="flex items-start">
          <FaLocationArrow className="mt-1 mr-2 text-red-600 flex-shrink-0" />
          <div className="text-sm text-gray-800 flex-grow">
            {booking.dropoffLocation.address}
          </div>
        </div>
        
        <div className="flex items-center">
          <FaClock className="mr-2 text-gray-600" />
          <div className="text-sm text-gray-600">
            Est. trip time: {formatTime(booking.duration)}
          </div>
        </div>
      </div>
      
      <button
        onClick={() => onAccept()}
        className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Accept Ride
      </button>
    </div>
  );
};

export default NearbyBookingCard;