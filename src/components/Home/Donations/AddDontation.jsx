// Main Component: /components/donations/AddDonation.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../../../config";
import { PlusCircle, Trash2, UploadCloud, X, LoaderCircle, CheckCircle, AlertTriangle } from "lucide-react";

const MAX_MEDICINES = 5;
const MAX_PHOTOS = 3;

// Debounce helper for autocomplete
const debounce = (fn, delay = 300) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
};

const AlertMessage = ({ type, message, onDismiss }) => {
  const isError = type === "error";
  const config = {
    bgColor: isError ? "bg-red-50" : "bg-green-50",
    textColor: isError ? "text-red-800" : "text-green-800",
    Icon: isError ? AlertTriangle : CheckCircle,
  };

  if (!message) return null;

  return (
    <div className={`${config.bgColor} ${config.textColor} p-4 rounded-lg flex items-start space-x-3`}>
      <config.Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 whitespace-pre-wrap">{message}</div>
      <button onClick={onDismiss} className="text-current opacity-70 hover:opacity-100">
        <X className="h-5 w-5" />
      </button>
    </div>
  );
};

const MedicineInputRow = ({ medicine, index, onChange, onRemove, error, suggestions = [], onPickSuggestion }) => (
  <div className="p-3 border rounded-lg bg-gray-50/50 space-y-2">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 items-start">
      {/* Medicine Name */}
      <div className="lg:col-span-2">
        <label className="text-sm font-medium text-gray-600 block mb-1">Medicine Name</label>
        <input
          type="text"
          placeholder="e.g. Panadol Extra"
          value={medicine.medicine_name || ""}
          onChange={(e) => onChange(index, "medicine_name", e.target.value)}
          className={`w-full p-2 border rounded-md focus:ring-2 ${error?.medicine_name ? "border-red-500 ring-red-300" : "border-gray-300 focus:ring-blue-500"}`}
        />
        {Array.isArray(suggestions) && suggestions.length > 0 && (
          <div className="mt-2 border rounded-md bg-white shadow-sm max-h-56 overflow-auto">
            {suggestions.map((sug) => (
              <button
                type="button"
                key={sug.id}
                className="w-full text-left px-3 py-2 hover:bg-gray-50"
                onClick={() => onPickSuggestion && onPickSuggestion(index, sug)}
              >
                {(sug.display_text || sug.name)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quantity */}
      <div>
        <label className="text-sm font-medium text-gray-600 block mb-1">Quantity</label>
        <input
          type="number"
          min="1"
          placeholder="1"
          value={medicine.quantity}
          onChange={(e) => onChange(index, "quantity", e.target.value)}
          className={`w-full  p-2 border rounded-md focus:ring-2 ${error?.quantity ? "border-red-500 ring-red-300" : "border-gray-300 focus:ring-blue-500"}`}
        />
      </div>

      {/* Expiry Date */}
      <div>
        <label className="text-sm font-medium text-gray-600 block mb-1">Expiry Date</label>
        <input
          type="date"
          value={medicine.expiry_date}
          onChange={(e) => onChange(index, "expiry_date", e.target.value)}
          className={`w-full p-2 border rounded-md focus:ring-2 ${error?.expiry_date ? "border-red-500 ring-red-300" : "border-gray-300 focus:ring-blue-500"}`}
        />
      </div>

      {/* Remove Button */}
      <div className="flex items-end h-full">
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-3 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center justify-center transition-colors"
            aria-label="Remove medicine"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  </div>
);

const ImageUploader = ({ photos, setPhotos, maxFiles, error }) => {
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    const urls = photos.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [photos]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).slice(0, maxFiles);
    setPhotos(files);
  };

  const removePhoto = (indexToRemove) => {
    setPhotos(photos.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div>
      <label className="block text-base font-semibold text-gray-800 mb-2">Packaging Photos (max {maxFiles})</label>
      <div className={`mt-2 flex justify-center rounded-lg border-2 ${error ? "border-red-500" : "border-dashed border-gray-300"} px-6 py-10`}>
        <div className="text-center">
          <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4 flex items-center text-sm leading-6 text-gray-600">
  <label
    htmlFor="file-upload"
    className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
  >
    <span>Choose files</span>
    <input
      id="file-upload"
      name="file-upload"
      type="file"
      className="sr-only"
      multiple
      accept="image/*"
      onChange={handleFileChange}
    />
  </label>
  <p className="pl-1">or drag and drop</p>
</div>

          <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF up to 10MB</p>
        </div>
      </div>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}

      {previews.length > 0 && (
        <div className="flex gap-4 mt-4 flex-wrap">
          {previews.map((src, i) => (
            <div key={i} className="relative">
              <img src={src} alt={`preview-${i}`} className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200" />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 leading-none"
                aria-label="Remove image"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AddDonation = () => {
  const [contactInfo, setContactInfo] = useState("");
  const [sealedConfirmed, setSealedConfirmed] = useState(false);
  const [medicines, setMedicines] = useState([{ medicine_id: null, medicine_name: "", quantity: 1, expiry_date: "" }]);
  const [photos, setPhotos] = useState([]);

  const [status, setStatus] = useState({ type: null, message: null });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Suggestions per row index
  const [suggestions, setSuggestions] = useState({});

  const searchMedicines = debounce(async (query, rowIndex) => {
    try {
      if (!query || query.length < 2) {
        setSuggestions((prev) => ({ ...prev, [rowIndex]: [] }));
        return;
      }
      const token = localStorage.getItem("authToken");
      const { data } = await axios.get(`${BASE_URL}medicines/search`, {
        params: { q: query, limit: 8 },
        headers: { Authorization: `Bearer ${token}` },
      });
      const items = data?.data?.medicines || [];
      setSuggestions((prev) => ({ ...prev, [rowIndex]: items }));
    } catch (e) {
      setSuggestions((prev) => ({ ...prev, [rowIndex]: [] }));
    }
  }, 300);

  const handleMedicineChange = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    if (field === "medicine_name") {
      updated[index].medicine_id = null;
      searchMedicines(value, index);
    }
    setMedicines(updated);
  };

  const addMedicine = () => {
    if (medicines.length < MAX_MEDICINES) {
      setMedicines([...medicines, { medicine_id: null, medicine_name: "", quantity: 1, expiry_date: "" }]);
    }
  };

  const removeMedicine = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const clearForm = () => {
    setContactInfo("");
    setSealedConfirmed(false);
    setMedicines([{ medicine_id: null, medicine_name: "", quantity: 1, expiry_date: "" }]);
    setPhotos([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setStatus({ type: null, message: null });

    const formData = new FormData();
    formData.append("contact_info", contactInfo);
    formData.append("sealed_confirmed", sealedConfirmed ? "1" : "0");

    medicines.forEach((m, i) => {
      Object.entries(m).forEach(([key, value]) => {
        formData.append(`medicines[${i}][${key}]`, value);
      });
    });

    photos.forEach((file) => {
      formData.append(`packaging_photos[]`, file);
    });

    try {
      const token = localStorage.getItem("authToken");
      await axios.post(`${BASE_URL}donations`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setStatus({ type: "success", message: "Your donation was submitted successfully! Thank you." });
      clearForm();
    } catch (err) {
      if (err.response?.status === 422 && err.response?.data?.errors) {
        const apiErrors = err.response.data.errors;
        setErrors(apiErrors);

        // Show detailed error messages
        const errorDetails = Object.entries(apiErrors)
          .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
          .join("\n");

        setStatus({ type: "error", message: `Validation errors:\n${errorDetails}` });
      } else {
        setStatus({ type: "error", message: err.response?.data?.message || "An unexpected error occurred. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-10 p-8 bg-white shadow-xl rounded-2xl relative">
        <div className="absolute top-4 right-4">
          <a
            href="/mydonate"
            className="inline-block px-6 py-2 text-lg font-semibold text-white bg-gradient-to-r from-green-500 to-green-700 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transform transition-all duration-300 no-underline"
          >
            My Donation
          </a>
        </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Add New Donation</h2>
        <p className="text-gray-500 mt-2">Fill in the form below to contribute medicines.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <AlertMessage type={status.type} message={status.message} onDismiss={() => setStatus({ type: null, message: null })} />

        {/* Contact Information */}
        <div className="p-6 border rounded-xl bg-slate-50">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">1. Contact Information</h3>
          <input
            type="text"
            placeholder="Phone number or email"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
            required
            className={`w-full p-3 border rounded-md focus:ring-2 ${errors.contact_info ? "border-red-500 ring-red-300" : "border-gray-300 focus:ring-blue-500"}`}
          />
          {errors.contact_info && <p className="text-sm text-red-600 mt-1">{errors.contact_info[0]}</p>}
        </div>

        {/* Medicines */}
        <div className="p-6 border rounded-xl bg-slate-50">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">2. Donated Medicines</h3>
          <div className="space-y-4">
            {medicines.map((m, idx) => (
              <MedicineInputRow
                key={idx}
                medicine={m}
                index={idx}
                onChange={handleMedicineChange}
                onRemove={medicines.length > 1 ? () => removeMedicine(idx) : null}
                error={errors[`medicines.${idx}`]}
                suggestions={suggestions[idx] || []}
                onPickSuggestion={(rowIndex, sug) => {
                  const updated = [...medicines];
                  updated[rowIndex].medicine_name = sug.name || sug.display_text || "";
                  updated[rowIndex].medicine_id = sug.id;
                  setMedicines(updated);
                  setSuggestions((prev) => ({ ...prev, [rowIndex]: [] }));
                }}
              />
            ))}
          </div>
          {medicines.length < MAX_MEDICINES && (
            <button
              type="button"
              onClick={addMedicine}
              className="mt-4 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg flex items-center gap-2 hover:bg-blue-50 transition-colors"
            >
              <PlusCircle className="w-5 h-5" /> Add another medicine
            </button>
          )}
        </div>

        {/* Photos & Confirmation */}
        <div className="p-6 border rounded-xl bg-slate-50 space-y-6">
          <h3 className="text-lg font-semibold text-gray-700">3. Confirmation & Photos</h3>
          <ImageUploader photos={photos} setPhotos={setPhotos} maxFiles={MAX_PHOTOS} error={errors.packaging_photos} />

          <div className="flex items-center gap-3 p-3 rounded-md bg-yellow-50 border border-yellow-200">
            <input
              type="checkbox"
              checked={sealedConfirmed}
              onChange={(e) => setSealedConfirmed(e.target.checked)}
              id="sealed"
              className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="sealed" className="font-medium text-yellow-800">
              I confirm that all medicines are sealed and unused.
            </label>
          </div>
          {errors.sealed_confirmed && <p className="text-sm text-red-600">{errors.sealed_confirmed[0]}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 text-lg bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all"
        >
          {loading ? (
            <>
              <LoaderCircle className="animate-spin h-5 w-5" />
              <span>Submitting...</span>
            </>
          ) : (
            "Submit Donation"
          )}
        </button>
      </form>
    </div>
  );
};

export default AddDonation;
