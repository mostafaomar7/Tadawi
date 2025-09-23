import React, { useState, useRef, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, ShoppingCart, X, Trash2, Package, CreditCard } from "lucide-react";
import { MoonLoader } from "react-spinners";
import { CartContext } from "../PharmacySearch/CartContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { cartItemCount, setCartItemCount } = useContext(CartContext);
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const dropdownRef = useRef(null);
  const cartRef = useRef(null);

  const token = localStorage.getItem("authToken");
  const user = localStorage.getItem("authUser")
    ? JSON.parse(localStorage.getItem("authUser"))
    : null;

  // Listen for cart updates from other components
  useEffect(() => {
    const handleCartUpdate = () => {
      fetchCartItems();
    };
    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, []);

  // Fetch cart items
  const fetchCartItems = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/v1/auth/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        const items = Array.isArray(data) ? data : data.items || data.data || [];
        setCartItems(items);

        // Count unique {medicine_name, pharmacy_name} pairs
        const uniquePairs = new Set();
        Array.isArray(items) &&
          items.forEach((item) => {
            Array.isArray(item.medicines) &&
              item.medicines.forEach((med) => {
                uniquePairs.add(
                  `${med.medicine?.brand_name || med.medicine_name || ""}|${item.pharmacy_name || ""}`
                );
              });
          });
        setCartItemCount(uniquePairs.size);
      } else {
        setCartItems([]);
        setCartItemCount(0);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCartItems([]);
      setCartItemCount(0);
    }
    setLoading(false);
  };

  // Clear pharmacy cart
  const clearPharmacyCart = async (pharmacyId) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/auth/cart/clear?pharmacy_id=${pharmacyId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        console.error("Failed to clear pharmacy cart");
      }
      await fetchCartItems();
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  // Clear all cart
  const clearAllCart = async () => {
    setLoading(true);
    const pharmacyIds = Array.isArray(cartItems)
      ? [...new Set(cartItems.map((item) => item.pharmacy_id))]
      : [];
    for (const pharmacyId of pharmacyIds) {
      await clearPharmacyCart(pharmacyId);
    }
    await fetchCartItems();
    setLoading(false);
    setCartOpen(false);
  };

  // Delete single medicine
  const deleteCartMedicine = async (medicineId) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/auth/cart/${medicineId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete medicine");
      }

      await fetchCartItems();
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Error deleting medicine:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    localStorage.removeItem("authRole");
    navigate("/auth");
  };

  // Group items by pharmacy
  const groupedItems = Array.isArray(cartItems)
    ? cartItems.reduce((acc, item) => {
        const pharmacyName = item.pharmacy_name || "Unknown Pharmacy";
        if (!acc[pharmacyName]) {
          acc[pharmacyName] = { items: [], pharmacyId: item.pharmacy_id, subtotal: 0 };
        }
        acc[pharmacyName].items.push(item);
        acc[pharmacyName].subtotal += (item.price || 0) * (item.quantity || 1);
        return acc;
      }, {})
    : {};

  // Calculate grand total
  const grandTotal = Object.values(groupedItems).reduce(
    (total, pharmacy) => total + (pharmacy.subtotal || 0),
    0
  );

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setCartOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch cart when cart opens
  useEffect(() => {
    if (cartOpen && token) fetchCartItems();
  }, [cartOpen, token]);

  // Fetch cart on mount
  useEffect(() => {
    if (token) {
      fetchCartItems();
    } else {
      setCartItemCount(0);
      setCartItems([]);
    }
  }, [token]);

  // Spinner component
  const Spinner = () => (
    <div className="flex items-center justify-center py-8">
      <MoonLoader color="#2563eb" size={40} />
    </div>
  );

  return (
    <>
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <nav className="bg-white/95 backdrop-blur-lg shadow-xl fixed w-full top-0 z-50 border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-3">
            <Link to="/" className="transition-transform duration-200 hover:scale-105">
              <img src="/logo.png" alt="Tadawi Logo" className="object-contain transition-all duration-200" style={{ height: "120px", width: "auto" }} />
            </Link>
          </div>

          <button
            style={{ outline: "none", border: "none" }}
            className="lg:hidden p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all duration-200 transform hover:scale-105"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span className={`block w-5 h-0.5 bg-current transition-all duration-200 ${isOpen ? 'rotate-45 translate-y-1' : ''}`}></span>
              <span className={`block w-5 h-0.5 bg-current mt-1 transition-all duration-200 ${isOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block w-5 h-0.5 bg-current mt-1 transition-all duration-200 ${isOpen ? '-rotate-45 -translate-y-1' : ''}`}></span>
            </div>
          </button>

          <div
            className={`
              ${isOpen ? "max-h-96 opacity-100 py-4" : "max-h-0 opacity-0 py-0"}
              transition-all duration-300 ease-in-out
              lg:flex lg:opacity-100 lg:max-h-none lg:py-0
              flex-col lg:flex-row lg:items-center gap-2 lg:gap-6
              absolute lg:static top-16 left-0 w-full lg:w-auto
              bg-white/95 lg:bg-transparent backdrop-blur-lg lg:backdrop-blur-none
              px-6 lg:p-0 shadow-lg lg:shadow-none
              border-b border-gray-200/50 lg:border-0
            `}
          >

            <Link to="/donate" className="block px-4 py-2 rounded-xl text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 no-underline text-base font-semibold transform hover:scale-105 hover:shadow-md">Donate</Link>
            <Link to="/Pharmacy" className="block px-4 py-2 rounded-xl text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 no-underline text-base font-semibold transform hover:scale-105 hover:shadow-md">Pharmacy</Link>
            <Link to="/alternative-search" className="block px-4 py-2 rounded-xl text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 no-underline text-base font-semibold transform hover:scale-105 hover:shadow-md">AI Alternative Search</Link>
            <Link to="/conflict-system" className="block px-4 py-2 rounded-xl text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 no-underline text-base font-semibold transform hover:scale-105 hover:shadow-md">AI Conflict System</Link>


            {!token ? (
              <Link to="/auth" className="block bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl transition-all duration-200 no-underline font-bold text-base shadow-lg hover:shadow-xl transform hover:scale-105">Login</Link>
            ) : (
              <div className="flex items-center gap-4 lg:gap-3">
                <div className="relative">
                  <button
                    onClick={() => setCartOpen(!cartOpen)}
                    style={{ outline: "none", border: "none" }}
                    className="p-3 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-all duration-200 transform hover:scale-110 shadow-md hover:shadow-lg"
                  >
                    <ShoppingCart className="w-6 h-6" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg animate-pulse">
                        {cartItemCount}
                      </span>
                    )}
                  </button>
                </div>

                <div className="relative" ref={dropdownRef}>
                  <button
                    style={{ outline: "none", border: "none" }}
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="p-3 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-700 transition-all duration-200 transform hover:scale-110 shadow-md hover:shadow-lg"
                  >
                    <User className="w-6 h-6" />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl ring-1 ring-gray-200 z-50 overflow-hidden transform transition-all duration-200 animate-in slide-in-from-top-2">
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                        <p className="text-lg font-bold text-gray-600">{user?.name || user?.email || "User"}</p>
                      </div>
                      <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-gray-700 text-base font-medium hover:bg-gray-50 transition-all duration-200 no-underline transform hover:translate-x-1" onClick={() => setProfileOpen(false)}>
                        <User className="w-5 h-5 text-blue-500" />
                        View Profile
                      </Link>

                      <Link
                        to="/orders"
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors no-underline border-t border-gray-100"
                        onClick={() => setProfileOpen(false)}
                      >
                        My Orders
                      </Link>
                   

                      <button style={{ outline: "none", border: "none" }} onClick={handleLogout} className="flex items-center gap-3 w-full text-left px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 transition-all duration-200 border-0 focus:outline-none transform hover:translate-x-1">
                        <X className="w-5 h-5" />

                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {cartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300" onClick={() => setCartOpen(false)}></div>
          <div ref={cartRef} className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl transform transition-all duration-300 ease-out animate-in slide-in-from-right">
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Shopping Cart</h2>
                <p className="text-sm text-gray-600 mt-1">{cartItemCount} {cartItemCount === 1 ? 'item' : 'items'} in your cart</p>
              </div>
              <button style={{ outline: "none", border: "none" }} onClick={() => setCartOpen(false)} className="p-2 rounded-full bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-110">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: "calc(100vh - 120px)" }}>
              {loading ? <Spinner /> : !Array.isArray(cartItems) || cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                  <div className="bg-gray-100 p-6 rounded-full mb-4">
                    <ShoppingCart className="w-12 h-12 text-gray-400" />
                  </div>
                  <p className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</p>
                  <p className="text-gray-500 text-center">Add some medicines to get started!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedItems).map(([pharmacyName, pharmacy]) => {
                    const pharmacySubtotal = pharmacy.items.reduce((subtotal, item) => {
                      return subtotal + item.medicines.reduce((total, med) => {
                        const price = parseFloat(med.price_at_time || 0);
                        const quantity = med.quantity || 1;
                        return total + price * quantity;
                      }, 0);
                    }, 0);
                    return (
                      <div key={pharmacyName} className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                        <div className="flex items-center justify-between mb-5">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-full">
                              <Package className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-bold text-blue-700 text-lg tracking-tight">{pharmacyName}</h3>
                              <p className="text-sm text-gray-500">{pharmacy.items.length} {pharmacy.items.length === 1 ? 'item' : 'items'}</p>
                            </div>
                          </div>
                          <button style={{ outline: "none", border: "none" }} onClick={() => clearPharmacyCart(pharmacy.pharmacyId)} className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm px-4 py-2 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105">Clear All</button>
                        </div>

                        <div className="space-y-4">
                          {pharmacy.items.map((item) => (
                            <div key={item.id} className="space-y-3">
                              {item.medicines.map((med) => (
                                <div key={med.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-200 hover:shadow-md">
                                  <div className="flex-1">
                                    <p className="font-bold text-gray-900 text-base mb-1">
                                      {med.medicine?.brand_name || item.name || "Unknown Item"}
                                    </p>
                                    <div className="flex items-center gap-6">
                                      <span className="text-gray-600 text-sm font-medium bg-gray-100 px-3 py-1 rounded-full">Qty: {med.quantity || 1}</span>
                                      <span className="text-green-600 font-bold text-lg">${(med.price_at_time ? parseFloat(med.price_at_time).toFixed(2) : "0.00")}</span>
                                    </div>
                                  </div>
                                  <button style={{ outline: "none", border: "none" }} onClick={() => deleteCartMedicine(med.id)} className="ml-4 p-3 rounded-full bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-110">
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>
                              ))}

                              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 mt-4">
                                <div className="flex justify-between items-center mb-3">
                                  <span className="font-bold text-gray-800 text-base">Pharmacy Subtotal:</span>
                                  <span className="font-bold text-blue-600 text-xl">${pharmacySubtotal.toFixed(2)}</span>
                                </div>

                                <button style={{ outline: "none", border: "none" }} onClick={() => { setCartOpen(false); navigate(`/checkout/${pharmacy.pharmacyId}`); }} className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-xl transition-all duration-200 font-bold text-base shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2">
                                  <CreditCard className="w-5 h-5" /> Proceed to Checkout
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-t-4 border-blue-500 rounded-2xl p-6 shadow-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-gray-900">Grand Total:</span>
                      <span className="text-3xl font-bold text-blue-600">${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {Array.isArray(cartItems) && cartItems.length > 0 && (
                    <button onClick={clearAllCart} className="w-full text-white bg-red-600 hover:bg-red-700 py-3 font-bold transition-colors mb-2 border border-black border-opacity-10 rounded-xl">Clear All Cart</button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
