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

const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [aiResults, setAiResults] = useState([]);
  const [aiUnavailable, setAiUnavailable] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  const [searched, setSearched] = useState(false);

  const userDrugs = ["Metformin"];

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResults([]);
    setAiResults([]);
    setAiUnavailable([]);
    setAiError(null);
    setSearched(true);

    try {
      const { lat, lng } = await getUserLocation();
      const response = await fetch(
        `http://127.0.0.1:8000/api/v1/search?name=${encodeURIComponent(
          query
        )}&lat=${lat}&lng=${lng}`
      );

      if (!response.ok) throw new Error("No results found ,enter valid search");

      const data = await response.json();
      setResults(data.matches || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
    try {
      const { lat, lng } = await getUserLocation();
      const body = {
        name: query.trim(),
        lat,
        lng,
        user_drugs: userDrugs,
      };
      // Debug log
      console.log("AI search body:", body);
      const response = await fetch(
        "http://127.0.0.1:8000/api/v1/search/with-alternatives",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      // Debug log
      console.log("AI search response status:", response.status);
      if (!response.ok) throw new Error("Failed to fetch AI alternatives");
      const data = await response.json();
      // Debug log
      console.log("AI search response data:", data);
      setAiResults(data.results || []);
      setAiUnavailable(data.unavailable || []);
    } catch (err) {
      setAiError(err.message);
      // Debug log
      console.error("AI search error:", err);
    } finally {
      setAiLoading(false);
    }
  };

  const renderMedicineCard = (item, isAI = false) => (
    <div
      key={item.pharmacy_id}
      className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition"
    >
      <div className="flex items-center mb-3">
        <Pill
          className={`mr-2 ${isAI ? "text-yellow-500" : "text-blue-500"}`}
        />
        <h3 className="font-semibold text-lg">{item.medicine_name}</h3>
        {isAI && (
          <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
            AI Alternative
          </span>
        )}
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
          Medicine Search
        </h1>
        <p className="text-gray-600">
          Find pharmacies near you that have your medicine in stock
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
          onClick={handleSearch}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Search
        </button>
      </div>

      {/* Status */}
      {loading && <p className="text-center text-gray-500">Searching...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {/* DB Results */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((item) => renderMedicineCard(item))}
        </div>
      )}

      {/* AI button: only show after first search */}
      {searched && !aiLoading && (
        <div className="text-center mt-6">
          <button
            onClick={handleAISearch}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
            style={{ border: "1px solid #fff" }}
            disabled={!query.trim()}
          >
            Search for alternatives by AI
          </button>
        </div>
      )}

      {/* AI Loading & Error */}
      {aiLoading && (
        <p className="text-center text-gray-500 mt-4">
          Searching for alternatives by AI...
        </p>
      )}
      {aiError && <p className="text-center text-red-500 mt-4">{aiError}</p>}

      {/* AI Results */}
      {aiResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {aiResults.map((item) => renderMedicineCard(item, true))}
        </div>
      )}

      {/* AI Unavailable */}
      {aiUnavailable.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {aiUnavailable.map((alt, idx) => renderUnavailableCard(alt, idx))}
        </div>
      )}

      {/* Friendly message if AI found nothing */}
      {searched &&
        !aiLoading &&
        aiResults.length === 0 &&
        aiUnavailable.length === 0 && (
          <div className="text-center mt-10">
            <p className="text-gray-500 mb-4">
              no alternatives could be found for your search .
            </p>
          </div>
        )}

      {/* No DB results case */}
      {searched &&
        results.length === 0 &&
        !loading &&
        !aiLoading &&
        aiResults.length === 0 &&
        aiUnavailable.length === 0 && (
          <div className="text-center mt-10">
            <p className="text-gray-500 mb-4">No results found.</p>
          </div>
        )}
    </div>
  );
};

export default Search;
