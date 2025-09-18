// DonationDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { BASE_URL } from "../../../config";
import {
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaClock,
  FaUser,
  FaPills,
} from "react-icons/fa";

export default function DonationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const locationHook = useLocation();
  const fromMyDonation = locationHook.state?.fromMyDonation || false;

  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // form state
  const [contactInfo, setContactInfo] = useState("");
  const [location, setLocation] = useState("");
  const [sealedConfirmed, setSealedConfirmed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    console.log("BASE_URL:", BASE_URL);

    fetch(`${BASE_URL}donations/${id}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch donation details");
        return res.json();
      })
      .then((data) => {
        setDonation(data.data);
        setContactInfo(data.data.contact_info || "");
        setLocation(data.data.location || "");
        setSealedConfirmed(data.data.sealed_confirmed || false);
        setLoading(false);
      })
      .catch(() => {
        setError("Unable to fetch donation details.");
        setLoading(false);
      });
  }, [id]);

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this donation?"
    );
    if (!confirmDelete) return;

    const token = localStorage.getItem("authToken");
    try {
      const res = await fetch(`${BASE_URL}donations/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete donation");

      alert("Donation deleted successfully");
      navigate("/my-donations");
    } catch (error) {
      alert("Error deleting donation");
    }
  };

  const handleUpdate = async () => {
    const token = localStorage.getItem("authToken");
    setUpdating(true);

    try {
      console.log("PUT URL:", `${BASE_URL}donations/${id}`);

      const res = await fetch(`${BASE_URL}donations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          contact_info: contactInfo,
          location,
          sealed_confirmed: sealedConfirmed,
          medicines: donation.medicines.map((m) => ({
            medicine_id: m.id,
            quantity: m.pivot.quantity,
            expiry_date: m.pivot.expiry_date,
          })),
          packaging_photos: donation.photos.map((p) => p.id),
          status: donation.status,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data.errors);
        throw new Error(data.message || "Failed to update donation");
      }

      setDonation(data.data); // ✅ تحديث البيانات
      setShowForm(false);
      alert("Donation updated successfully");
    } catch (error) {
      alert(error.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-slate-500">Loading...</div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 text-red-700 px-6 py-3 rounded-lg shadow">
          {error}
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        {/* Header */}
        <h1 className="text-3xl font-bold text-slate-800 mb-6">
          Donation at {donation.location ? donation.location : "Not provided"}
        </h1>

        {/* Donor Info */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="flex items-center p-3 border rounded-lg bg-slate-50">
            <FaUser className="text-slate-500 mr-2" /> {donation.user.name}
          </div>
          <div className="flex items-center p-3 border rounded-lg bg-slate-50">
            <FaPhoneAlt className="text-slate-500 mr-2" />{" "}
            {donation.user.phone_number}
          </div>
          <div className="flex items-center p-3 border rounded-lg bg-slate-50">
            <FaClock className="text-slate-500 mr-2" /> {donation.contact_info}
          </div>
          <div className="flex items-center p-3 border rounded-lg bg-slate-50">
            <FaMapMarkerAlt className="text-slate-500 mr-2" />{" "}
            {donation.location ? donation.location : "Not provided"}
          </div>
        </div>

        {/* Photos */}
        {donation.photos && donation.photos.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">
              Donation Photos
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {donation.photos.map((photo) => (
                <img
                  key={photo.id}
                  src={`${BASE_URL}storage/${photo.photo_path}`}
                  alt="Donation"
                  className="rounded-lg shadow-md border object-cover w-full h-40"
                />
              ))}
            </div>
          </div>
        )}

        {/* Medicines */}
        <h2 className="text-2xl font-semibold text-slate-800 mb-4 flex items-center">
          <FaPills className="mr-2 text-blue-600" /> Medicines
        </h2>
        <div className="space-y-3">
          {donation.medicines.map((med) => (
            <div
              key={med.id}
              className="p-4 border rounded-lg shadow-sm hover:shadow-md transition bg-slate-50"
            >
              <div className="font-medium text-lg text-slate-800">
                {med.brand_name} <span className="text-sm">({med.form})</span>
              </div>
              <div className="text-sm text-slate-600 mt-1">
                Dosage: {med.dosage_strength} | Qty: {med.pivot.quantity} |
                Expiry: {med.pivot.expiry_date}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        {fromMyDonation && (
          <div className="flex justify-end gap-3 mt-8">
            <button
              onClick={() => setShowForm(true)}
              className="px-5 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
            >
              Update
            </button>
            <button
              onClick={handleDelete}
              className="px-5 py-2 bg-red-600 text-white rounded-xl shadow hover:bg-red-700 transition"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Update Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Update Donation</h2>

            <label className="block mb-3">
              <span className="text-sm text-slate-600">Contact Info</span>
              <input
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                className="mt-1 w-full border rounded-lg p-2"
              />
            </label>

            <label className="block mb-3">
              <span className="text-sm text-slate-600">Location</span>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-1 w-full border rounded-lg p-2"
              />
            </label>

            <label className="flex items-center mb-4 gap-2">
              <input
                type="checkbox"
                checked={sealedConfirmed}
                onChange={(e) => setSealedConfirmed(e.target.checked)}
              />
              <span className="text-sm text-slate-600">
                Confirm medicine is sealed
              </span>
            </label>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdate}
                disabled={updating}
                className={`px-4 py-2 rounded-lg text-white ${
                  updating
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {updating ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
