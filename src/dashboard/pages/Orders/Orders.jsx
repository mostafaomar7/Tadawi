import React, { useState, useEffect } from 'react';
import {
  MdShoppingCart,
  MdAdd,
  MdSearch,
  MdFilterList,
  MdDelete,
  MdCheckCircle,
  MdCancel,
  MdPending,
  MdLocalShipping,
  MdAttachMoney,
  MdPerson,
  MdDateRange,
  MdRefresh,
  MdEdit
} from 'react-icons/md';
import { ordersService } from '../../services/orders';
import { useToast } from '../../hooks/useToast';
import Modal from '../../components/common/Modal';
import OrderForm from '../../components/forms/OrderForm';

export default function Orders() {
  const { showSuccess, showError } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  });

  useEffect(() => {
    fetchOrders();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersService.getOrders();
      console.log('Orders response:', response);

      // Handle response structure: response.data.data.data
      let ordersData = [];
      if (response.data && response.data.data && response.data.data.data) {
        ordersData = response.data.data.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        ordersData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        ordersData = response.data;
      } else if (Array.isArray(response)) {
        ordersData = response;
      }

      setOrders(ordersData);

      // Calculate stats
      const total = ordersData.length;
      const pending = ordersData.filter(o => o.status === 'pending').length;
      const confirmed = ordersData.filter(o => o.status === 'confirmed').length;
      const shipped = ordersData.filter(o => o.status === 'shipped').length;
      const delivered = ordersData.filter(o => o.status === 'delivered').length;
      const cancelled = ordersData.filter(o => o.status === 'cancelled').length;

      setStats({ total, pending, confirmed, shipped, delivered, cancelled });
    } catch (err) {
      console.error('Orders fetch error:', err);
      setError(err.message);
      showError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrder = () => {
    setSelectedOrder(null);
    setShowModal(true);
  };

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleDeleteOrder = (order) => {
    setOrderToDelete(order);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await ordersService.deleteOrder(orderToDelete.id);
      showSuccess('Order deleted successfully!');
      fetchOrders();
      setShowDeleteConfirm(false);
      setOrderToDelete(null);
    } catch (err) {
      showError(err.message || 'Failed to delete order');
    }
  };


  const handleModalClose = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const handleFormSave = () => {
    fetchOrders();
    setShowModal(false);
    setSelectedOrder(null);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchOrders();
      return;
    }

    try {
      setLoading(true);
      const response = await ordersService.searchOrders(searchTerm);
      setOrders(response.data || response || []);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'bg-warning', icon: MdPending, text: 'Pending' },
      confirmed: { class: 'bg-info', icon: MdCheckCircle, text: 'Confirmed' },
      shipped: { class: 'bg-primary', icon: MdLocalShipping, text: 'Shipped' },
      delivered: { class: 'bg-success', icon: MdCheckCircle, text: 'Delivered' },
      cancelled: { class: 'bg-danger', icon: MdCancel, text: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`badge ${config.class} d-flex align-items-center`}>
        <Icon className="me-1" size={14} />
        {config.text}
      </span>
    );
  };

  const filteredOrders = Array.isArray(orders) ? orders.filter(order => {
    const matchesSearch = order.id?.toString().includes(searchTerm) ||
                         order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.status?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  }) : [];

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="orders-page">
      {/* Header - Clean Design */}
      <div className="horizon-card mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="card-title mb-1">Orders Management</h2>
            <p className="text-muted mb-0">Manage and track all orders in the system</p>
          </div>
          <div className="d-flex gap-2">
            <button 
              className="btn btn-outline-primary"
              onClick={fetchOrders}
              title="Refresh Data"
            >
              Refresh
            </button>
            <button className="btn btn-primary-gradient text-white border-0" onClick={handleAddOrder}>
              Add Order
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards - Clean Design */}
      <div className="row mb-4">
        <div className="col-md-2">
          <div className="horizon-card text-center">
            <h6 className="mb-1 text-muted">Total</h6>
            <h3 className="mb-0 text-primary">{stats.total}</h3>
          </div>
        </div>
        <div className="col-md-2">
          <div className="horizon-card text-center">
            <h6 className="mb-1 text-muted">Pending</h6>
            <h3 className="mb-0 text-warning">{stats.pending}</h3>
          </div>
        </div>
        <div className="col-md-2">
          <div className="horizon-card text-center">
            <h6 className="mb-1 text-muted">Confirmed</h6>
            <h3 className="mb-0 text-info">{stats.confirmed}</h3>
          </div>
        </div>
        <div className="col-md-2">
          <div className="horizon-card text-center">
            <h6 className="mb-1 text-muted">Shipped</h6>
            <h3 className="mb-0 text-secondary">{stats.shipped}</h3>
          </div>
        </div>
        <div className="col-md-2">
          <div className="horizon-card text-center">
            <h6 className="mb-1 text-muted">Delivered</h6>
            <h3 className="mb-0 text-success">{stats.delivered}</h3>
          </div>
        </div>
        <div className="col-md-2">
          <div className="horizon-card text-center">
            <h6 className="mb-1 text-muted">Cancelled</h6>
            <h3 className="mb-0 text-danger">{stats.cancelled}</h3>
          </div>
        </div>
      </div>


      {/* Search and Filter Bar - Clean Design */}
      <div className="horizon-card mb-4">
        <div className="row align-items-center">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="Search orders by ID, user name, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="col-md-3">
            <select 
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="col-md-3">
            <button
              className="btn btn-primary-gradient text-white w-100"
              onClick={handleSearch}
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          <div>
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {/* Orders Table - Clean Design */}
      <div className="horizon-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Orders List</h5>
          <div className="d-flex gap-2">
            <span className="badge bg-success text-white px-3 py-2">
              {filteredOrders.length} Found
            </span>
            {(searchTerm || statusFilter !== 'all') && (
              <span className="badge bg-warning text-white px-3 py-2">
                Filtered
              </span>
            )}
          </div>
        </div>
        <div className="table-responsive">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-5">
              <h4 className="text-muted mb-3">
                {searchTerm || statusFilter !== 'all' ? 'No orders found' : 'No orders available'}
              </h4>
              <p className="text-muted mb-4">
                {searchTerm ? `No orders match your search "${searchTerm}"` : 
                 statusFilter !== 'all' ? `No orders found with the selected status filter` :
                 "No orders available in the system. Add your first order to get started."}
              </p>
              <div className="d-flex gap-3 justify-content-center">
                {searchTerm && (
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => setSearchTerm("")}
                  >
                    Clear Search
                  </button>
                )}
                {statusFilter !== 'all' && (
                  <button 
                    className="btn btn-outline-warning"
                    onClick={() => setStatusFilter('all')}
                  >
                    Clear Status Filter
                  </button>
                )}
                {!searchTerm && statusFilter === 'all' && (
                  <button 
                    className="btn btn-primary-gradient text-white"
                    onClick={handleAddOrder}
                  >
                    Add First Order
                  </button>
                )}
              </div>
            </div>
          ) : (
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th className="border-0 fw-bold">Order Details</th>
                  <th className="border-0 fw-bold">Customer</th>
                  <th className="border-0 fw-bold text-center">Status</th>
                  <th className="border-0 fw-bold text-center">Total</th>
                  <th className="border-0 fw-bold text-center">Date</th>
                  <th className="border-0 fw-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong>#{order.id}</strong>
                    </td>
                    <td>
                      <div>
                        <div className="fw-bold">{order.user?.name || 'Unknown User'}</div>
                        <small className="text-muted">{order.user?.email || ''}</small>
                      </div>
                    </td>
                    <td className="text-center">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="text-center">
                      <strong>{order.total_amount || '0.00'}</strong>
                    </td>
                    <td className="text-center">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="d-flex gap-2 justify-content-center">
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEditOrder(order)}
                          title="Edit Order"
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteOrder(order)}
                          title="Delete Order"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
          )}
        </div>
      </div>

      {/* Order Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleModalClose}
        title={selectedOrder ? "Edit Order" : "Add New Order"}
        size="lg"
      >
        <OrderForm
          order={selectedOrder}
          onSave={handleFormSave}
          onCancel={handleModalClose}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Confirm Delete"
        size="sm"
      >
        <div className="text-center">
          <p>Are you sure you want to delete <strong>Order #{orderToDelete?.id}</strong>?</p>
          <p className="text-muted">This action cannot be undone.</p>
          <div className="d-flex gap-2 justify-content-center">
            <button 
              className="btn btn-secondary"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </button>
            <button 
              className="btn btn-danger"
              onClick={confirmDelete}
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}