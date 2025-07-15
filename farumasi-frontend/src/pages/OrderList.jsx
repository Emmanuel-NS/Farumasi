import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";


export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderPage, setOrderPage] = useState(0);
  const [showAllOrders, setShowAllOrders] = useState(false);
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


  // Fetch orders
  useEffect(() => {
    setLoading(true);
    let params = {
      search: debouncedSearch,
      status,
      sort,
    };
    Object.keys(params).forEach((k) => params[k] === "" && delete params[k]);
    axios
      .get("http://localhost:5000/api/orders", { params })
      .then((res) => {
        setOrders(res.data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [debouncedSearch, status, sort]);


  // Memoize filtered and sorted orders
  const filteredOrders = useMemo(() => {
    let result = orders;
    if (debouncedSearch) {
      result = result.filter(
        (order) =>
          String(order.id).includes(debouncedSearch) ||
          (order.customer_name && order.customer_name.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
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
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
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
                <td className="p-3">{order.customer_name || order.user_name}</td>
                <td className="p-3">{order.pharmacy_name}</td>
                <td className="p-3">
                  {order.created_at ? new Date(order.created_at).toLocaleDateString() : ""}
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === "Delivered"
                      ? "bg-green-100 text-green-700"
                      : order.status === "Processing"
                      ? "bg-yellow-100 text-yellow-700"
                      : order.status === "Cancelled"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700"
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-3">
                  {order.total_price ? `RWF ${order.total_price.toLocaleString()}` : ""}
                </td>
                <td className="p-3 flex gap-2">
                  <Link
                    to={`/admin/orders/${order.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </Link>
                  <button
                    className="text-green-600 hover:underline"
                    onClick={() => navigate(`/admin/orders/${order.id}/edit`)}
                  >
                    Edit
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
    </div>
  );
}




