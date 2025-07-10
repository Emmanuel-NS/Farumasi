import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function RoleIndicator() {
  const { user, isAdmin, isUser } = useAuth();

  if (!user) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <div className={`px-3 py-2 rounded-full text-sm font-medium shadow-lg ${
        isAdmin() 
          ? 'bg-red-100 text-red-800 border border-red-200' 
          : 'bg-blue-100 text-blue-800 border border-blue-200'
      }`}>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            isAdmin() ? 'bg-red-500' : 'bg-blue-500'
          }`}></div>
          <span>
            {isAdmin() ? 'Admin Mode' : 'User Mode'}
          </span>
          {isAdmin() && (
            <Link 
              to="/dashboard" 
              className="text-xs text-red-600 hover:text-red-800 underline"
            >
              Switch to User
            </Link>
          )}
          {isUser() && user.role === 'admin' && (
            <Link 
              to="/admin" 
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Switch to Admin
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
