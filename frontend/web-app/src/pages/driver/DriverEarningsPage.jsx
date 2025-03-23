// frontend/web-app/src/pages/driver/DriverEarningsPage.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaCalendarAlt, FaMoneyBillWave, FaCar, FaCreditCard, FaWallet } from 'react-icons/fa';
import { getDriverEarnings } from '../../redux/slices/driverSlice';
import { getUserWallet } from '../../redux/slices/paymentSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EarningsChart from '../../components/driver/EarningsChart';
import EarningsSummary from '../../components/driver/EarningsSummary';
import Pagination from '../../components/common/Pagination';

const DriverEarningsPage = () => {
  const dispatch = useDispatch();
  const { earnings, earningsHistory, pagination, isLoading } = useSelector(state => state.driver);
  const { wallet } = useSelector(state => state.payment);
  
  const [timeRange, setTimeRange] = useState('week');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Fetch earnings data
  useEffect(() => {
    dispatch(getDriverEarnings({ timeRange, page: currentPage }));
    dispatch(getUserWallet());
  }, [dispatch, timeRange, currentPage]);
  
  // Handle time range change
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
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
  
  if (isLoading && !earnings) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Earnings</h2>
        
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => handleTimeRangeChange('today')}
            className={`px-4 py-2 rounded-md ${
              timeRange === 'today'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => handleTimeRangeChange('week')}
            className={`px-4 py-2 rounded-md ${
              timeRange === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => handleTimeRangeChange('month')}
            className={`px-4 py-2 rounded-md ${
              timeRange === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            This Month
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <EarningsSummary
            title="Today's Earnings"
            amount={earnings?.today || 0}
            icon={<FaMoneyBillWave className="text-green-600" />}
          />
          <EarningsSummary
            title="This Week"
            amount={earnings?.week || 0}
            icon={<FaMoneyBillWave className="text-blue-600" />}
          />
          <EarningsSummary
            title="This Month"
            amount={earnings?.month || 0}
            icon={<FaMoneyBillWave className="text-purple-600" />}
          />
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Earnings Trend</h3>
          <div className="h-64">
            <EarningsChart data={earningsHistory} timeRange={timeRange} />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Wallet Balance</h3>
            <div className="flex items-center">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <FaWallet className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Available Balance</p>
                <p className="text-2xl font-semibold">${(wallet?.balance || 0).toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Payment Method</h3>
            <div className="flex items-center">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <FaCreditCard className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Balance is transferred to</p>
                <p className="text-lg font-semibold">Bank Account (****1234)</p>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Recent Trips</h3>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : earningsHistory.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No trips found</h3>
              <p className="text-gray-500">
                You haven't completed any trips in the selected time range.
              </p>
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
                        Trip Details
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Distance & Duration
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Earnings
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {earningsHistory.map((trip) => (
                      <tr key={trip._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FaCalendarAlt className="mr-2 text-gray-400" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {formatDate(trip.date)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {formatTime(trip.date)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {trip.pickup} to {trip.dropoff}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {trip.distance.toFixed(1)} km • {trip.duration} min
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="text-green-600 font-semibold">
                            ${trip.amount.toFixed(2)}
                          </div>
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
    </div>
  );
};

export default DriverEarningsPage;