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

// Notification Component
const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === "success" ? "bg-green-500" : "bg-red-500";
  const icon =
    type === "success" ? (
      <Check className="w-5 h-5" />
    ) : (
      <AlertCircle className="w-5 h-5" />
    );

  return (
    <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-right duration-300">
      <div
        className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 max-w-sm`}
      >
        {icon}
        <span className="flex-1">{message}</span>
        <button onClick={onClose} className="hover:bg-white/20 rounded p-1">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const Search = () => {
  const token = localStorage.getItem("authToken");
  const [query, setQuery] = useState("");
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

  const handleSearch = async () => {
    if (!query.trim()) return;

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
          query
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

  const renderMedicineCard = (item, isAI = false, section = "") => {
    const itemKey = `${item.medicine_id || item.id}_${item.pharmacy_id}`;
    const quantity = cartQuantities[itemKey] || 1;
    const isAdding = addingToCart[itemKey];
    const showSuccess = cartSuccess[itemKey];

    return (
      <div
        key={itemKey}
        className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col justify-between"
        style={{ minHeight: 340 }}
      >
        {/* Pharmacy Info */}
        <div className="flex items-center mb-4">
          <MapPin className="w-5 h-5 text-indigo-500 mr-2" />
          <span className="font-semibold text-indigo-700 text-base">
            {item.pharmacy_name}
          </span>
          <span className="ml-2 px-2 py-1 text-xs bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">
            Pharmacy
          </span>
        </div>

        {/* Divider */}
        <div className="border-b border-gray-200 mb-4"></div>

        {/* Medicine Info */}
        <div className="flex items-center mb-2">
          <Pill
            className={`mr-2 ${isAI ? "text-yellow-500" : "text-blue-500"}`}
          />
          <h3 className="font-bold text-lg text-gray-900">
            {item.medicine_name}
          </h3>
          {isAI && (
            <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full border border-yellow-200">
              AI Alternative
            </span>
          )}
        </div>

        <div className="space-y-2 text-gray-700 mb-4">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
            <span className="text-sm">{item.pharmacy_location}</span>
          </div>
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 mr-2 text-green-500" />
            <span className="text-sm font-semibold text-green-700">
              {item.price} EGP
            </span>
          </div>
          <div className="flex items-center">
            <Package className="w-4 h-4 mr-2 text-blue-400" />
            <span className="text-sm text-gray-600">
              {item.quantity} in stock
            </span>
          </div>
          <div className="flex items-center">
            <Phone className="w-4 h-4 mr-2 text-blue-400" />
            <a
              href={`tel:${item.contact_info}`}
              className="text-sm text-blue-700 underline hover:text-blue-900 transition"
              title="Call pharmacy"
            >
              {item.contact_info}
            </a>
          </div>
        </div>

        {/* Add to Cart Section */}
        <div className="border-t border-gray-100 pt-4 mt-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Quantity:</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => updateQuantity(itemKey, -1)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors disabled:opacity-50"
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4 text-gray-600" />
              </button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <button
                onClick={() => updateQuantity(itemKey, 1)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors disabled:opacity-50"
                disabled={quantity >= 2 || quantity >= item.quantity}
              >
                <Plus className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          <button
            onClick={() => addToCart(item, isAI)}
            disabled={isAdding || showSuccess || item.quantity === 0}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2 border-[0.5px] ${
              showSuccess
                ? "bg-green-100 text-green-700 border-green-200"
                : isAdding
                ? "bg-blue-100 text-blue-700 border-blue-200"
                : item.quantity === 0
                ? "bg-gray-300 text-gray-500 border-gray-200 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg border-blue-700"
            }`}
          >
            {showSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added to Cart</span>
              </>
            ) : isAdding ? (
              <>
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Adding...</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
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
      className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl shadow border border-gray-200"
    >
      <div className="flex items-center mb-3">
        <Pill className="text-gray-400 mr-2" />
        <h3 className="font-semibold text-lg text-gray-700">{alt.name}</h3>
        <span className="ml-2 px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-full">
          AI Generated Alternative
        </span>
      </div>
      <p className="text-gray-500 text-sm leading-relaxed">{alt.description}</p>
      <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
        <p className="text-xs text-yellow-700 font-medium">
          💡 This medicine is not available in nearby pharmacies but might be a
          suitable alternative. Consult your doctor before use.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-2">
          Medicine Search
        </h1>
        <p className="text-gray-600 text-lg">
          Find pharmacies near you that have your medicine in stock
        </p>
      </header>

      {/* Search Bar */}
      <div className="max-w-xl mx-auto bg-white shadow-lg rounded-2xl p-4 flex items-center space-x-2 mb-8 border border-gray-200">
        <SearchIcon className="text-gray-500 w-6 h-6" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter medicine name..."
          className="flex-1 outline-none px-2 text-gray-700"
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors shadow-md border-[0.5px] border-blue-700"
        >
          Search
        </button>
      </div>

      {/* Status */}
      {loading && (
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 text-gray-600">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Searching...</span>
          </div>
        </div>
      )}
      {error && (
        <div className="text-center">
          <p className="text-red-500 bg-red-50 inline-block px-4 py-2 rounded-lg">
            {error}
          </p>
        </div>
      )}

      {/* Main Search Results */}
      {results.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Available in Pharmacies
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((item) => renderMedicineCard(item, false, "main"))}
          </div>
        </div>
      )}

      {/* AI Search Button */}
      {searched && !aiLoading && (
        <div className="text-center mt-8 mb-8">
          <button
            onClick={handleAISearch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition duration-300 ease-in-out border-[0.5px] border-blue-700"
            disabled={!query.trim()}
          >
            Search for AI Alternatives
          </button>
        </div>
      )}

      {/* AI Loading */}
      {aiLoading && (
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 text-gray-600">
            <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            <span>AI is searching for alternatives...</span>
          </div>
        </div>
      )}
      {aiError && (
        <div className="text-center">
          <p className="text-red-500 bg-red-50 inline-block px-4 py-2 rounded-lg">
            {aiError}
          </p>
        </div>
      )}

      {/* AI Available Alternatives */}
      {aiMatches.length > 0 && (
        <div className="mb-10">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-yellow-700 mb-2">
              AI Recommended Alternatives
            </h2>
            <p className="text-gray-600">
              These alternatives are recommended by AI and available in nearby
              pharmacies
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiMatches.map((item) =>
              renderMedicineCard(item, true, "available")
            )}
          </div>
        </div>
      )}

      {/* AI Unavailable Alternatives */}
      {aiUnavailable.length > 0 && (
        <div className="mb-10">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              💡 AI Suggested Alternatives (Not Available Nearby)
            </h2>
            <p className="text-gray-600">
              These alternatives are suggested by AI but not available in nearby
              pharmacies
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiUnavailable.map((alt, idx) => renderUnavailableCard(alt, idx))}
          </div>
        </div>
      )}

      {/* No Results Messages */}
      {aiRequested &&
        !aiLoading &&
        aiMatches.length === 0 &&
        aiUnavailable.length === 0 && (
          <div className="text-center mt-10">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-yellow-700 font-medium mb-2">
                No AI alternatives found
              </p>
              <p className="text-yellow-600 text-sm">
                Our AI couldn't find suitable alternatives for your search at
                this time.
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
          <div className="text-center mt-10">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-gray-700 font-medium mb-2">No results found</p>
              <p className="text-gray-500 text-sm">
                Try searching with a different medicine name or check the
                spelling.
              </p>
            </div>
          </div>
        )}
    </div>
  );
};

export default Search;
