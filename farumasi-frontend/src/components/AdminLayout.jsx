import React, { useState } from "react";
import Navbar from "./Navbar";
import { FaHome, FaCapsules, FaBoxOpen, FaTruck, FaUsers, FaCog, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Link } from "react-router-dom";


export default function AdminLayout({ children, activeMenu }) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);


  return (
    <div className="flex min-h-screen bg-white relative">
      {/* Sidebar */}
      {sidebarExpanded && (
        <aside className="fixed top-0 left-0 h-screen w-64 bg-green-700 text-white flex flex-col py-8 px-4 z-20 transition-all duration-300">
          <div className="mb-8 text-2xl font-bold">Farumasi Admin</div>
          <nav className="flex flex-col gap-2">
            <SidebarLink icon={<FaHome />} label="Dashboard" active={activeMenu === "Dashboard"} expanded={sidebarExpanded} />
            <SidebarLink icon={<FaCapsules />} label="Pharmacies" active={activeMenu === "Pharmacies"} expanded={sidebarExpanded} />
            <SidebarLink icon={<FaBoxOpen />} label="Products" active={activeMenu === "Products"} expanded={sidebarExpanded} />
            <SidebarLink icon={<FaTruck />} label="Orders" active={activeMenu === "Orders"} expanded={sidebarExpanded} />
            <SidebarLink icon={<FaUsers />} label="Customers" active={activeMenu === "Customers"} expanded={sidebarExpanded} />
            <SidebarLink icon={<FaCog />} label="Settings" active={activeMenu === "Settings"} expanded={sidebarExpanded} />
          </nav>
          <button
            className="absolute -right-4 top-1/2 transform -translate-y-1/2 bg-white text-green-700 rounded-full shadow p-2 hover:bg-green-100 transition"
            onClick={() => setSidebarExpanded(false)}
            aria-label="Minimize sidebar"
          >
            <FaChevronLeft />
          </button>
        </aside>
      )}
      {!sidebarExpanded && (
        <button
          className="fixed left-2 top-1/2 transform -translate-y-1/2 bg-white text-green-700 rounded-full shadow p-2 z-30 hover:bg-green-100 transition"
          onClick={() => setSidebarExpanded(true)}
          aria-label="Expand sidebar"
        >
          <FaChevronRight />
        </button>
      )}
      {/* Main Content */}
      <main className={`flex-1 px-10 py-8 bg-white ${sidebarExpanded ? "ml-64" : ""}`}>
        <Navbar />
        {children}
      </main>
    </div>
  );
}


function SidebarLink({ icon, label, active, expanded }) {
  const routes = {
    "Dashboard": "/admin",
    "Pharmacies": "/admin/pharmacies",
    "Products": "/admin/products",
    "Orders": "/admin/orders",
    "Customers": "/admin/customers",
    "Settings": "/admin/settings"
  };
  return (
    <Link
      to={routes[label]}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition
        ${active ? "bg-white text-green-700 font-bold" : "hover:bg-green-600"}
        ${!expanded ? "justify-center" : ""}`}
    >
      <span className="text-xl">{icon}</span>
      {expanded && <span>{label}</span>}
    </Link>
  );
}




