// frontend/web-app/src/pages/driver/DriverProfilePage.jsx
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FaCar, FaIdCard, FaCamera, FaCheck } from 'react-icons/fa';
import { updateDriverProfile, updateVehicleDetails } from '../../redux/slices/driverSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const DriverProfilePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { isLoading } = useSelector(state => state.driver);
  
  const [activeTab, setActiveTab] = useState('vehicle');
  
  // Vehicle details form
  const vehicleFormik = useFormik({
    initialValues: {
      type: user?.driverDetails?.vehicle?.type || 'economy',
      make: user?.driverDetails?.vehicle?.make || '',
      model: user?.driverDetails?.vehicle?.model || '',
      year: user?.driverDetails?.vehicle?.year || '',
      color: user?.driverDetails?.vehicle?.color || '',
      licensePlate: user?.driverDetails?.vehicle?.licensePlate || '',
      capacity: user?.driverDetails?.vehicle?.capacity || 4
    },
    validationSchema: Yup.object({
      type: Yup.string().required('Vehicle type is required'),
      make: Yup.string().required('Vehicle make is required'),
      model: Yup.string().required('Vehicle model is required'),
      year: Yup.number().required('Vehicle year is required').min(2000, 'Vehicle must be 2000 or newer'),
      color: Yup.string().required('Vehicle color is required'),
      licensePlate: Yup.string().required('License plate is required'),
      capacity: Yup.number().required('Capacity is required').min(1, 'Capacity must be at least 1')
    }),
    onSubmit: values => {
      dispatch(updateVehicleDetails(values));
    }
  });
  
  // Driver license form
  const licenseFormik = useFormik({
    initialValues: {
      number: user?.driverDetails?.drivingLicense?.number || '',
      expiryDate: user?.driverDetails?.drivingLicense?.expiryDate
        ? new Date(user.driverDetails.drivingLicense.expiryDate).toISOString().split('T')[0]
        : '',
      image: user?.driverDetails?.drivingLicense?.image || null
    },
    validationSchema: Yup.object({
      number: Yup.string().required('License number is required'),
      expiryDate: Yup.date().required('Expiry date is required')
    }),
    onSubmit: values => {
      dispatch(updateDriverProfile({ drivingLicense: values }));
    }
  });
  
  return (
    <div className="container mx-auto px-4">
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('vehicle')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'vehicle'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaCar className="inline-block mr-2" />
              Vehicle Details
            </button>
            <button
              onClick={() => setActiveTab('license')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'license'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaIdCard className="inline-block mr-2" />
              Driving License
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'vehicle' ? (
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Vehicle Details</h2>
              
              <form onSubmit={vehicleFormik.handleSubmit}>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                      Vehicle Type
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={vehicleFormik.values.type}
                      onChange={vehicleFormik.handleChange}
                      onBlur={vehicleFormik.handleBlur}
                      className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                        vehicleFormik.touched.type && vehicleFormik.errors.type
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    >
                      <option value="economy">Economy</option>
                      <option value="comfort">Comfort</option>
                      <option value="premium">Premium</option>
                      <option value="van">Van</option>
                    </select>
                    {vehicleFormik.touched.type && vehicleFormik.errors.type && (
                      <p className="mt-2 text-sm text-red-600">{vehicleFormik.errors.type}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
                      Passenger Capacity
                    </label>
                    <input
                      type="number"
                      id="capacity"
                      name="capacity"
                      min="1"
                      max="15"
                      value={vehicleFormik.values.capacity}
                      onChange={vehicleFormik.handleChange}
                      onBlur={vehicleFormik.handleBlur}
                      className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                        vehicleFormik.touched.capacity && vehicleFormik.errors.capacity
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                    {vehicleFormik.touched.capacity && vehicleFormik.errors.capacity && (
                      <p className="mt-2 text-sm text-red-600">{vehicleFormik.errors.capacity}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="make" className="block text-sm font-medium text-gray-700">
                      Make
                    </label>
                    <input
                      type="text"
                      id="make"
                      name="make"
                      value={vehicleFormik.values.make}
                      onChange={vehicleFormik.handleChange}
                      onBlur={vehicleFormik.handleBlur}
                      placeholder="e.g. Toyota"
                      className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                        vehicleFormik.touched.make && vehicleFormik.errors.make
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                    {vehicleFormik.touched.make && vehicleFormik.errors.make && (
                      <p className="mt-2 text-sm text-red-600">{vehicleFormik.errors.make}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="model" className="block text-sm font-medium text-gray-700">
                      Model
                    </label>
                    <input
                      type="text"
                      id="model"
                      name="model"
                      value={vehicleFormik.values.model}
                      onChange={vehicleFormik.handleChange}
                      onBlur={vehicleFormik.handleBlur}
                      placeholder="e.g. Camry"
                      className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                        vehicleFormik.touched.model && vehicleFormik.errors.model
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                    {vehicleFormik.touched.model && vehicleFormik.errors.model && (
                      <p className="mt-2 text-sm text-red-600">{vehicleFormik.errors.model}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                      Year
                    </label>
                    <input
                      type="number"
                      id="year"
                      name="year"
                      min="2000"
                      max={new Date().getFullYear() + 1}
                      value={vehicleFormik.values.year}
                      onChange={vehicleFormik.handleChange}
                      onBlur={vehicleFormik.handleBlur}
                      placeholder="e.g. 2022"
                      className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                        vehicleFormik.touched.year && vehicleFormik.errors.year
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                    {vehicleFormik.touched.year && vehicleFormik.errors.year && (
                      <p className="mt-2 text-sm text-red-600">{vehicleFormik.errors.year}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="color" className="block text-sm font-medium text-gray-700">
                      Color
                    </label>
                    <input
                      type="text"
                      id="color"
                      name="color"
                      value={vehicleFormik.values.color}
                      onChange={vehicleFormik.handleChange}
                      onBlur={vehicleFormik.handleBlur}
                      placeholder="e.g. Silver"
                      className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                        vehicleFormik.touched.color && vehicleFormik.errors.color
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                    {vehicleFormik.touched.color && vehicleFormik.errors.color && (
                      <p className="mt-2 text-sm text-red-600">{vehicleFormik.errors.color}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700">
                      License Plate
                    </label>
                    <input
                      type="text"
                      id="licensePlate"
                      name="licensePlate"
                      value={vehicleFormik.values.licensePlate}
                      onChange={vehicleFormik.handleChange}
                      onBlur={vehicleFormik.handleBlur}
                      placeholder="e.g. ABC123"
                      className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                        vehicleFormik.touched.licensePlate && vehicleFormik.errors.licensePlate
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                    {vehicleFormik.touched.licensePlate && vehicleFormik.errors.licensePlate && (
                      <p className="mt-2 text-sm text-red-600">{vehicleFormik.errors.licensePlate}</p>
                    )}
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {isLoading ? (
                      <LoadingSpinner size="sm" color="white" />
                    ) : (
                      <>
                        <FaCheck className="mr-2" />
                        Save Vehicle Details
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Driving License Information</h2>
              
              <form onSubmit={licenseFormik.handleSubmit}>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="number" className="block text-sm font-medium text-gray-700">
                      License Number
                    </label>
                    <input
                      type="text"
                      id="number"
                      name="number"
                      value={licenseFormik.values.number}
                      onChange={licenseFormik.handleChange}
                      onBlur={licenseFormik.handleBlur}
                      className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                        licenseFormik.touched.number && licenseFormik.errors.number
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                    {licenseFormik.touched.number && licenseFormik.errors.number && (
                      <p className="mt-2 text-sm text-red-600">{licenseFormik.errors.number}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      id="expiryDate"
                      name="expiryDate"
                      value={licenseFormik.values.expiryDate}
                      onChange={licenseFormik.handleChange}
                      onBlur={licenseFormik.handleBlur}
                      className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                        licenseFormik.touched.expiryDate && licenseFormik.errors.expiryDate
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                    {licenseFormik.touched.expiryDate && licenseFormik.errors.expiryDate && (
                      <p className="mt-2 text-sm text-red-600">{licenseFormik.errors.expiryDate}</p>
                    )}
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700">
                    License Image
                  </label>
                  <div className="mt-1 flex items-center">
                    {licenseFormik.values.image ? (
                      <div className="relative">
                        <img
                          src={licenseFormik.values.image}
                          alt="License"
                          className="h-32 w-auto object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => licenseFormik.setFieldValue('image', null)}
                          className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 focus:outline-none"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-32 w-48 bg-gray-100 rounded-md border-2 border-dashed border-gray-300">
                        <div className="text-center">
                          <FaCamera className="mx-auto h-6 w-6 text-gray-400" />
                          <div className="mt-1 text-sm text-gray-500">
                            Upload license image
                          </div>
                        </div>
                        <input
                          type="file"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(event) => {
                            const file = event.currentTarget.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                licenseFormik.setFieldValue('image', e.target.result);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          accept="image/*"
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {isLoading ? (
                      <LoadingSpinner size="sm" color="white" />
                    ) : (
                      <>
                        <FaCheck className="mr-2" />
                        Save License Information
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverProfilePage;