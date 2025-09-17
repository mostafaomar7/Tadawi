import React, { useState, useEffect } from 'react';
import { donationsService } from '../../services/donations';

export default function DonationForm({ donation, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    donor_id: '',
    recipient_id: '',
    status: 'pending',
    donation_type: 'medicine',
    estimated_value: '',
    description: '',
    medicines: [],
    image: null,
    pickup_address: '',
    delivery_address: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [donors, setDonors] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [medicines, setMedicines] = useState([]);

  useEffect(() => {
    if (donation) {
      setFormData({
        donor_id: donation.donor_id || '',
        recipient_id: donation.recipient_id || '',
        status: donation.status || 'pending',
        donation_type: donation.donation_type || 'medicine',
        estimated_value: donation.estimated_value || '',
        description: donation.description || '',
        medicines: donation.medicines || [],
        image: null,
        pickup_address: donation.pickup_address || '',
        delivery_address: donation.delivery_address || '',
        notes: donation.notes || ''
      });
    }
    
    // In a real app, you would fetch these from API
    setDonors([
      { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+1234567890' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '+1234567891' },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com', phone: '+1234567892' }
    ]);
    
    setRecipients([
      { id: 1, name: 'Cairo Hospital', location: 'Cairo, Egypt', type: 'hospital' },
      { id: 2, name: 'Alexandria Medical Center', location: 'Alexandria, Egypt', type: 'clinic' },
      { id: 3, name: 'Giza Health Center', location: 'Giza, Egypt', type: 'health_center' }
    ]);
    
    setMedicines([
      { id: 1, name: 'Paracetamol', dosage: '500mg', expiry_date: '2025-12-31' },
      { id: 2, name: 'Ibuprofen', dosage: '400mg', expiry_date: '2025-11-30' },
      { id: 3, name: 'Amoxicillin', dosage: '250mg', expiry_date: '2025-10-31' },
      { id: 4, name: 'Aspirin', dosage: '100mg', expiry_date: '2025-09-30' }
    ]);
  }, [donation]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      image: file
    }));
  };

  const handleMedicineChange = (index, field, value) => {
    const newMedicines = [...formData.medicines];
    newMedicines[index] = {
      ...newMedicines[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      medicines: newMedicines
    }));
  };

  const addMedicine = () => {
    setFormData(prev => ({
      ...prev,
      medicines: [...prev.medicines, {
        medicine_id: '',
        quantity: 1,
        expiry_date: '',
        condition: 'good'
      }]
    }));
  };

  const removeMedicine = (index) => {
    const newMedicines = formData.medicines.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      medicines: newMedicines
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add basic fields
      formDataToSend.append('donor_id', formData.donor_id);
      formDataToSend.append('recipient_id', formData.recipient_id);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('donation_type', formData.donation_type);
      formDataToSend.append('estimated_value', formData.estimated_value);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('pickup_address', formData.pickup_address);
      formDataToSend.append('delivery_address', formData.delivery_address);
      formDataToSend.append('notes', formData.notes);
      
      // Add medicines as JSON
      formDataToSend.append('medicines', JSON.stringify(formData.medicines));
      
      // Add image if provided
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      console.log('Sending donation data to backend:', Object.fromEntries(formDataToSend));

      if (donation) {
        await donationsService.updateDonation(donation.id, formDataToSend);
      } else {
        await donationsService.createDonation(formDataToSend);
      }
      onSave();
    } catch (err) {
      console.error('Donation form submission error:', err);
      if (err.response?.data?.errors) {
        // Handle validation errors
        const errorMessages = Object.values(err.response.data.errors).flat();
        setError(errorMessages.join(', '));
      } else {
        setError(err.message || 'An error occurred while saving the donation');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="donation-form">
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="alert alert-danger d-flex align-items-center" role="alert">
            <i className="fas fa-exclamation-triangle me-2"></i>
            <div>
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}

        {/* Basic Information */}
        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Donor *</label>
              <select
                className="form-control"
                name="donor_id"
                value={formData.donor_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Donor</option>
                {donors.map(donor => (
                  <option key={donor.id} value={donor.id}>
                    {donor.name} ({donor.email})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Recipient *</label>
              <select
                className="form-control"
                name="recipient_id"
                value={formData.recipient_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Recipient</option>
                {recipients.map(recipient => (
                  <option key={recipient.id} value={recipient.id}>
                    {recipient.name} - {recipient.location}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Donation Type *</label>
              <select
                className="form-control"
                name="donation_type"
                value={formData.donation_type}
                onChange={handleChange}
                required
              >
                <option value="medicine">Medicine</option>
                <option value="medical_equipment">Medical Equipment</option>
                <option value="financial">Financial</option>
                <option value="other">Other</option>
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
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="in_transit">In Transit</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Estimated Value</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                name="estimated_value"
                value={formData.estimated_value}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Donation Image</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={handleFileChange}
              />
              <small className="text-muted">
                Upload donation image (JPG, PNG - Max 5MB)
              </small>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Pickup Address</label>
              <textarea
                className="form-control"
                name="pickup_address"
                rows="3"
                value={formData.pickup_address}
                onChange={handleChange}
                placeholder="Enter pickup address..."
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Delivery Address</label>
              <textarea
                className="form-control"
                name="delivery_address"
                rows="3"
                value={formData.delivery_address}
                onChange={handleChange}
                placeholder="Enter delivery address..."
              />
            </div>
          </div>
        </div>

        {/* Donation Medicines */}
        {formData.donation_type === 'medicine' && (
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>Donated Medicines</h5>
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={addMedicine}
              >
                <i className="fas fa-plus me-1"></i>Add Medicine
              </button>
            </div>

            {formData.medicines.length === 0 ? (
              <div className="text-center py-3 text-muted">
                <p>No medicines added yet. Click "Add Medicine" to start.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Medicine</th>
                      <th>Quantity</th>
                      <th>Expiry Date</th>
                      <th>Condition</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.medicines.map((medicine, index) => (
                      <tr key={index}>
                        <td>
                          <select
                            className="form-control form-control-sm"
                            value={medicine.medicine_id}
                            onChange={(e) => handleMedicineChange(index, 'medicine_id', e.target.value)}
                            required
                          >
                            <option value="">Select Medicine</option>
                            {medicines.map(med => (
                              <option key={med.id} value={med.id}>
                                {med.name} ({med.dosage})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            value={medicine.quantity}
                            onChange={(e) => handleMedicineChange(index, 'quantity', e.target.value)}
                            min="1"
                            required
                          />
                        </td>
                        <td>
                          <input
                            type="date"
                            className="form-control form-control-sm"
                            value={medicine.expiry_date}
                            onChange={(e) => handleMedicineChange(index, 'expiry_date', e.target.value)}
                            required
                          />
                        </td>
                        <td>
                          <select
                            className="form-control form-control-sm"
                            value={medicine.condition}
                            onChange={(e) => handleMedicineChange(index, 'condition', e.target.value)}
                            required
                          >
                            <option value="good">Good</option>
                            <option value="fair">Fair</option>
                            <option value="poor">Poor</option>
                          </select>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removeMedicine(index)}
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
        )}

        {/* Description and Notes */}
        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the donation..."
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Notes</label>
              <textarea
                className="form-control"
                name="notes"
                rows="3"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional notes..."
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
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
                <i className="fas fa-save me-2"></i>{donation ? 'Update Donation' : 'Create Donation'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
