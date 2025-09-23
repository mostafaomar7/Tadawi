import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft,
  Calendar,
  MapPin,
  CreditCard,
  Package,
  Phone,
  Mail,
  FileText,
  Download,
  Copy,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  AlertCircle,
  Home,
  User
} from "lucide-react";
import { motion } from "framer-motion";

// Loading skeleton for order details
const OrderDetailsSkeleton = () => (
  <div className="order-details-skeleton">
    <div className="skeleton-header">
      <div className="skeleton-line skeleton-title"></div>
      <div className="skeleton-line skeleton-badge"></div>
    </div>
    <div className="skeleton-sections">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="skeleton-section">
          <div className="skeleton-line skeleton-section-title"></div>
          <div className="skeleton-line skeleton-text"></div>
          <div className="skeleton-line skeleton-text"></div>
        </div>
      ))}
    </div>
  </div>
);

// Error state component
const ErrorState = ({ message, onBack }) => (
  <motion.div 
    className="error-state"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className="error-icon">
      <AlertCircle size={64} />
    </div>
    <h3>Order Not Found</h3>
    <p>{message}</p>
    <button className="btn-back" onClick={onBack}>
      <ArrowLeft size={16} />
      Back to Orders
    </button>
  </motion.div>
);

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const token = localStorage.getItem("authToken");

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!token) {
        setError("Authentication required. Please log in.");
        setLoading(false);
        return;
      }

      if (!orderId) {
        setError("Order ID is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/v1/orders/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Order not found.");
          }
          throw new Error(`Failed to fetch order details: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
          setOrder(data.data);
        } else {
          throw new Error(data.message || "Failed to load order details");
        }
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, token]);

  // Status configuration
  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        icon: Clock,
        color: "warning",
        bgColor: "bg-yellow-50",
        textColor: "text-yellow-700",
        borderColor: "border-yellow-200"
      },
      processing: {
        icon: AlertCircle,
        color: "info",
        bgColor: "bg-blue-50",
        textColor: "text-blue-700",
        borderColor: "border-blue-200"
      },
      confirmed: {
        icon: CheckCircle,
        color: "success",
        bgColor: "bg-green-50",
        textColor: "text-green-700",
        borderColor: "border-green-200"
      },
      shipped: {
        icon: Truck,
        color: "primary",
        bgColor: "bg-indigo-50",
        textColor: "text-indigo-700",
        borderColor: "border-indigo-200"
      },
      delivered: {
        icon: CheckCircle,
        color: "success",
        bgColor: "bg-green-50",
        textColor: "text-green-700",
        borderColor: "border-green-200"
      },
      cancelled: {
        icon: XCircle,
        color: "danger",
        bgColor: "bg-red-50",
        textColor: "text-red-700",
        borderColor: "border-red-200"
      }
    };

    return configs[status] || configs.pending;
  };

  // Copy order number to clipboard
  const copyOrderNumber = () => {
    navigator.clipboard.writeText(order.order_number).then(() => {
      console.log("Order number copied to clipboard");
    }).catch(() => {
      console.error("Failed to copy order number");
    });
  };

  // Format date and time
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric"
      }),
      time: date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit"
      })
    };
  };

  // Get payment method display
  const getPaymentMethodDisplay = (method) => {
    const methods = {
      cash: "Cash on Delivery",
      card: "Credit/Debit Card",
      paypal: "PayPal"
    };
    return methods[method] || method;
  };

  // Download prescription file
  const downloadPrescription = (file) => {
    const link = document.createElement('a');
    link.href = `http://127.0.0.1:8000/storage/${file.file_path}`;
    link.download = file.file_path.split('/').pop();
    link.click();
  };

  // Back to orders
  const handleBack = () => {
    navigate('/orders');
  };

  if (loading) return <OrderDetailsSkeleton />;
  if (error || !order) return <ErrorState message={error} onBack={handleBack} />;

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;
  const orderDateTime = formatDateTime(order.created_at);

  return (
    <div className="order-details-container">
      {/* Header */}
      <motion.div 
        className="order-details-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="header-navigation">
          <button className="back-btn" onClick={handleBack}>
            <ArrowLeft size={20} />
            Back to Orders
          </button>
        </div>
        
        <div className="header-content">
          <div className="order-title-section">
            <h1>Order Details</h1>
            <div className="order-number">
              <span className="order-label">Order #</span>
              <span className="order-id">{order.order_number}</span>
              <button
                className="copy-btn"
                onClick={copyOrderNumber}
                title="Copy order number"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>
          
          <div className={`status-badge large ${statusConfig.color}`}>
            <StatusIcon size={20} />
            <span>{order.status_display}</span>
          </div>
        </div>

        <div className="order-meta">
          <div className="meta-item">
            <Calendar size={16} />
            <span>Placed on {orderDateTime.date} at {orderDateTime.time}</span>
          </div>
          <div className="meta-item">
            <Package size={16} />
            <span>{order.total_items} item{order.total_items !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="order-details-content">
        {/* Order Items */}
        <motion.section 
          className="details-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="section-title">
            <Package size={20} />
            Order Items
          </h2>
          <div className="items-list">
            {order.items.map((item) => (
              <div key={item.id} className="item-card">
                <div className="item-info">
                  <h3 className="item-name">{item.medicine_name}</h3>
                  <div className="item-details">
                    <span className="item-form">{item.medicine_form}</span>
                    <span className="item-dosage">{item.medicine_dosage}</span>
                  </div>
                </div>
                <div className="item-pricing">
                  <div className="quantity">Qty: {item.quantity}</div>
                  <div className="unit-price">
                    {parseFloat(item.price_at_time).toFixed(2)} {order.currency} each
                  </div>
                  <div className="line-total">
                    {parseFloat(item.line_total).toFixed(2)} {order.currency}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Pharmacy Information */}
        <motion.section 
          className="details-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="section-title">
            <MapPin size={20} />
            Pharmacy Information
          </h2>
          <div className="pharmacy-card">
            <div className="pharmacy-info">
              <div className="pharmacy-location">
                <MapPin size={16} />
                <span>{order.pharmacy.location}</span>
                {order.pharmacy.verified && (
                  <div className="verified-badge" title="Verified Pharmacy">
                    <CheckCircle size={14} />
                    Verified
                  </div>
                )}
              </div>
              <div className="pharmacy-contact">
                <Phone size={16} />
                <a href={`tel:${order.pharmacy.contact_info}`}>
                  {order.pharmacy.contact_info}
                </a>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Payment Information */}
        <motion.section 
          className="details-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="section-title">
            <CreditCard size={20} />
            Payment Information
          </h2>
          <div className="payment-card">
            <div className="payment-details">
              <div className="payment-method">
                <CreditCard size={16} />
                <span>{getPaymentMethodDisplay(order.payment_method)}</span>
                <div className={`payment-status ${order.payment.status}`}>
                  {order.payment.status}
                </div>
              </div>
              <div className="payment-amount">
                <span className="amount-label">Total Amount</span>
                <span className="amount-value">
                  {parseFloat(order.total_amount).toFixed(2)} {order.currency}
                </span>
              </div>
              {order.payment.transaction_id && (
                <div className="transaction-id">
                  <span className="label">Transaction ID:</span>
                  <span className="value">{order.payment.transaction_id}</span>
                </div>
              )}
            </div>
          </div>
        </motion.section>

        {/* Delivery Information */}
        <motion.section 
          className="details-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="section-title">
            <Home size={20} />
            Delivery Information
          </h2>
          <div className="delivery-card">
            <div className="address-section">
              <h3 className="address-title">
                <Home size={16} />
                Shipping Address
              </h3>
              <p className="address-text">{order.shipping_address}</p>
            </div>
            {order.billing_address !== order.shipping_address && (
              <div className="address-section">
                <h3 className="address-title">
                  <User size={16} />
                  Billing Address
                </h3>
                <p className="address-text">{order.billing_address}</p>
              </div>
            )}
          </div>
        </motion.section>

        {/* Prescription Files */}
        {order.prescription_uploads && order.prescription_uploads.length > 0 && (
          <motion.section 
            className="details-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="section-title">
              <FileText size={20} />
              Prescription Files
            </h2>
            <div className="prescription-files">
              {order.prescription_uploads.map((file) => (
                <div key={file.id} className="prescription-file">
                  <div className="file-info">
                    <FileText size={16} />
                    <span className="file-name">
                      {file.file_path.split('/').pop()}
                    </span>
                    <span className="file-date">
                      Uploaded on {formatDateTime(file.created_at).date}
                    </span>
                  </div>
                  <button
                    className="download-btn"
                    onClick={() => downloadPrescription(file)}
                    title="Download prescription"
                  >
                    <Download size={16} />
                    Download
                  </button>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Order Summary */}
        <motion.section 
          className="details-section order-summary"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="section-title">Order Summary</h2>
          <div className="summary-card">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{(parseFloat(order.total_amount) * 0.9).toFixed(2)} {order.currency}</span>
            </div>
            <div className="summary-row">
              <span>Tax & Fees</span>
              <span>{(parseFloat(order.total_amount) * 0.1).toFixed(2)} {order.currency}</span>
            </div>
            <div className="summary-row total">
              <span>Total Amount</span>
              <span>{parseFloat(order.total_amount).toFixed(2)} {order.currency}</span>
            </div>
          </div>
        </motion.section>
      </div>

      {/* Action Buttons */}
      <motion.div 
        className="order-actions"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        {order.status === 'pending' && (
          <button className="btn btn-danger">
            <XCircle size={16} />
            Cancel Order
          </button>
        )}
        <Link to="/orders" className="btn btn-secondary">
          <ArrowLeft size={16} />
          Back to Orders
        </Link>
        <button className="btn btn-primary">
          <Phone size={16} />
          Contact Support
        </button>
      </motion.div>
    </div>
  );
};

export default OrderDetails;
