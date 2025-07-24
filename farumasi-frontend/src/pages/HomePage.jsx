import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import StickyIcons from '../components/StickyIcons';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cart, setCart] = useState([]);
  const [showCartSummary, setShowCartSummary] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products', {
        params: {
          search: searchTerm,
          category: selectedCategory,
          limit: 12
        }
      });
      setProducts(response.data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
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

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const categories = ['Medication', 'Supplements', 'Medical Equipment', 'Personal Care'];
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <svg className="w-8 h-8 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="font-bold text-xl text-green-600">Farumasi</span>
              </Link>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-4">
              {cart.length > 0 && (
                <button
                  onClick={() => setShowCartSummary(!showCartSummary)}
                  className="relative bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 5H2m5 8v8a2 2 0 002 2h8a2 2 0 002-2v-8m-4 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                  </svg>
                  Cart ({cart.length})
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {cart.length}
                  </span>
                </button>
              )}

              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="bg-sky-500 text-white px-4 py-2 rounded-md hover:bg-sky-600"
                >
                  Dashboard
                </Link>
              ) : (
                <div className="space-x-2">
                  <Link
                    to="/help"
                    className="text-green-600 hover:text-green-800 px-3 py-2"
                  >
                    Help
                  </Link>
                  <Link
                    to="/login"
                    className="text-green-600 hover:text-green-800 px-3 py-2"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-sky-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Your Trusted Online Pharmacy</h1>
          <p className="text-xl mb-8">Quality medicines delivered to your doorstep</p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/register"
              className="bg-white text-green-600 px-6 py-3 rounded-md font-medium hover:bg-gray-100"
            >
              Get Started
            </Link>
            <button
              onClick={() => document.getElementById('products-section').scrollIntoView({ behavior: 'smooth' })}
              className="border-2 border-white text-white px-6 py-3 rounded-md font-medium hover:bg-white hover:text-green-600"
            >
              Browse Products
            </button>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products-section" className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-bold text-center mb-6">Browse Our Products</h2>
            
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
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          )}

          {products.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500">No products found</p>
            </div>
          )}
        </div>
      </section>

      {/* Cart Summary Sidebar */}
      {showCartSummary && cart.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Cart Summary</h2>
                <button
                  onClick={() => setShowCartSummary(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item.product_id} className="flex items-center justify-between border-b pb-4">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.product_name}</h4>
                      <p className="text-gray-600 text-sm">
                        RWF {item.price.toLocaleString()} each
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <button
                          onClick={() => updateCartQuantity(item.product_id, item.quantity - 1)}
                          className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm hover:bg-gray-300"
                        >
                          -
                        </button>
                        <span className="mx-2 text-sm w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.product_id, item.quantity + 1)}
                          className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm hover:bg-gray-300"
                        >
                          +
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeFromCart(item.product_id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>RWF {cartTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Checkout Button */}
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 font-medium text-center block"
                >
                  Proceed to Checkout
                </Link>
              ) : (
                <div className="space-y-3">
                  <p className="text-center text-sm text-gray-600">
                    Please login to proceed with checkout
                  </p>
                  <Link
                    to="/login"
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 font-medium text-center block"
                  >
                    Login to Checkout
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sticky Icons */}
      <StickyIcons cartCount={cart.length} />
    </div>
  );
}
