import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import API_BASE_URL from '../config/config';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [pharmacies, setPharmacies] = useState([]);
  const [pharmacyFilter, setPharmacyFilter] = useState("");
  const [pharmacyDropdownOpen, setPharmacyDropdownOpen] = useState(false);
  const [pharmacySearch, setPharmacySearch] = useState("");
  const [prescriptionFilter, setPrescriptionFilter] = useState(""); // Add this line
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [productPage, setProductPage] = useState(0);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const pharmacyDropdownRef = useRef(null);
  const navigate = useNavigate();

  const PRODUCTS_PER_PAGE = 5;
  const totalPages = Math.ceil(filtered.length / PRODUCTS_PER_PAGE);

  // Paginated products
  const paginatedProducts = showAllProducts
    ? filtered
    : filtered.slice(productPage * PRODUCTS_PER_PAGE, (productPage + 1) * PRODUCTS_PER_PAGE);

  useEffect(() => {
    fetchProducts();
    fetchPharmacies();
  }, []);

  useEffect(() => {
    let data = [...products];
    if (search) {
      data = data.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
      );
    }
    if (pharmacyFilter) {
      data = data.filter(p => String(p.pharmacy_id) === pharmacyFilter);
    }
    if (prescriptionFilter !== "") {
      data = data.filter(p =>
        prescriptionFilter === "yes"
          ? p.requires_prescription
          : !p.requires_prescription
      );
    }
    data.sort((a, b) => {
      if (!a[sortKey] || !b[sortKey]) return 0;
      if (sortOrder === "asc") return a[sortKey] > b[sortKey] ? 1 : -1;
      return a[sortKey] < b[sortKey] ? 1 : -1;
    });
    setFiltered(data);
  }, [products, search, sortKey, sortOrder, pharmacyFilter, prescriptionFilter]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (pharmacyDropdownRef.current && !pharmacyDropdownRef.current.contains(event.target)) {
        setPharmacyDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/products`);
      setProducts(res.data.data || []);
    } catch (err) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const fetchPharmacies = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/pharmacies?limit=100`);
      setPharmacies(res.data.data || []);
    } catch (err) {
      // handle error
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/products/${id}`);
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      // handle error
    }
  };

  const handleRowClick = async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/products/${id}`);
      setSelectedProduct(res.data);
      setShowDetails(true);
    } catch {
      setSelectedProduct(null);
      setShowDetails(false);
    }
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedProduct(null);
  };

  const filteredPharmacies = pharmacySearch
    ? pharmacies.filter(ph =>
        ph.name.toLowerCase().includes(pharmacySearch.toLowerCase())
      )
    : pharmacies;

  // Reset all filters and search
  const handleReset = () => {
    setSearch("");
    setPharmacyFilter("");
    setPharmacySearch("");
    setPrescriptionFilter("");
    setSortKey("name");
    setSortOrder("asc");
  };

  if (loading) return <div className="p-8 text-center text-gray-600">Loading products...</div>;

  return (
    <div className="max-w-6xl mx-auto mt-8 p-6 bg-white rounded shadow relative">
      {/* Product Details Overlay */}
      {showDetails && selectedProduct && (
        <div className="fixed inset-0 z-40 flex items-start justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded shadow-lg p-8 mt-16 max-w-lg w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-2xl"
              onClick={handleCloseDetails}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4 text-green-700">{selectedProduct.name}</h2>
            {selectedProduct.image_url && (
              <img src={selectedProduct.image_url} alt={selectedProduct.name} className="w-40 h-40 object-cover rounded mb-4 mx-auto" />
            )}
            <div className="mb-2"><span className="font-semibold">Category:</span> {selectedProduct.category}</div>
            <div className="mb-2"><span className="font-semibold">Price:</span> RWF {selectedProduct.price}</div>
            <div className="mb-2"><span className="font-semibold">Pharmacy:</span> {selectedProduct.pharmacy_name}</div>
            <div className="mb-2"><span className="font-semibold">Requires Prescription:</span> {selectedProduct.requires_prescription ? "Yes" : "No"}</div>
            <div className="mb-2"><span className="font-semibold">Description:</span> {selectedProduct.description || "N/A"}</div>
            <div className="flex gap-4 mt-6">
              <button
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                onClick={() => {
                  setShowDetails(false);
                  navigate(`/admin/products/${selectedProduct.id}/edit`);
                }}
              >
                Edit
              </button>
              <button
                className="border px-4 py-2 rounded text-gray-700 hover:bg-gray-100"
                onClick={handleCloseDetails}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h2 className="text-xl font-bold text-green-700">Products</h2>
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Search by name or category"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border rounded px-3 py-2"
          />
          {/* Pharmacy dropdown with search */}
          <div className="relative" ref={pharmacyDropdownRef}>
            <button
              type="button"
              className="border rounded px-3 py-2 bg-white flex items-center min-w-[180px]"
              onClick={() => setPharmacyDropdownOpen(v => !v)}
            >
              {pharmacyFilter
                ? pharmacies.find(ph => String(ph.id) === pharmacyFilter)?.name || "Select Pharmacy"
                : "All Pharmacies"}
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {pharmacyDropdownOpen && (
              <div className="absolute z-10 bg-white border rounded shadow mt-1 w-full max-h-60 overflow-y-auto">
                <div className="p-2">
                  <input
                    type="text"
                    placeholder="Search pharmacy..."
                    value={pharmacySearch}
                    onChange={e => setPharmacySearch(e.target.value)}
                    className="border rounded px-2 py-1 w-full"
                  />
                </div>
                <div>
                  <div
                    className={`px-4 py-2 cursor-pointer hover:bg-sky-50 ${pharmacyFilter === "" ? "font-bold text-green-700" : ""}`}
                    onClick={() => {
                      setPharmacyFilter("");
                      setPharmacyDropdownOpen(false);
                      setPharmacySearch("");
                    }}
                  >
                    All Pharmacies
                  </div>
                  {filteredPharmacies.map(ph => (
                    <div
                      key={ph.id}
                      className={`px-4 py-2 cursor-pointer hover:bg-sky-50 ${String(ph.id) === pharmacyFilter ? "font-bold text-green-700" : ""}`}
                      onClick={() => {
                        setPharmacyFilter(String(ph.id));
                        setPharmacyDropdownOpen(false);
                        setPharmacySearch("");
                      }}
                    >
                      {ph.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <select
            value={sortKey}
            onChange={e => setSortKey(e.target.value)}
            className="border rounded px-2 py-2"
          >
            <option value="name">Name</option>
            <option value="category">Category</option>
            <option value="price">Price</option>
          </select>
          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value)}
            className="border rounded px-2 py-2"
          >
            <option value="asc">Asc</option>
            <option value="desc">Desc</option>
          </select>
          <select
            value={prescriptionFilter}
            onChange={e => setPrescriptionFilter(e.target.value)}
            className="border rounded px-2 py-2"
          >
            <option value="">All</option>
            <option value="yes">Prescription Required</option>
            <option value="no">No Prescription</option>
          </select>
          <button
            type="button"
            onClick={handleReset}
            className="border px-4 py-2 rounded text-gray-700 hover:bg-gray-100"
          >
            Reset
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className={showAllProducts ? "max-h-[400px] overflow-y-auto" : ""}>
          <table className="w-full">
            <thead>
              <tr className="bg-sky-100 text-left">
                <th className="p-3 font-semibold">Name</th>
                <th className="p-3 font-semibold">Category</th>
                <th className="p-3 font-semibold">Price</th>
                <th className="p-3 font-semibold">Pharmacy</th>
                <th className="p-3 font-semibold">Prescription</th>
                <th className="p-3 font-semibold">Image</th>
                <th className="p-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map(product => (
                <tr
                  key={product.id}
                  className="hover:bg-sky-50 cursor-pointer transition"
                  onClick={() => handleRowClick(product.id)}
                >
                  <td className="p-3">{product.name}</td>
                  <td className="p-3">{product.category}</td>
                  <td className="p-3">RWF {product.price}</td>
                  <td className="p-3">{product.pharmacy_name}</td>
                  <td className="p-3">{product.requires_prescription ? "Yes" : "No"}</td>
                  <td className="p-3">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-12 h-12 object-cover rounded" />
                    ) : "No image"}
                  </td>
                  <td className="p-3 flex gap-2" onClick={e => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => {
                        handleRowClick(product.id);
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        navigate(`/admin/products/${product.id}/edit`);
                      }}
                      className="text-green-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        handleDelete(product.id);
                      }}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination and Show More/Less Controls */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50">
            <div>
              {!showAllProducts && (
                <>
                  <button
                    className="px-3 py-1 rounded bg-sky-100 text-sky-700 mr-2 disabled:opacity-50"
                    onClick={() => setProductPage(p => Math.max(p - 1, 0))}
                    disabled={productPage === 0}
                  >
                    Prev
                  </button>
                  <button
                    className="px-3 py-1 rounded bg-sky-100 text-sky-700 disabled:opacity-50"
                    onClick={() => setProductPage(p => Math.min(p + 1, totalPages - 1))}
                    disabled={productPage >= totalPages - 1}
                  >
                    Next
                  </button>
                </>
              )}
            </div>
            <div>
              {showAllProducts ? (
                <button
                  className="px-3 py-1 rounded bg-green-100 text-green-700"
                  onClick={() => setShowAllProducts(false)}
                >
                  Show Less
                </button>
              ) : (
                <button
                  className="px-3 py-1 rounded bg-green-100 text-green-700"
                  onClick={() => setShowAllProducts(true)}
                >
                  Show More
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      {filtered.length === 0 && (
        <div className="text-center text-gray-500 py-8">No products found.</div>
      )}
      <div className="mt-6 flex justify-end">
        <Link to="/admin/products/add" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          + Add Product
        </Link>
      </div>
    </div>
  );
}