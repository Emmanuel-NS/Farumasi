import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from '../config/config';

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-center text-gray-600">Loading product...</div>;
  if (!product) return <div className="p-8 text-center text-red-600">Product not found.</div>;

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-green-700">{product.name}</h2>
      {product.image_url && (
        <img src={product.image_url} alt={product.name} className="w-40 h-40 object-cover rounded mb-4 mx-auto" />
      )}
      <div className="mb-2"><span className="font-semibold">Category:</span> {product.category}</div>
      <div className="mb-2"><span className="font-semibold">Price:</span> RWF {product.price}</div>
      <div className="mb-2"><span className="font-semibold">Pharmacy:</span> {product.pharmacy_name}</div>
      <div className="mb-2"><span className="font-semibold">Requires Prescription:</span> {product.requires_prescription ? "Yes" : "No"}</div>
      <div className="mb-2"><span className="font-semibold">Description:</span> {product.description || "N/A"}</div>
      <div className="flex gap-4 mt-6">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={() => navigate(`/admin/products/${product.id}/edit`)}
        >
          Edit
        </button>
        <Link
          to="/admin/products"
          className="border px-4 py-2 rounded text-gray-700 hover:bg-gray-100"
        >
          Back to Products
        </Link>
      </div>
    </div>
  );
}