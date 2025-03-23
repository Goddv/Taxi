// frontend/web-app/src/pages/auth/RegisterPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaPhone, FaCheckCircle } from 'react-icons/fa';
import { register } from '../../redux/slices/authSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import logo from '../../assets/images/logo.png';

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector(state => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [accountType, setAccountType] = useState('passenger');

  const validationSchema = Yup.object({
    firstName: Yup.string()
      .required('First name is required'),
    lastName: Yup.string()
      .required('Last name is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    phone: Yup.string()
      .matches(/^[0-9+()-\s]+$/, 'Invalid phone number')
      .required('Phone number is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm password is required'),
    termsAccepted: Yup.boolean()
      .oneOf([true], 'You must accept the terms and conditions')
  });

  // Additional validation for driver account
  const driverValidationSchema = validationSchema.shape({
    drivingLicense: Yup.object({
      number: Yup.string().required('License number is required'),
      expiryDate: Yup.date().required('Expiry date is required')
    }).required('Driving license information is required'),
    vehicle: Yup.object({
      type: Yup.string().required('Vehicle type is required'),
      make: Yup.string().required('Vehicle make is required'),
      model: Yup.string().required('Vehicle model is required'),
      year: Yup.number().required('Vehicle year is required'),
      licensePlate: Yup.string().required('License plate is required')
    }).required('Vehicle information is required')
  });

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      termsAccepted: false,
      drivingLicense: {
        number: '',
        expiryDate: ''
      },
      vehicle: {
        type: 'economy',
        make: '',
        model: '',
        year: '',
        color: '',
        licensePlate: '',
        capacity: 4
      }
    },
    validationSchema: accountType === 'driver' ? driverValidationSchema : validationSchema,
    onSubmit: values => {
      const userData = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        password: values.password,
        role: accountType
      };

      if (accountType === 'driver') {
        userData.drivingLicense = values.drivingLicense;
        userData.vehicle = values.vehicle;
      }

      dispatch(register(userData))
        .unwrap()
        .then(() => {
          navigate('/dashboard');
        })
        .catch(error => {
          console.error('Registration failed:', error);
        });
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-center mb-8">
          <img src={logo} alt="TaxiGo Logo" className="h-16 w-auto" />
        </div>
        
        <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-6">
          Create your account
        </h2>
        
        <div className="flex justify-center mb-6">
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setAccountType('passenger')}
              className={`px-4 py-2 rounded-md font-medium ${
                accountType === 'passenger'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Passenger
            </button>
            <button
              type="button"
              onClick={() => setAccountType('driver')}
              className={`px-4 py-2 rounded-md font-medium ${
                accountType === 'driver'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Driver
            </button>
          </div>
        </div>
        
        <form className="space-y-4" onSubmit={formik.handleSubmit}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First name
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    formik.touched.firstName && formik.errors.firstName
                      ? 'border-red-500'
                      : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="First name"
                />
              </div>
              {formik.touched.firstName && formik.errors.firstName && (
                <p className="mt-2 text-sm text-red-600">{formik.errors.firstName}</p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last name
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    formik.touched.lastName && formik.errors.lastName
                      ? 'border-red-500'
                      : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="Last name"
                />
              </div>
              {formik.touched.lastName && formik.errors.lastName && (
                <p className="mt-2 text-sm text-red-600">{formik.errors.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`block w-full pl-10 pr-3 py-2 border ${
                  formik.touched.email && formik.errors.email
                    ? 'border-red-500'
                    : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="Email address"
              />
            </div>
            {formik.touched.email && formik.errors.email && (
              <p className="mt-2 text-sm text-red-600">{formik.errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone number
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaPhone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`block w-full pl-10 pr-3 py-2 border ${
                  formik.touched.phone && formik.errors.phone
                    ? 'border-red-500'
                    : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="Phone number"
              />
            </div>
            {formik.touched.phone && formik.errors.phone && (
              <p className="mt-2 text-sm text-red-600">{formik.errors.phone}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`block w-full pl-10 pr-10 py-2 border ${
                    formik.touched.password && formik.errors.password
                      ? 'border-red-500'
                      : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="Password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5" />
                    ) : (
                      <FaEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="mt-2 text-sm text-red-600">{formik.errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    formik.touched.confirmPassword && formik.errors.confirmPassword
                      ? 'border-red-500'
                      : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="Confirm password"
                />
              </div>
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">{formik.errors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Driver specific fields */}
          {accountType === 'driver' && (
            <>
              <div className="mt-8 mb-4">
                <h3 className="text-lg font-medium text-gray-900">Driver Information</h3>
                <p className="text-sm text-gray-500">Please provide your driving license and vehicle details.</p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="drivingLicense.number" className="block text-sm font-medium text-gray-700">
                    Driving License Number
                  </label>
                  <input
                    id="drivingLicense.number"
                    name="drivingLicense.number"
                    type="text"
                    value={formik.values.drivingLicense.number}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`block w-full px-3 py-2 border ${
                      formik.touched.drivingLicense?.number && formik.errors.drivingLicense?.number
                        ? 'border-red-500'
                        : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    placeholder="License number"
                  />
                  {formik.touched.drivingLicense?.number && formik.errors.drivingLicense?.number && (
                    <p className="mt-2 text-sm text-red-600">{formik.errors.drivingLicense.number}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="drivingLicense.expiryDate" className="block text-sm font-medium text-gray-700">
                    License Expiry Date
                  </label>
                  <input
                    id="drivingLicense.expiryDate"
                    name="drivingLicense.expiryDate"
                    type="date"
                    value={formik.values.drivingLicense.expiryDate}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`block w-full px-3 py-2 border ${
                      formik.touched.drivingLicense?.expiryDate && formik.errors.drivingLicense?.expiryDate
                        ? 'border-red-500'
                        : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  />
                  {formik.touched.drivingLicense?.expiryDate && formik.errors.drivingLicense?.expiryDate && (
                    <p className="mt-2 text-sm text-red-600">{formik.errors.drivingLicense.expiryDate}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="vehicle.type" className="block text-sm font-medium text-gray-700">
                  Vehicle Type
                </label>
                <select
                  id="vehicle.type"
                  name="vehicle.type"
                  value={formik.values.vehicle.type}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`block w-full px-3 py-2 border ${
                    formik.touched.vehicle?.type && formik.errors.vehicle?.type
                      ? 'border-red-500'
                      : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                >
                  <option value="economy">Economy</option>
                  <option value="comfort">Comfort</option>
                  <option value="premium">Premium</option>
                  <option value="van">Van</option>
                </select>
                {formik.touched.vehicle?.type && formik.errors.vehicle?.type && (
                  <p className="mt-2 text-sm text-red-600">{formik.errors.vehicle.type}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="vehicle.make" className="block text-sm font-medium text-gray-700">
                    Vehicle Make
                  </label>
                  <input
                    id="vehicle.make"
                    name="vehicle.make"
                    type="text"
                    value={formik.values.vehicle.make}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`block w-full px-3 py-2 border ${
                      formik.touched.vehicle?.make && formik.errors.vehicle?.make
                        ? 'border-red-500'
                        : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    placeholder="e.g. Toyota"
                  />
                  {formik.touched.vehicle?.make && formik.errors.vehicle?.make && (
                    <p className="mt-2 text-sm text-red-600">{formik.errors.vehicle.make}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="vehicle.model" className="block text-sm font-medium text-gray-700">
                    Vehicle Model
                  </label>
                  <input
                    id="vehicle.model"
                    name="vehicle.model"
                    type="text"
                    value={formik.values.vehicle.model}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`block w-full px-3 py-2 border ${
                      formik.touched.vehicle?.model && formik.errors.vehicle?.model
                        ? 'border-red-500'
                        : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    placeholder="e.g. Camry"
                  />
                  {formik.touched.vehicle?.model && formik.errors.vehicle?.model && (
                    <p className="mt-2 text-sm text-red-600">{formik.errors.vehicle.model}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label htmlFor="vehicle.year" className="block text-sm font-medium text-gray-700">
                    Year
                  </label>
                  <input
                    id="vehicle.year"
                    name="vehicle.year"
                    type="number"
                    value={formik.values.vehicle.year}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`block w-full px-3 py-2 border ${
                      formik.touched.vehicle?.year && formik.errors.vehicle?.year
                        ? 'border-red-500'
                        : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    placeholder="e.g. 2022"
                  />
                  {formik.touched.vehicle?.year && formik.errors.vehicle?.year && (
                    <p className="mt-2 text-sm text-red-600">{formik.errors.vehicle.year}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="vehicle.color" className="block text-sm font-medium text-gray-700">
                    Color
                  </label>
                  <input
                    id="vehicle.color"
                    name="vehicle.color"
                    type="text"
                    value={formik.values.vehicle.color}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`block w-full px-3 py-2 border ${
                      formik.touched.vehicle?.color && formik.errors.vehicle?.color
                        ? 'border-red-500'
                        : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    placeholder="e.g. Silver"
                  />
                  {formik.touched.vehicle?.color && formik.errors.vehicle?.color && (
                    <p className="mt-2 text-sm text-red-600">{formik.errors.vehicle.color}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="vehicle.licensePlate" className="block text-sm font-medium text-gray-700">
                    License Plate
                  </label>
                  <input
                    id="vehicle.licensePlate"
                    name="vehicle.licensePlate"
                    type="text"
                    value={formik.values.vehicle.licensePlate}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`block w-full px-3 py-2 border ${
                      formik.touched.vehicle?.licensePlate && formik.errors.vehicle?.licensePlate
                        ? 'border-red-500'
                        : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    placeholder="e.g. ABC123"
                  />
                  {formik.touched.vehicle?.licensePlate && formik.errors.vehicle?.licensePlate && (
                    <p className="mt-2 text-sm text-red-600">{formik.errors.vehicle.licensePlate}</p>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="flex items-center mt-4">
            <input
              id="termsAccepted"
              name="termsAccepted"
              type="checkbox"
              checked={formik.values.termsAccepted}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                formik.touched.termsAccepted && formik.errors.termsAccepted
                  ? 'border-red-500'
                  : ''
              }`}
            />
            <label htmlFor="termsAccepted" className="ml-2 block text-sm text-gray-900">
              I agree to the{' '}
              <Link to="/terms" className="text-blue-600 hover:text-blue-500">
                Terms and Conditions
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
                Privacy Policy
              </Link>
            </label>
          </div>
          {formik.touched.termsAccepted && formik.errors.termsAccepted && (
            <p className="mt-2 text-sm text-red-600">{formik.errors.termsAccepted}</p>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;