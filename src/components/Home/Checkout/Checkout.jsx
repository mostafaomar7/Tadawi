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
  const [paypalConfig, setPaypalConfig] = useState(null);
  const [paypalSDKLoaded, setPaypalSDKLoaded] = useState(false);
  const [paypalPaymentCompleted, setPaypalPaymentCompleted] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);

  // Derived validation for prescription requirement
  const isPrescriptionValid = !prescriptionRequired || (prescriptionFiles && prescriptionFiles.length > 0);

  // Load PayPal SDK dynamically when PayPal is selected
  useEffect(() => {
    if (paymentMethod === "paypal" && !paypalSDKLoaded) {
      loadPayPalSDK();
    }
  }, [paymentMethod]);

  // Effect to render PayPal buttons when PayPal is selected and SDK is loaded
  useEffect(() => {
    if (paymentMethod === "paypal" && summary && paypalSDKLoaded && window.paypal) {
      // Small delay to ensure the container is rendered
      setTimeout(() => {
        renderPayPalButtons();
      }, 100);
    }
  }, [paymentMethod, summary, paypalSDKLoaded, prescriptionRequired, prescriptionFiles]);

  const loadPayPalSDK = async () => {
    try {
      // Get PayPal config from your backend
      const token = localStorage.getItem("authToken");
      console.log("Fetching PayPal config from:", `${BASE_URL}checkout/paypal/config`);
      
      const response = await fetch(`${BASE_URL}checkout/paypal/config`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("PayPal config response status:", response.status);
      console.log("PayPal config response headers:", response.headers);
      
      // Check if response is actually JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error("Non-JSON response:", textResponse);
        throw new Error("Backend returned non-JSON response. Check if the endpoint exists.");
      }
      
      const data = await response.json();
      console.log("PayPal config data:", data);
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to get PayPal config");
      }

      setPaypalConfig(data.config);

      // Load PayPal SDK script dynamically
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${data.config.client_id}&currency=${data.config.currency}&disable-funding=credit,card`;
      script.async = true;
      script.onload = () => {
        setPaypalSDKLoaded(true);
      };
      script.onerror = () => {
        setError("Failed to load PayPal SDK");
      };
      document.body.appendChild(script);
      
    } catch (error) {
      console.error("PayPal config error:", error);
      setError("Failed to load PayPal configuration");
    }
  };

  const renderPayPalButtons = () => {
    const container = document.getElementById('paypal-button-container');
    if (!container || !window.paypal) return;

    // Clear any existing content
    container.innerHTML = '';

    window.paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'blue',
        shape: 'rect',
        label: 'paypal'
      },
      onClick: (data, actions) => {
        // Client-side validation before opening the PayPal popup
        if (!isPrescriptionValid) {
          setError("Prescription files are required when prescription is needed");
          return actions.reject();
        }
        // Clear any previous error
        setError(null);
        return actions.resolve();
      },
      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: summary.totals.total_amount,
              currency_code: paypalConfig?.currency || 'USD'
            },
            description: `Order from ${summary.pharmacy.name}`
          }]
        });
      },
      onApprove: async (data, actions) => {
        try {
          setProcessing(true);
          
          // Capture the PayPal payment
          const details = await actions.order.capture();
          
          console.log("PayPal payment captured:", details);
          
          // Step 1: Create order in database
          const formData = new FormData();
          formData.append("payment_method", "paypal");
          formData.append("billing_address", billingAddress);
          formData.append("shipping_address", shippingAddress);
          formData.append("phone", phone);
          formData.append("notes", notes);
          formData.append("prescription_required", prescriptionRequired ? "true" : "false");

          for (let file of prescriptionFiles) {
            formData.append("prescription_files[]", file);
          }

          console.log("Creating order...");
          const initiateResponse = await fetch(`${BASE_URL}checkout/initiate/${pharmacyId}`, {
            method: "POST",
            headers: { 
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              Accept: "application/json",
            },
            body: formData,
          });

          console.log("Initiate response status:", initiateResponse.status);
          const initiateText = await initiateResponse.text();
          console.log("Initiate response body:", initiateText);

          let initiateData;
          try {
            initiateData = JSON.parse(initiateText);
          } catch (e) {
            console.error("Failed to parse initiate response as JSON:", initiateText);
            throw new Error("Backend returned invalid response for order creation");
          }

          if (!initiateResponse.ok) {
            // Prefer detailed server-side validation messages
            let friendlyMessage = initiateData.message || "Failed to create order";
            if (initiateData.errors) {
              const fieldErrors = [];
              Object.keys(initiateData.errors).forEach((key) => {
                const arr = initiateData.errors[key];
                if (Array.isArray(arr) && arr.length > 0) {
                  fieldErrors.push(arr[0]);
                }
              });
              if (fieldErrors.length > 0) {
                friendlyMessage = fieldErrors.join(" \n");
              }
            }
            throw new Error(friendlyMessage);
          }

          console.log("Order created successfully:", initiateData);
          
          // Since we have the order created, show success and redirect
          // (Skip the PayPal processing call for now since it might not exist)
          setPaypalPaymentCompleted(true);
          setProcessing(false);
          
          // Redirect to orders page after showing success message
          setTimeout(() => {
            window.location.href = '/orders';
          }, 3000);
          
        } catch (error) {
          console.error("PayPal payment error:", error);
          setError(error.message);
          setProcessing(false);
        }
      },
      onError: (err) => {
        console.error("PayPal error:", err);
        setError("PayPal payment failed");
        setProcessing(false);
      },
      onCancel: (data) => {
        setError("PayPal payment was cancelled");
        setProcessing(false);
      }
    }).render('#paypal-button-container');
  };

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
        headers: { Authorization: `Bearer ${token}` }, // Important: don't set content-type manually
        body,
      };
    } else if (paymentMethod === "paypal") {
      // PayPal handled entirely via PayPal buttons
      setError("Please complete payment using the PayPal button above.");
      setProcessing(false);
      return;
    }

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


    // For cash payments - show success message and redirect
    setOrderCompleted(true);
    setProcessing(false);
    
    // Redirect to orders page after showing success message
    setTimeout(() => {
      window.location.href = '/orders';
    }, 3000);
    
    return; // Exit early to avoid the processing state change below
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
                Prescription Required
              </label>
              <input
                type="file"
                multiple
                onChange={(e) => setPrescriptionFiles([...e.target.files])}
              />
            </div>
          )}

          {paymentMethod === "paypal" && (
            <div className="space-y-4 mt-6">
              <h3 className="text-lg font-semibold text-gray-800">PayPal Payment</h3>
              <p className="text-gray-600">Complete your payment securely with PayPal</p>
              
              {/* Payment Details Form for PayPal */}
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700">Delivery Information</h4>
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
              
              {/* PayPal Button Container */}
              <div id="paypal-button-container" className="mt-4">
                {paymentMethod === "paypal" && !paypalSDKLoaded && (
                  <div className="text-center py-4">
                    <div className="text-gray-600">Loading PayPal...</div>
                  </div>
                )}
                {paypalPaymentCompleted && (
                  <div className="text-center py-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-green-700 font-semibold text-lg">✓ Order Completed Successfully!</div>
                    <div className="text-green-600 text-sm mt-2">Your payment has been processed. Redirecting to your orders page...</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>

        {/* Success Messages */}
        {orderCompleted && (
          <div className="text-center py-4 bg-green-50 rounded-lg border border-green-200 mx-6 mb-4">
            <div className="text-green-700 font-semibold text-lg">✓ Order Completed Successfully!</div>
            <div className="text-green-600 text-sm mt-2">Your order has been placed. Redirecting to your orders page...</div>
          </div>
        )}

        <CardFooter>
          {/* Hide button when any payment is completed */}
          {!paypalPaymentCompleted && !orderCompleted && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              disabled={processing || paymentMethod === "paypal"}
              onClick={handlePayment}
              className={`w-full font-semibold py-3 px-4 rounded-lg shadow-md transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 ${
                paymentMethod === "paypal"
                  ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {processing 
                ? "Processing..." 
                : paymentMethod === "paypal" 
                  ? "Complete PayPal Payment Above" 
                  : "Confirm & Pay"
              }
            </motion.button>
          )}
        </CardFooter>
      </Card>

      {error && <ErrorDisplay message={error} />}
    </motion.div>

{/*COMMMENT CONFLICT الي تحت دة ui بس*/}
{/*
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
    </div>  */}

  );
}