// MyDonation.jsx
import React, { useEffect, useState } from "react";
import { 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaClock, 
  FaCapsules 
} from "react-icons/fa";
import { BASE_URL } from "../../../config";

const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
    <div className="flex justify-between items-center mb-4">
      <div className="h-6 bg-slate-200 rounded w-3/5"></div>
      <div className="h-5 bg-slate-200 rounded w-16"></div>
    </div>
    <div className="space-y-2">
      <div className="h-4 bg-slate-200 rounded w-4/5"></div>
      <div className="h-4 bg-slate-200 rounded w-3/5"></div>
    </div>
  </div>
);

export default function MyDonation() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken"); // توكن المستخدم

    fetch(`${BASE_URL}donations`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch donations");
        return res.json();
      })
      .then((data) => {
        setDonations(data.data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to fetch your donations at this time.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {Array.from({ length: 4 }).map((_, idx) => <SkeletonCard key={idx} />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg">
        <FaExclamationTriangle className="text-red-500 text-4xl mb-4" />
        <h2 className="text-xl font-semibold text-red-700">Error</h2>
        <p className="text-red-600 mt-1">{error}</p>
      </div>
    );
  }

  if (donations.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12">
        <h2 className="text-xl font-semibold">You have no donations yet</h2>
        <p className="mt-2">Start by adding a new donation.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-slate-800">My Donations</h1>
        <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
          Here are the donations you have submitted.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {donations.map((donation) => (
          <div key={donation.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800">{donation.location || "No location provided"}</h2>
              {donation.verified ? (
                <div className="flex items-center bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">
                  <FaCheckCircle className="mr-1.5" /> Verified
                </div>
              ) : (
                <div className="flex items-center bg-yellow-100 text-yellow-700 text-xs font-bold px-2.5 py-1 rounded-full">
                  <FaExclamationTriangle className="mr-1.5" /> Unverified
                </div>
              )}
            </div>

            <div className="space-y-2 text-slate-600 mb-3">
              <div><strong>Contact:</strong> {donation.contact_info}</div>
              <div><strong>Status:</strong> {donation.status}</div>
              <div><strong>Sealed Confirmed:</strong> {donation.sealed_confirmed ? "Yes" : "No"}</div>
            </div>

            <div className="border-t border-slate-200 pt-3">
              <h3 className="font-semibold text-slate-800 mb-2 flex items-center">
                <FaCapsules className="mr-2" /> Medicines
              </h3>
              {donation.medicines.map((med) => (
                <div key={med.id} className="mb-2 p-2 border rounded bg-slate-50">
                  <div className="flex justify-between text-sm font-medium text-slate-700">
                    <span>{med.brand_name} ({med.form})</span>
                    <span>{med.pivot.quantity} pcs</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Dosage: {med.dosage_strength} | Manufacturer: {med.manufacturer} | Expiry: {med.pivot.expiry_date} | Batch: {med.pivot.batch_num || "N/A"}
                  </div>
                </div>
              ))}

              {donation.photos.length > 0 && (
                <div className="mt-3">
                  <h4 className="font-semibold text-slate-800 mb-1">Photos:</h4>
                  <div className="flex flex-wrap gap-2">
                    {donation.photos.map((photo) => (
                      <img
                        key={photo.id}
                        src={`${BASE_URL}/${photo.photo_path}`}
                        alt="Donation"
                        className="w-24 h-24 object-cover rounded"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
