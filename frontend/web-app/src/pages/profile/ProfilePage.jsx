// frontend/web-app/src/pages/profile/ProfilePage.jsx
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash, FaCamera, FaCheck } from 'react-icons/fa';
import { updateProfile, updatePassword } from '../../redux/slices/authSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);
  
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Profile form
  const profileFormik = useFormik({
    initialValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      profileImage: user?.profileImage || null
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required('First name is required'),
      lastName: Yup.string().required('Last name is required'),
      email: Yup.string().email('Invalid email address').required('Email is required'),
      phone: Yup.string().matches(/^[0-9+()-\s]+$/, 'Invalid phone number').required('Phone number is required')
    }),
    onSubmit: values => {
      dispatch(updateProfile(values));
    }
  });
  
  // Password form
  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    validationSchema: Yup.object({
      currentPassword: Yup.string().required('Current password is required'),
      newPassword: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .required('New password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
        .required('Confirm password is required')
    }),
    onSubmit: values => {
      dispatch(updatePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      }))
        .then(() => {
          passwordFormik.resetForm();
        });
    }
  });
  
  return (
    <div className="container mx-auto px-4">
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaUser className="inline-block mr-2" />
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'security'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaLock className="inline-block mr-2" />
              Security
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'profile' ? (
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Profile Information</h2>
              
              <form onSubmit={profileFormik.handleSubmit}>
                <div className="mb-6">
                  <div className="flex items-center">
                    <div className="mr-6">
                      <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-100">
                        {profileFormik.values.profileImage ? (
                          <img
                            src={profileFormik.values.profileImage}
                            alt="Profile"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <FaUser className="text-gray-400 text-4xl" />
                          </div>
                        )}
                        <label
                          htmlFor="profileImage"
                          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 cursor-pointer transition-opacity"
                        >
                          <FaCamera className="text-white text-xl" />
                          <input
                            id="profileImage"
                            name="profileImage"
                            type="file"
                            className="sr-only"
                            onChange={(event) => {
                              const file = event.currentTarget.files[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                  profileFormik.setFieldValue('profileImage', e.target.result);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            accept="image/*"
                          />
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{user?.firstName} {user?.lastName}</h3>
                      <p className="text-sm text-gray-500">
                        {user?.role === 'passenger' ? 'Passenger' : 'Driver'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Member since {new Date(user?.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUser className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={profileFormik.values.firstName}
                        onChange={profileFormik.handleChange}
                        onBlur={profileFormik.handleBlur}
                        className={`block w-full pl-10 pr-3 py-2 border ${
                          profileFormik.touched.firstName && profileFormik.errors.firstName
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        } rounded-md shadow-sm focus:outline-none sm:text-sm`}
                      />
                    </div>
                    {profileFormik.touched.firstName && profileFormik.errors.firstName && (
                      <p className="mt-2 text-sm text-red-600">{profileFormik.errors.firstName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUser className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={profileFormik.values.lastName}
                        onChange={profileFormik.handleChange}
                        onBlur={profileFormik.handleBlur}
                        className={`block w-full pl-10 pr-3 py-2 border ${
                          profileFormik.touched.lastName && profileFormik.errors.lastName
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        } rounded-md shadow-sm focus:outline-none sm:text-sm`}
                      />
                    </div>
                    {profileFormik.touched.lastName && profileFormik.errors.lastName && (
                      <p className="mt-2 text-sm text-red-600">{profileFormik.errors.lastName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaEnvelope className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={profileFormik.values.email}
                        onChange={profileFormik.handleChange}
                        onBlur={profileFormik.handleBlur}
                        className={`block w-full pl-10 pr-3 py-2 border ${
                          profileFormik.touched.email && profileFormik.errors.email
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        } rounded-md shadow-sm focus:outline-none sm:text-sm`}
                      />
                    </div>
                    {profileFormik.touched.email && profileFormik.errors.email && (
                      <p className="mt-2 text-sm text-red-600">{profileFormik.errors.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaPhone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={profileFormik.values.phone}
                        onChange={profileFormik.handleChange}
                        onBlur={profileFormik.handleBlur}
                        className={`block w-full pl-10 pr-3 py-2 border ${
                          profileFormik.touched.phone && profileFormik.errors.phone
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        } rounded-md shadow-sm focus:outline-none sm:text-sm`}
                      />
                    </div>
                    {profileFormik.touched.phone && profileFormik.errors.phone && (
                      <p className="mt-2 text-sm text-red-600">{profileFormik.errors.phone}</p>
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
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Change Password</h2>
              
              <form onSubmit={passwordFormik.handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                      Current Password
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="currentPassword"
                        name="currentPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={passwordFormik.values.currentPassword}
                        onChange={passwordFormik.handleChange}
                        onBlur={passwordFormik.handleBlur}
                        className={`block w-full pl-10 pr-10 py-2 border ${
                          passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        } rounded-md shadow-sm focus:outline-none sm:text-sm`}
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
                    {passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword && (
                      <p className="mt-2 text-sm text-red-600">{passwordFormik.errors.currentPassword}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="newPassword"
                        name="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordFormik.values.newPassword}
                        onChange={passwordFormik.handleChange}
                        onBlur={passwordFormik.handleBlur}
                        className={`block w-full pl-10 pr-10 py-2 border ${
                          passwordFormik.touched.newPassword && passwordFormik.errors.newPassword
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        } rounded-md shadow-sm focus:outline-none sm:text-sm`}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="text-gray-400 hover:text-gray-500 focus:outline-none"
                        >
                          {showNewPassword ? (
                            <FaEyeSlash className="h-5 w-5" />
                          ) : (
                            <FaEye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                    {passwordFormik.touched.newPassword && passwordFormik.errors.newPassword && (
                      <p className="mt-2 text-sm text-red-600">{passwordFormik.errors.newPassword}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Confirm New Password
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordFormik.values.confirmPassword}
                        onChange={passwordFormik.handleChange}
                        onBlur={passwordFormik.handleBlur}
                        className={`block w-full pl-10 pr-10 py-2 border ${
                          passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        } rounded-md shadow-sm focus:outline-none sm:text-sm`}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="text-gray-400 hover:text-gray-500 focus:outline-none"
                        >
                          {showConfirmPassword ? (
                            <FaEyeSlash className="h-5 w-5" />
                          ) : (
                            <FaEye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                    {passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword && (
                      <p className="mt-2 text-sm text-red-600">{passwordFormik.errors.confirmPassword}</p>
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
                        Change Password
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

export default ProfilePage;