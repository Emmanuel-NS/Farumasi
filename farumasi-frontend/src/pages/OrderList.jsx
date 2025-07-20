import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";


export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderPage, setOrderPage] = useState(0);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const ORDERS_PER_PAGE = 5;


  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("date");


  // Debounce search input
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(handler);
  }, [search]);


  const navigate = useNavigate();
  const location = useLocation();


  // Fetch orders
  useEffect(() => {
    setLoading(true);
    let params = {
      search: debouncedSearch,
      sort,
    };
    // Only add status if user selects it
    if (status) params.status = status;
    axios
      .get("http://localhost:5000/api/orders", { params })
      .then((res) => {
        setOrders(res.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [debouncedSearch, status, sort]);


  // Set status from URL param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const statusParam = params.get("status");
    if (statusParam) setStatus(statusParam);
  }, [location.search]);


  // Memoize filtered and sorted orders
  const filteredOrders = useMemo(() => {
    let result = orders;
    if (debouncedSearch) {
      result = result.filter(
        (order) =>
          String(order.id).includes(debouncedSearch) ||
          (order.user_name && order.user_name.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
          (order.pharmacy_name && order.pharmacy_name.toLowerCase().includes(debouncedSearch.toLowerCase()))
      );
    }
    if (status) {
      result = result.filter((order) => order.status === status);
    }
    if (sort === "date") {
      result = [...result].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sort === "total") {
      result = [...result].sort((a, b) => (b.total_price || 0) - (a.total_price || 0));
    }
    return result;
  }, [orders, debouncedSearch, status, sort]);


  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
  const paginatedOrders = showAllOrders
    ? filteredOrders
    : filteredOrders.slice(
        orderPage * ORDERS_PER_PAGE,
        (orderPage + 1) * ORDERS_PER_PAGE
      );


  // Handlers
  const handleNext = () => setOrderPage((prev) => Math.min(prev + 1, totalPages - 1));
  const handlePrev = () => setOrderPage((prev) => Math.max(prev - 1, 0));
  const handleShowAll = () => setShowAllOrders(true);
  const handleShowLess = () => {
    setShowAllOrders(false);
    setOrderPage(0);
  };
  const handleReset = () => {
    setSearch("");
    setStatus("");
    setSort("date");
    setOrderPage(0);
  };


  // Status update
  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, { status: newStatus });
      setOrders(orders =>
        orders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      alert("Failed to update order status.");
    }
    setUpdatingId(null);
  };


  // Delete order
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    setDeletingId(orderId);
    try {
      await axios.delete(`http://localhost:5000/api/orders/${orderId}`);
      setOrders(orders => orders.filter(order => order.id !== orderId));
    } catch (err) {
      alert("Failed to delete order.");
    }
    setDeletingId(null);
  };


  // Fetch order details
  const fetchOrderDetails = async (orderId) => {
    setSelectedOrder(null);
    try {
      const res = await axios.get(`http://localhost:5000/api/orders/${orderId}`);
      setSelectedOrder(res.data);
    } catch (err) {
      alert("Failed to fetch order details.");
    }
  };


  if (loading) return <div className="p-8">Loading...</div>;


  return (
    <div className="max-w-5xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-green-700">Orders</h2>


      {/* Filters and Search Bar */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 flex flex-wrap gap-3 items-center">
        <input
          className="border px-2 py-1 rounded w-48"
          placeholder="Search by ID, customer, or pharmacy"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.target.blur();
            }
          }}
        />
        <select
          className="border px-2 py-1 rounded"
          value={status}
          onChange={e => {
            setStatus(e.target.value);
            setOrderPage(0);
          }}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="pending_prescription_review">Prescription Review</option>
          <option value="approved">Approved</option>
          <option value="shipped">Shipped</option>
          <option value="out_for_delivery">Out for Delivery</option>
          <option value="delivered">Delivered</option>
          <option value="canceled">Canceled</option>
        </select>
        <select
          className="border px-2 py-1 rounded"
          value={sort}
          onChange={e => setSort(e.target.value)}
        >
          <option value="date">Sort by Date</option>
          <option value="total">Sort by Total</option>
        </select>
        <button
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded ml-2"
          onClick={handleReset}
          type="button"
        >
          Reset
        </button>
      </div>


      {/* Table */}
      <div className={showAllOrders ? "max-h-96 overflow-y-auto" : ""}>
        <table className="w-full">
          <thead>
            <tr className="bg-green-100">
              <th className="p-3 font-semibold text-left">Order ID</th>
              <th className="p-3 font-semibold text-left">Customer</th>
              <th className="p-3 font-semibold text-left">Pharmacy</th>
              <th className="p-3 font-semibold text-left">Date</th>
              <th className="p-3 font-semibold text-left">Status</th>
              <th className="p-3 font-semibold text-left">Total</th>
              <th className="p-3 font-semibold text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.map((order) => (
              <tr key={order.id} className="hover:bg-green-50 transition">
                <td className="p-3">{order.id}</td>
                <td className="p-3">{order.user_name}</td>
                <td className="p-3">{order.pharmacy_name}</td>
                <td className="p-3">
                  {order.created_at ? new Date(order.created_at).toLocaleDateString() : ""}
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === "delivered"
                      ? "bg-green-100 text-green-700"
                      : order.status === "approved"
                      ? "bg-blue-100 text-blue-700"
                      : order.status === "pending_prescription_review"
                      ? "bg-yellow-100 text-yellow-700"
                      : order.status === "canceled"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700"
                  }`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-3">
                  {order.total_price ? `RWF ${order.total_price.toLocaleString()}` : ""}
                </td>
                <td className="p-3 flex gap-2">
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => fetchOrderDetails(order.id)}
                  >
                    View
                  </button>
                  {order.status === "pending_prescription_review" ? (
                    <button
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-xs"
                      onClick={() => navigate(`/admin/orders/${order.id}/review`)}
                    >
                      Review
                    </button>
                  ) : (
                    <select
                      className="border rounded px-2 py-1 text-xs"
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={e => handleStatusUpdate(order.id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="shipped">Shipped</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="canceled">Canceled</option>
                    </select>
                  )}
                  <button
                    className={`text-red-600 hover:underline ${deletingId === order.id ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={() => handleDeleteOrder(order.id)}
                    disabled={deletingId === order.id}
                  >
                    {deletingId === order.id ? "Removing..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      {/* Pagination and Show More/Less */}
      {filteredOrders.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          {!showAllOrders && (
            <>
              <button
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                onClick={handlePrev}
                disabled={orderPage === 0}
              >
                Prev
              </button>
              <span>
                Showing {orderPage * ORDERS_PER_PAGE + 1} - {Math.min((orderPage + 1) * ORDERS_PER_PAGE, filteredOrders.length)} of {filteredOrders.length}
              </span>
              <button
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                onClick={handleNext}
                disabled={orderPage >= totalPages - 1}
              >
                Next
              </button>
              <button
                className="ml-4 px-3 py-1 bg-blue-500 text-white rounded"
                onClick={handleShowAll}
              >
                Show More
              </button>
            </>
          )}
          {showAllOrders && (
            <button
              className="px-3 py-1 bg-blue-500 text-white rounded"
              onClick={handleShowLess}
            >
              Show Less
            </button>
          )}
        </div>
      )}


      {/* Modal for Order Details */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 max-w-xl w-full relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-3xl font-bold rounded-full w-10 h-10 flex items-center justify-center transition"
              onClick={() => setSelectedOrder(null)}
              aria-label="Close"
              style={{ lineHeight: 1 }}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-green-700">Order #{selectedOrder.id}</h2>
            <div className="mb-2"><b>Customer:</b> {selectedOrder.user_name}</div>
            <div className="mb-2"><b>Pharmacy:</b> {selectedOrder.pharmacy_name}</div>
            <div className="mb-2"><b>Status:</b> {selectedOrder.status.replace('_', ' ')}</div>
            <div className="mb-2"><b>Total:</b> {selectedOrder.total_price ? `RWF ${selectedOrder.total_price.toLocaleString()}` : "N/A"}</div>
            <div className="mb-2"><b>Delivery Fee:</b> {selectedOrder.delivery_fee ? `RWF ${selectedOrder.delivery_fee}` : "N/A"}</div>
            {selectedOrder.prescription_file && (
              <div className="mb-2">
                <b>Prescription File:</b> <a href={`http://localhost:5000/uploads/${selectedOrder.prescription_file}`} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">View</a>
              </div>
            )}
            <div className="mb-2"><b>Insurance:</b> {selectedOrder.insurance_provider}</div>
            <div className="mb-2"><b>Created At:</b> {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString() : ""}</div>
            <div className="mb-2"><b>Items:</b>
              <ul className="list-disc ml-6">
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  selectedOrder.items.map(item => (
                    <li key={item.id}>
                      Product #{item.product_id} — Qty: {item.quantity} — Price: RWF {item.price}
                    </li>
                  ))
                ) : (
                  <li>No items (prescription order)</li>
                )}
              </ul>
            </div>
            {/* Prescription Review Button */}
            {selectedOrder.status === "pending_prescription_review" && (
              <div className="mt-4">
                <button
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
                  onClick={() => navigate(`/admin/orders/${selectedOrder.id}/review`)}
                >
                  Review Prescription
                </button>
              </div>
            )}
            <div className="mt-4 flex gap-4">
              <button
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                onClick={() => setSelectedOrder(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



