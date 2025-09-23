import React, { useState, useEffect } from "react";

const MedicineSortFilter = ({ medicines = [], onSorted = () => {} }) => {
  // Sort states
  const [sortDistance, setSortDistance] = useState(""); // "nearest" or "farthest"
  const [sortName, setSortName] = useState(""); // "asc" or "desc"

  // Price filter state (multiple selection)
  const [priceFilters, setPriceFilters] = useState([]);

  // Handle checkbox change
  const togglePriceFilter = (value) => {
    setPriceFilters((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  useEffect(() => {
    if (!medicines || medicines.length === 0) return;

    let filtered = [...medicines];

    // Apply price filters
    if (priceFilters.length > 0) {
      filtered = filtered.map((pharmacy) => {
        const filteredMeds = pharmacy.medicines.filter((med) => {
          const price = med.price || 0;
          return priceFilters.some((range) => {
            if (range === "0-50") return price >= 0 && price <= 50;
            if (range === "51-100") return price >= 51 && price <= 100;
            if (range === "100+") return price > 100;
            return true;
          });
        });
        return { ...pharmacy, medicines: filteredMeds };
      });
    }

    // Remove pharmacies with no medicines after filtering
    filtered = filtered.filter((pharmacy) => pharmacy.medicines.length > 0);

    // Sort by distance
    if (sortDistance) {
      filtered.sort((a, b) =>
        sortDistance === "nearest"
          ? (a.distance || 0) - (b.distance || 0)
          : (b.distance || 0) - (a.distance || 0)
      );
    }

    // Sort by pharmacy name
    if (sortName) {
      filtered.sort((a, b) =>
        sortName === "asc"
          ? a.pharmacy_name.localeCompare(b.pharmacy_name)
          : b.pharmacy_name.localeCompare(a.pharmacy_name)
      );
    }

    onSorted(filtered);
  }, [medicines, sortDistance, sortName, priceFilters, onSorted]);

  return (
    <div className="flex flex-col w-64 p-4 bg-white shadow rounded-lg space-y-6">
      {/* Sort by Distance */}
      <div>
        <h3 className="font-semibold mb-2">Sort by Distance</h3>
        <select
          value={sortDistance}
          onChange={(e) => setSortDistance(e.target.value)}
          className="w-full border px-3 py-2 rounded-lg"
        >
          <option value="">None</option>
          <option value="nearest">Nearest</option>
          <option value="farthest">Farthest</option>
        </select>
      </div>

      {/* Sort by Name */}
      <div>
        <h3 className="font-semibold mb-2">Sort by Pharmacy Name</h3>
        <select
          value={sortName}
          onChange={(e) => setSortName(e.target.value)}
          className="w-full border px-3 py-2 rounded-lg"
        >
          <option value="">None</option>
          <option value="asc">A → Z</option>
          <option value="desc">Z → A</option>
        </select>
      </div>

      {/* Price Filters */}
      <div>
        <h3 className="font-semibold mb-2">Filter by Price</h3>
        <div className="flex flex-col space-y-2">
          {["0-50", "51-100", "100+"].map((range) => (
            <label key={range} className="inline-flex items-center space-x-2">
              <input
                type="checkbox"
                checked={priceFilters.includes(range)}
                onChange={() => togglePriceFilter(range)}
                className="form-checkbox"
              />
              <span>{range} EGP</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MedicineSortFilter;
