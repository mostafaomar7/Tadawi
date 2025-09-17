import React, { useState, useEffect } from 'react';
import { ordersService } from '../../services/orders';

export default function OrderForm({ order, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    user_id: '',
    status: 'pending',
    total_amount: '',
    shipping_address: '',
    billing_address: '',
    payment_method: 'cash',
    notes: '',
    items: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (order) {
      setFormData({
        user_id: order.user_id || '',
        status: order.status || 'pending',
        total_amount: order.total_amount || '',
        shipping_address: order.shipping_address || '',
        billing_address: order.billing_address || '',
        payment_method: order.payment_method || 'cash',
        notes: order.notes || '',
        items: order.items || []
      });
    }
    // In a real app, you would fetch users from API
    setUsers([
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com' }
    ]);
  }, [order]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        medicine_id: '',
        quantity: 1,
        price: 0
      }]
    }));
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Transform form data to match backend expectations
      const backendData = {
        user_id: parseInt(formData.user_id),
        status: formData.status,
        total_amount: parseFloat(formData.total_amount),
        shipping_address: formData.shipping_address,
        billing_address: formData.billing_address,
        payment_method: formData.payment_method,
        notes: formData.notes,
        items: formData.items.map(item => ({
          medicine_id: parseInt(item.medicine_id),
          quantity: parseInt(item.quantity),
          price: parseFloat(item.price)
        }))
      };

      console.log('Sending order data to backend:', backendData);

      if (order) {
        await ordersService.updateOrder(order.id, backendData);
      } else {
        await ordersService.createOrder(backendData);
      }
      onSave();
    } catch (err) {
      console.error('Order form submission error:', err);
      if (err.response?.data?.errors) {
        // Handle validation errors
        const errorMessages = Object.values(err.response.data.errors).flat();
        setError(errorMessages.join(', '));
      } else {
        setError(err.message || 'An error occurred while saving the order');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="order-form">
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="alert alert-danger d-flex align-items-center" role="alert">
            <i className="fas fa-exclamation-triangle me-2"></i>
            <div>
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}

        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Customer *</label>
              <select
                className="form-control"
                name="user_id"
                value={formData.user_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Customer</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Status *</label>
              <select
                className="form-control"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Total Amount *</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                name="total_amount"
                value={formData.total_amount}
                onChange={handleChange}
                required
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Payment Method *</label>
              <select
                className="form-control"
                name="payment_method"
                value={formData.payment_method}
                onChange={handleChange}
                required
              >
                <option value="cash">Cash</option>
                <option value="credit_card">Credit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="mobile_payment">Mobile Payment</option>
              </select>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Shipping Address *</label>
              <textarea
                className="form-control"
                name="shipping_address"
                rows="3"
                value={formData.shipping_address}
                onChange={handleChange}
                required
                placeholder="Enter shipping address..."
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Billing Address</label>
              <textarea
                className="form-control"
                name="billing_address"
                rows="3"
                value={formData.billing_address}
                onChange={handleChange}
                placeholder="Enter billing address (optional)..."
              />
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>Order Items</h5>
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={addItem}
            >
              <i className="fas fa-plus me-1"></i>Add Item
            </button>
          </div>

          {formData.items.length === 0 ? (
            <div className="text-center py-3 text-muted">
              <p>No items added yet. Click "Add Item" to start.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Medicine ID</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={item.medicine_id}
                          onChange={(e) => handleItemChange(index, 'medicine_id', e.target.value)}
                          placeholder="Medicine ID"
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          min="1"
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control form-control-sm"
                          value={item.price}
                          onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                          placeholder="0.00"
                          required
                        />
                      </td>
                      <td>
                        <strong>${(item.quantity * item.price).toFixed(2)}</strong>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeItem(index)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">Notes</label>
          <textarea
            className="form-control"
            name="notes"
            rows="3"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Additional notes or comments..."
          />
        </div>

        <div className="modal-footer">
          <button 
            type="button" 
            className="btn btn-outline-secondary" 
            onClick={onCancel}
            disabled={loading}
          >
            <i className="fas fa-times me-2"></i>Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary-gradient text-white border-0"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin me-2"></i>Saving...
              </>
            ) : (
              <>
                <i className="fas fa-save me-2"></i>{order ? 'Update Order' : 'Create Order'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
