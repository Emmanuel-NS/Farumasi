import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Short country list for demo; you can expand this as needed
const countries = [
  { name: "Rwanda", code: "+250" },
  { name: "Kenya", code: "+254" },
  { name: "Uganda", code: "+256" },
  { name: "Tanzania", code: "+255" },
  { name: "Burundi", code: "+257" },
  { name: "South Sudan", code: "+211" },
  { name: "DR Congo", code: "+243" },
];

const insurances = ["RSSB", "SANLAM", "MMI", "Radiant", "Other"];

const rwandaProvinces = [
  "Kigali City",
  "Northern",
  "Southern",
  "Eastern",
  "Western",
];

export default function RegisterPharmacy() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    insurance_accepted: [],
    country: "",
    province: "",
    district: "",
    sector: "",
    village: "",
    latitude: "",
    longitude: "",
    is_active: true,
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"
  const [locating, setLocating] = useState(false);
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox" && name === "insurance_accepted") {
      setForm((prev) => {
        const arr = prev.insurance_accepted.includes(value)
          ? prev.insurance_accepted.filter((i) => i !== value)
          : [...prev.insurance_accepted, value];
        return { ...prev, insurance_accepted: arr };
      });
    } else if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle country change
  const handleCountryChange = (e) => {
    const country = e.target.value;
    setForm((prev) => ({
      ...prev,
      country,
      // Reset Rwanda-specific fields if not Rwanda
      province: "",
      district: "",
      sector: "",
      village: "",
      phone: countries.find((c) => c.name === country)?.code || "",
    }));
  };

  // Get location from browser
  const handleGetLocation = () => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setForm((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
          setLocating(false);
        },
        () => {
          setMessage("Could not get location.");
          setLocating(false);
        }
      );
    } else {
      setMessage("Geolocation is not supported by this browser.");
      setLocating(false);
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    try {
      const payload = {
        ...form,
        latitude: form.latitude ? parseFloat(form.latitude) : undefined,
        longitude: form.longitude ? parseFloat(form.longitude) : undefined,
      };
      await axios.post("https://farumasi.onrender.com/api/pharmacies", payload);
      setMessage("Pharmacy registered successfully!");
      setMessageType("success");
      setForm({
        name: "",
        email: "",
        phone: "",
        address: "",
        insurance_accepted: [],
        country: "",
        province: "",
        district: "",
        sector: "",
        village: "",
        latitude: "",
        longitude: "",
        is_active: true,
      });
    } catch (err) {
      setMessage("Error registering pharmacy.");
      setMessageType("error");
    }
  };

  const selectedCountry = countries.find((c) => c.name === form.country);

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded shadow">
      {/* Message at the top */}
      {message && (
        <div
          className={`mb-4 text-center px-4 py-2 rounded ${
            messageType === "success"
              ? "bg-green-100 text-green-700 border border-green-300"
              : "bg-red-100 text-red-700 border border-red-300"
          }`}
        >
          {message}
        </div>
      )}
      <h2 className="text-xl font-bold mb-4 text-green-700">Register Pharmacy</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input className="w-full border px-3 py-2 rounded" name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        <input className="w-full border px-3 py-2 rounded" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />

        {/* Phone with country code */}
        <div className="flex">
          <select
            className="border rounded-l px-2 py-2 bg-gray-100"
            value={selectedCountry?.code || ""}
            onChange={(e) => {
              const code = e.target.value;
              setForm((prev) => ({
                ...prev,
                phone: code,
                country: countries.find((c) => c.code === code)?.name || "",
              }));
            }}
          >
            <option value="">Code</option>
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
          <input
            className="w-full border-t border-b border-r px-3 py-2 rounded-r"
            name="phone"
            placeholder="Phone"
            value={form.phone.startsWith("+") ? form.phone : ""}
            onChange={handleChange}
            required
          />
        </div>

        <input className="w-full border px-3 py-2 rounded" name="address" placeholder="Address" value={form.address} onChange={handleChange} required />

        {/* Insurance checkboxes */}
        <div>
          <div className="mb-1">Insurance Accepted:</div>
          <div className="flex flex-wrap gap-4">
            {insurances.map((ins) => (
              <label key={ins} className="flex items-center space-x-1">
                <input
                  type="checkbox"
                  name="insurance_accepted"
                  value={ins}
                  checked={form.insurance_accepted.includes(ins)}
                  onChange={handleChange}
                />
                <span>{ins}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Country select */}
        <select
          className="w-full border px-3 py-2 rounded"
          name="country"
          value={form.country}
          onChange={handleCountryChange}
          required
        >
          <option value="">Select Country</option>
          {countries.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Rwanda-specific fields */}
        {form.country === "Rwanda" && (
          <>
            <select
              className="w-full border px-3 py-2 rounded"
              name="province"
              value={form.province}
              onChange={handleChange}
              required
            >
              <option value="">Select Province</option>
              {rwandaProvinces.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <input className="w-full border px-3 py-2 rounded" name="district" placeholder="District" value={form.district} onChange={handleChange} />
            <input className="w-full border px-3 py-2 rounded" name="sector" placeholder="Sector" value={form.sector} onChange={handleChange} />
            <input className="w-full border px-3 py-2 rounded" name="village" placeholder="Village" value={form.village} onChange={handleChange} />
          </>
        )}

        {/* Location */}
        <div className="flex space-x-2">
          <input
            className="w-full border px-3 py-2 rounded"
            name="latitude"
            placeholder="Latitude"
            value={form.latitude}
            readOnly
          />
          <input
            className="w-full border px-3 py-2 rounded"
            name="longitude"
            placeholder="Longitude"
            value={form.longitude}
            readOnly
          />
          <button
            type="button"
            className="bg-blue-500 text-white px-2 py-1 rounded"
            onClick={handleGetLocation}
            disabled={locating}
          >
            {locating ? "Locating..." : "Get Location"}
          </button>
        </div>

        <label className="flex items-center space-x-2">
          <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
          <span>Active</span>
        </label>
        <div className="flex justify-end gap-2">
          <button className="bg-green-600 text-white px-4 py-2 rounded" type="submit">
            Register
          </button>
          <button
            type="button"
            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded ml-2"
            onClick={() => navigate("/admin/pharmacies")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}