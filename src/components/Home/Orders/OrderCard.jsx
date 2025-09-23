import React from "react";
import { Link } from "react-router-dom";
import { 
  Calendar, 
  MapPin, 
  Package, 
  CreditCard,
  Eye,
  Copy,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";

const OrderCard = ({ order }) => {
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
  const copyOrderNumber = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    navigator.clipboard.writeText(order.order_number).then(() => {
      // You could add a toast notification here
      console.log("Order number copied to clipboard");
    }).catch(() => {
      console.error("Failed to copy order number");
    });
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit"
    });
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

  // Get medicines summary
  const getMedicinesSummary = () => {
    if (!order.items || order.items.length === 0) return "No items";
    
    if (order.items.length === 1) {
      const item = order.items[0];
      return `${item.medicine_name} (${item.quantity}x)`;
    }
    
    return `${order.items[0].medicine_name} +${order.items.length - 1} more`;
  };

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      className="order-card"
      whileHover={{ y: -2, shadow: "0 8px 25px rgba(0,0,0,0.15)" }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/orders/${order.id}`} className="order-card-link">
        {/* Header */}
        <div className="order-card-header">
          <div className="order-number-section">
            <div className="order-number">
              <span className="order-label">Order #</span>
              <span className="order-id">{order.order_number}</span>
              <button
                className="copy-btn"
                onClick={copyOrderNumber}
                title="Copy order number"
              >
                <Copy size={14} />
              </button>
            </div>
            <div className="order-date">
              <Calendar size={14} />
              <span>{formatDate(order.created_at)}</span>
              <span className="order-time">{formatTime(order.created_at)}</span>
            </div>
          </div>
          
          <div className={`status-badge ${statusConfig.color}`}>
            <StatusIcon size={16} />
            <span>{order.status_display}</span>
          </div>
        </div>

        {/* Content */}
        <div className="order-card-content">
          {/* Pharmacy Info */}
          <div className="pharmacy-info">
            <div className="pharmacy-location">
              <MapPin size={16} />
              <span>{order.pharmacy.location}</span>
              {order.pharmacy.verified && (
                <div className="verified-badge" title="Verified Pharmacy">
                  <CheckCircle size={14} />
                </div>
              )}
            </div>
            <div className="pharmacy-contact">
              {order.pharmacy.contact_info}
            </div>
          </div>

          {/* Medicines Summary */}
          <div className="medicines-summary">
            <Package size={16} />
            <span>{getMedicinesSummary()}</span>
            <span className="items-count">
              ({order.total_items} item{order.total_items !== 1 ? 's' : ''})
            </span>
          </div>

          {/* Payment Info */}
          <div className="payment-info">
            <CreditCard size={16} />
            <span>{getPaymentMethodDisplay(order.payment_method)}</span>
            <div className={`payment-status ${order.payment.status}`}>
              {order.payment.status}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="order-card-footer">
          <div className="total-amount">
            <span className="amount-label">Total</span>
            <span className="amount-value">
              {parseFloat(order.total_amount).toFixed(2)} {order.currency}
            </span>
          </div>
          
          <div className="view-details-btn">
            <Eye size={16} />
            <span>View Details</span>
          </div>
        </div>

        {/* Progress Bar (for certain statuses) */}
        {(order.status === 'processing' || order.status === 'shipped') && (
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className={`progress-fill ${statusConfig.color}`}
                style={{ 
                  width: order.status === 'processing' ? '50%' : '75%' 
                }}
              ></div>
            </div>
            <div className="progress-labels">
              <span className={order.status === 'processing' ? 'active' : 'completed'}>
                Processing
              </span>
              <span className={order.status === 'shipped' ? 'active' : ''}>
                Shipped
              </span>
              <span>Delivered</span>
            </div>
          </div>
        )}
      </Link>
    </motion.div>
  );
};

export default OrderCard;
