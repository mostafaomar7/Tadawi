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
import { AlertCircle, Upload, Check, CreditCard, Banknote } from "lucide-react";
import { motion } from "framer-motion";

// Skeleton Loader with enhanced styling
const SkeletonBox = ({ className }) => (
  <div className={`bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] rounded-lg ${className}`} />
);

const CheckoutSkeleton = () => (
  <div className="max-w-4xl mx-auto p-6">
    <Card className="shadow-xl border-0 bg-white">
      <CardHeader className="pb-8">
        <SkeletonBox className="h-8 w-1/3 mb-2" />
        <SkeletonBox className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-8">
        <SkeletonBox className="h-6 w-1/4" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex justify-between items-center py-4">
            <SkeletonBox className="h-5 w-2/3" />
            <SkeletonBox className="h-5 w-1/6" />
          </div>
        ))}
      </CardContent>
      <CardFooter className="pt-8">
        <SkeletonBox className="h-14 w-full rounded-xl" />
      </CardFooter>
    </Card>
  </div>
);

// Enhanced Error Display
const ErrorDisplay = ({ message }) => (
  <div className="max-w-4xl mx-auto p-6">
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100 shadow-lg">
        <CardContent className="flex gap-4 items-start p-8">
          <div className="bg-red-500 rounded-full p-2">
            <AlertCircle className="text-white h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-red-800 text-lg mb-2">Error Occurred</h3>
            <p className="text-red-700 leading-relaxed">
              {message || "Something went wrong. Please try again."}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  </div>
);

// Enhanced Input Component
const FormInput = ({ label, value, onChange, placeholder, type = "text", required = false, className = "" }) => (
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-gray-800 tracking-wide">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 
        transition-all duration-200 ease-in-out
        focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none
        hover:border-gray-300 bg-white shadow-sm
        font-medium text-base ${className}`}
    />
  </div>
);

// Enhanced Textarea Component
const FormTextarea = ({ label, value, onChange, placeholder, required = false }) => (
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-gray-800 tracking-wide">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={4}
      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 
        transition-all duration-200 ease-in-out
        focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none
        hover:border-gray-300 bg-white shadow-sm resize-none
        font-medium text-base"
    />
  </div>
);

// Enhanced File Upload Component
const FileUpload = ({ files, onChange, label }) => (
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-gray-800 tracking-wide">
      {label}
    </label>
    <div className="relative">
      <input
        type="file"
        multiple
        onChange={onChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center 
        hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 bg-gray-50">
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-600 font-medium">
          Click to upload prescription files
        </p>
        <p className="text-sm text-gray-500 mt-1">
          PNG, JPG, PDF up to 10MB each
        </p>
        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            {Array.from(files).map((file, index) => (
              <div key={index} className="flex items-center justify-center gap-2 text-sm text-green-600">
                <Check className="h-4 w-4" />
                <span>{file.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

// Enhanced Payment Method Button
const PaymentMethodButton = ({ method, currentMethod, onClick, icon: Icon, label }) => (
  <motion.button
  style={{ outline: "none", border: "none" }}
    type="button"
    onClick={() => onClick(method)}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={`flex items-center gap-3 px-6 py-4 rounded-xl border-2 font-semibold text-base
      transition-all duration-200 ease-in-out min-w-[140px] justify-center
      ${currentMethod === method
        ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200"
        : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50 shadow-sm"
      }`}
  >
    <Icon className="h-5 w-5" />
    {label}
  </motion.button>
);

export default function Checkout() {
  const { pharmacyId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [validation, setValidation] = useState(null);
  const [summary, setSummary] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState("cash");
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
          headers: { Authorization: `Bearer ${token}` },
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      <motion.div
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-2xl border-0 bg-white overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white pb-8">
            <CardTitle className="text-3xl text-white font-bold tracking-tight">
              Review Your Order
            </CardTitle>
            <p className="text-blue-100 text-lg font-medium mt-2">
              Complete your purchase securely
            </p>
          </CardHeader>

          <CardContent className="p-8 space-y-10">
            {/* Pharmacy Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-200"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Pharmacy Information
              </h3>
              <div className="space-y-2">
                <p className="text-gray-800 font-semibold text-lg">{summary?.pharmacy?.name}</p>
                <p className="text-gray-600 font-medium">{summary?.pharmacy?.address}</p>
                <p className="text-gray-600 font-medium">{summary?.pharmacy?.phone}</p>
              </div>
            </motion.div>

            {/* Items List */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Your Items
              </h3>
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <ul className="divide-y divide-gray-100">
                  {summary?.medicines?.map((item, index) => (
                    <motion.li
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="p-6 flex justify-between items-center hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <span className="text-gray-800 font-semibold text-lg">
                          {item.name}
                        </span>
                        <span className="text-gray-500 font-medium ml-3">
                          (Qty: {item.quantity})
                        </span>
                      </div>
                      <span className="font-bold text-xl text-gray-800">
                        {item.subtotal} EGP
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                Order Summary
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-gray-700 font-medium">
                  <span>Subtotal</span>
                  <span className="text-lg">{summary?.totals?.subtotal} EGP</span>
                </div>
                <div className="flex justify-between items-center text-gray-700 font-medium">
                  <span>Tax</span>
                  <span className="text-lg">{summary?.totals?.tax} EGP</span>
                </div>
                <div className="flex justify-between items-center text-gray-700 font-medium">
                  <span>Shipping</span>
                  <span className="text-lg">{summary?.totals?.shipping} EGP</span>
                </div>
                <div className="border-t border-blue-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-800">Total</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {summary?.totals?.total_amount} EGP
                    </span>
                  </div>
                </div>
              </div>
              {summary?.estimated_delivery && (
                <div className="mt-6 p-4 bg-green-100 rounded-xl border border-green-200">
                  <p className="text-green-700 font-semibold flex items-center gap-2">
                    <Check className="h-5 w-5" />
                    Estimated Delivery: {summary?.estimated_delivery}
                  </p>
                </div>
              )}
            </motion.div>

            {/* Payment Method Selection */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Payment Method
              </h3>
              <div className="flex gap-4 flex-wrap">
                <PaymentMethodButton
                style={{ outline: "none", border: "none" }}
                  method="cash"
                  currentMethod={paymentMethod}
                  onClick={setPaymentMethod}
                  icon={Banknote}
                  label="Cash"
                />
                <PaymentMethodButton
                style={{ outline: "none", border: "none" }}
                  method="paypal"
                  currentMethod={paymentMethod}
                  onClick={setPaymentMethod}
                  icon={CreditCard}
                  label="PayPal"
                />
              </div>
            </motion.div>

            {/* Payment Form */}
            {paymentMethod === "cash" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 bg-gray-50 p-6 rounded-2xl border border-gray-200"
              >
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Payment Details
                </h3>
                
                <div className="grid w-full gap-6">
  <FormInput
    label="Billing Address"
    value={billingAddress}
    onChange={(e) => setBillingAddress(e.target.value)}
    placeholder="Enter your billing address"
    required
  />
  <FormInput
    label="Shipping Address"
    value={shippingAddress}
    onChange={(e) => setShippingAddress(e.target.value)}
    placeholder="Enter your shipping address"
    required
  />
</div>
                <FormInput
                  label="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  type="tel"
                  required
                />

                <FormTextarea
                  label="Additional Notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions or notes for your order..."
                />

                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={prescriptionRequired}
                        onChange={(e) => setPrescriptionRequired(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-6 h-6 rounded-lg border-2 transition-all duration-200 
                        ${prescriptionRequired 
                          ? 'bg-blue-600 border-blue-600' 
                          : 'bg-white border-gray-300 group-hover:border-blue-400'
                        }`}>
                        {prescriptionRequired && (
                          <Check className="w-4 h-4 text-white absolute top-0.5 left-0.5" />
                        )}
                      </div>
                    </div>
                    <span className="text-gray-800 font-semibold">
                      Prescription Required
                    </span>
                  </label>

                  <FileUpload
                    files={prescriptionFiles}
                    onChange={(e) => setPrescriptionFiles([...e.target.files])}
                    label="Upload Prescription Files"
                  />
                </div>
              </motion.div>
            )}
          </CardContent>

          <CardFooter className="p-8 bg-gray-50 border-t border-gray-200">
            <motion.button
            style={{ outline: "none", border: "none" }}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={processing}
              onClick={handlePayment}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 
                text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl
                transition-all duration-200 ease-in-out text-lg
                focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                flex items-center justify-center gap-3"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                  Processing Payment...
                </>
              ) : (
                <>
                  <CreditCard className="h-6 w-6" />
                  Confirm & Pay {summary?.totals?.total_amount} EGP
                </>
              )}
            </motion.button>
          </CardFooter>
        </Card>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <ErrorDisplay message={error} />
          </motion.div>
        )}
      </motion.div>

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}