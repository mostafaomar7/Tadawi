import React, { useEffect, useState } from "react";
import { 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaPhoneAlt, 
  FaMapMarkerAlt, 
  FaClock, 
  FaUser 
} from "react-icons/fa";
import { BASE_URL } from "../../../config";
import { useNavigate } from "react-router-dom"; // استدعاء useNavigate

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

export default function DonateList() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate(); // استخدام الـ hook

  useEffect(() => {
    const token = localStorage.getItem('authToken'); 

    fetch(`${BASE_URL}donations-available`, {
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
        setError("Unable to fetch donations at this time.");
        setLoading(false);
      });
  }, []);

  const handleAddDonate = () => {
    navigate("/add-dontation"); // الانتقال للرووت
  };

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

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header مع زرار Add Donate */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div className="text-center md:text-left mb-4 md:mb-0">
          <h1 className="text-4xl font-bold text-slate-800">Available Donations</h1>
          <p className="text-gray-600 mt-2 max-w-2xl">
            Browse available medicine donations from our donors.
          </p>
        </div>
        <button
          onClick={handleAddDonate}
          style={{border:"1px solid #fff",
            padding :"15px",
            fontSize :"22px",
            width : "180px"
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-full font-semibold transition duration-200"
        >
          Add Donate
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {donations.map((donation) => (
          <div key={donation.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800">{donation.location}</h2>
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
              <div className="flex items-center"><FaUser className="mr-2" /> {donation.user.name}</div>
              <div className="flex items-center"><FaPhoneAlt className="mr-2" /> {donation.user.phone_number}</div>
              <div className="flex items-center"><FaClock className="mr-2" /> {donation.contact_info.split(",")[1].replace("Available:", "").trim()}</div>
              <div className="flex items-center"><FaMapMarkerAlt className="mr-2" /> {donation.location}</div>
              <div className="text-sm font-semibold mt-2">Status: {donation.status}</div>
            </div>

            <div className="border-t border-slate-200 pt-3">
              <h3 className="font-semibold text-slate-800 mb-2">Medicines:</h3>
              {donation.medicines.map((med) => (
                <div key={med.id} className="mb-2 p-2 border rounded bg-slate-50">
                  <div className="flex justify-between text-sm font-medium text-slate-700">
                    <span>{med.brand_name} ({med.form})</span>
                    <span>{med.pivot.quantity} pcs</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Dosage: {med.dosage_strength} | Manufacturer: {med.manufacturer} | Expiry: {med.pivot.expiry_date} | Batch: {med.pivot.batch_num}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
