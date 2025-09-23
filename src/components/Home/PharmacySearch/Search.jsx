import React, { useState, useEffect } from "react";
import {
  Search as SearchIcon,
  Pill,
  MapPin,
  Package,
  DollarSign,
  Phone,
  ShoppingCart,
  Plus,
  Minus,
  Check,
  X,
  AlertCircle,
  Sparkles,
  Clock,
} from "lucide-react";
import './Search.css';
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
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === "success" 
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

  // Notification state
  const [notification, setNotification] = useState(null);

  const userDrugs = ["Metformin"];

  const showNotification = (message, type) => {
    setNotification({ message, type });
  };

  // Auto-run search if initialQuery is passed
  useEffect(() => {
    if (initialQuery.trim()) {
      setQuery(initialQuery);
      handleSearch(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const handleSearch = async (overrideQuery) => {
    const searchValue = overrideQuery || query;
    if (!searchValue.trim()) return;

    setLoading(true);
    setError(null);
    setResults([]);
    setAiMatches([]);
    setAiUnavailable([]);
    setAiError(null);
    setSearched(true);

    try {
      const { lat, lng } = await getUserLocation();
      const response = await fetch(
        `http://127.0.0.1:8000/api/v1/search?name=${encodeURIComponent(
          searchValue
        )}&lat=${lat}&lng=${lng}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("No results found, enter valid search");

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
    setAiMatches([]);
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
      setAiMatches(data.matches || []);
      setAiUnavailable(data.unavailable || []);
    } catch (err) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  // Handle quantity change
  const updateQuantity = (itemKey, change) => {
    setCartQuantities((prev) => ({
      ...prev,
      [itemKey]: Math.max(1, (prev[itemKey] || 1) + change),
    }));
  };

  // Add to cart function
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
          quantity: quantity,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to add to cart");
      }

      // Show success state
      setCartSuccess((prev) => ({ ...prev, [itemKey]: true }));
      showNotification(
        `${item.medicine_name} added to cart successfully!`,
        "success"
      );

      // Reset success state after 2 seconds
      setTimeout(() => {
        setCartSuccess((prev) => ({ ...prev, [itemKey]: false }));
      }, 2000);
    } catch (err) {
      console.error("Error adding to cart:", err);
      showNotification(
        err.message || "Failed to add item to cart. Please try again.",
        "error"
      );
    } finally {
      setAddingToCart((prev) => ({ ...prev, [itemKey]: false }));
    }
  };

  const renderMedicineCard = (item, isAI = false) => {
    const itemKey = `${item.medicine_id || item.id}_${item.pharmacy_id}`;
    const quantity = cartQuantities[itemKey] || 1;
    const isAdding = addingToCart[itemKey];
    const showSuccess = cartSuccess[itemKey];

    return (
      <div
        key={itemKey}
        className="bg-white p-7 rounded-3xl  transition-all duration-300 border border-gray-100 flex flex-col justify-between group hover:scale-[1.02] transform"
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

        {/* Divider */}
        <div className="border-b border-gray-200 mb-5"></div>

        {/* Medicine Info */}
        <div className="flex items-center mb-3">
          <div className={`p-2 rounded-full mr-3 ${isAI ? "bg-yellow-100" : "bg-blue-100"}`}>
            <Pill
              className={`w-5 h-5 ${isAI ? "text-yellow-600" : "text-blue-600"}`}
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
            <span className="text-sm font-medium">{item.pharmacy_location}</span>
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
              title="Call pharmacy"
            >
              {item.contact_info}
            </a>
          </div>
        </div>

        {/* Add to Cart Section */}
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
              <span className="w-10 text-center font-bold text-lg">{quantity}</span>
              <button
              style={{ outline: "none", border: "none" }}
                onClick={() => updateQuantity(itemKey, 1)}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 disabled:opacity-50 hover:scale-110 transform"
                disabled={quantity >= 2 || quantity >= item.quantity}
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
          <h3 className="font-bold text-xl text-gray-700 tracking-tight">{alt.name}</h3>
          <span className="inline-flex items-center gap-1 mt-1 px-3 py-1 text-xs bg-gray-200 text-gray-600 rounded-full font-medium">
            <Sparkles className="w-3 h-3" />
            AI Generated Alternative
          </span>
        </div>
      </div>
      <p className="text-gray-600 text-sm leading-relaxed mb-4 font-medium">{alt.description}</p>
      <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
        <p className="text-xs text-yellow-700 font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          This medicine is not available in nearby pharmacies but might be a suitable alternative. Consult your doctor before use.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      {/* Custom scrollbar hide styles */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Notification */}
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
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        />
        <button
        style={{ outline: "none", border: "none" }}
          onClick={() => handleSearch()}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl font-bold text-base transform hover:scale-105"
        >
          Search
        </button>
      </div>

      {/* Status */}
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

      {/* Main Search Results */}
      {results.length > 0 && (
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2 tracking-tight">
              Available in Pharmacies
            </h2>
            <p className="text-gray-600 font-medium">Found {results.length} results near you</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 scrollbar-hide overflow-y-auto max-h-screen">
            {results.map((item) => renderMedicineCard(item, false))}
          </div>
        </div>
      )}

      {/* AI Search Button */}
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

      {/* AI Loading */}
      {aiLoading && (
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3 text-gray-600 bg-white px-6 py-3 rounded-full shadow-lg">
            <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="font-medium">AI is searching for alternatives...</span>
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

      {/* AI Available Alternatives */}
      {aiMatches.length > 0 && (
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-yellow-700 mb-2 tracking-tight flex items-center justify-center gap-2">
              <Sparkles className="w-8 h-8" />
              AI Recommended Alternatives
            </h2>
            <p className="text-gray-600 font-medium">
              These alternatives are recommended by AI and available in nearby pharmacies
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 scrollbar-hide overflow-y-auto max-h-screen">
            {aiMatches.map((item) => renderMedicineCard(item, true))}
          </div>
        </div>
      )}

      {/* AI Unavailable Alternatives */}
      {aiUnavailable.length > 0 && (
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-700 mb-2 tracking-tight flex items-center justify-center gap-2">
              <Clock className="w-8 h-8" />
              AI Suggested Alternatives (Not Available Nearby)
            </h2>
            <p className="text-gray-600 font-medium">
              These alternatives are suggested by AI but not available in nearby pharmacies
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 scrollbar-hide overflow-y-auto max-h-screen">
            {aiUnavailable.map((alt, idx) => renderUnavailableCard(alt, idx))}
          </div>
        </div>
      )}

      {/* No Results Messages */}
      {aiRequested &&
        !aiLoading &&
        aiMatches.length === 0 &&
        aiUnavailable.length === 0 && (
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-8 max-w-md mx-auto shadow-lg">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-yellow-100 p-3 rounded-full">
                  <AlertCircle className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
              <p className="text-yellow-700 font-bold mb-2 text-lg">
                No AI alternatives found
              </p>
              <p className="text-yellow-600 text-sm font-medium">
                Our AI couldn't find suitable alternatives for your search at this time.
              </p>
            </div>
          </div>
        )}

      {searched &&
        results.length === 0 &&
        !loading &&
        !aiLoading &&
        aiMatches.length === 0 &&
        aiUnavailable.length === 0 && (
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-8 max-w-md mx-auto shadow-lg">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-gray-200 p-3 rounded-full">
                  <SearchIcon className="w-8 h-8 text-gray-500" />
                </div>
              </div>
              <p className="text-gray-700 font-bold mb-2 text-lg">No results found</p>
              <p className="text-gray-500 text-sm font-medium">
                Try searching with a different medicine name or check the spelling.
              </p>
            </div>
          </div>
        )}
    </div>
  );
};

export default Search;