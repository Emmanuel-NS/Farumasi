import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const INSURANCE_OPTIONS = ["RSSB", "MMI", "MUTUELLE", "SANLAM", "NONE"];

export default function OrderPrescriptionReview() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [insurance, setInsurance] = useState("NONE");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        // Fetch order details
        const orderRes = await axios.get(`http://localhost:5000/api/orders/${id}`);
        setOrder(orderRes.data);
        setInsurance(orderRes.data.insurance_provider || "NONE");

        // Fetch products for fulfillment
        const productsRes = await axios.get("http://localhost:5000/api/products");
        setProducts(productsRes.data.data || []);
      } catch (err) {
        setError("Failed to load order or products.");
      }
      setLoading(false);
    }
    fetchData();
  }, [id]);

  // Filtering products by search
  const filteredProducts = products.filter(
    p =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(productSearch.toLowerCase()))
  );

  // Add product to prescription fulfillment
  const handleAddProduct = (productId) => {
    if (!selectedItems.some(item => item.product_id === productId)) {
      setSelectedItems([...selectedItems, { product_id: productId, quantity: 1 }]);
    }
  };

  // Update quantity
  const handleQuantityChange = (productId, qty) => {
    setSelectedItems(items =>
      items.map(item =>
        item.product_id === productId ? { ...item, quantity: qty } : item
      )
    );
  };

  // Remove product
  const handleRemoveProduct = (productId) => {
    setSelectedItems(items => items.filter(item => item.product_id !== productId));
  };

  // Submit prescription review
  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      await axios.put("http://localhost:5000/api/orders/prescription-review", {
        order_id: id,
        items: selectedItems,
        insurance_provider: insurance,
        status: "pending"
      });
      alert("Prescription reviewed and order updated!");
      navigate("/admin/orders");
    } catch (err) {
      setError(
        err.response?.data?.error ||
        "Failed to submit review. Please check your input and try again."
      );
    }
    setSubmitting(false);
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!order) return <div className="p-8 text-red-600">Order not found.</div>;

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-green-700">
        Review Prescription for Order #{order.id}
      </h2>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <div className="mb-4">
        <b>Customer:</b> {order.user_name}<br />
        <b>Pharmacy:</b> {order.pharmacy_name || "Not assigned"}<br />
        <b>Prescription File:</b>{" "}
        {order.prescription_file ? (
          <a
            href={`http://localhost:5000/uploads/${order.prescription_file}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-700 underline"
          >
            View Prescription
          </a>
        ) : (
          <span className="text-red-600">No file uploaded</span>
        )}
      </div>
      {/* Insurance selection */}
      <div className="mb-6">
        <label className="font-semibold mr-2">Insurance Provider:</label>
        <select
          className="border px-2 py-1 rounded"
          value={insurance}
          onChange={e => setInsurance(e.target.value)}
        >
          {INSURANCE_OPTIONS.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
      {/* Product search/filter */}
      <div className="mb-4">
        <input
          className="border px-2 py-1 rounded w-full"
          placeholder="Search products by name or category"
          value={productSearch}
          onChange={e => setProductSearch(e.target.value)}
        />
      </div>
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Select Products to Fulfill Prescription</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProducts.map(product => (
            <div key={product.id} className="border rounded p-3 flex flex-col">
              <span className="font-medium">{product.name}</span>
              <span className="text-sm text-gray-600">
                {product.category ? `Category: ${product.category}` : ""}
              </span>
              <span className="text-sm text-gray-600">Stock: {product.stock}</span>
              <span className="text-sm text-gray-600">Price: RWF {product.price}</span>
              <button
                className="mt-2 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                onClick={() => handleAddProduct(product.id)}
                disabled={selectedItems.some(item => item.product_id === product.id)}
              >
                {selectedItems.some(item => item.product_id === product.id) ? "Added" : "Add"}
              </button>
            </div>
          ))}
        </div>
      </div>
      {selectedItems.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Selected Products</h3>
          <table className="w-full">
            <thead>
              <tr className="bg-green-100">
                <th className="p-2">Product</th>
                <th className="p-2">Quantity</th>
                <th className="p-2">Remove</th>
              </tr>
            </thead>
            <tbody>
              {selectedItems.map(item => {
                const product = products.find(p => p.id === item.product_id);
                return (
                  <tr key={item.product_id}>
                    <td className="p-2">{product ? product.name : `ID ${item.product_id}`}</td>
                    <td className="p-2">
                      <input
                        type="number"
                        min={1}
                        max={product ? product.stock : 100}
                        value={item.quantity}
                        onChange={e => handleQuantityChange(item.product_id, Number(e.target.value))}
                        className="border rounded px-2 py-1 w-16"
                      />
                    </td>
                    <td className="p-2">
                      <button
                        className="text-red-600 hover:underline"
                        onClick={() => handleRemoveProduct(item.product_id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <button
        className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded font-bold shadow"
        onClick={handleSubmit}
        disabled={selectedItems.length === 0 || submitting}
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </div>
  );
}