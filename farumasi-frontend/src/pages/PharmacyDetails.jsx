import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

export default function PharmacyDetails() {
  const { id } = useParams();
  const [pharmacy, setPharmacy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/pharmacies/${id}`)
      .then((res) => {
        setPharmacy(res.data.data || res.data); // support both {data: {...}} and {...}
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!pharmacy) return <div className="p-8 text-red-600">Pharmacy not found.</div>;

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-green-700">{pharmacy.name}</h2>
      <div className="mb-2"><b>Email:</b> {pharmacy.email}</div>
      <div className="mb-2"><b>Phone:</b> {pharmacy.phone}</div>
      <div className="mb-2"><b>Address:</b> {pharmacy.address}</div>
      <div className="mb-2"><b>Insurance Accepted:</b> {(pharmacy.insurance_accepted || []).join(", ")}</div>
      <div className="mb-2"><b>Country:</b> {pharmacy.location?.country}</div>
      <div className="mb-2"><b>Province:</b> {pharmacy.location?.province}</div>
      <div className="mb-2"><b>District:</b> {pharmacy.location?.district}</div>
      <div className="mb-2"><b>Sector:</b> {pharmacy.location?.sector}</div>
      <div className="mb-2"><b>Village:</b> {pharmacy.location?.village}</div>
      <div className="mb-2">
        <b>Latitude:</b> {pharmacy.location?.coordinate?.latitude ?? <span className="text-red-500">Not set</span>}
      </div>
      <div className="mb-2">
        <b>Longitude:</b> {pharmacy.location?.coordinate?.longitude ?? <span className="text-red-500">Not set</span>}
      </div>
      <div className="mb-2"><b>Status:</b> {pharmacy.is_active ? "Active" : "Inactive"}</div>
      <div className="mt-4">
        <Link to={`/admin/pharmacies/${pharmacy.id}/edit`} className="text-green-600 hover:underline mr-4">
          Edit
        </Link>
        <Link to="/admin/pharmacies" className="text-blue-600 hover:underline">
          Back to List
        </Link>
      </div>
    </div>
  );
}