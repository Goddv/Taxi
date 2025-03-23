// frontend/web-app/src/components/admin/DriverFilterPanel.jsx
import React, { useState } from 'react';
import { FaTimes, FaFilter } from 'react-icons/fa';

/**
 * Panel component for filtering driver lists in the admin interface
 * Allows filtering by driver status, verification status, and vehicle type
 */
const DriverFilterPanel = ({ filters, onFilterChange, onClose }) => {
  const [localFilters, setLocalFilters] = useState({
    status: filters.status || 'all',
    verificationStatus: filters.verificationStatus || 'all',
    vehicleType: filters.vehicleType || 'all'
  });
  
  // Handle change in filter values
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters({
      ...localFilters,
      [name]: value
    });
  };
  
  // Apply filters and close panel
  const handleApplyFilters = () => {
    onFilterChange(localFilters);
  };
  
  // Reset all filters to default values
  const handleResetFilters = () => {
    const resetFilters = {
      status: 'all',
      verificationStatus: 'all',
      vehicleType: 'all'
    };
    setLocalFilters(resetFilters);
  };
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg mb-6 p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-800 flex items-center">
          <FaFilter className="mr-2 text-blue-600" />
          Filter Drivers
        </h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <FaTimes className="h-5 w-5" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Driver Status Filter */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Driver Status
          </label>
          <select
            id="status"
            name="status"
            value={localFilters.status}
            onChange={handleFilterChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        
        {/* Verification Status Filter */}
        <div>
          <label htmlFor="verificationStatus" className="block text-sm font-medium text-gray-700 mb-1">
            Verification Status
          </label>
          <select
            id="verificationStatus"
            name="verificationStatus"
            value={localFilters.verificationStatus}
            onChange={handleFilterChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="all">All</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending Verification</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        
        {/* Vehicle Type Filter */}
        <div>
          <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700 mb-1">
            Vehicle Type
          </label>
          <select
            id="vehicleType"
            name="vehicleType"
            value={localFilters.vehicleType}
            onChange={handleFilterChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="all">All Types</option>
            <option value="economy">Economy</option>
            <option value="comfort">Comfort</option>
            <option value="premium">Premium</option>
            <option value="van">Van</option>
          </select>
        </div>
      </div>
      
      {/* Additional filters can be added here */}
      
      <div className="flex justify-end mt-4 space-x-3">
        <button
          type="button"
          onClick={handleResetFilters}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Reset Filters
        </button>
        <button
          type="button"
          onClick={handleApplyFilters}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default DriverFilterPanel;