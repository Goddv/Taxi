// frontend/web-app/src/components/tracking/RealTimeTracking.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { FaMapMarkerAlt, FaCarSide, FaLocationArrow, FaPhoneAlt, FaRoute } from 'react-icons/fa';
import { getTrackingSession } from '../../redux/slices/trackingSlice';
import socketService from '../../services/socketService';
import LoadingSpinner from '../common/LoadingSpinner';

// Set your Mapbox token
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN || 'pk.eyJ1IjoiYWthZ29kZHYiLCJhIjoiY204a3lycWozMTI1bTJsc2EwdHZkcXUwcCJ9.DqeQFGE_NaN-68_3rIWFlw';

const RealTimeTracking = ({ bookingId, driverInfo }) => {
  const dispatch = useDispatch();
  const { currentSession, driverLocation, isTracking, lastEvent } = useSelector(state => state.tracking);
  const { user } = useSelector(state => state.auth);
  
  const mapContainer = useRef(null);
  const map = useRef(null);
  const pickupMarker = useRef(null);
  const dropoffMarker = useRef(null);
  const driverMarker = useRef(null);
  const routeLine = useRef(null);
  
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [etaMinutes, setEtaMinutes] = useState(null);
  const [showDirectionsPanel, setShowDirectionsPanel] = useState(false);
  const [tripStage, setTripStage] = useState('preparing'); // preparing, pickup, dropoff, completed

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

      // Add map controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true
      }), 'top-right');
    }
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Fetch tracking session
  useEffect(() => {
    if (bookingId) {
      dispatch(getTrackingSession(bookingId));
    }
  }, [dispatch, bookingId]);

  // Initialize socket connection for real-time updates
  useEffect(() => {
    if (bookingId && isMapLoaded) {
      const socket = socketService.getSocket();
      
      if (socket) {
        // Join booking room
        socket.emit('join_booking', bookingId);
        
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
          socket.emit('leave_booking', bookingId);
        }
      };
    }
  }, [bookingId, isMapLoaded]);

  // Set up map with tracking session data
  useEffect(() => {
    if (currentSession && isMapLoaded) {
      setupMap();
    }
  }, [currentSession, isMapLoaded]);

  // Update driver marker when location changes
  useEffect(() => {
    if (driverLocation && map.current) {
      updateDriverMarker(driverLocation);
      updateETA();
    }
  }, [driverLocation]);

  // Update trip stage based on lastEvent
  useEffect(() => {
    if (lastEvent) {
      switch (lastEvent.type) {
        case 'pickup_started':
          setTripStage('preparing');
          break;
        case 'pickup_arrived':
          setTripStage('pickup');
          break;
        case 'trip_started':
          setTripStage('dropoff');
          break;
        case 'trip_completed':
          setTripStage('completed');
          break;
        default:
          break;
      }
    }
  }, [lastEvent]);

  // Setup map with route and markers
  const setupMap = () => {
    if (!currentSession || !map.current) return;

    const pickupCoordinates = currentSession.events.find(e => e.type === 'pickup_started')?.location?.coordinates || 
                             currentSession.route[0]?.location?.coordinates;
    
    const dropoffCoordinates = currentSession.events.find(e => e.type === 'trip_completed')?.location?.coordinates;

    if (pickupCoordinates) {
      addPickupMarker(pickupCoordinates);
    }

    if (dropoffCoordinates) {
      addDropoffMarker(dropoffCoordinates);
    }

    if (pickupCoordinates && dropoffCoordinates) {
      drawRoute(pickupCoordinates, dropoffCoordinates);
    }

    // Set driver marker if available
    if (currentSession.route && currentSession.route.length > 0) {
      const mostRecentLocation = currentSession.route[currentSession.route.length - 1].location.coordinates;
      updateDriverMarker(mostRecentLocation);
    }

    // Fit bounds to include all markers
    fitMapBounds();
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
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML('<h3>Pickup Location</h3>'))
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
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML('<h3>Dropoff Location</h3>'))
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
      el.innerHTML = '<div style="background-color: #4CAF50; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><i class="fa fa-car"></i></div>';
      
      driverMarker.current = new mapboxgl.Marker(el)
        .setLngLat(coordinates)
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML('<h3>Driver Location</h3>'))
        .addTo(map.current);
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

        // Save route details for directions panel
        routeLine.current = {
          distance: route.distance,
          duration: route.duration,
          steps: route.legs[0].steps
        };
      }
    } catch (error) {
      console.error('Error drawing route:', error);
    }
  };

  // Update ETA
  const updateETA = async () => {
    if (!driverLocation || !currentSession) return;
    
    try {
      // Determine destination coordinates based on trip stage
      let destCoords;
      
      if (tripStage === 'preparing' || tripStage === 'pickup') {
        // Driver is heading to pickup
        destCoords = currentSession.events.find(e => e.type === 'pickup_started')?.location?.coordinates;
      } else if (tripStage === 'dropoff') {
        // Driver is heading to dropoff
        destCoords = currentSession.events.find(e => e.type === 'trip_completed')?.location?.coordinates;
      } else {
        return; // No need to calculate ETA if trip is completed
      }
      
      if (!destCoords) return;
      
      // Get route from Mapbox Directions API
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${driverLocation[0]},${driverLocation[1]};${destCoords[0]},${destCoords[1]}?access_token=${mapboxgl.accessToken}`
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

  // Fit map bounds to include all markers
  const fitMapBounds = () => {
    if (!map.current) return;
    
    const bounds = new mapboxgl.LngLatBounds();
    let hasPoints = false;
    
    if (pickupMarker.current) {
      bounds.extend(pickupMarker.current.getLngLat());
      hasPoints = true;
    }
    
    if (dropoffMarker.current) {
      bounds.extend(dropoffMarker.current.getLngLat());
      hasPoints = true;
    }
    
    if (driverMarker.current) {
      bounds.extend(driverMarker.current.getLngLat());
      hasPoints = true;
    }
    
    if (hasPoints) {
      map.current.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        maxZoom: 15
      });
    }
  };

  // Handle driver location update from socket
  const handleDriverLocationUpdate = (data) => {
    if (data.bookingId === bookingId) {
      updateDriverMarker(data.location.coordinates);
      updateETA();
    }
  };

  // Handle tracking event from socket
  const handleTrackingEvent = (data) => {
    if (data.bookingId === bookingId) {
      // Update tracking session
      dispatch(getTrackingSession(bookingId));
      
      // Update trip stage
      switch (data.type) {
        case 'pickup_arrived':
          setTripStage('pickup');
          break;
        case 'trip_started':
          setTripStage('dropoff');
          break;
        default:
          break;
      }
    }
  };

  // Handle tracking ended from socket
  const handleTrackingEnded = (data) => {
    if (data.bookingId === bookingId) {
      setTripStage('completed');
      dispatch(getTrackingSession(bookingId));
    }
  };

  // Get ETA display text
  const getETAText = () => {
    if (etaMinutes === null) return 'Calculating...';
    
    if (etaMinutes < 1) {
      return 'Less than a minute';
    } else if (etaMinutes === 1) {
      return '1 minute';
    } else {
      return `${etaMinutes} minutes`;
    }
  };

  // Get status text based on trip stage
  const getStatusText = () => {
    switch (tripStage) {
      case 'preparing':
        return 'Driver is on the way';
      case 'pickup':
        return 'Driver has arrived at pickup location';
      case 'dropoff':
        return 'En route to destination';
      case 'completed':
        return 'Trip completed';
      default:
        return 'Connecting to driver...';
    }
  };

  // Get status color
  const getStatusColor = () => {
    switch (tripStage) {
      case 'preparing':
        return 'text-blue-600';
      case 'pickup':
        return 'text-yellow-600';
      case 'dropoff':
        return 'text-green-600';
      case 'completed':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  // Format distance
  const formatDistance = (meters) => {
    if (!meters) return '';
    const km = meters / 1000;
    return km >= 1 ? `${km.toFixed(1)} km` : `${meters.toFixed(0)} m`;
  };

  // Format duration
  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} hr ${remainingMinutes} min`;
  };

  if (!currentSession) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative">
        <div className="h-64 sm:h-72 md:h-96" ref={mapContainer}></div>

        {/* Status overlay */}
        <div className="absolute top-4 left-4 right-4 bg-white bg-opacity-90 rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-lg font-medium ${getStatusColor()}`}>{getStatusText()}</h3>
              {tripStage !== 'completed' && etaMinutes !== null && (
                <p className="text-sm text-gray-600">
                  ETA: <span className="font-medium">{getETAText()}</span>
                </p>
              )}
            </div>
            <button
              onClick={() => setShowDirectionsPanel(!showDirectionsPanel)}
              className="p-2 bg-white rounded-full shadow-md text-blue-600 hover:bg-blue-50"
              title="Toggle directions"
            >
              <FaRoute />
            </button>
          </div>
        </div>
      </div>

      {/* Driver info section */}
      {driverInfo && tripStage !== 'completed' && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                {driverInfo.profileImage ? (
                  <img
                    src={driverInfo.profileImage}
                    alt="Driver"
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <FaCarSide className="text-gray-500 text-xl" />
                )}
              </div>
              <div>
                <h4 className="font-medium text-gray-800">{driverInfo.name || 'Your Driver'}</h4>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-2">{driverInfo.vehicle?.make} {driverInfo.vehicle?.model}</span>
                  <span>{driverInfo.vehicle?.licensePlate}</span>
                </div>
              </div>
            </div>
            <a
              href={`tel:${driverInfo.phone}`}
              className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700"
              title="Call driver"
            >
              <FaPhoneAlt />
            </a>
          </div>
        </div>
      )}

      {/* Directions panel */}
      {showDirectionsPanel && routeLine.current && (
        <div className="max-h-64 overflow-y-auto border-t border-gray-200">
          <div className="p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium text-gray-800">Trip Directions</h4>
              <div className="text-sm text-gray-500">
                {formatDistance(routeLine.current.distance)} • {formatDuration(routeLine.current.duration)}
              </div>
            </div>
            <ul className="space-y-3">
              {routeLine.current.steps.map((step, index) => (
                <li key={index} className="flex">
                  <div className="mr-3 mt-1">
                    {index === 0 ? (
                      <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <FaMapMarkerAlt className="text-blue-600 text-sm" />
                      </div>
                    ) : index === routeLine.current.steps.length - 1 ? (
                      <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center">
                        <FaLocationArrow className="text-red-600 text-sm" />
                      </div>
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-500">{index}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm" dangerouslySetInnerHTML={{ __html: step.maneuver.instruction }} />
                    <div className="text-xs text-gray-500">
                      {formatDistance(step.distance)} • {formatDuration(step.duration)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeTracking;