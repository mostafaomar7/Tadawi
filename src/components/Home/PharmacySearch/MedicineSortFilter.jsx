import React from "react";

const MedicineSortFilter = ({ medicines, onSorted }) => {
  const handleChange = (e) => {
    const value = e.target.value;
    let sorted = [...medicines];

    switch (value) {
      case "name-asc":
        sorted.sort((a, b) => a.medicine_name.localeCompare(b.medicine_name));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.medicine_name.localeCompare(a.medicine_name));
        break;
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "0-50":
        sorted = sorted.filter((m) => m.price <= 50);
        break;
      case "51-100":
        sorted = sorted.filter((m) => m.price > 50 && m.price <= 100);
        break;
      case "100+":
        sorted = sorted.filter((m) => m.price > 100);
        break;
      default:
        break;
    }

    onSorted(sorted);
  };

  return (
    <div className="mb-4">
      <select
        onChange={handleChange}
        defaultValue=""
        className="p-2 border rounded bg-white"
      >
        <option value="">Sort / Filter</option>
        <optgroup label="Sort">
          <option value="name-asc">Name Ascending</option>
          <option value="name-desc">Name Descending</option>
          <option value="price-asc">Price Ascending</option>
          <option value="price-desc">Price Descending</option>
        </optgroup>
        <optgroup label="Price Filter">
          <option value="0-50">0-50 EGP</option>
          <option value="51-100">51-100 EGP</option>
          <option value="100+">100+ EGP</option>
        </optgroup>
      </select>
    </div>
  );
};

export default MedicineSortFilter;
