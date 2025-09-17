import React, { useState } from "react";
import {
  Search as SearchIcon,
  Pill,
  MapPin,
  Package,
  DollarSign,
  Phone,
} from "lucide-react";

// Helper to get user location
function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("Geolocation is not supported by your browser");
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => reject(error.message)
      );
    }
  });
}

const AlternativeSearch = () => {
  const token = localStorage.getItem("authToken");
  const [query, setQuery] = useState("");
  const [aiResults, setAiResults] = useState([]);
  const [aiUnavailable, setAiUnavailable] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiRequested, setAiRequested] = useState(false);

  const userDrugs = ["Metformin"];

  const handleAISearch = async () => {
    if (!query.trim()) {
      setAiError(
        "Please enter a medicine name before searching for alternatives."
      );
      return;
    }
    setAiLoading(true);
    setAiError(null);
    setAiResults([]);
    setAiUnavailable([]);
    setAiRequested(true);

    try {
      const { lat, lng } = await getUserLocation();
      const body = {
        name: query.trim(),
        lat,
        lng,
        user_drugs: userDrugs,
      };

      const response = await fetch(
        "http://127.0.0.1:8000/api/v1/search/with-alternatives",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) throw new Error("Failed to fetch AI alternatives");

      const data = await response.json();
      setAiResults(data.results || []);
      setAiUnavailable(data.unavailable || []);
    } catch (err) {
      setAiError(err.message);
      console.error("AI search error:", err);
    } finally {
      setAiLoading(false);
    }
  };

  const renderMedicineCard = (item) => (
    <div
      key={item.pharmacy_id}
      className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition"
    >
      <div className="flex items-center mb-3">
        <Pill className="mr-2 text-blue-500" />
        <h3 className="font-semibold text-lg">{item.medicine_name}</h3>
        <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
          AI Alternative
        </span>
      </div>
      <div className="space-y-2 text-gray-700">
        <p className="flex items-center">
          <MapPin className="w-4 h-4 mr-2 text-gray-500" />
          {item.pharmacy_location}
        </p>
        <p className="flex items-center">
          <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
          {item.price} EGP
        </p>
        <p className="flex items-center">
          <Package className="w-4 h-4 mr-2 text-gray-500" />
          {item.quantity} in stock
        </p>
        <p className="flex items-center">
          <Phone className="w-4 h-4 mr-2 text-gray-500" />
          {item.contact_info}
        </p>
      </div>
    </div>
  );

  const renderUnavailableCard = (alt, idx) => (
    <div
      key={alt.name + idx}
      className="bg-gray-100 p-6 rounded-2xl shadow border border-gray-300 flex flex-col justify-between"
    >
      <div className="flex items-center mb-3">
        <Pill className="text-gray-400 mr-2" />
        <h3 className="font-semibold text-lg text-gray-700">{alt.name}</h3>
        <span className="ml-2 px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded">
          AI Suggestion
        </span>
      </div>
      <p className="text-gray-500 text-sm">{alt.description}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">
          Alternative Medicine Search
        </h1>
        <p className="text-gray-600">
          Find AI-suggested alternatives for your medicine
        </p>
      </header>

      {/* Search Bar */}
      <div className="max-w-xl mx-auto bg-white shadow-md rounded-2xl p-4 flex items-center space-x-2 mb-8">
        <SearchIcon className="text-gray-500 w-6 h-6" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter medicine name..."
          className="flex-1 outline-none px-2"
        />
        <button
          style={{ border: "1px solid #fff" }}
          onClick={handleAISearch}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Search Alternatives
        </button>
      </div>

      {/* AI Loading & Error */}
      {aiLoading && (
        <p className="text-center text-gray-500">
          Searching for alternatives...
        </p>
      )}
      {aiError && <p className="text-center text-red-500">{aiError}</p>}

      {/* Alternatives Title */}
      {(aiResults.length > 0 || aiUnavailable.length > 0) && (
        <div className="max-w-xl mx-auto mt-10 mb-4 text-center">
          <h2 className="text-2xl font-bold text-blue-700 mb-2">
            AI Suggested Alternatives
          </h2>
          <p className="text-gray-600">
            These alternatives are recommended by AI based on your search and
            your medical history.
          </p>
        </div>
      )}

      {/* AI Results */}
      {aiResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {aiResults.map((item) => renderMedicineCard(item))}
        </div>
      )}

      {/* AI Unavailable */}
      {aiUnavailable.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {aiUnavailable.map((alt, idx) => renderUnavailableCard(alt, idx))}
        </div>
      )}

      {/* No results case */}
      {aiRequested &&
        !aiLoading &&
        aiResults.length === 0 &&
        aiUnavailable.length === 0 && (
          <div className="text-center mt-10">
            <p className="text-gray-500 mb-4">
              No alternatives could be found for your search.
            </p>
          </div>
        )}
    </div>
  );
};

export default AlternativeSearch;
