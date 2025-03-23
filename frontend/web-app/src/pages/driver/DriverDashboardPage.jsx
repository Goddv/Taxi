// frontend/web-app/src/pages/driver/DriverDashboardPage.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { FaCar, FaMoneyBillWave, FaUserAlt, FaStar, FaMapMarkerAlt, FaToggleOn, FaToggleOff, FaTaxi } from 'react-icons/fa';
import {
  updateDriverAvailability,
  getDriverStatistics,
  getNearbyBookings,
  acceptBooking
} from '../../redux/slices/driverSlice';
import { updateDriverLocation } from '../../redux/slices/trackingSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import NearbyBookingCard from '../../components/driver/NearbyBookingCard';
import DriverStatCard from '../../components/driver/DriverStatCard';

// Set your Mapbox token
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN || 'pk.eyJ1IjoiYWthZ29kZHYiLCJhIjoiY204a3lycWozMTI1bTJsc2EwdHZkcXUwcCJ9.DqeQFGE_NaN-68_3rIWFlw';

const DriverDashboardPage = () => {
  const dispatch = useDispatch();
  const { isAvailable, statistics, nearbyBookings, isLoading } = useSelector(state => state.driver);
  const { user } = useSelector(state => state.auth);
  
  const mapContainer = useRef(null);
  const map = useRef(null);
  const userMarker = useRef(null);
  const watchId = useRef(null);
  
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  
  // Initialize map
  useEffect(() => {
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-73.985664, 40.748514], // Default to NYC
        zoom: 12
      });
      
      map.current.on('load', () => {
        setIsMapLoaded(true);
      });
    }
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      
      if (watchId.current) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []);
  
  // Get driver statistics
  useEffect(() => {
    dispatch(getDriverStatistics());
  }, [dispatch]);
  
  // Get nearby bookings if driver is available
  useEffect(() => {
    if (isAvailable && currentLocation) {
      dispatch(getNearbyBookings());
    }
  }, [dispatch, isAvailable, currentLocation]);
  
  // Start tracking location if driver is available
  useEffect(() => {
    if (isAvailable) {
      startLocationTracking();
    } else {
      stopLocationTracking();
    }
    
    return () => {
      stopLocationTracking();
    };
  }, [isAvailable]);
  
  // Add user marker
  const addUserMarker = (coordinates) => {
    if (userMarker.current) {
      userMarker.current.setLngLat(coordinates);
    } else if (map.current) {
      const el = document.createElement('div');
      el.className = 'driver-marker';
      el.style.backgroundColor = '#3b82f6';
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';
      
      userMarker.current = new mapboxgl.Marker(el)
        .setLngLat(coordinates)
        .addTo(map.current);
    }
  };
  
  // Start location tracking
  const startLocationTracking = () => {
    if (navigator.geolocation) {
      // Get initial position
      navigator.geolocation.getCurrentPosition(
        position => {
          const { longitude, latitude } = position.coords;
          
          if (map.current) {
            map.current.flyTo({
              center: [longitude, latitude],
              zoom: 14
            });
          }
          
          setCurrentLocation({ longitude, latitude });
          addUserMarker([longitude, latitude]);
          
          // Update driver location
          dispatch(updateDriverLocation({
            location: {
              type: 'Point',
              coordinates: [longitude, latitude]
            },
            speed: position.coords.speed || 0,
            heading: position.coords.heading || 0,
            accuracy: position.coords.accuracy || 0,
            isAvailable: true
          }));
        },
        error => {
          console.error('Error getting initial position:', error);
        }
      );
      
      // Watch position
      watchId.current = navigator.geolocation.watchPosition(
        position => {
          const { longitude, latitude } = position.coords;
          
          setCurrentLocation({ longitude, latitude });
          addUserMarker([longitude, latitude]);
          
          // Update driver location every 10 seconds or when moving more than 100 meters
          dispatch(updateDriverLocation({
            location: {
              type: 'Point',
              coordinates: [longitude, latitude]
            },
            speed: position.coords.speed || 0,
            heading: position.coords.heading || 0,
            accuracy: position.coords.accuracy || 0,
            isAvailable: true
          }));
        },
        error => {
          console.error('Error watching position:', error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 30000, // 30 seconds
          timeout: 27000 // 27 seconds
        }
      );
    }
  };
  
  // Stop location tracking
  const stopLocationTracking = () => {
    if (watchId.current) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    
    // Update driver location with isAvailable: false
    if (currentLocation) {
      dispatch(updateDriverLocation({
        location: {
          type: 'Point',
          coordinates: [currentLocation.longitude, currentLocation.latitude]
        },
        isAvailable: false
      }));
    }
  };
  
  // Handle toggle availability
  const handleToggleAvailability = () => {
    dispatch(updateDriverAvailability(!isAvailable));
  };
  
  // Handle accept booking
  const handleAcceptBooking = (bookingId) => {
    dispatch(acceptBooking(bookingId));
  };
  
  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <FaUserAlt className="text-blue-600 text-2xl" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">
                Welcome, {user.firstName}!
              </h2>
              <p className="text-gray-600">
                {isAvailable ? (
                  <span className="text-green-600 font-medium">You're online and available for trips</span>
                ) : (
                  <span className="text-gray-500">You're currently offline</span>
                )}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleToggleAvailability}
            className={`flex items-center px-4 py-2 rounded-md ${
              isAvailable
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
          >
            {isAvailable ? (
              <>
                <FaToggleOn className="mr-2 text-xl" />
                Go Offline
              </>
            ) : (
              <>
                <FaToggleOff className="mr-2 text-xl" />
                Go Online
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
        <div className="w-full lg:w-2/3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Location</h3>
            <div className="h-80 lg:h-96 w-full">
              <div ref={mapContainer} className="h-full w-full" />
            </div>
          </div>
          
          {isAvailable && nearbyBookings.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Nearby Ride Requests ({nearbyBookings.length})
              </h3>
              <div className="space-y-4">
                {nearbyBookings.map(booking => (
                  <NearbyBookingCard
                    key={booking._id}
                    booking={booking}
                    onAccept={() => handleAcceptBooking(booking._id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="w-full lg:w-1/3 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Driver Statistics</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <DriverStatCard
                icon={<FaTaxi className="text-blue-600" />}
                title="Total Rides"
                value={statistics.totalRides}
              />
              <DriverStatCard
                icon={<FaMoneyBillWave className="text-green-600" />}
                title="Today's Earnings"
                value={`$${statistics.earnings?.today?.toFixed(2) || '0.00'}`}
              />
              <DriverStatCard
                icon={<FaMapMarkerAlt className="text-red-600" />}
                title="Acceptance Rate"
                value={`${Math.round(statistics.acceptanceRate || 0)}%`}
              />
              <DriverStatCard
                icon={<FaStar className="text-yellow-500" />}
                title="Rating"
                value={`${(statistics.averageRating || 0).toFixed(1)}/5`}
              />
            </div>
            
            <div className="mt-4">
              <Link
                to="/driver/earnings"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View detailed earnings →
              </Link>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Ride</h3>
            
            {user.currentRide ? (
              <div>
                {/* Current ride details would go here */}
                <p>Current ride details...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="bg-gray-100 rounded-full p-4 mb-4">
                  <FaCar className="text-2xl text-gray-500" />
                </div>
                <p className="text-gray-500 mb-4">You don't have any active rides</p>
                {!isAvailable && (
                  <button
                    onClick={handleToggleAvailability}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Go Online
                  </button>
                )}
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            
            <div className="space-y-2">
              <Link
                to="/driver/bookings"
                className="block w-full text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                View Ride History
              </Link>
              <Link
                to="/driver/profile"
                className="block w-full text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Edit Vehicle Profile
              </Link>
              <Link
                to="/driver/earnings"
                className="block w-full text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                View Earnings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboardPage;