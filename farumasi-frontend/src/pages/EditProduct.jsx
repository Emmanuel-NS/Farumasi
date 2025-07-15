import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from '../config/config';


export default function EditProduct() {
  const { id } = useParams();
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    requires_prescription: false,
    pharmacy_id: "",
    image: null,
  });
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();


  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/products/${id}`)
      .then(res => {
        const p = res.data;
        if (p && p.name) {
          setForm({
            name: p.name || "",
            description: p.description || "",
            category: p.category || "",
            price: p.price || "",
            requires_prescription: !!p.requires_prescription,
            pharmacy_id: p.pharmacy_id || "",
            image: null,
          });
        }
      })
      .finally(() => setLoading(false));
    axios.get(`${API_BASE_URL}/api/pharmacies?limit=100`)
      .then(res => setPharmacies(res.data.data || []));
  }, [id]);


  const handleChange = e => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setForm(f => ({ ...f, [name]: checked }));
    } else if (type === "file") {
      setForm(f => ({ ...f, image: files[0] }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };


  const handleSubmit = async e => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === "image" && !value) return;
      data.append(key, value);
    });
    try {
      await axios.put(`${API_BASE_URL}/api/products/${id}`, data);
      setMessage("Product updated successfully!");
      setTimeout(() => navigate(`/admin/products/${id}`), 1200);
    } catch {
      setMessage("Failed to update product.");
    }
  };


  if (loading) return <div className="p-8 text-center text-gray-600">Loading...</div>;
  if (!form.name && !loading) return <div className="p-8 text-center text-red-600">Product not found.</div>;


  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-green-700">Edit Product</h2>
      {message && <div className="mb-4 text-blue-600">{message}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="w-full border px-3 py-2 rounded" required />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="w-full border px-3 py-2 rounded" />
        <input name="category" value={form.category} onChange={handleChange} placeholder="Category" className="w-full border px-3 py-2 rounded" />
        <input name="price" value={form.price} onChange={handleChange} placeholder="Price" type="number" min="0" className="w-full border px-3 py-2 rounded" required />
        <label className="flex items-center gap-2">
          <input type="checkbox" name="requires_prescription" checked={form.requires_prescription} onChange={handleChange} />
          Requires Prescription
        </label>
        <select name="pharmacy_id" value={form.pharmacy_id} onChange={handleChange} className="w-full border px-3 py-2 rounded" required>
          <option value="">Select Pharmacy</option>
          {pharmacies.map(ph => (
            <option key={ph.id} value={ph.id}>{ph.name}</option>
          ))}
        </select>
        <input type="file" name="image" accept="image/*" onChange={handleChange} className="w-full" />
        <div className="flex gap-4">
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Update</button>
          <button type="button" onClick={() => navigate(`/admin/products/${id}`)} className="border px-4 py-2 rounded text-gray-700 hover:bg-gray-100">Cancel</button>
        </div>
      </form>
    </div>
  );
}



