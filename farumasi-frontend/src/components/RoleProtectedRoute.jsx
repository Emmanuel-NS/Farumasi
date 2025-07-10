import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RoleProtectedRoute = ({ children, requiredRole, fallbackPath = '/login' }) => {
  const { isAuthenticated, getUserRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userRole = getUserRole();
  
  if (requiredRole && userRole !== requiredRole) {
    // Redirect based on user's actual role
    if (userRole === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (userRole === 'user') {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to={fallbackPath} replace />;
    }
  }

  return children;
};

export default RoleProtectedRoute;
