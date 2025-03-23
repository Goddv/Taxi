// frontend/web-app/src/pages/admin/AdminUsersPage.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FaSearch, 
  FaUserAlt, 
  FaEnvelope, 
  FaPhone, 
  FaCalendarAlt, 
  FaSort,
  FaSortUp,
  FaSortDown,
  FaToggleOn,
  FaToggleOff,
  FaUserSlash,
  FaUserCheck,
  FaEllipsisV,
  FaFilter
} from 'react-icons/fa';
import { getAllUsers, updateUserStatus } from '../../redux/slices/adminSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import { format } from 'date-fns';

const AdminUsersPage = () => {
  const dispatch = useDispatch();
  const { users, usersPagination, isLoading } = useSelector(state => state.admin);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [dropdownOpen, setDropdownOpen] = useState(null);

  // Fetch users on initial load and when params change
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: 10,
      sort: sortField,
      direction: sortDirection,
      search: searchTerm || undefined,
      role: filterRole !== 'all' ? filterRole : undefined,
      status: filterStatus !== 'all' ? filterStatus : undefined
    };

    dispatch(getAllUsers(params));
  }, [dispatch, currentPage, sortField, sortDirection, searchTerm, filterRole, filterStatus]);

  // Handle search input
  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setSearchTerm(e.target.value);
      setCurrentPage(1); // Reset to first page when searching
    }
  };

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to ascending for new field
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Get sort icon
  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <FaSort className="ml-1 text-gray-400" />;
    }
    return sortDirection === 'asc' ? (
      <FaSortUp className="ml-1 text-blue-600" />
    ) : (
      <FaSortDown className="ml-1 text-blue-600" />
    );
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle dropdown toggle
  const toggleDropdown = (userId) => {
    setDropdownOpen(dropdownOpen === userId ? null : userId);
  };

  // Handle status update
  const handleStatusUpdate = (userId, status) => {
    dispatch(updateUserStatus({ userId, status }))
      .then(() => {
        setDropdownOpen(null);
      });
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>;
      case 'inactive':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Inactive</span>;
      case 'suspended':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Suspended</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Pending</span>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 md:mb-0">User Management</h2>
          
          <div className="flex w-full md:w-auto space-x-2">
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search users..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                onKeyDown={handleSearch}
                defaultValue={searchTerm}
              />
            </div>
            
            <div className="relative">
              <button
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => setDropdownOpen(dropdownOpen === 'filter' ? null : 'filter')}
              >
                <FaFilter className="h-4 w-4" />
              </button>
              
              {dropdownOpen === 'filter' && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1 p-2" role="menu" aria-orientation="vertical" aria-labelledby="filter-menu">
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <select
                        value={filterRole}
                        onChange={(e) => {
                          setFilterRole(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="all">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="driver">Driver</option>
                        <option value="passenger">Passenger</option>
                      </select>
                    </div>
                    
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={filterStatus}
                        onChange={(e) => {
                          setFilterStatus(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>
                    
                    <button
                      className="w-full mt-2 px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={() => {
                        setFilterRole('all');
                        setFilterStatus('all');
                        setCurrentPage(1);
                        setDropdownOpen(null);
                      }}
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {isLoading && !users.length ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : users.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FaUserAlt className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-500">
              {searchTerm ? `No users matching "${searchTerm}"` : "No users available."}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        <span>Name</span>
                        {getSortIcon('name')}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center">
                        <span>Email</span>
                        {getSortIcon('email')}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('role')}
                    >
                      <div className="flex items-center">
                        <span>Role</span>
                        {getSortIcon('role')}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center">
                        <span>Status</span>
                        {getSortIcon('status')}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center">
                        <span>Joined</span>
                        {getSortIcon('createdAt')}
                      </div>
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
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {user.profileImage ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={user.profileImage}
                                alt={`${user.firstName} ${user.lastName}`}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                <FaUserAlt className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {user._id.substring(0, 8)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <FaEnvelope className="mr-2 text-gray-400" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center text-sm text-gray-500">
                            <FaPhone className="mr-2 text-gray-400" />
                            {user.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${
                          user.role === 'admin' ? 'text-indigo-600' :
                          user.role === 'driver' ? 'text-green-600' :
                          'text-gray-900'
                        } capitalize`}>
                          {user.role}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <FaCalendarAlt className="mr-2 text-gray-400" />
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="relative">
                          <button
                            className="text-gray-500 hover:text-gray-700 focus:outline-none"
                            onClick={() => toggleDropdown(user._id)}
                          >
                            <FaEllipsisV />
                          </button>
                          
                          {dropdownOpen === user._id && (
                            <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                              <div className="py-1" role="menu" aria-orientation="vertical">
                                <button
                                  className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  onClick={() => handleStatusUpdate(user._id, 'active')}
                                  disabled={user.status === 'active'}
                                >
                                  <FaUserCheck className="inline-block mr-2 text-green-500" />
                                  Activate User
                                </button>
                                <button
                                  className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  onClick={() => handleStatusUpdate(user._id, 'suspended')}
                                  disabled={user.status === 'suspended'}
                                >
                                  <FaUserSlash className="inline-block mr-2 text-red-500" />
                                  Suspend User
                                </button>
                                <button
                                  className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  onClick={() => handleStatusUpdate(user._id, 'inactive')}
                                  disabled={user.status === 'inactive'}
                                >
                                  <FaToggleOff className="inline-block mr-2 text-gray-500" />
                                  Deactivate User
                                </button>
                                <a
                                  href={`/admin/users/${user._id}`}
                                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  View Details
                                </a>
                              </div>
                            </div>
                          )}
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
                totalPages={usersPagination.pages}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminUsersPage;