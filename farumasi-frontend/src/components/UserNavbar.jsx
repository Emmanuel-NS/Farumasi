import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function UserNavbar() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  // Check if admin is viewing user interface
  const isAdminUserView = isAdmin() && location.pathname.startsWith('/admin/user-view');

  const handleLogout = () => {
    logout();
    navigate('/home');
  };

  const switchToAdminDashboard = () => {
    navigate('/admin');
  };

  const handleLogoClick = () => {
    if (location.pathname === '/home') {
      // If already on home page, refresh it
      window.location.reload();
    } else {
      // From any other page, navigate to home
      navigate('/home');
    }
  };

  const handleNavClick = (path) => {
    // Adjust path for admin user view
    let targetPath = path;
    if (isAdminUserView) {
      if (path === '/dashboard') targetPath = '/admin/user-view';
      else if (path === '/orders') targetPath = '/admin/user-view/orders';
      else if (path === '/profile') targetPath = '/admin/user-view/profile';
    }

    if (location.pathname === targetPath) {
      // If already on this page, refresh it
      window.location.reload();
    } else {
      // Otherwise navigate to the page
      navigate(targetPath);
    }
  };

  const isActive = (path) => {
    if (isAdminUserView) {
      if (path === '/dashboard') return location.pathname === '/admin/user-view';
      else if (path === '/orders') return location.pathname === '/admin/user-view/orders';
      else if (path === '/profile') return location.pathname === '/admin/user-view/profile';
    }
    return location.pathname === path;
  };

  return (
    <nav className="bg-green-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button 
              onClick={handleLogoClick}
              className="flex items-center hover:text-green-200 transition-colors focus:outline-none"
            >
              <svg className="w-8 h-8 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="font-bold text-xl">Farumasi</span>
            </button>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <button
                onClick={() => handleNavClick('/dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/dashboard')
                    ? 'bg-green-700 text-white'
                    : 'text-green-100 hover:bg-green-500 hover:text-white'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => handleNavClick('/orders')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/orders')
                    ? 'bg-green-700 text-white'
                    : 'text-green-100 hover:bg-green-500 hover:text-white'
                }`}
              >
                My Orders
              </button>
              <button
                onClick={() => handleNavClick('/profile')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/profile')
                    ? 'bg-green-700 text-white'
                    : 'text-green-100 hover:bg-green-500 hover:text-white'
                }`}
              >
                Profile
              </button>
            </div>
          </div>

          {/* User Menu */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 text-sm text-green-100 hover:text-white"
                >
                  <span>Welcome, {user?.name}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <div className="font-medium">{user?.name}</div>
                      <div className="text-xs text-gray-500">
                        {isAdminUserView ? 'Admin (User View)' : 'User Role'}
                      </div>
                    </div>
                    
                    {isAdmin() && (
                      <button
                        onClick={switchToAdminDashboard}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Switch to Admin Dashboard
                      </button>
                    )}
                    
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="bg-green-700 inline-flex items-center justify-center p-2 rounded-md text-green-100 hover:text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-800 focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden" id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <button
            onClick={() => handleNavClick('/dashboard')}
            className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
              isActive('/dashboard')
                ? 'bg-green-700 text-white'
                : 'text-green-100 hover:bg-green-500 hover:text-white'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => handleNavClick('/orders')}
            className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
              isActive('/orders')
                ? 'bg-green-700 text-white'
                : 'text-green-100 hover:bg-green-500 hover:text-white'
            }`}
          >
            My Orders
          </button>
          <button
            onClick={() => handleNavClick('/profile')}
            className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
              isActive('/profile')
                ? 'bg-green-700 text-white'
                : 'text-green-100 hover:bg-green-500 hover:text-white'
            }`}
          >
            Profile
          </button>
        </div>
        <div className="pt-4 pb-3 border-t border-green-700">
          <div className="flex items-center px-5">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="ml-3">
              <div className="text-base font-medium text-white">{user?.name}</div>
              <div className="text-sm font-medium text-green-300">{user?.email}</div>
            </div>
          </div>
          <div className="mt-3 px-2 space-y-1">
            {isAdmin() && (
              <button
                onClick={switchToAdminDashboard}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-green-100 hover:text-white hover:bg-green-500"
              >
                Switch to Admin Dashboard
              </button>
            )}
            <button
              onClick={handleLogout}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-green-100 hover:text-white hover:bg-green-500"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
