import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const insurances = ["RSSB", "SANLAM", "MMI", "Radiant", "Other"];
const rwandaProvinces = [
  "Kigali City",
  "Northern",
  "Southern",
  "Eastern",
  "Western",
];

export default function EditPharmacy() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [locating, setLocating] = useState(false);
  const topRef = useRef(null);

  useEffect(() => {
    axios
      .get(`https://farumasi.onrender.com/api/pharmacies/${id}`)
      .then((res) => {
        const pharmacy = res.data.data || res.data;
        setForm({
          ...pharmacy,
          insurance_accepted: pharmacy.insurance_accepted || [],
          location: {
            ...pharmacy.location,
            coordinate: {
              latitude: pharmacy.location?.coordinate?.latitude || "",
              longitude: pharmacy.location?.coordinate?.longitude || "",
            },
          },
        });
      })
      .catch(() => setMessage("Failed to load pharmacy."));
  }, [id]);

  useEffect(() => {
    if (message && topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [message]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox" && name === "insurance_accepted") {
      setForm((prev) => {
        const arr = prev.insurance_accepted.includes(value)
          ? prev.insurance_accepted.filter((i) => i !== value)
          : [...prev.insurance_accepted, value];
        return { ...prev, insurance_accepted: arr };
      });
    } else if (
      ["country", "province", "district", "sector", "village"].includes(name)
    ) {
      setForm((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [name]: value,
        },
      }));
    } else if (["latitude", "longitude"].includes(name)) {
      setForm((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          coordinate: {
            ...prev.location.coordinate,
            [name]: value,
          },
        },
      }));
    } else if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleGetLocation = () => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setForm((prev) => ({
            ...prev,
            location: {
              ...prev.location,
              coordinate: {
                ...prev.location.coordinate,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              },
            },
          }));
          setLocating(false);
        },
        () => {
          setMessage("Could not get location.");
          setMessageType("error");
          setLocating(false);
        }
      );
    } else {
      setMessage("Geolocation is not supported by this browser.");
      setMessageType("error");
      setLocating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    try {
      // Flatten location fields to root level for backend
      const payload = {
        ...form,
        country: form.location?.country,
        province: form.location?.province,
        district: form.location?.district,
        sector: form.location?.sector,
        village: form.location?.village,
        latitude: parseFloat(form.location?.coordinate?.latitude) || undefined,
        longitude: parseFloat(form.location?.coordinate?.longitude) || undefined,
      };
      delete payload.location; // Remove nested location object

      await axios.put(`https://farumasi.onrender.com/api/pharmacies/${id}`, payload);
      setMessage("Pharmacy updated successfully!");
      setMessageType("success");
      setTimeout(() => navigate(`/admin/pharmacies/${id}`), 1200);
    } catch (err) {
      setMessage("Error updating pharmacy.");
      setMessageType("error");
    }
  };

  if (!form) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <div ref={topRef}></div>
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
      <h2 className="text-xl font-bold mb-4 text-green-700">Edit Pharmacy</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input className="w-full border px-3 py-2 rounded" name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        <input className="w-full border px-3 py-2 rounded" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input className="w-full border px-3 py-2 rounded" name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} required />
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

        {/* Country and Rwanda-specific fields */}
        <input
          className="w-full border px-3 py-2 rounded"
          name="country"
          placeholder="Country"
          value={form.location?.country || ""}
          onChange={handleChange}
          required
        />

        {form.location?.country === "Rwanda" && (
          <>
            <select
              className="w-full border px-3 py-2 rounded"
              name="province"
              value={form.location?.province || ""}
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
            <input className="w-full border px-3 py-2 rounded" name="district" placeholder="District" value={form.location?.district || ""} onChange={handleChange} />
            <input className="w-full border px-3 py-2 rounded" name="sector" placeholder="Sector" value={form.location?.sector || ""} onChange={handleChange} />
            <input className="w-full border px-3 py-2 rounded" name="village" placeholder="Village" value={form.location?.village || ""} onChange={handleChange} />
          </>
        )}

        {/* Location with Get Location button */}
        <div className="flex space-x-2">
          <input
            className="w-full border px-3 py-2 rounded"
            name="latitude"
            placeholder="Latitude"
            value={form.location?.coordinate?.latitude || ""}
            onChange={handleChange}
          />
          <input
            className="w-full border px-3 py-2 rounded"
            name="longitude"
            placeholder="Longitude"
            value={form.location?.coordinate?.longitude || ""}
            onChange={handleChange}
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
        <div className="flex justify-end space-x-2">
          <button className="bg-green-600 text-white px-4 py-2 rounded" type="submit">
            Save Changes
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