// frontend/web-app/src/pages/passenger/BookingPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaLocationArrow, FaMapMarkerAlt, FaCar, FaCalendarAlt, FaWallet, FaCreditCard, FaMoneyBillWave } from 'react-icons/fa';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { createBooking, setFareEstimate } from '../../redux/slices/bookingSlice';
import { findNearbyDrivers } from '../../redux/slices/trackingSlice';
import { getUserPaymentMethods } from '../../redux/slices/paymentSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import VehicleTypeSelector from '../../components/booking/VehicleTypeSelector';
import PaymentMethodSelector from '../../components/booking/PaymentMethodSelector';
import BookingSummary from '../../components/booking/BookingSummary';

// Set your Mapbox token
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN || 'pk.eyJ1IjoiYWthZ29kZHYiLCJhIjoiY204a3lycWozMTI1bTJsc2EwdHZkcXUwcCJ9.DqeQFGE_NaN-68_3rIWFlw';

const BookingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, fareEstimate } = useSelector(state => state.booking);
  const { paymentMethods } = useSelector(state => state.payment);
  const { nearbyDrivers } = useSelector(state => state.tracking);
  
  const mapContainer = useRef(null);
  const map = useRef(null);
  const pickupMarker = useRef(null);
  const dropoffMarker = useRef(null);
  const routeLine = useRef(null);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    pickupLocation: {
      address: '',
      coordinates: {
        type: 'Point',
        coordinates: [0, 0]
      }
    },
    dropoffLocation: {
      address: '',
      coordinates: {
        type: 'Point',
        coordinates: [0, 0]
      }
    },
    pickupTime: new Date(),
    vehicleType: 'economy',
    paymentMethod: 'cash',
    isScheduled: false,
    specialRequirements: ''
  });
  
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isSettingPickup, setIsSettingPickup] = useState(true);
  
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
        
        // Try to get user's location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            position => {
              const { longitude, latitude } = position.coords;
              map.current.flyTo({
                center: [longitude, latitude],
                zoom: 14
              });
              
              // Set initial pickup location
              setBookingData(prev => ({
                ...prev,
                pickupLocation: {
                  ...prev.pickupLocation,
                  coordinates: {
                    type: 'Point',
                    coordinates: [longitude, latitude]
                  }
                }
              }));
              
              // Get address from coordinates
              reverseGeocode(longitude, latitude, 'pickup');
              
              // Add pickup marker
              addPickupMarker([longitude, latitude]);
            },
            error => {
              console.error('Error getting user location:', error);
            }
          );
        }
        
        // Add click handler to set locations
        map.current.on('click', e => {
          const { lng, lat } = e.lngLat;
          
          if (isSettingPickup) {
            // Update pickup location
            setBookingData(prev => ({
              ...prev,
              pickupLocation: {
                ...prev.pickupLocation,
                coordinates: {
                  type: 'Point',
                  coordinates: [lng, lat]
                }
              }
            }));
            
            // Get address from coordinates
            reverseGeocode(lng, lat, 'pickup');
            
            // Add or update pickup marker
            addPickupMarker([lng, lat]);
          } else {
            // Update dropoff location
            setBookingData(prev => ({
              ...prev,
              dropoffLocation: {
                ...prev.dropoffLocation,
                coordinates: {
                  type: 'Point',
                  coordinates: [lng, lat]
                }
              }
            }));
            
            // Get address from coordinates
            reverseGeocode(lng, lat, 'dropoff');
            
            // Add or update dropoff marker
            addDropoffMarker([lng, lat]);
          }
          
          // If both markers are set, draw route
          if (
            bookingData.pickupLocation.coordinates.coordinates[0] !== 0 &&
            bookingData.dropoffLocation.coordinates.coordinates[0] !== 0
          ) {
            drawRoute();
          }
        });
      });
    }
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [isSettingPickup]);
  
  // Load payment methods
  useEffect(() => {
    dispatch(getUserPaymentMethods());
  }, [dispatch]);
  
  // Add pickup marker
  const addPickupMarker = coordinates => {
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
  const addDropoffMarker = coordinates => {
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
  
  // Draw route between pickup and dropoff
  const drawRoute = async () => {
    const pickupCoords = bookingData.pickupLocation.coordinates.coordinates;
    const dropoffCoords = bookingData.dropoffLocation.coordinates.coordinates;
    
    try {
      // Get route from Mapbox Directions API
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${pickupCoords[0]},${pickupCoords[1]};${dropoffCoords[0]},${dropoffCoords[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`
      );
      
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const routeGeometry = route.geometry;
        
        // Remove previous route
        if (map.current.getSource('route')) {
          map.current.removeLayer('route');
          map.current.removeSource('route');
        }
        
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
        
        // Fit bounds to include both markers
        const bounds = new mapboxgl.LngLatBounds()
          .extend(pickupCoords)
          .extend(dropoffCoords);
        
        map.current.fitBounds(bounds, {
          padding: 100
        });
        
        // Calculate fare estimate
        const distance = route.distance / 1000; // km
        const duration = route.duration / 60; // minutes
        
        // Save route info for fare calculation
        setBookingData(prev => ({
          ...prev,
          distance,
          duration
        }));
        
        // Calculate fare estimate
        calculateFareEstimate(distance, duration, bookingData.vehicleType);
      }
    } catch (error) {
      console.error('Error drawing route:', error);
    }
  };
  
  // Reverse geocode to get address from coordinates
  const reverseGeocode = async (lng, lat, locationType) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
      );
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const address = data.features[0].place_name;
        
        setBookingData(prev => ({
          ...prev,
          [locationType === 'pickup' ? 'pickupLocation' : 'dropoffLocation']: {
            ...prev[locationType === 'pickup' ? 'pickupLocation' : 'dropoffLocation'],
            address
          }
        }));
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };
  
  // Calculate fare estimate
  const calculateFareEstimate = (distance, duration, vehicleType) => {
    // Base fare and rate per km based on vehicle type
    let basePrice = 5; // Base price in dollars
    let perKmRate = 1.5; // Rate per km in dollars
    
    // Apply multiplier based on vehicle type
    let multiplier = 1;
    
    switch (vehicleType) {
      case 'comfort':
        multiplier = 1.2;
        break;
      case 'premium':
        multiplier = 1.5;
        break;
      case 'van':
        multiplier = 1.7;
        break;
      default:
        multiplier = 1;
    }
    
    // Calculate fare
    const fare = (basePrice + (distance * perKmRate)) * multiplier;
    
    // Dispatch action to set fare estimate
    dispatch(setFareEstimate({
      fare: fare.toFixed(2),
      distance: distance.toFixed(1),
      duration: Math.round(duration),
      vehicleType
    }));
    
    // Find nearby drivers
    const { coordinates } = bookingData.pickupLocation.coordinates;
    dispatch(findNearbyDrivers({
      latitude: coordinates[1],
      longitude: coordinates[0],
      radius: 5000, // 5km
      vehicleType
    }));
  };
  
  // Handle input changes
  const handleInputChange = e => {
    const { name, value } = e.target;
    
    if (name === 'vehicleType') {
      setBookingData(prev => ({
        ...prev,
        vehicleType: value
      }));
      
      // Recalculate fare estimate
      if (bookingData.distance && bookingData.duration) {
        calculateFareEstimate(bookingData.distance, bookingData.duration, value);
      }
    } else if (name === 'paymentMethod') {
      setBookingData(prev => ({
        ...prev,
        paymentMethod: value
      }));
    } else if (name === 'isScheduled') {
      setBookingData(prev => ({
        ...prev,
        isScheduled: !prev.isScheduled
      }));
    } else if (name === 'pickupTime') {
      setBookingData(prev => ({
        ...prev,
        pickupTime: new Date(value)
      }));
    } else if (name === 'specialRequirements') {
      setBookingData(prev => ({
        ...prev,
        specialRequirements: value
      }));
    }
  };
  
  // Handle location toggle
  const handleLocationToggle = () => {
    setIsSettingPickup(!isSettingPickup);
  };
  
  // Handle step change
  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleBookNow();
    }
  };
  
  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Handle booking
  const handleBookNow = () => {
    dispatch(createBooking(bookingData))
      .unwrap()
      .then(response => {
        navigate(`/bookings/${response.booking._id}`);
      })
      .catch(error => {
        console.error('Booking failed:', error);
      });
  };
  
  // Check if user can proceed to next step
  const canProceedToNextStep = () => {
    if (currentStep === 1) {
      // Check if pickup and dropoff locations are set
      return (
        bookingData.pickupLocation.address &&
        bookingData.dropoffLocation.address
      );
    }
    
    return true;
  };
  
  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col lg:flex-row">
        <div className="w-full lg:w-2/3 pr-0 lg:pr-4 mb-4 lg:mb-0">
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Book a Ride</h2>
            
            {/* Step indicator */}
            <div className="flex justify-between mb-8">
              <div className={`flex flex-col items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`rounded-full h-10 w-10 flex items-center justify-center ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  1
                </div>
                <span className="mt-2 text-sm">Set Location</span>
              </div>
              
              <div className="flex-1 flex items-center">
                <div className={`flex-1 h-1 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              </div>
              
              <div className={`flex flex-col items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`rounded-full h-10 w-10 flex items-center justify-center ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  2
                </div>
                <span className="mt-2 text-sm">Vehicle Type</span>
              </div>
              
              <div className="flex-1 flex items-center">
                <div className={`flex-1 h-1 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              </div>
              
              <div className={`flex flex-col items-center ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`rounded-full h-10 w-10 flex items-center justify-center ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  3
                </div>
                <span className="mt-2 text-sm">Payment</span>
              </div>
            </div>
            
            {/* Step 1: Set location */}
            {currentStep === 1 && (
              <div>
                <div className="mb-4">
                  <div className="flex items-center">
                    <FaMapMarkerAlt className={`mr-2 ${isSettingPickup ? 'text-blue-600' : 'text-gray-500'}`} />
                    <label htmlFor="pickupLocation" className="block text-sm font-medium text-gray-700">
                      Pickup Location
                    </label>
                    <button
                      type="button"
                      onClick={handleLocationToggle}
                      className={`ml-2 px-2 py-1 text-xs rounded-md ${
                        isSettingPickup ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      Setting
                    </button>
                  </div>
                  <input
                    id="pickupLocation"
                    type="text"
                    value={bookingData.pickupLocation.address}
                    onChange={e => {
                      setBookingData(prev => ({
                        ...prev,
                        pickupLocation: {
                          ...prev.pickupLocation,
                          address: e.target.value
                        }
                      }));
                    }}
                    placeholder="Click on the map to set pickup location"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center">
                    <FaLocationArrow className={`mr-2 ${!isSettingPickup ? 'text-blue-600' : 'text-gray-500'}`} />
                    <label htmlFor="dropoffLocation" className="block text-sm font-medium text-gray-700">
                      Dropoff Location
                    </label>
                    <button
                      type="button"
                      onClick={handleLocationToggle}
                      className={`ml-2 px-2 py-1 text-xs rounded-md ${
                        !isSettingPickup ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      Setting
                    </button>
                  </div>
                  <input
                    id="dropoffLocation"
                    type="text"
                    value={bookingData.dropoffLocation.address}
                    onChange={e => {
                      setBookingData(prev => ({
                        ...prev,
                        dropoffLocation: {
                          ...prev.dropoffLocation,
                          address: e.target.value
                        }
                      }));
                    }}
                    placeholder="Click on the map to set dropoff location"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isScheduled"
                      name="isScheduled"
                      checked={bookingData.isScheduled}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isScheduled" className="ml-2 block text-sm text-gray-900">
                      Schedule for later
                    </label>
                  </div>
                </div>
                
                {bookingData.isScheduled && (
                  <div className="mb-4">
                    <div className="flex items-center">
                      <FaCalendarAlt className="mr-2 text-gray-500" />
                      <label htmlFor="pickupTime" className="block text-sm font-medium text-gray-700">
                        Pickup Time
                      </label>
                    </div>
                    <input
                      id="pickupTime"
                      name="pickupTime"
                      type="datetime-local"
                      value={bookingData.pickupTime.toISOString().slice(0, 16)}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                )}
              </div>
            )}
            
            {/* Step 2: Vehicle type */}
            {currentStep === 2 && (
              <div>
                <VehicleTypeSelector
                  selectedType={bookingData.vehicleType}
                  onChange={handleInputChange}
                  nearbyDrivers={nearbyDrivers}
                />
                
                {nearbyDrivers.length === 0 && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-yellow-700 text-sm">
                      No drivers of this type are currently available near the pickup location.
                      You can still book and we'll find a driver for you.
                    </p>
                  </div>
                )}
                
                <div className="mt-4">
                  <label htmlFor="specialRequirements" className="block text-sm font-medium text-gray-700">
                    Special Requirements (Optional)
                  </label>
                  <textarea
                    id="specialRequirements"
                    name="specialRequirements"
                    rows={3}
                    value={bookingData.specialRequirements}
                    onChange={handleInputChange}
                    placeholder="Any special instructions for the driver"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            )}
            
            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <div>
                <PaymentMethodSelector
                  selectedMethod={bookingData.paymentMethod}
                  paymentMethods={paymentMethods}
                  onChange={handleInputChange}
                />
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Booking Summary</h3>
                  <BookingSummary
                    pickupLocation={bookingData.pickupLocation.address}
                    dropoffLocation={bookingData.dropoffLocation.address}
                    vehicleType={bookingData.vehicleType}
                    fareEstimate={fareEstimate}
                    isScheduled={bookingData.isScheduled}
                    pickupTime={bookingData.pickupTime}
                  />
                </div>
              </div>
            )}
            
            {/* Navigation buttons */}
            <div className="flex justify-between mt-8">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePreviousStep}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back
                </button>
              ) : (
                <div></div>
              )}
              
              <button
                type="button"
                onClick={handleNextStep}
                disabled={!canProceedToNextStep() || isLoading}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                  canProceedToNextStep()
                    ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    : 'bg-blue-300 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" color="white" />
                ) : currentStep === 3 ? (
                  'Book Now'
                ) : (
                  'Next'
                )}
              </button>
            </div>
          </div>
        </div>
        
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-4 h-96 lg:h-full">
            <div ref={mapContainer} className="h-full w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;