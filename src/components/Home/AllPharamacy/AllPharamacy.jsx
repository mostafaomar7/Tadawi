// AllPharmacy.jsx
import React, { useEffect, useState } from "react";
import { 
  FaStar, 
  FaCheckCircle, 
  FaPhoneAlt, 
  FaMapMarkerAlt, 
  FaEnvelope, 
  FaClock, 
  FaSearch,
  FaExclamationTriangle
} from "react-icons/fa";

// Skeleton Card Component (for loading state)
const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
    <div className="flex justify-between items-center mb-6">
      <div className="h-6 bg-slate-200 rounded w-3/5"></div>
      <div className="h-5 bg-slate-200 rounded-full w-16"></div>
    </div>
    <div className="space-y-4">
      <div className="h-4 bg-slate-200 rounded w-4/5"></div>
      <div className="h-4 bg-slate-200 rounded w-1/2"></div>
    </div>
    <div className="border-t border-slate-200 mt-6 pt-4 flex justify-between items-center">
      <div className="h-5 bg-slate-200 rounded w-12"></div>
      <div className="h-5 bg-slate-200 rounded w-24"></div>
    </div>
  </div>
);

// Main Component
export default function AllPharmacy() {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Get the auth token from localStorage
    const authToken = localStorage.getItem("authToken");

    // Set the Authorization header
    const headers = {
      "Authorization": `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };

    fetch("http://127.0.0.1:8000/api/v1/pharmacies", { headers })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch data from server");
        return res.json();
      })
      .then((data) => {
        setPharmacies(data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching pharmacies:", err);
        setError("Unable to display pharmacies at this time. Please try again later.");
        setLoading(false);
      });
  }, []);

  const filteredPharmacies = pharmacies.filter((pharmacy) =>
    pharmacy.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderContent = () => {
    if (loading) {
      return Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />);
    }

    if (error) {
      return (
        <div className="col-span-full flex flex-col items-center justify-center text-center bg-red-50 p-8 rounded-lg">
          <FaExclamationTriangle className="text-red-500 text-4xl mb-4" />
          <h2 className="text-xl font-semibold text-red-700">Error</h2>
          <p className="text-red-600 mt-1">{error}</p>
        </div>
      );
    }

    if (filteredPharmacies.length === 0) {
      return (
        <div className="col-span-full text-center text-slate-500 py-12">
          <h2 className="text-xl font-semibold">No pharmacies found</h2>
          <p>Try changing your search keywords.</p>
        </div>
      );
    }

    return filteredPharmacies.map((pharmacy) => (
      <div key={pharmacy.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-slate-800 leading-tight">
              {pharmacy.location}
            </h2>
            {pharmacy.verified && (
              <div className="flex items-center bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">
                <FaCheckCircle className="mr-1.5" />
                Verified
              </div>
            )}
          </div>
          <div className="space-y-2 text-slate-600">
            <div className="flex items-center">
              <FaPhoneAlt className="mr-3 h-4 w-4 text-slate-400" />
              <span>{pharmacy.contact_info.split(",")[0].replace("Phone:", "").trim()}</span>
            </div>
            <div className="flex items-center">
              <FaEnvelope className="mr-3 h-4 w-4 text-slate-400" />
              <span>{pharmacy.contact_info.split(",")[1].replace("Email:", "").trim()}</span>
            </div>
            <div className="flex items-center">
              <FaClock className="mr-3 h-4 w-4 text-slate-400" />
              <span>{pharmacy.contact_info.split(",")[2].replace("Working Hours:", "").trim()}</span>
            </div>
          </div>
          <div className="border-t border-slate-200 mt-5 pt-4 flex justify-between items-center">
            <div className="flex items-center">
              <FaStar className="text-yellow-400 mr-1.5" />
              <span className="text-slate-800 font-semibold">{pharmacy.rating}</span>
              <span className="text-slate-500 text-sm ml-1">/ 5</span>
            </div>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-slate-50 antialiased">
      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight">
            Find a Pharmacy
          </h1>
          <p className="text-lg text-slate-600 mt-3 max-w-2xl mx-auto">
            Browse our network of trusted pharmacies near you.
          </p>
        </header>

        {/* Search Bar */}
        <div className="mb-8 max-w-lg mx-auto">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by location (e.g., 'Cairo')..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            />
          </div>
        </div>

        {/* Pharmacy Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
