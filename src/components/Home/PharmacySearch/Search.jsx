import React, { useState } from "react";
import { Search as SearchIcon, Pill, MapPin, Package, DollarSign, Phone } from "lucide-react";
// import { BASE_URL } from "../../../config";

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

  const handleSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      const { lat, lng } = await getUserLocation();
      const response = await fetch(
        `http://127.0.0.1:8000/api/search?name=${encodeURIComponent(
          query
        )}&lat=${lat}&lng=${lng}`
      );

      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      setResults(data.matches);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((item) => (
          <div
            key={item.pharmacy_id}
            className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition"
          >
            <div className="flex items-center mb-3">
              <Pill className="text-blue-500 mr-2" />
              <h3 className="font-semibold text-lg">{item.medicine_name}</h3>
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
              {/* لو حابب تعرض المسافة ترجع السطر الجاي */}
              {/* <p className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                {item.distance_km.toFixed(2)} km away
              </p> */}
              <p className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-gray-500" />
                {item.contact_info}
              </p>
            </div>
          </div>
        ))}
      </div>

      {results.length === 0 && !loading && (
        <p className="text-center text-gray-500 mt-10">
          No results yet. Try searching for a medicine.
        </p>
      )}
    </div>
  );
};

export default Search;
