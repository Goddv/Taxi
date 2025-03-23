// frontend/web-app/src/pages/dashboard/DashboardPage.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { FaCar, FaHistory, FaWallet, FaMapMarkerAlt, FaStar, FaCalendarAlt } from 'react-icons/fa';
import { getUserBookings } from '../../redux/slices/bookingSlice';
import { getUserWallet } from '../../redux/slices/paymentSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import BookingSummaryCard from '../../components/booking/BookingSummaryCard';

// Set your Mapbox token
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN || 'pk.eyJ1IjoiYWthZ29kZHYiLCJhIjoiY204a3lycWozMTI1bTJsc2EwdHZkcXUwcCJ9.DqeQFGE_NaN-68_3rIWFlw';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { bookings, isLoading: bookingsLoading } = useSelector(state => state.booking);
  const { wallet, isLoading: walletLoading } = useSelector(state => state.payment);
  
  const mapContainer = useRef(null);
  const map = useRef(null);
  const userMarker = useRef(null);
  
  const [currentLocation, setCurrentLocation] = useState(null);
  
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
        // Try to get user's location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            position => {
              const { longitude, latitude } = position.coords;
              
              setCurrentLocation({ longitude, latitude });
              
              map.current.flyTo({
                center: [longitude, latitude],
                zoom: 14
              });
              
              // Add user marker
              addUserMarker([longitude, latitude]);
            },
            error => {
              console.error('Error getting user location:', error);
            }
          );
        }
      });
    }
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);
  
  // Fetch user bookings and wallet
  useEffect(() => {
    dispatch(getUserBookings({ limit: 5 }));
    dispatch(getUserWallet());
  }, [dispatch]);
  
  // Add user marker
  const addUserMarker = (coordinates) => {
    if (userMarker.current) {
      userMarker.current.remove();
    }
    
    const el = document.createElement('div');
    el.className = 'user-marker';
    el.style.backgroundColor = '#3b82f6';
    el.style.width = '20px';
    el.style.height = '20px';
    el.style.borderRadius = '50%';
    el.style.border = '2px solid white';
    
    userMarker.current = new mapboxgl.Marker(el)
      .setLngLat(coordinates)
      .addTo(map.current);
  };
  
  const hasRecentRide = bookings && bookings.length > 0;
  const mostRecentRide = hasRecentRide ? bookings[0] : null;
  
  const isLoading = bookingsLoading || walletLoading;
  
  if (isLoading && !bookings && !wallet) {
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
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Welcome, {user?.firstName}!
            </h2>
            <p className="text-gray-600">
              Ready for your next ride?
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Link
              to="/book"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaCar className="mr-2" />
              Book a Ride
            </Link>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
        <div className="w-full lg:w-2/3">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Location</h3>
            <div className="h-64 w-full">
              <div ref={mapContainer} className="h-full w-full" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Recent Rides</h3>
              <Link
                to="/bookings"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View all
              </Link>
            </div>
            
            {bookingsLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : !hasRecentRide ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No recent rides</h3>
                <p className="text-gray-500 mb-4">You haven't taken any rides yet.</p>
                <Link
                  to="/book"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <FaCar className="mr-2" />
                  Book Your First Ride
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map(booking => (
                  <BookingSummaryCard key={booking._id} booking={booking} />
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="w-full lg:w-1/3 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            
            <div className="space-y-3">
              <Link
                to="/book"
                className="flex items-center justify-between p-3 bg-blue-100 rounded-lg text-blue-700 hover:bg-blue-200"
              >
                <div className="flex items-center">
                  <FaCar className="mr-3 text-xl" />
                  <span>Book a Ride</span>
                </div>
                <span>→</span>
              </Link>
              
              <Link
                to="/bookings"
                className="flex items-center justify-between p-3 bg-purple-100 rounded-lg text-purple-700 hover:bg-purple-200"
              >
                <div className="flex items-center">
                  <FaHistory className="mr-3 text-xl" />
                  <span>My Ride History</span>
                </div>
                <span>→</span>
              </Link>
              
              <Link
                to="/wallet"
                className="flex items-center justify-between p-3 bg-green-100 rounded-lg text-green-700 hover:bg-green-200"
              >
                <div className="flex items-center">
                  <FaWallet className="mr-3 text-xl" />
                  <span>Manage Wallet</span>
                </div>
                <span>→</span>
              </Link>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Wallet Balance</h3>
            
            {walletLoading ? (
              <div className="flex justify-center py-4">
                <LoadingSpinner size="md" />
              </div>
            ) : (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Available Balance</span>
                  <span className="text-2xl font-semibold text-blue-700">${(wallet?.balance || 0).toFixed(2)}</span>
                </div>
                
                <Link
                  to="/wallet"
                  className="block w-full text-center px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-600 hover:text-white mt-2"
                >
                  Add Funds
                </Link>
              </div>
            )}
          </div>
          
          {mostRecentRide && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Latest Ride</h3>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <FaMapMarkerAlt className="mt-1 mr-3 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">From</p>
                    <p className="text-sm text-gray-800">{mostRecentRide.pickupLocation.address}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FaMapMarkerAlt className="mt-1 mr-3 text-red-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">To</p>
                    <p className="text-sm text-gray-800">{mostRecentRide.dropoffLocation.address}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <FaCalendarAlt className="mr-3 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500">Date & Time</p>
                    <p className="text-sm text-gray-800">{new Date(mostRecentRide.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <FaStar className="mr-3 text-yellow-500" />
                  <div>
                    <p className="text-xs text-gray-500">Rating</p>
                    <p className="text-sm text-gray-800">
                      {mostRecentRide.rating ? `${mostRecentRide.rating}/5` : 'Not rated yet'}
                    </p>
                  </div>
                </div>
                
                <Link
                  to={`/bookings/${mostRecentRide._id}`}
                  className="block w-full text-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 mt-2"
                >
                  View Details
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;