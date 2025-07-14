import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import OrderTrackingMap from '../components/OrderTrackingMap';
import API_BASE_URL from '../config/config';

export default function OrderTracking() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
    
    // Set up real-time updates (optional - can be enhanced with WebSocket)
    const interval = setInterval(fetchOrderDetails, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/orders/${orderId}`);
      setOrder(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusSteps = () => {
    const steps = [
      { id: 'pending', label: 'Order Placed', completed: true },
      { id: 'approved', label: 'Order Approved', completed: false },
      { id: 'shipped', label: 'Picked Up', completed: false },
      { id: 'out_for_delivery', label: 'Out for Delivery', completed: false },
      { id: 'delivered', label: 'Delivered', completed: false },
    ];

    const statusOrder = ['pending', 'approved', 'shipped', 'out_for_delivery', 'delivered'];
    const currentIndex = statusOrder.indexOf(order?.status);

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'out_for_delivery':
        return 'text-blue-600 bg-blue-100';
      case 'shipped':
        return 'text-purple-600 bg-purple-100';
      case 'approved':
        return 'text-yellow-600 bg-yellow-100';
      case 'canceled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The order you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/orders')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const steps = getStatusSteps();
  const canTrack = ['approved', 'shipped', 'out_for_delivery'].includes(order.status);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/orders')}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
          >
            ← Back to Orders
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Track Order #{order.id}</h1>
          <p className="text-gray-600 mt-2">Placed on {formatDate(order.created_at)}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Details</h2>
              
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Status</span>
                  <span className={`ml-2 inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-500">Total Amount</span>
                  <p className="text-lg font-semibold text-gray-900">GH₵ {order.total_amount}</p>
                </div>

                {order.pharmacy_name && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Pharmacy</span>
                    <p className="text-gray-900">{order.pharmacy_name}</p>
                  </div>
                )}

                <div>
                  <span className="text-sm font-medium text-gray-500">Delivery Address</span>
                  <p className="text-gray-900">{order.delivery_address || 'Default Address'}</p>
                </div>

                {order.delivery_notes && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Delivery Notes</span>
                    <p className="text-gray-900">{order.delivery_notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Progress */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Progress</h3>
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className={`w-4 h-4 rounded-full flex-shrink-0 ${
                      step.completed ? 'bg-green-500' : 
                      step.current ? 'bg-blue-500' : 'bg-gray-300'
                    }`}></div>
                    <div className="ml-3">
                      <p className={`text-sm font-medium ${
                        step.completed ? 'text-green-600' : 
                        step.current ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        {step.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Live Tracking</h2>
              
              {canTrack ? (
                <>
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-blue-800 text-sm">
                      📍 Your order is being processed and will be delivered soon!
                    </p>
                  </div>
                  <OrderTrackingMap 
                    order={order} 
                    height="500px" 
                    showRoute={true}
                    interactive={true}
                  />
                </>
              ) : order.status === 'delivered' ? (
                <div className="flex items-center justify-center bg-green-50 rounded-lg p-8">
                  <div className="text-center">
                    <div className="text-6xl mb-4">✅</div>
                    <h3 className="text-xl font-semibold text-green-800 mb-2">Order Delivered!</h3>
                    <p className="text-green-600">Your order was successfully delivered.</p>
                  </div>
                </div>
              ) : order.status === 'canceled' ? (
                <div className="flex items-center justify-center bg-red-50 rounded-lg p-8">
                  <div className="text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h3 className="text-xl font-semibold text-red-800 mb-2">Order Canceled</h3>
                    <p className="text-red-600">This order has been canceled.</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center bg-gray-50 rounded-lg p-8">
                  <div className="text-center">
                    <div className="text-6xl mb-4">⏳</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Processing Order</h3>
                    <p className="text-gray-600">Your order is being prepared. Tracking will be available once it's approved.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Items */}
        {order.items && order.items.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">{item.product_name}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-gray-900">GH₵ {item.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
