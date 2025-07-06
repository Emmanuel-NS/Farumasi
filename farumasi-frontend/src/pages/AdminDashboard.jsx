import React from "react";

export default function AdminDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4 text-green-700">Admin Dashboard</h1>
      <ul className="list-disc ml-6 space-y-2">
        <li>Register Pharmacy</li>
        <li>Insert Products</li>
        <li>Complete Orders</li>
        <li>Track Orders & Delivery</li>
        <li>Manage Payments</li>
        <li>More admin features coming soon...</li>
      </ul>
    </div>
  );
}