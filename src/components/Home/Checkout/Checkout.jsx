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
      // PayPal handled entirely via PayPal buttons
      setError("Please complete payment using the PayPal button above.");
      setProcessing(false);
      return;
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
  );
}
