// frontend/web-app/src/components/booking/BookingSummaryCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaCalendarAlt, FaMoneyBillWave, FaCarSide } from 'react-icons/fa';
import BookingStatusBadge from './BookingStatusBadge';

const BookingSummaryCard = ({ booking }) => {
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <FaCalendarAlt className="text-gray-500 mr-2" />
          <div>
            <div className="text-sm font-medium text-gray-800">
              {formatDate(booking.pickupTime)}
            </div>
            <div className="text-xs text-gray-500">
              {formatTime(booking.pickupTime)}
            </div>
          </div>
        </div>
        
        <BookingStatusBadge status={booking.status} />
      </div>
      
      <div className="flex flex-col space-y-2">
        <div className="flex items-start">
          <FaMapMarkerAlt className="mt-1 mr-2 text-blue-600" />
          <div className="flex-grow">
            <div className="text-xs text-gray-500">From</div>
            <div className="text-sm truncate">{booking.pickupLocation.address}</div>
          </div>
        </div>
        
        <div className="flex items-start">
          <FaMapMarkerAlt className="mt-1 mr-2 text-red-600" />
          <div className="flex-grow">
            <div className="text-xs text-gray-500">To</div>
            <div className="text-sm truncate">{booking.dropoffLocation.address}</div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-3">
        <div className="flex items-center">
          <FaCarSide className="text-gray-500 mr-2" />
          <span className="text-sm capitalize">{booking.vehicleType}</span>
        </div>
        
        <div className="flex items-center">
          <FaMoneyBillWave className="text-green-600 mr-2" />
          <span className="text-sm font-medium">${booking.fareEstimate.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="mt-3 flex justify-end">
        <Link
          to={`/bookings/${booking._id}`}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default BookingSummaryCard;