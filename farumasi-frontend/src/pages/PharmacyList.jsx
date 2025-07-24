import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function PharmacyList() {
  const [pharmacies, setPharmacies] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Pagination and show all
  const [pharmacyPage, setPharmacyPage] = useState(0);
  const [showAllPharmacies, setShowAllPharmacies] = useState(false);
  const PHARMACIES_PER_PAGE = 5;

  // Filters and search
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [province, setProvince] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("name");

  // Debounce search input
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(handler);
  }, [search]);

  const navigate = useNavigate();

  // Fetch pharmacies
  useEffect(() => {
    setLoading(true);
    let params = {
      search: debouncedSearch,
      country,
      province,
      status,
      sort,
    };
    // Remove empty params
    Object.keys(params).forEach((k) => params[k] === "" && delete params[k]);
    axios
      .get("https://farumasi.onrender.com/api/pharmacies", { params })
      .then((res) => {
        setPharmacies(res.data.data || []);
        setCount(res.data.count || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [debouncedSearch, country, province, status, sort]);

  // Memoize filtered and sorted pharmacies
  const filteredPharmacies = useMemo(() => {
    let result = pharmacies;
    if (debouncedSearch) {
      result = result.filter(
        (pharmacy) =>
          pharmacy.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          pharmacy.email.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }
    if (country) {
      result = result.filter((pharmacy) => pharmacy.location?.country === country);
    }
    if (province) {
      result = result.filter((pharmacy) => pharmacy.location?.province === province);
    }
    if (status) {
      result = result.filter(
        (pharmacy) =>
          (status === "active" && pharmacy.is_active) ||
          (status === "inactive" && !pharmacy.is_active)
      );
    }
    if (sort === "name") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "email") {
      result = [...result].sort((a, b) => a.email.localeCompare(b.email));
    }
    return result;
  }, [pharmacies, debouncedSearch, country, province, status, sort]);

  // Pagination logic
  const totalPages = Math.ceil(filteredPharmacies.length / PHARMACIES_PER_PAGE);
  const paginatedPharmacies = showAllPharmacies
    ? filteredPharmacies
    : filteredPharmacies.slice(
        pharmacyPage * PHARMACIES_PER_PAGE,
        (pharmacyPage + 1) * PHARMACIES_PER_PAGE
      );

  // Unique countries/provinces for filters
  const countries = [
    ...new Set(pharmacies.map((p) => p.location?.country).filter(Boolean)),
  ];
  const provinces = [
    ...new Set(pharmacies.map((p) => p.location?.province).filter(Boolean)),
  ];

  // Handlers
  const handleNext = () => setPharmacyPage((prev) => Math.min(prev + 1, totalPages - 1));
  const handlePrev = () => setPharmacyPage((prev) => Math.max(prev - 1, 0));
  const handleShowAll = () => setShowAllPharmacies(true);
  const handleShowLess = () => {
    setShowAllPharmacies(false);
    setPharmacyPage(0);
  };
  const handleReset = () => {
    setSearch("");
    setCountry("");
    setProvince("");
    setStatus("");
    setSort("name");
    setPharmacyPage(0);
  };

  // Remove pharmacy and its products
  const handleDeletePharmacy = async (id) => {
    if (!window.confirm("Are you sure you want to delete this pharmacy and all its products?")) return;
    setDeletingId(id);
    try {
      await axios.delete(`https://farumasi.onrender.com/api/pharmacies/${id}`);
      // Optionally, you may want to also call DELETE /api/products?pharmacy_id=id if your backend supports it,
      // but usually backend should cascade delete products when pharmacy is deleted.
      setPharmacies(pharmacies.filter(ph => ph.id !== id));
    } catch (err) {
      alert("Failed to delete pharmacy.");
    }
    setDeletingId(null);
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-green-700">Registered Pharmacies</h2>

      {/* Filters and Search Bar */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 flex flex-wrap gap-3 items-center">
        <input
          className="border px-2 py-1 rounded w-48"
          placeholder="Search by name or email"
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
          value={country}
          onChange={(e) => {
            setCountry(e.target.value);
            setPharmacyPage(0);
          }}
        >
          <option value="">All Countries</option>
          {countries.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          className="border px-2 py-1 rounded"
          value={province}
          onChange={(e) => {
            setProvince(e.target.value);
            setPharmacyPage(0);
          }}
        >
          <option value="">All Provinces</option>
          {provinces.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select
          className="border px-2 py-1 rounded"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPharmacyPage(0);
          }}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select
          className="border px-2 py-1 rounded"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="name">Sort by Name</option>
          <option value="email">Sort by Email</option>
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
      <div className={showAllPharmacies ? "max-h-96 overflow-y-auto" : ""}>
        <table className="w-full">
          <thead>
            <tr className="bg-green-100">
              <th className="p-3 font-semibold text-left">Name</th>
              <th className="p-3 font-semibold text-left">Email</th>
              <th className="p-3 font-semibold text-left">Phone</th>
              <th className="p-3 font-semibold text-left">Country</th>
              <th className="p-3 font-semibold text-left">Province</th>
              <th className="p-3 font-semibold text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPharmacies.map((pharmacy) => (
              <tr
                key={pharmacy.id}
                className="hover:bg-green-50 transition"
              >
                <td className="p-3">{pharmacy.name}</td>
                <td className="p-3">
                  <a
                    href={`mailto:${pharmacy.email}`}
                    className="text-blue-700 underline"
                  >
                    {pharmacy.email}
                  </a>
                </td>
                <td className="p-3">{pharmacy.phone}</td>
                <td className="p-3">{pharmacy.location?.country}</td>
                <td className="p-3">{pharmacy.location?.province}</td>
                <td className="p-3 flex gap-2">
                  <Link
                    to="#"
                    onClick={() => setSelectedPharmacy(pharmacy)}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </Link>
                  <span>|</span>
                  <Link
                    to={`/admin/pharmacies/${pharmacy.id}/edit`}
                    className="text-green-600 hover:underline"
                  >
                    Edit
                  </Link>
                  <span>|</span>
                  <button
                    className={`text-red-600 hover:underline ${deletingId === pharmacy.id ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={() => handleDeletePharmacy(pharmacy.id)}
                    disabled={deletingId === pharmacy.id}
                  >
                    {deletingId === pharmacy.id ? "Removing..." : "Remove"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination and Show More/Less */}
      {filteredPharmacies.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          {!showAllPharmacies && (
            <>
              <button
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                onClick={handlePrev}
                disabled={pharmacyPage === 0}
              >
                Prev
              </button>
              <span>
                Showing {pharmacyPage * PHARMACIES_PER_PAGE + 1} - {Math.min((pharmacyPage + 1) * PHARMACIES_PER_PAGE, filteredPharmacies.length)} of {filteredPharmacies.length}
              </span>
              <button
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                onClick={handleNext}
                disabled={pharmacyPage >= totalPages - 1}
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
          {showAllPharmacies && (
            <button
              className="px-3 py-1 bg-blue-500 text-white rounded"
              onClick={handleShowLess}
            >
              Show Less
            </button>
          )}
        </div>
      )}

      {/* Add Pharmacy Button at the Bottom */}
      <div className="flex justify-end mt-8">
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-bold shadow"
          onClick={() => navigate("/admin/register-pharmacy")}
        >
          + Add Pharmacy
        </button>
      </div>

      {/* Modal for Pharmacy Details */}
      {selectedPharmacy && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 max-w-xl w-full relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-3xl font-bold rounded-full w-10 h-10 flex items-center justify-center transition"
              onClick={() => setSelectedPharmacy(null)}
              aria-label="Close"
              style={{ lineHeight: 1 }}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-green-700">{selectedPharmacy.name}</h2>
            <div className="mb-2"><b>Email:</b> <a href={`mailto:${selectedPharmacy.email}`} className="text-blue-700 underline">{selectedPharmacy.email}</a></div>
            <div className="mb-2"><b>Phone:</b> {selectedPharmacy.phone}</div>
            <div className="mb-2"><b>Address:</b> {selectedPharmacy.address}</div>
            <div className="mb-2"><b>Insurance Accepted:</b> {(selectedPharmacy.insurance_accepted || []).join(", ")}</div>
            <div className="mb-2"><b>Country:</b> {selectedPharmacy.location?.country}</div>
            <div className="mb-2"><b>Province:</b> {selectedPharmacy.location?.province}</div>
            <div className="mb-2"><b>District:</b> {selectedPharmacy.location?.district}</div>
            <div className="mb-2"><b>Sector:</b> {selectedPharmacy.location?.sector}</div>
            <div className="mb-2"><b>Village:</b> {selectedPharmacy.location?.village}</div>
            <div className="mb-2">
              <b>Latitude:</b> {selectedPharmacy.location?.coordinate?.latitude ?? <span className="text-red-500">Not set</span>}
            </div>
            <div className="mb-2">
              <b>Longitude:</b> {selectedPharmacy.location?.coordinate?.longitude ?? <span className="text-red-500">Not set</span>}
            </div>
            <div className="mb-2"><b>Status:</b> {selectedPharmacy.is_active ? "Active" : "Inactive"}</div>
            <div className="mt-4 flex gap-4">
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                onClick={() => {
                  setSelectedPharmacy(null);
                  navigate(`/admin/pharmacies/${selectedPharmacy.id}/edit`);
                }}
              >
                Edit
              </button>
              <button
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                onClick={() => setSelectedPharmacy(null)}
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