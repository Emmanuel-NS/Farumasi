import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const switchToUserDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <nav className="bg-green-600 text-white p-4 flex justify-between items-center">
      <Link to="/admin" className="font-bold text-xl hover:text-green-200 transition-colors">
        Farumasi Admin
      </Link>
      
      <div className="flex items-center space-x-4">
        <Link to="/admin" className="hover:underline">Dashboard</Link>
        <Link to="/admin/pharmacies" className="hover:underline">Pharmacies</Link>
        <Link to="/admin/register-pharmacy" className="hover:underline">Add Pharmacy</Link>
        
        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-2 hover:bg-green-700 px-3 py-2 rounded"
          >
            <div className="w-8 h-8 bg-green-800 rounded-full flex items-center justify-center">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <span>{user?.name || 'Admin'}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
              <div className="px-4 py-2 text-sm text-gray-700 border-b">
                <div className="font-medium">{user?.name}</div>
                <div className="text-xs text-gray-500">Admin Role</div>
              </div>
              
              <button
                onClick={switchToUserDashboard}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Switch to User View
              </button>
              
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
    </nav>
  );
}