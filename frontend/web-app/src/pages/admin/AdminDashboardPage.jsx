// frontend/web-app/src/pages/admin/AdminDashboardPage.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  FaUsers, 
  FaCar, 
  FaMoneyBillWave, 
  FaChartLine, 
  FaCalendarAlt, 
  FaUserTie, 
  FaMapMarkerAlt,
  FaExclamationTriangle
} from 'react-icons/fa';
import { getSystemStatistics } from '../../redux/slices/adminSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboardPage = () => {
  const dispatch = useDispatch();
  const { statistics, isLoading } = useSelector(state => state.admin);
  const [timeRange, setTimeRange] = useState('week');
  
  // Fetch system statistics
  useEffect(() => {
    dispatch(getSystemStatistics());
    
    // Refresh statistics every 60 seconds
    const intervalId = setInterval(() => {
      dispatch(getSystemStatistics());
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [dispatch]);
  
  // Generate chart data
  const getRevenueChartData = () => {
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Sample data - in a real app this would come from statistics
    const data = [
      5000, 7500, 8000, 9000, 9500, 10000, 11000, 10500, 12000, 12500, 13000, 14000
    ];
    
    return {
      labels,
      datasets: [
        {
          label: 'Monthly Revenue',
          data,
          fill: true,
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgba(59, 130, 246, 1)',
          tension: 0.4,
        }
      ]
    };
  };
  
  const getBookingsChartData = () => {
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    // Sample data - in a real app this would come from statistics
    const data = [45, 60, 75, 80, 90, 100, 85];
    
    return {
      labels,
      datasets: [
        {
          label: 'Daily Bookings',
          data,
          backgroundColor: 'rgba(99, 102, 241, 0.5)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 1,
        }
      ]
    };
  };
  
  const getVehicleTypeChartData = () => {
    // Sample data - in a real app this would come from statistics
    return {
      labels: ['Economy', 'Comfort', 'Premium', 'Van'],
      datasets: [
        {
          data: [55, 25, 15, 5],
          backgroundColor: [
            'rgba(52, 211, 153, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(251, 191, 36, 0.8)'
          ],
          borderColor: [
            'rgba(52, 211, 153, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(139, 92, 246, 1)',
            'rgba(251, 191, 36, 1)'
          ],
          borderWidth: 1,
        }
      ]
    };
  };
  
  // Chart options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `$${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value;
          }
        }
      }
    }
  };
  
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };
  
  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      }
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Handle time range change
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    // In a real app, you would refetch statistics with the new time range
    // dispatch(getSystemStatistics({ timeRange: range }));
  };
  
  if (isLoading && !statistics) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 md:mb-0">Dashboard Overview</h2>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handleTimeRangeChange('day')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                timeRange === 'day'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => handleTimeRangeChange('week')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                timeRange === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => handleTimeRangeChange('month')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                timeRange === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              This Month
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                <FaUsers className="text-indigo-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-semibold">{statistics?.totalUsers || 0}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Active Users</span>
                <span className="font-medium">{statistics?.activeUsers || 0}</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full mt-1">
                <div 
                  className="bg-indigo-600 h-2 rounded-full" 
                  style={{ width: `${statistics?.activeUsers / statistics?.totalUsers * 100 || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <FaCar className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Drivers</p>
                <p className="text-2xl font-semibold">{statistics?.totalDrivers || 0}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Active Drivers</span>
                <span className="font-medium">{statistics?.activeDrivers || 0}</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full mt-1">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${statistics?.activeDrivers / statistics?.totalDrivers * 100 || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <FaCalendarAlt className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Bookings</p>
                <p className="text-2xl font-semibold">{statistics?.totalBookings || 0}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Completed</span>
                <span className="font-medium">{statistics?.completedBookings || 0}</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full mt-1">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${statistics?.completedBookings / statistics?.totalBookings * 100 || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                <FaMoneyBillWave className="text-yellow-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-semibold">${statistics?.totalRevenue?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex space-x-2 text-sm">
                <div className="flex items-center">
                  <div className="h-3 w-3 bg-yellow-500 rounded-full mr-1"></div>
                  <span className="text-gray-500">Weekly: ${(statistics?.totalRevenue / 4).toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex items-center">
                  <div className="h-3 w-3 bg-yellow-300 rounded-full mr-1"></div>
                  <span className="text-gray-500">Today: ${(statistics?.totalRevenue / 30).toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 lg:col-span-2 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Revenue Trend</h3>
            <div className="h-64">
              <Line data={getRevenueChartData()} options={lineChartOptions} />
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Vehicle Types</h3>
            <div className="h-64">
              <Doughnut data={getVehicleTypeChartData()} options={doughnutChartOptions} />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Weekly Bookings</h3>
            <div className="h-64">
              <Bar data={getBookingsChartData()} options={barChartOptions} />
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6 lg:col-span-2 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-800">Recent Bookings</h3>
              <Link
                to="/admin/bookings"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            
            {statistics?.recentBookings && statistics.recentBookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        ID
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        User
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {statistics.recentBookings.map((booking) => (
                      <tr key={booking._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          #{booking._id.substring(0, 8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(booking.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <FaUserTie className="text-gray-500" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {booking.userName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {booking.userEmail}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            booking.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${booking.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No recent bookings available
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Issue reports and alerts section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">System Alerts</h2>
        
        <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Low driver availability</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  There are currently only 5 active drivers in the downtown area.
                  This may lead to longer wait times during peak hours.
                </p>
              </div>
              <div className="mt-3">
                <div className="-mx-2 -my-1.5 flex">
                  <button
                    type="button"
                    className="px-2 py-1.5 rounded-md text-sm font-medium text-yellow-800 hover:bg-yellow-100 focus:outline-none"
                  >
                    Send notification to drivers
                  </button>
                  <button
                    type="button"
                    className="ml-3 px-2 py-1.5 rounded-md text-sm font-medium text-yellow-800 hover:bg-yellow-100 focus:outline-none"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-l-4 border-red-500 bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Payment gateway issue</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  The payment gateway experienced a temporary outage at 12:45 PM.
                  Some transactions may have been affected. Technical team is investigating.
                </p>
              </div>
              <div className="mt-3">
                <div className="-mx-2 -my-1.5 flex">
                  <button
                    type="button"
                    className="px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none"
                  >
                    View affected transactions
                  </button>
                  <button
                    type="button"
                    className="ml-3 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none"
                  >
                    Resolve
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick action cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
          <h3 className="text-lg font-medium mb-4">User Management</h3>
          <p className="mb-4">View and manage user accounts, verify drivers, and handle user issues.</p>
          <Link
            to="/admin/users"
            className="inline-block px-4 py-2 bg-white text-blue-600 rounded-md font-medium hover:bg-blue-50"
          >
            Manage Users
          </Link>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
          <h3 className="text-lg font-medium mb-4">Booking Management</h3>
          <p className="mb-4">View all bookings, handle disputes, and manage refunds.</p>
          <Link
            to="/admin/bookings"
            className="inline-block px-4 py-2 bg-white text-green-600 rounded-md font-medium hover:bg-green-50"
          >
            Manage Bookings
          </Link>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
          <h3 className="text-lg font-medium mb-4">Reports & Analytics</h3>
          <p className="mb-4">View detailed reports, analyze trends, and export data.</p>
          <Link
            to="/admin/reports"
            className="inline-block px-4 py-2 bg-white text-purple-600 rounded-md font-medium hover:bg-purple-50"
          >
            View Reports
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;