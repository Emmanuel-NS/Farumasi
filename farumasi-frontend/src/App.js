import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import './App.css';
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import RoleIndicator from "./components/RoleIndicator";

// Admin Components
import Navbar from "./components/Navbar";
import AdminDashboard from "./pages/AdminDashboard";
import RegisterPharmacy from "./pages/RegisterPharmacy";
import PharmacyList from "./pages/PharmacyList";
import PharmacyDetails from "./pages/PharmacyDetails";
import EditPharmacy from "./pages/EditPharmacy";

// User Components
import UserNavbar from "./components/UserNavbar";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import UserOrders from "./pages/UserOrders";
import UserProfile from "./pages/UserProfile";
import OrderTracking from "./pages/OrderTracking";

function AppRoutes() {
  const { isAuthenticated, getUserRole } = useAuth();

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected User Routes */}
        <Route path="/dashboard" element={
          <RoleProtectedRoute requiredRole="user">
            <UserNavbar />
            <UserDashboard />
          </RoleProtectedRoute>
        } />
        <Route path="/orders" element={
          <RoleProtectedRoute requiredRole="user">
            <UserNavbar />
            <UserOrders />
          </RoleProtectedRoute>
        } />
        <Route path="/track/:orderId" element={
          <RoleProtectedRoute requiredRole="user">
            <UserNavbar />
            <OrderTracking />
          </RoleProtectedRoute>
        } />
        <Route path="/profile" element={
          <RoleProtectedRoute requiredRole="user">
            <UserNavbar />
            <UserProfile />
          </RoleProtectedRoute>
        } />
        
        {/* Admin viewing user interface routes */}
        <Route path="/admin/user-view" element={
          <RoleProtectedRoute requiredRole="admin">
            <UserNavbar />
            <UserDashboard />
          </RoleProtectedRoute>
        } />
        <Route path="/admin/user-view/orders" element={
          <RoleProtectedRoute requiredRole="admin">
            <UserNavbar />
            <UserOrders />
          </RoleProtectedRoute>
        } />
        <Route path="/admin/user-view/profile" element={
          <RoleProtectedRoute requiredRole="admin">
            <UserNavbar />
            <UserProfile />
          </RoleProtectedRoute>
        } />
        
        {/* Protected Admin Routes */}
        <Route path="/admin" element={
          <RoleProtectedRoute requiredRole="admin">
            <Navbar />
            <AdminDashboard />
          </RoleProtectedRoute>
        } />
        <Route path="/admin/register-pharmacy" element={
          <RoleProtectedRoute requiredRole="admin">
            <Navbar />
            <RegisterPharmacy />
          </RoleProtectedRoute>
        } />
        <Route path="/admin/pharmacies" element={
          <RoleProtectedRoute requiredRole="admin">
            <Navbar />
            <PharmacyList />
          </RoleProtectedRoute>
        } />
        <Route path="/admin/pharmacies/:id" element={
          <RoleProtectedRoute requiredRole="admin">
            <Navbar />
            <PharmacyDetails />
          </RoleProtectedRoute>
        } />
        <Route path="/admin/pharmacies/:id/edit" element={
          <RoleProtectedRoute requiredRole="admin">
            <Navbar />
            <EditPharmacy />
          </RoleProtectedRoute>
        } />
        
        {/* Default redirects based on role */}
        <Route path="/" element={
          isAuthenticated ? (
            getUserRole() === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />
          ) : <Navigate to="/home" />
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      
      {/* Role Indicator - shown on all authenticated pages */}
      {isAuthenticated && <RoleIndicator />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;