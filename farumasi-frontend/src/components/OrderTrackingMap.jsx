import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';

// Custom icons
const pharmacyIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png',
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});
const userIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1077/1077012.png',
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});
const deliveryIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2830/2830284.png',
  iconSize: [44, 44],
  iconAnchor: [22, 44],
  popupAnchor: [0, -44],
});

const statusColors = {
  shipped: "#3b82f6",
  out_for_delivery: "#10b981",
  delivered: "#059669",
  canceled: "#ef4444",
  pending_prescription_review: "#facc15",
  pending: "#a3a3a3"
};

function haversineDistance([lat1, lng1], [lat2, lng2]) {
  const toRad = x => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
function estimateTime(distanceKm) {
  if (!distanceKm) return null;
  const speed = 40;
  return Math.round((distanceKm / speed) * 60);
}

const API_BASE = "http://localhost:5000/api";

export default function OrderTrackingMap({
  allOrders,
  height = '500px',
  interactive = true,
  zoomToAdmin = false
}) {
  // Always center and zoom to Kigali, Rwanda for best UX
  const KIGALI_CENTER = [-1.9577, 30.1127];
  const DEFAULT_ZOOM = 13;

  const [orderLocations, setOrderLocations] = useState([]);

  // Fetch locations for each active order
  useEffect(() => {
    async function fetchLocations() {
      if (!Array.isArray(allOrders)) return;
      const activeOrders = allOrders.filter(o => o.status === "out_for_delivery" || o.status === "shipped");
      const locations = await Promise.all(
        activeOrders.map(async o => {
          let pharmacyLoc = null;
          let userLoc = null;
          try {
            // Get pharmacy location
            if (o.pharmacy_id) {
              const res = await axios.get(`${API_BASE}/locations/pharmacy/${o.pharmacy_id}`);
              pharmacyLoc = res.data;
            }
            // Get user location
            if (o.user_id) {
              const res = await axios.get(`${API_BASE}/locations/user/${o.user_id}`);
              userLoc = res.data;
            }
          } catch (err) {
            // Handle error or fallback
          }
          return {
            order: o,
            pharmacyLoc,
            userLoc,
            deliveryLoc: o.delivery_lat && o.delivery_lng ? { latitude: o.delivery_lat, longitude: o.delivery_lng } : null
          };
        })
      );
      setOrderLocations(locations);
    }
    fetchLocations();
  }, [allOrders]);

  // Prepare markers and polylines
  const markers = [];
  const polylines = [];
  const infoBoxes = [];
  orderLocations.forEach(({ order, pharmacyLoc, userLoc, deliveryLoc }) => {
    // Pharmacy marker
    if (pharmacyLoc && pharmacyLoc.latitude && pharmacyLoc.longitude) {
      markers.push({
        position: [pharmacyLoc.latitude, pharmacyLoc.longitude],
        type: "pharmacy",
        label: `Order #${order.id} - Pickup: ${order.pharmacy_name || "Unknown"}`
      });
    }
    // Customer marker
    if (userLoc && userLoc.latitude && userLoc.longitude) {
      markers.push({
        position: [userLoc.latitude, userLoc.longitude],
        type: "user",
        label: `Order #${order.id} - Destination: ${order.user_name || "Unknown"}`
      });
    }
    // Delivery agent marker
    if (deliveryLoc && deliveryLoc.latitude && deliveryLoc.longitude) {
      markers.push({
        position: [deliveryLoc.latitude, deliveryLoc.longitude],
        type: "delivery",
        label: `Order #${order.id} - Delivery Agent`
      });
    }
    // Route polyline
    const points = [];
    if (pharmacyLoc && pharmacyLoc.latitude && pharmacyLoc.longitude) points.push([pharmacyLoc.latitude, pharmacyLoc.longitude]);
    if (deliveryLoc && deliveryLoc.latitude && deliveryLoc.longitude) points.push([deliveryLoc.latitude, deliveryLoc.longitude]);
    if (userLoc && userLoc.latitude && userLoc.longitude) points.push([userLoc.latitude, userLoc.longitude]);
    if (points.length >= 2) {
      polylines.push({
        positions: points,
        color: statusColors[order.status] || "#38bdf8",
        orderId: order.id
      });
      // Info box for distance/time
      const dist = haversineDistance(points[0], points[points.length - 1]);
      infoBoxes.push({
        orderId: order.id,
        distance: dist,
        time: estimateTime(dist),
        from: order.pharmacy_name,
        to: order.user_name
      });
    }
  });

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 bg-white" style={{ width: "100%", height }}>
      <MapContainer
        center={KIGALI_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={true}
        zoomControl={true}
        minZoom={10}
        maxZoom={18}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((m, idx) => (
          <Marker
            key={idx}
            position={m.position}
            icon={
              m.type === "pharmacy"
                ? pharmacyIcon
                : m.type === "user"
                ? userIcon
                : deliveryIcon
            }
          >
            <Popup>
              <div style={{ minWidth: 120 }}>
                <div className="font-bold text-base mb-1">
                  {m.type === "pharmacy" && "🏥 Pickup (Pharmacy)"}
                  {m.type === "user" && "🎯 Destination (Customer)"}
                  {m.type === "delivery" && "🚚 Delivery Agent"}
                </div>
                <div className="text-sm">{m.label}</div>
              </div>
            </Popup>
            <Tooltip direction="top" offset={[0, -20]} opacity={1} permanent>
              {m.type === "pharmacy" && "+"}
              {m.type === "user" && "🎯"}
              {m.type === "delivery" && "🚚"}
            </Tooltip>
          </Marker>
        ))}
        {polylines.map((line, idx) => (
          <Polyline
            key={idx}
            positions={line.positions}
            color={line.color}
            weight={6}
            opacity={0.7}
            dashArray="10,10"
          />
        ))}
      </MapContainer>
      <div className="flex flex-col md:flex-row justify-between items-center px-4 py-2 bg-gray-50 border-t border-gray-200">
        <span className="text-xs text-gray-600">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse"></span>
          Live Delivery Tracking
        </span>
        <span className="text-xs text-gray-400">
          Centered on Kigali, Rwanda
        </span>
      </div>
      <div className="flex gap-4 px-4 py-2 text-xs text-gray-500 bg-white border-t">
        <span><img src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" alt="Pharmacy" style={{width:20}} /> Pickup (Pharmacy)</span>
        <span><img src="https://cdn-icons-png.flaticon.com/512/1077/1077012.png" alt="Customer" style={{width:20}} /> Destination (Customer)</span>
        <span><img src="https://cdn-icons-png.flaticon.com/512/2830/2830284.png" alt="Delivery" style={{width:20}} /> Delivery Agent</span>
      </div>
      <div className="px-4 py-2 bg-gray-50 border-t grid grid-cols-1 md:grid-cols-2 gap-2">
        {infoBoxes.map(box => (
          <div key={box.orderId} className="text-xs text-gray-700 bg-white rounded shadow p-2 flex flex-col">
            <span className="font-semibold text-green-700 mb-1">Order #{box.orderId}</span>
            <span>From <b>{box.from}</b> to <b>{box.to}</b></span>
            <span>Distance: <b>{box.distance.toFixed(2)} km</b></span>
            <span>Est. Time: <b>{box.time} min</b></span>
          </div>
        ))}
      </div>
    </div>
  );
}
