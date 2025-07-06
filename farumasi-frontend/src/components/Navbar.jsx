import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-green-600 text-white p-4 flex justify-between">
      <div className="font-bold text-xl">Farumasi Admin</div>
      <div className="space-x-4">
        <Link to="/admin" className="hover:underline">Admin Dashboard</Link>
        <Link to="/admin/pharmacies" className="hover:underline">Pharmacies</Link>
        {/* Add more links as needed */}
      </div>
    </nav>
  );
}