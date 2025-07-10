import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import OrderSummary from '../components/OrderSummary';
import PrescriptionUpload from '../components/PrescriptionUpload';
import StickyIcons from '../components/StickyIcons';

export default function UserDashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cart, setCart] = useState([]);
  const [showPrescriptionUpload, setShowPrescriptionUpload] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products', {
        params: {
          search: searchTerm,
          category: selectedCategory,
          limit: 20
        }
      });
      setProducts(response.data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/orders/user/${user.id}`);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product_id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, {
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        requires_prescription: product.requires_prescription,
        quantity
      }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.product_id !== productId));
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.product_id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const placeOrder = async (orderData) => {
    try {
      const response = await axios.post('http://localhost:5000/api/orders', orderData);
      
      if (response.status === 201) {
        setCart([]);
        fetchOrders();
        return { success: true, data: response.data };
      }
    } catch (error) {
      console.error('Error placing order:', error);
      return { success: false, error: error.response?.data?.error || 'Failed to place order' };
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const categories = ['Medication', 'Supplements', 'Medical Equipment', 'Personal Care'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Welcome, {user.name}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 5H2m5 8v8a2 2 0 002 2h8a2 2 0 002-2v-8m-4 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                  </svg>
                  Cart ({cart.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Browse Products</h2>
              
              <form onSubmit={handleSearch} className="mb-4">
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Search
                  </button>
                </div>
              </form>

              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setShowPrescriptionUpload(!showPrescriptionUpload)}
                  className="px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors"
                >
                  {showPrescriptionUpload ? 'Hide' : 'Upload'} Prescription
                </button>
              </div>

              {showPrescriptionUpload && (
                <PrescriptionUpload onUploadSuccess={fetchOrders} />
              )}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                />
              ))}
            </div>

            {products.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No products found</p>
              </div>
            )}

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow p-6 mt-8">
              <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
              {orders.length === 0 ? (
                <p className="text-gray-500">No orders yet</p>
              ) : (
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Order #{order.id}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            Status: <span className={`font-medium ${
                              order.status === 'delivered' ? 'text-green-600' :
                              order.status === 'shipped' ? 'text-blue-600' :
                              order.status === 'canceled' ? 'text-red-600' :
                              'text-yellow-600'
                            }`}>
                              {order.status}
                            </span>
                          </p>
                        </div>
                        <div className="text-right">
                          {order.total_price && (
                            <p className="font-medium">
                              RWF {order.total_price.toLocaleString()}
                            </p>
                          )}
                          {order.prescription_file && (
                            <p className="text-sm text-blue-600">Prescription Order</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <OrderSummary
              cart={cart}
              onUpdateQuantity={updateCartQuantity}
              onRemoveItem={removeFromCart}
              onPlaceOrder={placeOrder}
            />
          </div>
        </div>
      </div>

      {/* Sticky Icons */}
      <StickyIcons cartCount={cart.length} />
    </div>
  );
}
