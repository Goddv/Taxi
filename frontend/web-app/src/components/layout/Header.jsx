// frontend/web-app/src/components/layout/Header.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaBars, FaBell, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { logout } from '../../redux/slices/authSlice';
import logo from '../../assets/images/logo.png';

const Header = ({ toggleSidebar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const { unreadCount } = useSelector(state => state.notification);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  return (
    <header className="bg-white shadow-md z-10">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="text-gray-600 focus:outline-none focus:text-blue-500 mr-6"
            >
              <FaBars className="h-6 w-6" />
            </button>
            
            <Link to="/dashboard" className="flex items-center">
              <img src={logo} alt="Taxi App Logo" className="h-8 w-auto" />
              <span className="ml-2 text-xl font-semibold text-gray-800">TaxiGo</span>
            </Link>
          </div>
          
          <div className="flex items-center">
            <Link to="/notifications" className="relative p-2 mr-4 text-gray-600 hover:text-blue-500">
              <FaBell className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            
            <div className="relative">
              <button
                onClick={toggleProfileMenu}
                className="flex items-center focus:outline-none"
              >
                <span className="hidden md:block mr-2">
                  {user?.firstName} {user?.lastName}
                </span>
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt="Profile"
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <FaUserCircle className="h-8 w-8 text-gray-600" />
                )}
              </button>
              
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    Profile
                  </Link>
                  
                  {user?.role === 'passenger' && (
                    <>
                      <Link
                        to="/wallet"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        Wallet
                      </Link>
                      <Link
                        to="/payment-methods"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        Payment Methods
                      </Link>
                    </>
                  )}
                  
                  {user?.role === 'driver' && (
                    <Link
                      to="/driver/earnings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      Earnings
                    </Link>
                  )}
                  
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      <FaSignOutAlt className="mr-2" />
                      Logout
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;