import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import logo from './logo.svg';
import './App.css';
import Navbar from "./components/Navbar";
import AdminDashboard from "./pages/AdminDashboard";
import RegisterPharmacy from "./pages/RegisterPharmacy";
import PharmacyList from "./pages/PharmacyList";
import PharmacyDetails from "./pages/PharmacyDetails";
import EditPharmacy from "./pages/EditPharmacy";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/register-pharmacy" element={<RegisterPharmacy />} />
        <Route path="/admin/pharmacies" element={<PharmacyList />} />
        <Route path="/admin/pharmacies/:id" element={<PharmacyDetails />} />
        <Route path="/admin/pharmacies/:id/edit" element={<EditPharmacy />} />
        {/* Add more routes here */}
        <Route path="*" element={<div className="p-8">Welcome to Farumasi!</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
