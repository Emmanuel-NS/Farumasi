import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalPharmacies: 0,
    totalProducts: 0,
    prescriptionOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch orders
      const ordersResponse = await axios.get('http://localhost:5000/api/orders');
      const orders = ordersResponse.data;
      
      // Fetch pharmacies
      const pharmaciesResponse = await axios.get('http://localhost:5000/api/pharmacies');
      const pharmacies = pharmaciesResponse.data.data || [];
      
      // Fetch products
      const productsResponse = await axios.get('http://localhost:5000/api/products');
      const products = productsResponse.data.data || [];

      // Calculate stats
      const pendingOrders = orders.filter(order => order.status === 'pending').length;
      const prescriptionOrders = orders.filter(order => order.status === 'pending_prescription_review').length;

      setStats({
        totalOrders: orders.length,
        pendingOrders,
        totalPharmacies: pharmacies.length,
        totalProducts: products.length,
        prescriptionOrders
      });

      // Set recent orders (last 5)
      setRecentOrders(orders.slice(0, 5));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your pharmacy network and monitor operations</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            color="border-blue-500"
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />
          
          <StatCard
            title="Pending Orders"
            value={stats.pendingOrders}
            color="border-yellow-500"
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          
          <StatCard
            title="Prescription Reviews"
            value={stats.prescriptionOrders}
            color="border-red-500"
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />
          
          <StatCard
            title="Pharmacies"
            value={stats.totalPharmacies}
            color="border-green-500"
            link="/admin/pharmacies"
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
          />
          
          <StatCard
            title="Products"
            value={stats.totalProducts}
            color="border-purple-500"
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
          />
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
            <button className="text-purple-600 hover:text-purple-700 font-medium">
              Manage Orders →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
