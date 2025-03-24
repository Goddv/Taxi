// frontend/web-app/src/pages/passenger/BookingDetailsPage.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  FaMapMarkerAlt,
  FaLocationArrow,
  FaCar,
  FaUser,
  FaPhoneAlt,
  FaStar,
  FaMoneyBillWave,
  FaClock,
  FaCalendarAlt,
  FaTimes,
  FaCheck
} from 'react-icons/fa';
import { getBooking, updateBookingStatus, rateBooking } from '../../redux/slices/bookingSlice';
import { getTrackingSession } from '../../redux/slices/trackingSlice';
import { processPayment } from '../../redux/slices/paymentSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import RatingStars from '../../components/common/RatingStars';
import BookingStatusBadge from '../../components/booking/BookingStatusBadge';
import socketService from '../../services/socketService';
import ChatContainer from '../../components/chat/ChatContainer';

// Set your Mapbox token
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN || 'pk.eyJ1IjoiYWthZ29kZHYiLCJhIjoiY204a3lycWozMTI1bTJsc2EwdHZkcXUwcCJ9.DqeQFGE_NaN-68_3rIWFlw';

const BookingDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentBooking, isLoading } = useSelector(state => state.booking);
  const { currentSession, driverLocation, isTracking } = useSelector(state => state.tracking);
  const { user } = useSelector(state => state.auth);
  
  const mapContainer = useRef(null);
  const map = useRef(null);
  const pickupMarker = useRef(null);
  const dropoffMarker = useRef(null);
  const driverMarker = useRef(null);
  const routeLine = useRef(null);
  
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [etaMinutes, setEtaMinutes] = useState(null);
  
  // Fetch booking details
  useEffect(() => {
    dispatch(getBooking(id));
  }, [dispatch, id]);
  
  // Initialize map
  useEffect(() => {
    if (currentBooking && !map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: currentBooking.pickupLocation.coordinates.coordinates,
        zoom: 13
      });
      
      map.current.on('load', () => {
        // Add markers
        addPickupMarker(currentBooking.pickupLocation.coordinates.coordinates);
        addDropoffMarker(currentBooking.dropoffLocation.coordinates.coordinates);
        
        // Draw route
        drawRoute(
          currentBooking.pickupLocation.coordinates.coordinates,
          currentBooking.dropoffLocation.coordinates.coordinates
        );
        
        // Fit bounds to include both markers
        const bounds = new mapboxgl.LngLatBounds()
          .extend(currentBooking.pickupLocation.coordinates.coordinates)
          .extend(currentBooking.dropoffLocation.coordinates.coordinates);
        
        map.current.fitBounds(bounds, {
          padding: 80
        });
      });
    }
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [currentBooking]);
  
  // Start tracking if status is 'driver_assigned' or 'in_progress'
  useEffect(() => {
    if (
      currentBooking &&
      (currentBooking.status === 'driver_assigned' || currentBooking.status === 'in_progress') &&
      !isTracking
    ) {
      dispatch(getTrackingSession(id));
      
      // Initialize socket for real-time tracking
      const socket = socketService.getSocket();
      if (socket) {
        // Join booking room
        socket.emit('join_booking', id);
        
        // Listen for driver location updates
        socket.on('driver_location_update', handleDriverLocationUpdate);
        
        // Listen for tracking events
        socket.on('tracking_event', handleTrackingEvent);
        
        // Listen for tracking end
        socket.on('tracking_ended', handleTrackingEnded);
      }
      
      return () => {
        if (socket) {
          socket.off('driver_location_update', handleDriverLocationUpdate);
          socket.off('tracking_event', handleTrackingEvent);
          socket.off('tracking_ended', handleTrackingEnded);
          socket.emit('leave_booking', id);
        }
      };
    }
  }, [currentBooking, dispatch, id, isTracking]);
  
  // Update driver marker when location changes
  useEffect(() => {
    if (driverLocation && map.current) {
      updateDriverMarker(driverLocation.coordinates);
      updateETA();
    }
  }, [driverLocation]);
  
  // Handle driver location update from socket
  const handleDriverLocationUpdate = (data) => {
    if (data.bookingId === id) {
      updateDriverMarker(data.location.coordinates);
      updateETA();
    }
  };
  
  // Handle tracking event from socket
  const handleTrackingEvent = (data) => {
    if (data.bookingId === id) {
      // Update booking status
      dispatch(getBooking(id));
    }
  };
  
  // Handle tracking ended from socket
  const handleTrackingEnded = (data) => {
    if (data.bookingId === id) {
      // Update booking status
      dispatch(getBooking(id));
    }
  };
  
  // Add pickup marker
  const addPickupMarker = (coordinates) => {
    if (pickupMarker.current) {
      pickupMarker.current.remove();
    }
    
    const el = document.createElement('div');
    el.className = 'pickup-marker';
    el.style.backgroundColor = '#3b82f6';
    el.style.width = '20px';
    el.style.height = '20px';
    el.style.borderRadius = '50%';
    el.style.border = '2px solid white';
    
    pickupMarker.current = new mapboxgl.Marker(el)
      .setLngLat(coordinates)
      .addTo(map.current);
  };
  
  // Add dropoff marker
  const addDropoffMarker = (coordinates) => {
    if (dropoffMarker.current) {
      dropoffMarker.current.remove();
    }
    
    const el = document.createElement('div');
    el.className = 'dropoff-marker';
    el.style.backgroundColor = '#ef4444';
    el.style.width = '20px';
    el.style.height = '20px';
    el.style.borderRadius = '50%';
    el.style.border = '2px solid white';
    
    dropoffMarker.current = new mapboxgl.Marker(el)
      .setLngLat(coordinates)
      .addTo(map.current);
  };
  
  // Update driver marker
  const updateDriverMarker = (coordinates) => {
    if (!map.current) return;
    
    if (driverMarker.current) {
      driverMarker.current.setLngLat(coordinates);
    } else {
      const el = document.createElement('div');
      el.className = 'driver-marker';
      el.style.backgroundImage = 'url(/car-icon.png)';
      el.style.backgroundSize = 'cover';
      el.style.width = '30px';
      el.style.height = '30px';
      
      driverMarker.current = new mapboxgl.Marker(el)
        .setLngLat(coordinates)
        .addTo(map.current);
    }
    
    // Update map view to include driver
    if (currentBooking) {
      const bounds = new mapboxgl.LngLatBounds();
      
      // Include driver location
      bounds.extend(coordinates);
      
      // Include pickup location if trip not started
      if (currentBooking.status === 'driver_assigned') {
        bounds.extend(currentBooking.pickupLocation.coordinates.coordinates);
      }
      
      // Include dropoff location if trip started
      if (currentBooking.status === 'in_progress') {
        bounds.extend(currentBooking.dropoffLocation.coordinates.coordinates);
      }
      
      map.current.fitBounds(bounds, {
        padding: 80
      });
    }
  };
  
  // Draw route between pickup and dropoff
  const drawRoute = async (pickupCoords, dropoffCoords) => {
    try {
      // Get route from Mapbox Directions API
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${pickupCoords[0]},${pickupCoords[1]};${dropoffCoords[0]},${dropoffCoords[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`
      );
      
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const routeGeometry = route.geometry;
        
        // Add route to map
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: routeGeometry
          }
        });
        
        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#3b82f6',
            'line-width': 5,
            'line-opacity': 0.75
          }
        });
      }
    } catch (error) {
      console.error('Error drawing route:', error);
    }
  };
  
  // Update ETA
  const updateETA = async () => {
    if (!driverLocation || !currentBooking) return;
    
    try {
      // Determine destination coordinates based on status
      const destCoords = currentBooking.status === 'driver_assigned'
        ? currentBooking.pickupLocation.coordinates.coordinates
        : currentBooking.dropoffLocation.coordinates.coordinates;
      
      // Get route from Mapbox Directions API
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${driverLocation.coordinates[0]},${driverLocation.coordinates[1]};${destCoords[0]},${destCoords[1]}?access_token=${mapboxgl.accessToken}`
      );
      
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const duration = Math.ceil(data.routes[0].duration / 60); // Convert to minutes
        setEtaMinutes(duration);
      }
    } catch (error) {
      console.error('Error updating ETA:', error);
    }
  };
  
  // Handle cancel booking
  const handleCancelBooking = () => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      dispatch(updateBookingStatus({
        bookingId: id,
        status: 'cancelled'
      }));
    }
  };
  
  // Handle submit rating
  const handleSubmitRating = () => {
    dispatch(rateBooking({
      bookingId: id,
      rating,
      feedback
    }))
      .then(() => {
        setShowRatingModal(false);
      });
  };
  
  // Handle payment
  const handlePayment = () => {
    dispatch(processPayment({
      bookingId: id,
      amount: currentBooking.fareEstimate,
      paymentMethod: currentBooking.paymentMethod
    }));
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Get status text
  const getStatusText = () => {
    if (!currentBooking) return '';
    
    switch (currentBooking.status) {
      case 'pending':
        return 'Looking for a driver...';
      case 'driver_assigned':
        return 'Driver is on the way';
      case 'in_progress':
        return 'Ride in progress';
      case 'completed':
        return 'Ride completed';
      case 'cancelled':
        return 'Ride cancelled';
      default:
        return '';
    }
  };
  
  if (isLoading || !currentBooking) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col lg:flex-row">
        <div className="w-full lg:w-2/3 pr-0 lg:pr-4 mb-4 lg:mb-0">
          <div className="bg-white rounded-lg shadow-md p-4 h-96 lg:h-full">
            <div ref={mapContainer} className="h-full w-full" />
          </div>
        </div>
        
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Ride Details</h2>
              <BookingStatusBadge status={currentBooking.status} />
            </div>
            
            <div className="text-lg font-medium text-gray-700 mb-4">
              {getStatusText()}
              {etaMinutes !== null && (currentBooking.status === 'driver_assigned' || currentBooking.status === 'in_progress') && (
                <span className="text-blue-600 ml-2">
                  (ETA: {etaMinutes} min)
                </span>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <FaMapMarkerAlt className="mt-1 mr-3 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Pickup</p>
                  <p className="text-sm text-gray-500">{currentBooking.pickupLocation.address}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <FaLocationArrow className="mt-1 mr-3 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Dropoff</p>
                  <p className="text-sm text-gray-500">{currentBooking.dropoffLocation.address}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <FaCar className="mt-1 mr-3 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Vehicle Type</p>
                  <p className="text-sm text-gray-500 capitalize">{currentBooking.vehicleType}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <FaCalendarAlt className="mt-1 mr-3 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Pickup Time</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(currentBooking.pickupTime)}
                    {currentBooking.isScheduled && ' (Scheduled)'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <FaMoneyBillWave className="mt-1 mr-3 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Fare</p>
                  <p className="text-sm text-gray-500">
                    ${currentBooking.fareEstimate.toFixed(2)}
                    {currentBooking.paymentStatus === 'completed' && (
                      <span className="ml-2 text-green-600">(Paid)</span>
                    )}
                  </p>
                </div>
              </div>
              
              {currentBooking.distance && currentBooking.duration && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-500">Distance</span>
                    <span className="text-sm font-medium">{currentBooking.distance.toFixed(1)} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Duration</span>
                    <span className="text-sm font-medium">{Math.round(currentBooking.duration)} min</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {currentBooking.driverId && (
            <div className="bg-white rounded-lg shadow-md p-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Driver Information</h3>
              
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                  <FaUser className="text-gray-500 text-2xl" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">John Doe</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <FaStar className="text-yellow-400 mr-1" />
                    <span>4.8 (250+ trips)</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <FaCar className="text-gray-500 mr-2" />
                  <span className="text-sm text-gray-600">Toyota Camry (ABC123)</span>
                </div>
                <div className="text-sm text-gray-600">Silver</div>
              </div>
              
              <a
                href="tel:+1234567890"
                className="block w-full py-2 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 transition-colors"
              >
                <div className="flex items-center justify-center">
                  <FaPhoneAlt className="mr-2" />
                  <span>Call Driver</span>
                </div>
              </a>
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions</h3>
            
            <div className="flex flex-col space-y-2">
              {currentBooking.status === 'pending' && (
                <button
                  onClick={handleCancelBooking}
                  className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  <div className="flex items-center justify-center">
                    <FaTimes className="mr-2" />
                    <span>Cancel Booking</span>
                  </div>
                </button>
              )}
              
              {currentBooking.status === 'completed' && currentBooking.paymentStatus === 'pending' && (
                <button
                  onClick={handlePayment}
                  className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <div className="flex items-center justify-center">
                    <FaMoneyBillWave className="mr-2" />
                    <span>Pay Now (${currentBooking.fareEstimate.toFixed(2)})</span>
                  </div>
                </button>
              )}
              
              {currentBooking.status === 'completed' && !currentBooking.rating && (
                <button
                  onClick={() => setShowRatingModal(true)}
                  className="py-2 px-4 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
                >
                  <div className="flex items-center justify-center">
                    <FaStar className="mr-2" />
                    <span>Rate Trip</span>
                  </div>
                </button>
              )}
              
              <Link
                to="/bookings"
                className="py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors text-center"
              >
                Back to My Rides
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Add Chat Container */}
      {currentBooking && currentBooking.driverId && (
        <div className="fixed bottom-5 right-5">
          <ChatContainer 
            bookingId={currentBooking._id}
            recipientId={currentBooking.driverId}
            recipientName={currentBooking.driverName || 'Driver'}
            bookingStatus={currentBooking.status}
          />
        </div>
      )}
      
      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Rate Your Trip</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How was your trip?
              </label>
              <RatingStars rating={rating} setRating={setRating} />
            </div>
            
            <div className="mb-4">
              <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                Feedback (Optional)
              </label>
              <textarea
                id="feedback"
                rows={3}
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder="Share your experience..."
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowRatingModal(false)}
                className="py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRating}
                className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Submit Rating
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetailsPage;