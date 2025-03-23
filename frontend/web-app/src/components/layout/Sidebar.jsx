// frontend/web-app/src/components/layout/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaTaxi,
  FaHistory,
  FaWallet,
  FaCreditCard,
  FaBell,
  FaUser,
  FaUsers,
  FaClipboardList,
  FaChartBar,
  FaCog,
  FaMoneyBillWave,
  FaCarAlt,
  FaRoute,
  FaTimes
} from 'react-icons/fa';

const Sidebar = ({ isOpen, toggleSidebar, userRole }) => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Define menu items based on user role
  const getMenuItems = () => {
    const commonItems = [
      {
        path: '/profile',
        icon: <FaUser className="mr-3" />,
        text: 'Profile'
      },
      {
        path: '/notifications',
        icon: <FaBell className="mr-3" />,
        text: 'Notifications'
      }
    ];

    // Passenger menu items
    if (userRole === 'passenger') {
      return [
        {
          path: '/dashboard',
          icon: <FaTachometerAlt className="mr-3" />,
          text: 'Dashboard'
        },
        {
          path: '/book',
          icon: <FaTaxi className="mr-3" />,
          text: 'Book a Ride'
        },
        {
          path: '/bookings',
          icon: <FaHistory className="mr-3" />,
          text: 'My Rides'
        },
        {
          path: '/wallet',
          icon: <FaWallet className="mr-3" />,
          text: 'Wallet'
        },
        {
          path: '/payment-methods',
          icon: <FaCreditCard className="mr-3" />,
          text: 'Payment Methods'
        },
        ...commonItems
      ];
    }

    // Driver menu items
    if (userRole === 'driver') {
      return [
        {
          path: '/driver/dashboard',
          icon: <FaTachometerAlt className="mr-3" />,
          text: 'Dashboard'
        },
        {
          path: '/driver/bookings',
          icon: <FaRoute className="mr-3" />,
          text: 'My Rides'
        },
        {
          path: '/driver/earnings',
          icon: <FaMoneyBillWave className="mr-3" />,
          text: 'Earnings'
        },
        {
          path: '/driver/profile',
          icon: <FaCarAlt className="mr-3" />,
          text: 'Vehicle Profile'
        },
        ...commonItems
      ];
    }

    // Admin menu items
    if (userRole === 'admin') {
      return [
        {
          path: '/admin/dashboard',
          icon: <FaTachometerAlt className="mr-3" />,
          text: 'Dashboard'
        },
        {
          path: '/admin/users',
          icon: <FaUsers className="mr-3" />,
          text: 'Users'
        },
        {
          path: '/admin/drivers',
          icon: <FaCarAlt className="mr-3" />,
          text: 'Drivers'
        },
        {
          path: '/admin/bookings',
          icon: <FaClipboardList className="mr-3" />,
          text: 'Bookings'
        },
        {
          path: '/admin/reports',
          icon: <FaChartBar className="mr-3" />,
          text: 'Reports'
        },
        {
          path: '/admin/settings',
          icon: <FaCog className="mr-3" />,
          text: 'Settings'
        }
      ];
    }

    // Default items
    return commonItems;
  };

  const menuItems = getMenuItems();

  return (
    <div
      className={`fixed inset-y-0 left-0 z-30 w-64 bg-blue-800 overflow-y-auto transition duration-300 transform ${
        isOpen ? 'translate-x-0 ease-out' : '-translate-x-full ease-in'
      } md:translate-x-0 md:static md:inset-auto`}
    >
      <div className="flex items-center justify-between px-4 py-6 md:hidden">
        <div className="text-xl font-semibold text-white">TaxiGo</div>
        <button
          onClick={toggleSidebar}
          className="text-white focus:outline-none focus:text-gray-400"
        >
          <FaTimes className="h-6 w-6" />
        </button>
      </div>
      
      <nav className="mt-5 px-4">
        <div className="flex flex-col">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center px-4 py-3 mt-1 text-gray-100 rounded-lg ${
                isActive(item.path)
                  ? 'bg-blue-700'
                  : 'hover:bg-blue-700 hover:text-white'
              }`}
              onClick={() => {
                if (window.innerWidth < 768) {
                  toggleSidebar();
                }
              }}
            >
              {item.icon}
              <span>{item.text}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;