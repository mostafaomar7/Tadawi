import React, { useState, useEffect, useContext } from "react";
import MedicineSortFilter from "./MedicineSortFilter";
import {
  Search as SearchIcon,
  Pill,
  MapPin,
  DollarSign,
  ShoppingCart,
  Plus,
  Minus,
  Check,
  X,
  AlertCircle,
  Sparkles,
  Clock,
  Package,
  Phone,
} from "lucide-react";
import "./Search.css";

import { CartContext } from "./CartContext";

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

// Enhanced Notification Component
const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor =
    type === "success"
      ? "bg-gradient-to-r from-green-500 to-green-600"
      : "bg-gradient-to-r from-red-500 to-red-600";
  const icon =
    type === "success" ? (
      <Check className="w-5 h-5" />
    ) : (
      <AlertCircle className="w-5 h-5" />
    );

  return (
    <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right duration-300">
      <div
        className={`${bgColor} text-white px-6 py-4 rounded-xl shadow-xl flex items-center space-x-3 max-w-sm border border-white/20`}
      >
        {icon}
        <span className="flex-1 font-medium">{message}</span>
        <button
          style={{ outline: "none", border: "none" }}
          onClick={onClose}
          className="hover:bg-white/20 rounded-full p-1 transition-colors duration-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const Search = ({ initialQuery = "" }) => {
  const token = localStorage.getItem("authToken");
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [aiMatches, setAiMatches] = useState([]);
  const [aiUnavailable, setAiUnavailable] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [aiRequested, setAiRequested] = useState(false);

  // Cart state
  const [cartQuantities, setCartQuantities] = useState({});
  const [addingToCart, setAddingToCart] = useState({});
  const [cartSuccess, setCartSuccess] = useState({});
  const [notification, setNotification] = useState(null);
  const { cartItemCount, setCartItemCount } = useContext(CartContext);

  const userDrugs = ["Metformin"];
  const showNotification = (message, type) =>
    setNotification({ message, type });

  useEffect(() => {
    if (initialQuery.trim()) {
      setQuery(initialQuery);
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = async (overrideQuery, pageNumber = 1) => {
    const searchValue = overrideQuery || query;
    if (!searchValue.trim()) return;

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      let url = `http://127.0.0.1:8000/api/v1/search?name=${encodeURIComponent(
        searchValue
      )}&page=${pageNumber}&per_page=5`;

      try {
        const { lat, lng } = await getUserLocation();
        url += `&lat=${lat}&lng=${lng}`;
      } catch (geoError) {
        console.warn("Location blocked or unavailable.");
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) throw new Error("No results found");

      const data = await response.json();
      setResults(data.matches);
      setPage(data.pagination.current_page);
      setLastPage(data.pagination.last_page);
    } catch (err) {
      setError(err.message);
      setResults([]);
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
    setAiMatches([]);
    setAiUnavailable([]);
    setAiRequested(true);

    try {
      const body = { name: query.trim(), user_drugs: userDrugs };
      try {
        const { lat, lng } = await getUserLocation();
        body.lat = lat;
        body.lng = lng;
      } catch (geoError) {
        console.warn("Location blocked. AI search continues without location.");
      }

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
      setAiMatches(data.matches || []);
      setAiUnavailable(data.unavailable || []);
    } catch (err) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const updateQuantity = (itemKey, change) => {
    setCartQuantities((prev) => ({
      ...prev,
      [itemKey]: Math.max(1, (prev[itemKey] || 1) + change),
    }));
  };

  const addToCart = async (item, isAI = false) => {
    const itemKey = `${item.medicine_id || item.id}_${item.pharmacy_id}`;
    const quantity = cartQuantities[itemKey] || 1;
    setAddingToCart((prev) => ({ ...prev, [itemKey]: true }));

    try {
      const response = await fetch("http://localhost:8000/api/v1/auth/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          medicine_id: item.medicine_id || item.id,
          pharmacy_id: item.pharmacy_id,
          quantity,
        }),
      });

      const responseData = await response.json();
      if (!response.ok)
        throw new Error(responseData.message || "Failed to add to cart");

      setCartSuccess((prev) => ({ ...prev, [itemKey]: true }));
      setCartItemCount((prev) => prev + quantity);
      window.dispatchEvent(new CustomEvent("cartUpdated"));

      setTimeout(
        () => setCartSuccess((prev) => ({ ...prev, [itemKey]: false })),
        2000
      );
    } catch (err) {
      showNotification(
        err.message || "Failed to add item to cart. Please try again.",
        "error"
      );
    } finally {
      setAddingToCart((prev) => ({ ...prev, [itemKey]: false }));
    }
  };

  const renderPharmacyGroup = (pharmacy) => (
    <div
      key={pharmacy.pharmacy_id}
      className="col-span-full border border-gray-300 rounded-2xl p-5 mb-6 shadow-lg bg-gray-50 w-full"
    >
      <div className="mb-4">
        <h3 className="text-2xl font-extrabold text-blue-900">
          {pharmacy.pharmacy_name}
        </h3>
        <p className="text-base text-gray-800 mt-2">
          <span className="font-semibold">Contact:</span>{" "}
          {pharmacy.contact_info}
        </p>
        <p className="text-base text-gray-800 mt-1">
          <span className="font-semibold">Location:</span>{" "}
          {pharmacy.pharmacy_location}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {pharmacy.medicines.map((med) =>
          renderMedicineCard({
            ...med,
            pharmacy_id: pharmacy.pharmacy_id,
            pharmacy_name: pharmacy.pharmacy_name,
            pharmacy_location: pharmacy.pharmacy_location,
            contact_info: pharmacy.contact_info,
          })
        )}
      </div>
    </div>
  );

  const renderMedicineCard = (item, isAI = false) => {
    const itemKey = `${item.medicine_id || item.id}_${item.pharmacy_id}`;
    const quantity = cartQuantities[itemKey] || 1;
    const isAdding = addingToCart[itemKey];
    const showSuccess = cartSuccess[itemKey];

    return (
      <div
        key={itemKey}
        className="bg-white p-7 rounded-3xl transition-all duration-300 border border-gray-100 flex flex-col justify-between group hover:scale-[1.02] transform"
        style={{ minHeight: 380 }}
      >
        {/* Pharmacy Info */}
        <div className="flex items-center mb-5">
          <div className="bg-indigo-100 p-2 rounded-full mr-3">
            <MapPin className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="flex-1">
            <span className="font-bold text-indigo-700 text-lg tracking-tight">
              {item.pharmacy_name}
            </span>
            <span className="ml-3 px-3 py-1 text-xs bg-indigo-50 text-indigo-600 rounded-full border border-indigo-200 font-medium">
              Pharmacy
            </span>
          </div>
        </div>

        <div className="border-b border-gray-200 mb-5"></div>

        {/* Medicine Info */}
        <div className="flex items-center mb-3">
          <div
            className={`p-2 rounded-full mr-3 ${
              isAI ? "bg-yellow-100" : "bg-blue-100"
            }`}
          >
            <Pill
              className={`w-5 h-5 ${
                isAI ? "text-yellow-600" : "text-blue-600"
              }`}
            />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-xl text-gray-900 tracking-tight">
              {item.medicine_name}
            </h3>
            {isAI && (
              <span className="inline-flex items-center gap-1 mt-1 px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full border border-yellow-200 font-medium">
                <Sparkles className="w-3 h-3" />
                AI Alternative
              </span>
            )}
          </div>
        </div>

        <div className="space-y-3 text-gray-700 mb-6 scrollbar-hide overflow-y-auto max-h-32">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-3 text-gray-500" />
            <span className="text-sm font-medium">
              {item.pharmacy_location}
            </span>
          </div>
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 mr-3 text-green-500" />
            <span className="text-sm font-bold text-green-700 text-lg">
              {item.price} EGP
            </span>
          </div>
          <div className="flex items-center">
            <Package className="w-4 h-4 mr-3 text-blue-500" />
            <span className="text-sm text-gray-600 font-medium">
              {item.quantity} in stock
            </span>
          </div>
          <div className="flex items-center">
            <Phone className="w-4 h-4 mr-3 text-blue-500" />
            <a
              href={`tel:${item.contact_info}`}
              className="text-sm text-blue-700 underline hover:text-blue-900 transition-colors font-medium"
            >
              {item.contact_info}
            </a>
          </div>
        </div>

        {/* Add to Cart */}
        <div className="border-t border-gray-100 pt-5 mt-auto">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-gray-800">Quantity:</span>
            <div className="flex items-center space-x-3">
              <button
                style={{ outline: "none", border: "none" }}
                onClick={() => updateQuantity(itemKey, -1)}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 disabled:opacity-50 hover:scale-110 transform"
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4 text-gray-600" />
              </button>
              <span className="w-10 text-center font-bold text-lg">
                {quantity}
              </span>
              <button
                style={{ outline: "none", border: "none" }}
                onClick={() => updateQuantity(itemKey, 1)}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 disabled:opacity-50 hover:scale-110 transform"
                disabled={quantity >= item.quantity}
              >
                <Plus className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          <button
            style={{ outline: "none", border: "none" }}
            onClick={() => addToCart(item, isAI)}
            disabled={isAdding || showSuccess || item.quantity === 0}
            className={`w-full py-3 px-4 rounded-xl font-bold text-base transition-all duration-300 flex items-center justify-center space-x-2 transform hover:scale-105 ${
              showSuccess
                ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg"
                : isAdding
                ? "bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-lg"
                : item.quantity === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl"
            }`}
          >
            {showSuccess ? (
              <>
                <Check className="w-5 h-5" />
                <span>Added to Cart</span>
              </>
            ) : isAdding ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Adding...</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  const renderUnavailableCard = (alt, idx) => (
    <div
      key={alt.name + idx}
      className="bg-gradient-to-br from-gray-50 to-gray-100 p-7 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 group hover:scale-[1.02] transform"
    >
      <div className="flex items-center mb-4">
        <div className="bg-gray-200 p-2 rounded-full mr-3">
          <Pill className="text-gray-500 w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-xl text-gray-700 tracking-tight">
            {alt.name}
          </h3>
          <span className="inline-flex items-center gap-1 mt-1 px-3 py-1 text-xs bg-gray-200 text-gray-600 rounded-full font-medium">
            <Sparkles className="w-3 h-3" />
            AI Generated Alternative
          </span>
        </div>
      </div>
      <p className="text-gray-600 text-sm leading-relaxed mb-4 font-medium">
        {alt.description}
      </p>
      <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
        <p className="text-xs text-yellow-700 font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          This medicine is not available in nearby pharmacies but might be a
          suitable alternative. Consult your doctor before use.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Header */}
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 tracking-tight">
          Medicine Search
        </h1>
        <p className="text-gray-600 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
          Find pharmacies near you that have your medicine in stock
        </p>
      </header>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-full p-3 flex items-center space-x-3 mb-12 border border-gray-200 hover:shadow-xl transition-all duration-300">
        <div className="bg-blue-100 p-2 rounded-full">
          <SearchIcon className="text-blue-600 w-6 h-6" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter medicine name..."
          className="flex-1 outline-none px-3 text-gray-700 font-medium text-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 rounded-full py-2"
          onKeyPress={(e) => e.key === "Enter" && handleSearch(query, 1)}
        />
        <button
          style={{ outline: "none", border: "none" }}
          onClick={() => handleSearch(query, 1)}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl font-bold text-base transform hover:scale-105"
        >
          Search
        </button>
      </div>

      {loading && (
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3 text-gray-600 bg-white px-6 py-3 rounded-full shadow-lg">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="font-medium">Searching for medicines...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-700 px-6 py-4 rounded-xl inline-block shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Available in Pharmacies
          </h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((pharmacy) => renderPharmacyGroup(pharmacy))}
          </div>

          {lastPage > 1 && (
            <div className="flex justify-center mt-6 space-x-2">
              {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => handleSearch(query, p)}
                  className={`px-4 py-2 rounded-lg border ${
                    p === page
                      ? "bg-blue-600 text-white border-blue-700"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AI Section */}
      {searched && !aiLoading && (
        <div className="text-center mt-12 mb-12">
          <button
            style={{ outline: "none", border: "none" }}
            onClick={handleAISearch}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-lg flex items-center gap-3 mx-auto"
            disabled={!query.trim()}
          >
            <Sparkles className="w-6 h-6" />
            Search for AI Alternatives
          </button>
        </div>
      )}

      {aiLoading && (
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3 text-gray-600 bg-white px-6 py-3 rounded-full shadow-lg">
            <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="font-medium">
              AI is searching for alternatives...
            </span>
          </div>
        </div>
      )}
      {aiError && (
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-700 px-6 py-4 rounded-xl inline-block shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">{aiError}</span>
            </div>
          </div>
        </div>
      )}

      {aiMatches.length > 0 && (
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-yellow-700 mb-2 tracking-tight flex items-center justify-center gap-2">
              <Sparkles className="w-8 h-8" />
              AI Recommended Alternatives
            </h2>
            <p className="text-gray-600 font-medium">
              These alternatives are recommended by AI and available in nearby
              pharmacies
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 scrollbar-hide overflow-y-auto max-h-screen">
            {aiMatches.map((item) => renderMedicineCard(item, true))}
          </div>
        </div>
      )}

      {aiUnavailable.length > 0 && (
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-700 mb-2 tracking-tight flex items-center justify-center gap-2">
              <Clock className="w-8 h-8" />
              AI Suggested Alternatives (Not Available Nearby)
            </h2>
            <p className="text-gray-600 font-medium">
              These alternatives are suggested by AI but not available in nearby
              pharmacies
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 scrollbar-hide overflow-y-auto max-h-screen">
            {aiUnavailable.map((alt, idx) => renderUnavailableCard(alt, idx))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
