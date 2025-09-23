import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Filter, 
  Package, 
  ShoppingCart,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import OrderCard from "./OrderCard";
import "./Orders.css";

// Loading Skeleton Component
const OrderSkeleton = () => (
  <div className="order-skeleton">
    <div className="skeleton-header">
      <div className="skeleton-line skeleton-title"></div>
      <div className="skeleton-line skeleton-badge"></div>
    </div>
    <div className="skeleton-body">
      <div className="skeleton-line skeleton-text"></div>
      <div className="skeleton-line skeleton-text-short"></div>
    </div>
    <div className="skeleton-footer">
      <div className="skeleton-line skeleton-amount"></div>
      <div className="skeleton-line skeleton-button"></div>
    </div>
  </div>
);

// Empty State Component
const EmptyState = ({ hasFilters, onClearFilters }) => (
  <motion.div 
    className="empty-state"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className="empty-icon">
      <Package size={64} />
    </div>
    <h3>No Orders Found</h3>
    <p>
      {hasFilters 
        ? "No orders match your current filters. Try adjusting your search criteria."
        : "You haven't placed any orders yet. Start shopping to see your orders here!"
      }
    </p>
    {hasFilters && (
      <button className="btn-clear-filters" onClick={onClearFilters}>
        Clear Filters
      </button>
    )}
    {!hasFilters && (
      <Link to="/pharasearch" className="btn-start-shopping">
        Start Shopping
      </Link>
    )}
  </motion.div>
);

// Error State Component
const ErrorState = ({ message, onRetry }) => (
  <motion.div 
    className="error-state"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className="error-icon">
      <AlertCircle size={64} />
    </div>
    <h3>Unable to Load Orders</h3>
    <p>{message}</p>
    <button className="btn-retry" onClick={onRetry}>
      <RefreshCw size={16} />
      Try Again
    </button>
  </motion.div>
);

const Orders = () => {
  // State Management
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter States
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Auth token
  const token = localStorage.getItem("authToken");

  // Status options for filter
  const statusOptions = [
    { value: "all", label: "All Orders", color: "default" },
    { value: "pending", label: "Pending", color: "warning" },
    { value: "processing", label: "Processing", color: "info" },
    { value: "confirmed", label: "Confirmed", color: "success" },
    { value: "shipped", label: "Shipped", color: "primary" },
    { value: "delivered", label: "Delivered", color: "success" },
    { value: "cancelled", label: "Cancelled", color: "danger" }
  ];

  // Payment method options
  const paymentOptions = [
    { value: "all", label: "All Methods" },
    { value: "cash", label: "Cash" },
    { value: "card", label: "Card" },
    { value: "paypal", label: "PayPal" }
  ];

  // Fetch Orders Function
  const fetchOrders = async (page = 1) => {
    if (!token) {
      setError("Authentication required. Please log in.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: itemsPerPage.toString()
      });

      // Add filters if they exist
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      if (paymentFilter !== "all") {
        params.append("payment_method", paymentFilter);
      }

      const response = await fetch(
        `http://127.0.0.1:8000/api/v1/orders?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data || []);
        
        // Handle pagination if provided in response
        if (data.pagination) {
          setCurrentPage(data.pagination.current_page);
          setTotalPages(data.pagination.last_page);
          setTotalItems(data.pagination.total);
        } else {
          // Estimate pagination from data length
          setTotalItems(data.data.length);
          setTotalPages(Math.ceil(data.data.length / itemsPerPage));
        }
      } else {
        throw new Error(data.message || "Failed to load orders");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage, statusFilter, paymentFilter]);


  // Event Handlers
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handlePaymentFilter = (payment) => {
    setPaymentFilter(payment);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setPaymentFilter("all");
    setCurrentPage(1);
  };

  const hasActiveFilters = statusFilter !== "all" || paymentFilter !== "all";

  // Render Functions
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="pagination-container">
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <div className="pagination-numbers">
            {startPage > 1 && (
              <>
                <button
                  className="pagination-number"
                  onClick={() => handlePageChange(1)}
                >
                  1
                </button>
                {startPage > 2 && <span className="pagination-ellipsis">...</span>}
              </>
            )}

            {pages.map((page) => (
              <button
                key={page}
                className={`pagination-number ${
                  currentPage === page ? "active" : ""
                }`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}

            {endPage < totalPages && (
              <>
                {endPage < totalPages - 1 && <span className="pagination-ellipsis">...</span>}
                <button
                  className="pagination-number"
                  onClick={() => handlePageChange(totalPages)}
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>

          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="pagination-info">
          Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} to{" "}
          {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} orders
        </div>
      </div>
    );
  };

  return (
    <div className="orders-container">
      {/* Header */}
      <motion.div 
        className="orders-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="header-content">
          <div className="header-title">
            <ShoppingCart size={28} />
            <h1>My Orders</h1>
          </div>
          <p className="header-subtitle">
            Track and manage your medicine orders
          </p>
        </div>
      </motion.div>

      {/* Filters Section */}
      <motion.div 
        className="orders-filters"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {/* Filter Pills */}
        <div className="filters-row">
          {/* Status Filter */}
          <div className="filter-group">
            <label className="filter-label">
              <Filter size={16} />
              Status
            </label>
            <div className="filter-pills">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  className={`filter-pill ${
                    statusFilter === option.value ? "active" : ""
                  } ${option.color}`}
                  onClick={() => handleStatusFilter(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Filter */}
          <div className="filter-group">
            <label className="filter-label">Payment Method</label>
            <div className="filter-pills">
              {paymentOptions.map((option) => (
                <button
                  key={option.value}
                  className={`filter-pill ${
                    paymentFilter === option.value ? "active" : ""
                  }`}
                  onClick={() => handlePaymentFilter(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="active-filters">
            <span>Active filters: </span>
            {statusFilter !== "all" && (
              <span className="filter-tag">
                Status: {statusOptions.find(s => s.value === statusFilter)?.label}
              </span>
            )}
            {paymentFilter !== "all" && (
              <span className="filter-tag">
                Payment: {paymentOptions.find(p => p.value === paymentFilter)?.label}
              </span>
            )}
            <button className="clear-filters-btn" onClick={clearFilters}>
              Clear All
            </button>
          </div>
        )}
      </motion.div>

      {/* Content */}
      <motion.div 
        className="orders-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {loading && (
          <div className="orders-grid">
            {[...Array(6)].map((_, index) => (
              <OrderSkeleton key={index} />
            ))}
          </div>
        )}

        {error && !loading && (
          <ErrorState 
            message={error} 
            onRetry={() => fetchOrders(currentPage)} 
          />
        )}

        {!loading && !error && orders.length === 0 && (
          <EmptyState 
            hasFilters={hasActiveFilters} 
            onClearFilters={clearFilters} 
          />
        )}

        {!loading && !error && orders.length > 0 && (
          <>
            <div className="orders-grid">
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <OrderCard order={order} />
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {renderPagination()}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Orders;
