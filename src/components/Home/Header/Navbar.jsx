import React, { useState, useRef, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, ShoppingCart, X, Trash2 } from "lucide-react";
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
    const handleCartUpdate = (e) => {
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
        const items = Array.isArray(data)
          ? data
          : data.items || data.data || [];
        setCartItems(items);

        // Count unique {medicine_name, pharmacy_name} pairs
        const uniquePairs = new Set();
        Array.isArray(items) &&
          items.forEach((item) => {
            Array.isArray(item.medicines) &&
              item.medicines.forEach((med) => {
                uniquePairs.add(
                  `${med.medicine?.brand_name || med.medicine_name || ""}|${
                    item.pharmacy_name || ""
                  }`
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
    }
    setLoading(false);
  };

  // Clear pharmacy cart (delete all medicines for a pharmacy)
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
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  // Clear all cart by looping through all pharmacies, show spinner until done
  const clearAllCart = async () => {
    setLoading(true);
    // Get unique pharmacy ids
    const pharmacyIds = Array.isArray(cartItems)
      ? [...new Set(cartItems.map((item) => item.pharmacy_id))]
      : [];
    for (const pharmacyId of pharmacyIds) {
      await clearPharmacyCart(pharmacyId);
    }
    await fetchCartItems();
    setLoading(false);
    setCartOpen(false);
    setCartItemCount(0);
    setCartItems([]);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // Delete single medicine: clear pharmacy cart for that medicine's pharmacy
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

  // Group items by pharmacy - with safety check
  const groupedItems = Array.isArray(cartItems)
    ? cartItems.reduce((acc, item) => {
        const pharmacyName = item.pharmacy_name || "Unknown Pharmacy";
        if (!acc[pharmacyName]) {
          acc[pharmacyName] = {
            items: [],
            pharmacyId: item.pharmacy_id,
            subtotal: 0,
          };
        }
        acc[pharmacyName].items.push(item);
        acc[pharmacyName].subtotal += (item.price || 0) * (item.quantity || 1);
        return acc;
      }, {})
    : {};

  // Calculate total - with safety check
  const grandTotal = Object.values(groupedItems).reduce(
    (total, pharmacy) => total + (pharmacy.subtotal || 0),
    0
  );

  // Close dropdowns when clicking outside
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
    if (cartOpen && token) {
      fetchCartItems();
    }
  }, [cartOpen, token]);

  // Log medicines when cart opens and cartItems change
  useEffect(() => {
    if (cartOpen && Array.isArray(cartItems)) {
      cartItems.forEach((item) => {
        if (Array.isArray(item.medicines)) {
          item.medicines.forEach((med) => {
            console.log("Medicine object:", med);
          });
        }
      });
    }
  }, [cartOpen, cartItems]);

  // Fetch cart items and update count on mount and when token changes
  useEffect(() => {
    if (token) {
      fetchCartItems();
    } else {
      setCartItemCount(0);
      setCartItems([]);
    }
  }, [token]);

  // Spinner component
  function Spinner() {
    return (
      <div className="flex items-center justify-center py-8">
        <MoonLoader color="#2563eb" size={40} />
      </div>
    );
  }

  return (
    <>
      <nav className="bg-white shadow-md fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 h-14">
          {/* Logo + Brand */}
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Tadawi Logo" className="h-8 w-10" />
            <Link
              to="/"
              className="text-xl font-bold text-blue-600 no-underline"
            >
              Tadawi
            </Link>
          </div>

          {/* Hamburger button (mobile) */}
          <button
            className="lg:hidden text-gray-700 text-2xl"
            onClick={() => {
              setIsOpen(!isOpen);
            }}
          >
            ☰
          </button>

          {/* Links */}
          <div
            className={`
              ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
               transition-all duration-300
              lg:flex lg:opacity-100 lg:max-h-none
              flex-col lg:flex-row lg:items-center gap-4
              absolute lg:static top-14 left-0 w-full lg:w-auto
              bg-white lg:bg-transparent px-4 lg:p-0
            `}
          >
            <Link
              to="/donate"
              className="block text-blue-600 hover:text-blue-800 no-underline"
            >
              Donate
            </Link>
            <Link
              to="/Pharmacy"
              className="block text-blue-600 hover:text-blue-800 no-underline"
            >
              Pharmacy
            </Link>

            {!token ? (
              <Link
                to="/auth"
                className="block bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition text-sm no-underline"
              >
                Login
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                {/* Cart Icon */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setCartOpen(!cartOpen);
                    }}
                    className="flex items-center text-blue-600 hover:text-blue-800 bg-transparent hover:bg-transparent active:bg-transparent focus:outline-none border-0 relative"
                  >
                    <ShoppingCart className="w-7 h-7" />
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  </button>
                </div>

                {/* Profile Icon */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => {
                      setProfileOpen(!profileOpen);
                    }}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 bg-transparent hover:bg-transparent active:bg-transparent focus:outline-none border-0"
                  >
                    <User className="w-7 h-7" />
                  </button>

                  {/* Profile Dropdown */}
                  {profileOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl ring-1 ring-gray-200 z-50 overflow-hidden">
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors no-underline"
                        onClick={() => setProfileOpen(false)}
                      >
                        View Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors border-0 focus:outline-none"
                      >
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

      {/* Cart Side Menu */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setCartOpen(false)}
          ></div>

          {/* Cart Panel */}
          <div
            ref={cartRef}
            className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-gray-200 pb-2 mb-1">
                SHOPPING CART
              </h2>
              <button
                onClick={() => setCartOpen(false)}
                className="bg-white border-0 p-0 text-black hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Content */}
            <div
              className="flex-1 overflow-y-auto p-4"
              style={{ maxHeight: "calc(100vh - 120px)" }}
            >
              {loading ? (
                <Spinner />
              ) : !Array.isArray(cartItems) || cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <ShoppingCart className="w-12 h-12 mb-2" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedItems).map(
                    ([pharmacyName, pharmacy]) => {
                      const pharmacySubtotal = pharmacy.items.reduce(
                        (subtotal, item) => {
                          return (
                            subtotal +
                            item.medicines.reduce((total, med) => {
                              const price = parseFloat(med.price_at_time || 0);
                              const quantity = med.quantity || 1;
                              return total + price * quantity;
                            }, 0)
                          );
                        },
                        0
                      );
                      return (
                        <div
                          key={pharmacyName}
                          className="border border-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow pt-1"
                        >
                          {/* Pharmacy Header */}
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-blue-600 text-sm">
                              {pharmacyName}
                            </h3>
                          </div>

                          {/* Pharmacy Items */}
                          <div className="space-y-3">
                            {pharmacy.items.map((item) => (
                              <div key={item.id} className="space-y-2">
                                {item.medicines.map((med) => {
                                  // Use med.medicine_id for delete
                                  return (
                                    <div
                                      key={med.id}
                                      className="flex items-center justify-between"
                                    >
                                      <div className="flex-1">
                                        <p className="font-medium text-gray-900 text-sm">
                                          {med.medicine?.brand_name ||
                                            item.name ||
                                            "Unknown Item"}
                                        </p>
                                        <div className="flex items-center gap-4 mt-1">
                                          <span className="text-gray-600 text-xs">
                                            Qty: {med.quantity || 1}
                                          </span>
                                          <span className="text-gray-900 font-medium text-sm">
                                            $
                                            {parseFloat(
                                              med.price_at_time
                                            ).toFixed(2)}
                                          </span>
                                        </div>
                                      </div>
                                      <button
                                        onClick={() =>
                                          deleteCartMedicine(med.id)
                                        }
                                        className="ml-2 p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-colors border border-red-200 hover:border-red-300"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  );
                                })}

                                {/* Pharmacy Subtotal Display */}
                                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                  <span className="font-medium text-gray-900 text-sm">
                                    Pharmacy Subtotal:
                                  </span>
                                  <span className="font-medium text-gray-900 text-sm">
                                    ${pharmacySubtotal.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                  )}

                  {/* Grand Total */}
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold text-gray-900">
                        Total:
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        $
                        {Object.entries(groupedItems)
                          .reduce((grand, [, pharmacy]) => {
                            return (
                              grand +
                              pharmacy.items.reduce((subtotal, item) => {
                                return (
                                  subtotal +
                                  item.medicines.reduce((total, med) => {
                                    const price = parseFloat(
                                      med.price_at_time || item.price || 0
                                    );
                                    const quantity = med.quantity || 1;
                                    return total + price * quantity;
                                  }, 0)
                                );
                              }, 0)
                            );
                          }, 0)
                          .toFixed(2)}
                      </span>
                    </div>

                    {/* Clear All Button */}
                    {Array.isArray(cartItems) && cartItems.length > 0 && (
                      <button
                        onClick={clearAllCart}
                        className="w-full text-white bg-red-600 hover:bg-red-700 py-3 font-bold transition-colors mb-2 border border-black border-opacity-10 rounded-xl"
                      >
                        Clear All Cart
                      </button>
                    )}

                    {/* Checkout Button */}
                    <button
                      onClick={() => {
                        setCartOpen(false);
                        navigate("/checkout");
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl transition-colors font-medium border border-black border-opacity-10"
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
