import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import API_BASE_URL from '../config/config';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom icons for different types of locations
const pharmacyIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3019/3019014.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const userIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/854/854878.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const deliveryIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2830/2830284.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const OrderTrackingMap = ({ 
  order, 
  height = '400px', 
  showRoute = true, 
  interactive = true,
  allOrders = null // For admin view to show all orders
}) => {
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [realTimePositions, setRealTimePositions] = useState({});

  // Default center (Accra, Ghana)
  const defaultCenter = [5.6037, -0.1870];

  useEffect(() => {
    if (allOrders) {
      // Admin view - show all active orders
      processAllOrders(allOrders);
    } else if (order) {
      // User view - show specific order
      processOrderData(order);
    }
  }, [order, allOrders]);

  // Real-time position updates (every 30 seconds)
  useEffect(() => {
    let interval;
    if (mapData && (order || allOrders)) {
      interval = setInterval(() => {
        updateRealTimePositions();
      }, 30000); // Update every 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [mapData, order, allOrders]);

  const processOrderData = async (orderData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch real GPS data for the order
      const locationData = await fetchOrderLocationData(orderData.id);
      setMapData(locationData);
    } catch (err) {
      console.error('Error processing order data:', err);
      setError('Failed to load tracking data');
      // Fallback to basic data if real GPS fails
      setMapData(generateFallbackData(orderData));
    } finally {
      setLoading(false);
    }
  };

  const processAllOrders = async (orders) => {
    try {
      setLoading(true);
      setError(null);
      
      const activeOrders = orders.filter(order => 
        ['approved', 'shipped', 'out_for_delivery'].includes(order.status)
      );
      
      // Fetch location data for all active orders
      const allOrdersLocationData = await Promise.all(
        activeOrders.map(order => fetchOrderLocationData(order.id))
      );
      
      setMapData({ allOrders: allOrdersLocationData });
    } catch (err) {
      console.error('Error processing all orders:', err);
      setError('Failed to load tracking data');
      // Fallback to basic data
      const fallbackData = orders
        .filter(order => ['approved', 'shipped', 'out_for_delivery'].includes(order.status))
        .map(order => generateFallbackData(order));
      setMapData({ allOrders: fallbackData });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderLocationData = async (orderId) => {
    try {
      // Fetch order details with location data
      const orderResponse = await axios.get(`${API_BASE_URL}/api/orders/${orderId}`);
      const orderData = orderResponse.data;

      // Fetch pharmacy location
      const pharmacyLocation = await fetchPharmacyLocation(orderData.pharmacy_id);
      
      // Fetch user location  
      const userLocation = await fetchUserLocation(orderData.user_id);
      
      // Fetch delivery agent location (if order is shipped/out for delivery)
      let deliveryLocation = null;
      if (['shipped', 'out_for_delivery'].includes(orderData.status)) {
        deliveryLocation = await fetchDeliveryAgentLocation(orderId);
      }

      // Generate route if locations are available
      let route = null;
      if (showRoute && pharmacyLocation && userLocation) {
        route = await generateRoute(pharmacyLocation, userLocation, deliveryLocation);
      }

      return {
        orderId: orderData.id,
        status: orderData.status,
        pharmacy: {
          ...pharmacyLocation,
          name: orderData.pharmacy_name || "Partner Pharmacy"
        },
        user: {
          ...userLocation,
          name: "Delivery Address"
        },
        delivery: deliveryLocation,
        estimatedTime: calculateEstimatedTime(orderData.status, pharmacyLocation, userLocation, deliveryLocation),
        route: route,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching order location data:', error);
      throw error;
    }
  };

  const fetchPharmacyLocation = async (pharmacyId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/locations/pharmacy/${pharmacyId}`);
      return {
        lat: response.data.latitude,
        lng: response.data.longitude,
        name: response.data.name || "Pharmacy Location"
      };
    } catch (error) {
      console.error('Error fetching pharmacy location:', error);
      // Return default location for Ghana
      return { lat: 5.6037, lng: -0.1870, name: "Pharmacy Location" };
    }
  };

  const fetchUserLocation = async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/locations/user/${userId}`);
      return {
        lat: response.data.latitude,
        lng: response.data.longitude,
        name: response.data.address || "Delivery Address"
      };
    } catch (error) {
      console.error('Error fetching user location:', error);
      // Return default location for Ghana
      return { lat: 5.5560, lng: -0.2057, name: "Delivery Address" };
    }
  };

  const fetchDeliveryAgentLocation = async (orderId) => {
    try {
      // This would connect to a real-time tracking service or delivery agent app
      const response = await axios.get(`${API_BASE_URL}/api/delivery/location/${orderId}`);
      return {
        lat: response.data.latitude,
        lng: response.data.longitude,
        name: "Delivery Agent",
        agentName: response.data.agent_name,
        phone: response.data.phone,
        lastUpdated: response.data.updated_at
      };
    } catch (error) {
      console.error('Error fetching delivery agent location:', error);
      // If real-time tracking is not available, return null
      return null;
    }
  };

  const generateRoute = async (pharmacyLocation, userLocation, deliveryLocation) => {
    try {
      // Use a routing service like OpenRouteService, Mapbox, or Google Directions
      // For now, we'll create a simple route array
      const routePoints = [
        [pharmacyLocation.lat, pharmacyLocation.lng]
      ];

      if (deliveryLocation) {
        routePoints.push([deliveryLocation.lat, deliveryLocation.lng]);
      }

      routePoints.push([userLocation.lat, userLocation.lng]);

      // Optional: Use a real routing API for accurate road routes
      // const routingResponse = await axios.get(`https://api.openrouteservice.org/v2/directions/driving-car`, {
      //   params: {
      //     api_key: 'YOUR_API_KEY',
      //     start: `${pharmacyLocation.lng},${pharmacyLocation.lat}`,
      //     end: `${userLocation.lng},${userLocation.lat}`
      //   }
      // });

      return routePoints;
    } catch (error) {
      console.error('Error generating route:', error);
      // Return simple straight line route
      return [
        [pharmacyLocation.lat, pharmacyLocation.lng],
        [userLocation.lat, userLocation.lng]
      ];
    }
  };

  const updateRealTimePositions = async () => {
    try {
      if (order) {
        // Update single order
        const updatedData = await fetchOrderLocationData(order.id);
        setMapData(updatedData);
      } else if (allOrders) {
        // Update all active orders
        const activeOrders = allOrders.filter(order => 
          ['approved', 'shipped', 'out_for_delivery'].includes(order.status)
        );
        
        const updatedOrdersData = await Promise.all(
          activeOrders.map(order => fetchOrderLocationData(order.id))
        );
        
        setMapData({ allOrders: updatedOrdersData });
      }
    } catch (error) {
      console.error('Error updating real-time positions:', error);
    }
  };

  const generateFallbackData = (orderData) => {
    // Fallback mock coordinates for Ghana when real GPS data is unavailable
    const mockLocations = [
      { lat: 5.6037, lng: -0.1870, name: "Accra Central" },
      { lat: 5.5560, lng: -0.2057, name: "Tema" },
      { lat: 5.6500, lng: -0.1000, name: "East Legon" },
      { lat: 5.5600, lng: -0.2400, name: "Kaneshie" },
      { lat: 5.6200, lng: -0.1600, name: "Osu" },
      { lat: 5.5800, lng: -0.2200, name: "Dansoman" },
    ];

    const pharmacyLocation = mockLocations[Math.floor(Math.random() * mockLocations.length)];
    const userLocation = mockLocations[Math.floor(Math.random() * mockLocations.length)];
    
    let deliveryLocation = null;
    if (orderData.status === 'shipped' || orderData.status === 'out_for_delivery') {
      deliveryLocation = {
        lat: (pharmacyLocation.lat + userLocation.lat) / 2 + (Math.random() - 0.5) * 0.01,
        lng: (pharmacyLocation.lng + userLocation.lng) / 2 + (Math.random() - 0.5) * 0.01,
        name: "Delivery in Progress"
      };
    }

    return {
      orderId: orderData.id,
      status: orderData.status,
      pharmacy: {
        ...pharmacyLocation,
        name: orderData.pharmacy_name || "Partner Pharmacy"
      },
      user: {
        ...userLocation,
        name: "Delivery Address"
      },
      delivery: deliveryLocation,
      estimatedTime: generateEstimatedTime(orderData.status),
      route: showRoute ? [
        [pharmacyLocation.lat, pharmacyLocation.lng],
        ...(deliveryLocation ? [[deliveryLocation.lat, deliveryLocation.lng]] : []),
        [userLocation.lat, userLocation.lng]
      ] : null,
      isFallback: true
    };
  };

  const calculateEstimatedTime = (status, pharmacyLocation, userLocation, deliveryLocation) => {
    if (!pharmacyLocation || !userLocation) {
      return generateEstimatedTime(status);
    }

    // Calculate distance between locations using Haversine formula
    const distance = calculateDistance(
      pharmacyLocation.lat, pharmacyLocation.lng,
      userLocation.lat, userLocation.lng
    );

    // Calculate estimated delivery time based on distance and current status
    let baseTime;
    switch (status) {
      case 'approved':
        baseTime = Math.max(15, Math.min(45, distance * 2)); // 2 minutes per km preparation
        return `${baseTime}-${baseTime + 15} minutes (Preparing order)`;
      case 'shipped':
        if (deliveryLocation) {
          const remainingDistance = calculateDistance(
            deliveryLocation.lat, deliveryLocation.lng,
            userLocation.lat, userLocation.lng
          );
          baseTime = Math.max(5, Math.min(30, remainingDistance * 3)); // 3 minutes per km
          return `${baseTime}-${baseTime + 10} minutes (In transit)`;
        }
        baseTime = Math.max(10, Math.min(40, distance * 2.5)); // 2.5 minutes per km
        return `${baseTime}-${baseTime + 15} minutes (In transit)`;
      case 'out_for_delivery':
        if (deliveryLocation) {
          const remainingDistance = calculateDistance(
            deliveryLocation.lat, deliveryLocation.lng,
            userLocation.lat, userLocation.lng
          );
          baseTime = Math.max(2, Math.min(15, remainingDistance * 4)); // 4 minutes per km
          return `${baseTime}-${baseTime + 5} minutes (Almost there!)`;
        }
        return '5-15 minutes (Almost there!)';
      default:
        return 'Processing...';
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    // Haversine formula for calculating distance between two GPS coordinates
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  };

  const generateEstimatedTime = (status) => {
    // Fallback estimated times when real GPS calculation is not available
    switch (status) {
      case 'approved':
        return '15-30 minutes (Preparing order)';
      case 'shipped':
        return '10-20 minutes (In transit)';
      case 'out_for_delivery':
        return '5-15 minutes (Almost there!)';
      default:
        return 'Processing...';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return '#fbbf24'; // yellow
      case 'shipped':
        return '#3b82f6'; // blue
      case 'out_for_delivery':
        return '#10b981'; // green
      case 'delivered':
        return '#059669'; // dark green
      default:
        return '#6b7280'; // gray
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <div className="ml-3">
          <p className="text-gray-600">Loading real-time tracking data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center bg-yellow-50 rounded-lg border border-yellow-200" style={{ height }}>
        <div className="text-center">
          <div className="text-yellow-600 mb-2">⚠️</div>
          <p className="text-yellow-800 text-sm">{error}</p>
          <p className="text-yellow-600 text-xs mt-1">Showing approximate locations</p>
        </div>
      </div>
    );
  }

  if (!mapData) {
    return (
      <div className="flex items-center justify-center bg-gray-100 rounded-lg" style={{ height }}>
        <p className="text-gray-500">No tracking data available</p>
      </div>
    );
  }

  // Calculate map center and bounds
  let center = defaultCenter;
  let bounds = null;

  if (mapData.allOrders) {
    // Admin view - show all orders
    const allPoints = mapData.allOrders.flatMap(order => [
      [order.pharmacy.lat, order.pharmacy.lng],
      [order.user.lat, order.user.lng],
      ...(order.delivery ? [[order.delivery.lat, order.delivery.lng]] : [])
    ]);
    
    if (allPoints.length > 0) {
      bounds = allPoints;
    }
  } else {
    // User view - center on specific order
    const points = [
      [mapData.pharmacy.lat, mapData.pharmacy.lng],
      [mapData.user.lat, mapData.user.lng],
      ...(mapData.delivery ? [[mapData.delivery.lat, mapData.delivery.lng]] : [])
    ];
    bounds = points;
  }

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200">
      {/* Real-time status indicator */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${error ? 'bg-yellow-500' : 'bg-green-500'} animate-pulse`}></div>
          <span className="text-xs text-gray-600">
            {error ? 'Limited tracking' : 'Live tracking'}
          </span>
          {mapData?.lastUpdated && (
            <span className="text-xs text-gray-400">
              • Updated {new Date(mapData.lastUpdated).toLocaleTimeString()}
            </span>
          )}
        </div>
        {(mapData?.isFallback || error) && (
          <span className="text-xs text-orange-600">📍 Approximate locations</span>
        )}
      </div>
      
      <MapContainer
        center={center}
        zoom={12}
        style={{ height, width: '100%' }}
        scrollWheelZoom={interactive}
        bounds={bounds}
        boundsOptions={{ padding: [20, 20] }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {mapData.allOrders ? (
          // Admin view - show all orders
          mapData.allOrders.map((orderData, index) => (
            <React.Fragment key={index}>
              {/* Pharmacy marker */}
              <Marker position={[orderData.pharmacy.lat, orderData.pharmacy.lng]} icon={pharmacyIcon}>
                <Popup>
                  <div className="text-sm">
                    <h3 className="font-semibold text-blue-600">📍 {orderData.pharmacy.name}</h3>
                    <p>Order #{orderData.orderId}</p>
                    <p className="text-gray-600">Pickup Location</p>
                  </div>
                </Popup>
              </Marker>

              {/* User delivery address marker */}
              <Marker position={[orderData.user.lat, orderData.user.lng]} icon={userIcon}>
                <Popup>
                  <div className="text-sm">
                    <h3 className="font-semibold text-green-600">🏠 {orderData.user.name}</h3>
                    <p>Order #{orderData.orderId}</p>
                    <p className="text-gray-600">Delivery Address</p>
                  </div>
                </Popup>
              </Marker>

              {/* Delivery person marker */}
              {orderData.delivery && (
                <Marker position={[orderData.delivery.lat, orderData.delivery.lng]} icon={deliveryIcon}>
                  <Popup>
                    <div className="text-sm">
                      <h3 className="font-semibold text-purple-600">🚴 Delivery Agent</h3>
                      {orderData.delivery.agentName && (
                        <p className="font-medium">{orderData.delivery.agentName}</p>
                      )}
                      <p>Order #{orderData.orderId}</p>
                      <p className="text-gray-600">{orderData.estimatedTime}</p>
                      {orderData.delivery.lastUpdated && (
                        <p className="text-xs text-gray-500">
                          Updated: {new Date(orderData.delivery.lastUpdated).toLocaleTimeString()}
                        </p>
                      )}
                      {orderData.delivery.phone && (
                        <p className="text-xs text-blue-600">📞 {orderData.delivery.phone}</p>
                      )}
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1`}
                            style={{ backgroundColor: getStatusColor(orderData.status), color: 'white' }}>
                        {orderData.status.replace('_', ' ').toUpperCase()}
                      </span>
                      {orderData.isFallback && (
                        <p className="text-xs text-orange-500 mt-1">📍 Approximate location</p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Route line */}
              {orderData.route && (
                <Polyline
                  positions={orderData.route}
                  color={getStatusColor(orderData.status)}
                  weight={3}
                  opacity={0.7}
                />
              )}
            </React.Fragment>
          ))
        ) : (
          // User view - show single order
          <>
            {/* Pharmacy marker */}
            <Marker position={[mapData.pharmacy.lat, mapData.pharmacy.lng]} icon={pharmacyIcon}>
              <Popup>
                <div className="text-sm">
                  <h3 className="font-semibold text-blue-600">📍 {mapData.pharmacy.name}</h3>
                  <p>Your order is being prepared here</p>
                  <p className="text-gray-600">Pickup Location</p>
                </div>
              </Popup>
            </Marker>

            {/* User delivery address marker */}
            <Marker position={[mapData.user.lat, mapData.user.lng]} icon={userIcon}>
              <Popup>
                <div className="text-sm">
                  <h3 className="font-semibold text-green-600">🏠 {mapData.user.name}</h3>
                  <p>Your delivery destination</p>
                  <p className="text-gray-600">Delivery Address</p>
                </div>
              </Popup>
            </Marker>

            {/* Delivery person marker */}
            {mapData.delivery && (
              <Marker position={[mapData.delivery.lat, mapData.delivery.lng]} icon={deliveryIcon}>
                <Popup>
                  <div className="text-sm">
                    <h3 className="font-semibold text-purple-600">🚴 Your Delivery Agent</h3>
                    {mapData.delivery.agentName && (
                      <p className="font-medium">{mapData.delivery.agentName}</p>
                    )}
                    <p>ETA: {mapData.estimatedTime}</p>
                    {mapData.delivery.lastUpdated && (
                      <p className="text-xs text-gray-500">
                        Last updated: {new Date(mapData.delivery.lastUpdated).toLocaleTimeString()}
                      </p>
                    )}
                    {mapData.delivery.phone && (
                      <p className="text-xs text-blue-600 mt-1">📞 {mapData.delivery.phone}</p>
                    )}
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2`}
                          style={{ backgroundColor: getStatusColor(mapData.status), color: 'white' }}>
                      {mapData.status.replace('_', ' ').toUpperCase()}
                    </span>
                    {mapData.isFallback && (
                      <p className="text-xs text-orange-500 mt-1">📍 Approximate location</p>
                    )}
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Route line */}
            {mapData.route && (
              <Polyline
                positions={mapData.route}
                color={getStatusColor(mapData.status)}
                weight={4}
                opacity={0.8}
              />
            )}
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default OrderTrackingMap;
