import React, { useEffect, useState } from "react";
import { FaHome, FaCapsules, FaBoxOpen, FaTruck, FaUsers, FaCog, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Bar, Pie, Line } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend } from "chart.js";
import axios from "axios";
import { Link } from "react-router-dom";
import OrderTrackingMap from "../components/OrderTrackingMap";
import API_BASE_URL from '../config/config';

// Register the missing PointElement and LineElement for Line charts
Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend);

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalPharmacies: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    prescriptionOrders: 0,
    activeDeliveries: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [ordersStats, setOrdersStats] = useState([]);
  const [productsStats, setProductsStats] = useState([]);
  const [pharmacyLineStats, setPharmacyLineStats] = useState([]);
  const [activeMenu, setActiveMenu] = useState("Dashboard");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchChartData();
    fetchPharmacyPerformance();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch orders
      const ordersResponse = await axios.get(`${API_BASE_URL}/api/orders`);
      const orders = ordersResponse.data;
      
      // Fetch pharmacies
      const pharmaciesResponse = await axios.get(`${API_BASE_URL}/api/pharmacies`);
      const pharmacies = pharmaciesResponse.data.data || [];
      
      // Fetch products
      const productsResponse = await axios.get(`${API_BASE_URL}/api/products`);
      const products = productsResponse.data.data || [];

      // Calculate stats
      const pendingOrders = orders.filter(order => order.status === 'pending').length;
      const prescriptionOrders = orders.filter(order => order.status === 'pending_prescription_review').length;
      const activeDeliveries = orders.filter(order => 
        ['approved', 'shipped', 'out_for_delivery'].includes(order.status)
      ).length;

      setStats({
        totalOrders: orders.length,
        pendingOrders,
        totalPharmacies: pharmacies.length,
        totalProducts: products.length,
        prescriptionOrders,
        activeDeliveries
      });

      // Set all orders for map
      setAllOrders(orders);

      // Set recent orders (last 5)
      setRecentOrders(orders.slice(0, 5));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    // Orders per month
    const ordersRes = await axios.get(`${API_BASE_URL}/api/orders`);
    const orders = ordersRes.data || [];
    const ordersByMonth = {};
    orders.forEach(order => {
      const date = order.created_at ? new Date(order.created_at) : null;
      if (!date) return;
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      ordersByMonth[month] = (ordersByMonth[month] || 0) + 1;
    });
    const ordersStatsArr = Object.entries(ordersByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }));
    setOrdersStats(ordersStatsArr);

    // Products per pharmacy
    const productsRes = await axios.get(`${API_BASE_URL}/api/products`);
    const products = productsRes.data.data || [];
    const productsByPharmacy = {};
    products.forEach(product => {
      const name = product.pharmacy_name || "Unknown";
      productsByPharmacy[name] = (productsByPharmacy[name] || 0) + 1;
    });
    const productsStatsArr = Object.entries(productsByPharmacy)
      .map(([pharmacy_name, count]) => ({ pharmacy_name, count }));
    setProductsStats(productsStatsArr);
  };

  // Limit bar chart to last 6 months for readability
  const limitedOrdersStats = ordersStats.slice(-6);

  // Chart data
  const ordersBarData = {
    labels: limitedOrdersStats.map(stat => stat.month),
    datasets: [
      {
        label: "Orders",
        data: limitedOrdersStats.map(stat => stat.count),
        backgroundColor: "#38bdf8",
        borderRadius: 8,
        barThickness: 32,
        maxBarThickness: 40,
      },
    ],
  };

  const productsBarData = {
    labels: productsStats.map(stat => stat.pharmacy_name),
    datasets: [
      {
        label: "Products",
        data: productsStats.map(stat => stat.count),
        backgroundColor: "#fbbf24",
        borderRadius: 8,
        barThickness: 18,
        maxBarThickness: 24,
      },
    ],
  };

  // Pharmacy performance line chart (orders per month per pharmacy)
  const fetchPharmacyPerformance = async () => {
    const ordersRes = await axios.get(`${API_BASE_URL}/api/orders`);
    const orders = ordersRes.data || [];
    // Group by pharmacy and month
    const perf = {};
    orders.forEach(order => {
      const date = order.created_at ? new Date(order.created_at) : null;
      if (!date || !order.pharmacy_name) return;
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!perf[order.pharmacy_name]) perf[order.pharmacy_name] = {};
      perf[order.pharmacy_name][month] = (perf[order.pharmacy_name][month] || 0) + 1;
    });
    // Get all months in sorted order
    const allMonths = Array.from(
      new Set(
        Object.values(perf)
          .flatMap(obj => Object.keys(obj))
      )
    ).sort();
    // Build datasets
    const datasets = Object.entries(perf).map(([pharmacy, months], idx) => ({
      label: pharmacy,
      data: allMonths.map(m => months[m] || 0),
      borderColor: ["#38bdf8", "#4ade80", "#fbbf24", "#a78bfa", "#f87171", "#22d3ee"][idx % 6],
      backgroundColor: "rgba(56,189,248,0.1)",
      tension: 0.3,
      fill: false,
      pointRadius: 3,
      pointHoverRadius: 6,
    }));
    setPharmacyLineStats({ labels: allMonths.slice(-6), datasets: datasets.map(ds => ({ ...ds, data: ds.data.slice(-6) })) });
  };

  const pharmacyLineOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.parsed.y}`,
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Month", color: "#0e7490", font: { weight: "bold" } },
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: "Orders", color: "#0e7490", font: { weight: "bold" } },
        grid: { color: "#bae6fd" }
      }
    }
  };

  // Chart options for better visuals
  const ordersBarOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => `Orders: ${context.parsed.y}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        title: { display: true, text: "Month", color: "#0e7490", font: { weight: "bold" } }
      },
      y: {
        beginAtZero: true,
        grid: { color: "#bae6fd" },
        title: { display: true, text: "Orders", color: "#0e7490", font: { weight: "bold" } }
      }
    }
  };

  const productsBarOptions = {
    indexAxis: "y",
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `Products: ${context.parsed.x}`,
        },
      },
      title: {
        display: false,
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: "#fde68a" },
        title: { display: true, text: "Products", color: "#ca8a04", font: { weight: "bold" } }
      },
      y: {
        grid: { display: false },
        title: { display: true, text: "Pharmacy", color: "#ca8a04", font: { weight: "bold" } }
      }
    }
  };

  const StatCard = ({ title, value, icon, color, link }) => (
    <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${color}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`w-8 h-8 ${color.replace('border-', 'text-')}`}>
            {icon}
          </div>
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="text-lg font-medium text-gray-900">{value}</dd>
          </dl>
        </div>
        {link && (
          <div className="ml-5 flex-shrink-0">
            <Link to={link} className="text-sm text-sky-600 hover:text-sky-500">
              View all →
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'shipped':
        return 'text-blue-600 bg-blue-100';
      case 'approved':
        return 'text-purple-600 bg-purple-100';
      case 'canceled':
        return 'text-red-600 bg-red-100';
      case 'pending_prescription_review':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white relative">
      {/* Sidebar */}
      {sidebarExpanded && (
        <aside className="fixed top-0 left-0 h-screen w-64 bg-green-700 text-white flex flex-col py-8 px-4 z-20 transition-all duration-300">
          <div className="mb-8 text-2xl font-bold">Farumasi Admin</div>
          <nav className="flex flex-col gap-2">
            <SidebarLink icon={<FaHome />} label="Dashboard" active={activeMenu === "Dashboard"} expanded={sidebarExpanded} />
            <SidebarLink icon={<FaCapsules />} label="Pharmacies" active={activeMenu === "Pharmacies"} expanded={sidebarExpanded} />
            <SidebarLink icon={<FaBoxOpen />} label="Products" active={activeMenu === "Products"} expanded={sidebarExpanded} />
            <SidebarLink
              icon={<FaTruck />}
              label="Orders"
              active={activeMenu === "Orders"}
              expanded={sidebarExpanded}
            />
            <SidebarLink icon={<FaUsers />} label="Customers" active={activeMenu === "Customers"} expanded={sidebarExpanded} />
            <SidebarLink icon={<FaCog />} label="Settings" active={activeMenu === "Settings"} expanded={sidebarExpanded} />
          </nav>
          {/* Collapse Button */}
          <button
            className="absolute -right-4 top-1/2 transform -translate-y-1/2 bg-white text-green-700 rounded-full shadow p-2 hover:bg-green-100 transition"
            onClick={() => setSidebarExpanded(false)}
            aria-label="Minimize sidebar"
          >
            <FaChevronLeft />
          </button>
        </aside>
      )}
      {!sidebarExpanded && (
        <button
          className="fixed left-2 top-1/2 transform -translate-y-1/2 bg-white text-green-700 rounded-full shadow p-2 z-30 hover:bg-green-100 transition"
          onClick={() => setSidebarExpanded(true)}
          aria-label="Expand sidebar"
        >
          <FaChevronRight />
        </button>
      )}

      {/* Main Content */}
      <main className={`flex-1 px-10 py-8 bg-white ${sidebarExpanded ? "ml-64" : ""}`}>
        <h1 className="text-3xl font-bold mb-8 text-green-700">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatsCard label="Total Pharmacies" value={stats.totalPharmacies} />
          <StatsCard label="Total Products" value={stats.totalProducts} />
          <StatsCard label="Total Orders" value={stats.totalOrders} />
          <StatsCard label="Total Customers" value={stats.totalCustomers} />
        </div>

        {/* Delivery Tracking Map */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Live Delivery Tracking</h2>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {stats.activeDeliveries} active deliveries
                </span>
                <button
                  onClick={() => setShowMap(!showMap)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  {showMap ? 'Hide Map' : 'Show Map'}
                </button>
              </div>
            </div>
            {showMap && (
              <>
                {stats.activeDeliveries > 0 ? (
                  <div>
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-blue-800 text-sm">
                        📍 Tracking all active deliveries in real-time. Click on markers for details.
                      </p>
                    </div>
                    <OrderTrackingMap
                      allOrders={allOrders}
                      height="500px"
                      showRoute={true}
                      interactive={true}
                      zoomToAdmin={true} // <-- this prop triggers zoom to admin location
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center bg-gray-50 rounded-lg p-12">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📍</div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">No Active Deliveries</h3>
                      <p className="text-gray-600">All orders are either pending approval or have been delivered.</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/admin/register-pharmacy"
                className="block w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 text-center"
              >
                Register New Pharmacy
              </Link>
              <Link
                to="/admin/pharmacies"
                className="block w-full bg-sky-600 text-white py-2 px-4 rounded-md hover:bg-sky-700 text-center"
              >
                Manage Pharmacies
              </Link>
              <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700">
                Add Product
              </button>
              <button className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700">
                Review Prescriptions
              </button>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
            {recentOrders.length === 0 ? (
              <p className="text-gray-500">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between border-b pb-3">
                    <div>
                      <p className="font-medium">Order #{order.id}</p>
                      <p className="text-sm text-gray-600">
                        {order.user_name} • {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </span>
                      {order.total_price && (
                        <p className="text-sm font-medium mt-1">
                          RWF {order.total_price.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Management Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <svg className="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="text-lg font-semibold">Pharmacy Management</h3>
            </div>
            <p className="text-gray-600 mb-4">Register new pharmacies, update locations, and manage pharmacy information.</p>
            <Link
              to="/admin/pharmacies"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Manage Pharmacies →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <svg className="w-8 h-8 text-sky-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="text-lg font-semibold">Product Management</h3>
            </div>
            <p className="text-gray-600 mb-4">Add new products, update inventory, and manage product categories.</p>
            <button className="text-sky-600 hover:text-sky-700 font-medium">
              Manage Products →
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <svg className="w-8 h-8 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-lg font-semibold">Order Management</h3>
            </div>
            <p className="text-gray-600 mb-4">Track orders, update status, and review prescription submissions.</p>
            <Link
              to="/admin/orders"
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Manage Orders →
            </Link>
            <Link
              to="/admin/orders?status=pending_prescription_review"
              className="text-yellow-600 hover:text-yellow-700 font-medium"
            >
              Review Prescriptions →
            </Link>
          </div>
        </div>

        {/* Statistics Overview - Bottom chart section */}
        <div className="bg-white rounded-2xl shadow-lg mt-8 p-8">
          <h2 className="text-2xl font-bold mb-8 text-green-700 flex items-center gap-2 justify-center">
            <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17a4 4 0 01-4-4V7a4 4 0 014-4h2a4 4 0 014 4v6a4 4 0 01-4 4z" />
            </svg>
            Statistics Overview
          </h2>
          <div className="flex flex-col gap-8 items-center">
            <div className="bg-gradient-to-br from-sky-100 to-sky-200 rounded-xl p-4 shadow flex flex-col mb-8 w-full max-w-2xl mx-auto">
              <h3 className="font-semibold mb-4 text-sky-700 text-lg flex items-center gap-2 justify-center">
                <svg className="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
                </svg>
                Orders Per Month
              </h3>
              <div style={{ width: 600, height: 320, margin: "0 auto" }}>
                <Bar data={ordersBarData} options={ordersBarOptions} />
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl p-4 shadow flex flex-col w-full max-w-2xl mx-auto">
              <h3 className="font-semibold mb-4 text-yellow-700 text-lg flex items-center gap-2 justify-center">
                <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Products Per Pharmacy
              </h3>
              <div style={{ width: 600, height: 320, margin: "0 auto" }}>
                <Bar data={productsBarData} options={productsBarOptions} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Sidebar link component
function SidebarLink({ icon, label, active, expanded }) {
  const routes = {
    "Dashboard": "/admin", // <-- Fix here
    "Pharmacies": "/admin/pharmacies",
    "Products": "/admin/products",
    "Orders": "/admin/orders",
    "Customers": "/admin/customers",
    "Settings": "/admin/settings"
  };
  return (
    <Link
      to={routes[label]}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition 
        ${active ? "bg-white text-green-700 font-bold" : "hover:bg-green-600"} 
        ${!expanded ? "justify-center" : ""}`}
    >
      <span className="text-xl">{icon}</span>
      {expanded && <span>{label}</span>}
    </Link>
  );
}

// Stats card component
function StatsCard({ label, value }) {
  return (
    <div className="bg-sky-100 rounded-xl shadow flex flex-col items-center justify-center py-8">
      <div className="text-2xl font-bold text-green-700">{value}</div>
      <div className="text-gray-700 mt-2">{label}</div>
    </div>
  );
}

// Status color helper
function getStatusColor(status) {
  switch (status) {
    case "Shipped":
      return "bg-green-100 text-green-700";
    case "Delivered":
      return "bg-blue-100 text-blue-700";
    case "Processing":
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}
