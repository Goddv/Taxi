// frontend/web-app/src/pages/passenger/BookingHistoryPage.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaCar, FaCalendarAlt, FaMapMarkerAlt, FaLocationArrow, FaMoneyBillWave } from 'react-icons/fa';
import { getUserBookings } from '../../redux/slices/bookingSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import BookingStatusBadge from '../../components/booking/BookingStatusBadge';
import Pagination from '../../components/common/Pagination';

const BookingHistoryPage = () => {
  const dispatch = useDispatch();
  const { bookings, pagination, isLoading } = useSelector(state => state.booking);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Fetch bookings
  useEffect(() => {
    let params = {
      page: currentPage,
      limit: 10
    };
    
    if (filter !== 'all') {
      params.status = filter;
    }
    
    dispatch(getUserBookings(params));
  }, [dispatch, filter, currentPage]);
  
  // Handle filter change
  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };
  
  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
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
    <div className="container mx-auto px-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 md:mb-0">My Rides</h2>
          
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <label htmlFor="filter" className="text-sm font-medium text-gray-700 sr-only">
              Filter by status
            </label>
            <select
              id="filter"
              value={filter}
              onChange={handleFilterChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="all">All Rides</option>
              <option value="pending">Pending</option>
              <option value="driver_assigned">Driver Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <Link
              to="/book"
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaCar className="mr-2" />
              Book a Ride
            </Link>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No rides found</h3>
            <p className="text-gray-500 mb-4">
              {filter === 'all'
                ? "You haven't taken any rides yet."
                : `You don't have any ${filter} rides.`}
            </p>
            <Link
              to="/book"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <FaCar className="mr-2" />
              Book Your First Ride
            </Link>
          </div>
        ) : (
          <>
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date & Time
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Pickup & Dropoff
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell"
                    >
                      Fare
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FaCalendarAlt className="mr-2 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {formatDate(booking.pickupTime)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatTime(booking.pickupTime)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center">
                            <FaMapMarkerAlt className="mr-2 text-blue-500 flex-shrink-0" />
                            <div className="text-sm text-gray-900 truncate max-w-xs">
                              {booking.pickupLocation.address}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <FaLocationArrow className="mr-2 text-red-500 flex-shrink-0" />
                            <div className="text-sm text-gray-900 truncate max-w-xs">
                              {booking.dropoffLocation.address}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                        <div className="flex items-center">
                          <FaMoneyBillWave className="mr-2 text-green-500" />
                          <div className="text-sm text-gray-900">
                            ${booking.fareEstimate.toFixed(2)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                        <BookingStatusBadge status={booking.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/bookings/${booking._id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
    </div>
  );
};

export default BookingHistoryPage;