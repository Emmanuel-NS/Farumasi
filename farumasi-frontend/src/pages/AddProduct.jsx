import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from '../config/config';


export default function AddProduct() {
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
  const [message, setMessage] = useState("");


  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/pharmacies?limit=100`)
      .then(res => setPharmacies(res.data.data || []));
  }, []);


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
      if (value !== null && value !== "") data.append(key, value);
    });
    try {
      await axios.post(`${API_BASE_URL}/api/products`, data);
      setMessage("Product added successfully!");
      setForm({
        name: "",
        description: "",
        category: "",
        price: "",
        requires_prescription: false,
        pharmacy_id: "",
        image: null,
      });
    } catch (err) {
      setMessage("Failed to add product.");
    }
  };


  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-green-700">Add Product</h2>
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
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Add Product</button>
      </form>
    </div>
  );
}



