// frontend/web-app/src/pages/admin/AdminDriversPage.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaSearch, FaFilter, FaPlus } from 'react-icons/fa';
import { getAllDrivers } from '../../redux/slices/adminSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import DriverCard from '../../components/admin/DriverCard';
import DriverVerificationModal from '../../components/admin/DriverVerificationModal';
import DriverFilterPanel from '../../components/admin/DriverFilterPanel';

const AdminDriversPage = () => {
  const dispatch = useDispatch();
  const { drivers, driversPagination, isLoading } = useSelector(state => state.admin);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    verificationStatus: 'all',
    vehicleType: 'all'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // Fetch drivers on initial load and when params change
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: 8,
      search: searchTerm || undefined,
      status: filters.status !== 'all' ? filters.status : undefined,
      verificationStatus: filters.verificationStatus !== 'all' ? filters.verificationStatus : undefined,
      vehicleType: filters.vehicleType !== 'all' ? filters.vehicleType : undefined
    };

    dispatch(getAllDrivers(params));
  }, [dispatch, currentPage, searchTerm, filters]);

  // Handle search input
  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setSearchTerm(e.target.value);
      setCurrentPage(1); // Reset to first page when searching
    }
  };

  // Handle filter change
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filtering
    setShowFilterPanel(false);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Open driver verification modal
  const openVerificationModal = (driver) => {
    setSelectedDriver(driver);
    setShowVerificationModal(true);
  };

  // Close driver verification modal
  const closeVerificationModal = () => {
    setSelectedDriver(null);
    setShowVerificationModal(false);
  };

  return (
    <div className="container mx-auto px-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 md:mb-0">Driver Management</h2>
          
          <div className="flex w-full md:w-auto space-x-2">
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search drivers..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                onKeyDown={handleSearch}
                defaultValue={searchTerm}
              />
            </div>
            
            <button
              className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => setShowFilterPanel(!showFilterPanel)}
            >
              <FaFilter className="h-4 w-4" />
            </button>
            
            <button
              className="px-3 py-2 border border-transparent rounded-md bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaPlus className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Filter Panel */}
        {showFilterPanel && (
          <DriverFilterPanel 
            filters={filters} 
            onFilterChange={handleFilterChange} 
            onClose={() => setShowFilterPanel(false)}
          />
        )}
        
        {isLoading && !drivers.length ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : drivers.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No drivers found</h3>
            <p className="text-gray-500">
              {searchTerm ? `No drivers matching "${searchTerm}"` : "No drivers available."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {drivers.map((driver) => (
                <DriverCard 
                  key={driver._id} 
                  driver={driver} 
                  onVerify={() => openVerificationModal(driver)}
                />
              ))}
            </div>
            
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={driversPagination.pages}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}
      </div>
      
      {/* Driver Verification Modal */}
      {showVerificationModal && selectedDriver && (
        <DriverVerificationModal
          driver={selectedDriver}
          onClose={closeVerificationModal}
        />
      )}
    </div>
  );
};

export default AdminDriversPage;