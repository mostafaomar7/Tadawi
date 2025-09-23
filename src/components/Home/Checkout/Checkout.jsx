import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BASE_URL } from "../../../config";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../ui/card";
import { AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

// Skeleton Loader
const SkeletonBox = ({ className }) => (
  <div className={`bg-gray-200 rounded animate-pulse ${className}`} />
);

const CheckoutSkeleton = () => (
  <Card className="max-w-2xl mx-auto">
    <CardHeader>
      <SkeletonBox className="h-8 w-1/3 mb-4" />
    </CardHeader>
    <CardContent className="space-y-6">
      <SkeletonBox className="h-5 w-1/4" />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex justify-between">
          <SkeletonBox className="h-5 w-2/3" />
          <SkeletonBox className="h-5 w-1/6" />
        </div>
      ))}
    </CardContent>
    <CardFooter>
      <SkeletonBox className="h-10 w-full rounded-lg" />
    </CardFooter>
  </Card>
);

// Error Display
const ErrorDisplay = ({ message }) => (
  <Card className="max-w-2xl mx-auto border-red-200 bg-red-50 mt-4">
    <CardContent className="flex gap-3 items-start p-6">
      <AlertCircle className="text-red-500 h-6 w-6 mt-1" />
      <div>
        <p className="font-semibold text-red-700">Error</p>
        <p className="text-sm text-red-600 mt-1">
          {message || "Something went wrong."}
        </p>
      </div>
    </CardContent>
  </Card>
);

export default function Checkout() {
  const { pharmacyId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [validation, setValidation] = useState(null);
  const [summary, setSummary] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState("cash"); // default cash
  const [processing, setProcessing] = useState(false);

  // form state
  const [billingAddress, setBillingAddress] = useState("123 Main Street, Cairo, Egypt");
  const [shippingAddress, setShippingAddress] = useState("123 Main Street, Cairo, Egypt");
  const [phone, setPhone] = useState("+201234567890");
  const [notes, setNotes] = useState("");
  const [prescriptionRequired, setPrescriptionRequired] = useState(true);
  const [prescriptionFiles, setPrescriptionFiles] = useState([]);

  useEffect(() => {
    const fetchCheckoutData = async () => {
      setLoading(true);
      setError(null);
      setValidation(null);
      setSummary(null);

      if (!pharmacyId) {
        setError("Pharmacy ID is missing from the URL.");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("authToken");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      try {
        const validateRes = await fetch(
          `${BASE_URL}checkout/validate/${pharmacyId}`,
          { headers }
        );
        const validateData = await validateRes.json();

        if (!validateRes.ok) {
          throw new Error(validateData.message || "Failed to validate checkout.");
        }

        setValidation(validateData);

        if (validateData.valid) {
          const summaryRes = await fetch(
            `${BASE_URL}checkout/summary/${pharmacyId}`,
            { headers }
          );
          const summaryData = await summaryRes.json();

          if (!summaryRes.ok) {
            throw new Error(
              summaryData.message || "Failed to get checkout summary."
            );
          }
          setSummary(summaryData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCheckoutData();
  }, [pharmacyId]);

  const handlePayment = async () => {
  if (!summary) return;
  setProcessing(true);
  setError(null);

  const token = localStorage.getItem("authToken");

  try {
    let response;
    let url;
    let options;

    if (paymentMethod === "cash") {
      // build form-data
      const body = new FormData();
      body.append("payment_method", "cash");
      body.append("billing_address", billingAddress);
      body.append("shipping_address", shippingAddress);
      body.append("phone", phone);
      body.append("notes", notes);
      body.append("prescription_required", prescriptionRequired ? "true" : "false");

      for (let file of prescriptionFiles) {
        body.append("prescription_files[]", file);
      }

      url = `${BASE_URL}checkout/initiate/${pharmacyId}`;
      options = {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }, // Important: don't set content-type manually
        body,
      };
    } else if (paymentMethod === "paypal") {
      const body = {
        order_id: summary?.order_id || "65",
        payer_id: "PAYER123456789",
        payment_id: "PAY123456789",
      };

      url = `${BASE_URL}checkout/paypal/${pharmacyId}`;
      options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      };
    }

    // Debugging Logs
    console.log("=== Payment Request Debug ===");
    console.log("URL:", url);
    console.log("Options:", options);

    response = await fetch(url, options);

    const data = await response.json();
    console.log("Response:", data);

    if (!response.ok) {
      throw new Error(
        data.message || `Payment failed: ${JSON.stringify(data)}`
      );
    }

    alert(data.message || "Payment successful!");
  } catch (err) {
    console.error("Payment Error:", err);
    setError(err.message);
  } finally {
    setProcessing(false);
  }
};


  if (loading) return <CheckoutSkeleton />;
  if (error && !summary) return <ErrorDisplay message={error} />;
  if (!validation?.valid) return <ErrorDisplay message={validation?.message} />;

  return (
    <motion.div
      className="max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Review Your Order</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Pharmacy Info */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Pharmacy Information
            </h3>
            <p className="text-gray-700">{summary?.pharmacy?.name}</p>
            <p className="text-gray-500 text-sm">{summary?.pharmacy?.address}</p>
            <p className="text-gray-500 text-sm">{summary?.pharmacy?.phone}</p>
          </div>

          {/* Items List */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Your Items
            </h3>
            <ul className="divide-y divide-gray-200">
              {summary?.medicines?.map((item) => (
                <li
                  key={item.id}
                  className="py-3 flex justify-between items-center"
                >
                  <span className="text-gray-700">
                    {item.name}{" "}
                    <span className="text-gray-500 text-sm">
                      (x{item.quantity})
                    </span>
                  </span>
                  <span className="font-medium">{item.subtotal} EGP</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Order Summary */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Order Summary
            </h3>
            <div className="space-y-2 text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{summary?.totals?.subtotal} EGP</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{summary?.totals?.tax} EGP</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{summary?.totals?.shipping} EGP</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-3 border-t mt-3">
                <span>Total</span>
                <span>{summary?.totals?.total_amount} EGP</span>
              </div>
            </div>
            {summary?.estimated_delivery && (
              <p className="text-sm text-green-600 mt-4">
                ✓ Estimated Delivery: {summary?.estimated_delivery}
              </p>
            )}
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800">Payment Method</h3>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod("cash")}
                className={`px-4 py-2 rounded-lg border ${
                  paymentMethod === "cash"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
              >
                Cash
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("paypal")}
                className={`px-4 py-2 rounded-lg border ${
                  paymentMethod === "paypal"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
              >
                PayPal
              </button>
            </div>
          </div>

          {/* Payment Form */}
          {paymentMethod === "cash" && (
            <div className="space-y-4 mt-6">
              <h3 className="text-lg font-semibold text-gray-800">Payment Details</h3>
              <input
                type="text"
                value={billingAddress}
                onChange={(e) => setBillingAddress(e.target.value)}
                placeholder="Billing Address"
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                type="text"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Shipping Address"
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone"
                className="w-full border rounded-lg px-3 py-2"
              />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes (optional)"
                className="w-full border rounded-lg px-3 py-2"
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={prescriptionRequired}
                  onChange={(e) => setPrescriptionRequired(e.target.checked)}
                />
                Prescription Required
              </label>
              <input
                type="file"
                multiple
                onChange={(e) => setPrescriptionFiles([...e.target.files])}
              />
            </div>
          )}
        </CardContent>

        <CardFooter>
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            disabled={processing}
            onClick={handlePayment}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50"
          >
            {processing ? "Processing..." : "Confirm & Pay"}
          </motion.button>
        </CardFooter>
      </Card>

      {error && <ErrorDisplay message={error} />}
    </motion.div>
  );
}
