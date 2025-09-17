import React, { useState, useEffect } from 'react';
import { medicinesService } from '../../services/medicines';
import { useToast } from '../../hooks/useToast';

export default function MedicineForm({ medicine, onSave, onCancel }) {
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    active_ingredient: '',
    active_ingredient_id: '',
    dosage: '',
    price: '',
    stock_quantity: '',
    description: '',
    therapeutic_class_id: '',
    manufacturer: '',
    form: 'Tablet',
    expiry_date: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (medicine) {
      setFormData({
        name: medicine.name || '',
        active_ingredient: medicine.active_ingredient || '',
        active_ingredient_id: medicine.active_ingredient_id || '',
        dosage: medicine.dosage || '',
        price: medicine.price || '',
        stock_quantity: medicine.stock_quantity || '',
        description: medicine.description || '',
        therapeutic_class_id: medicine.therapeutic_class_id || '',
        manufacturer: medicine.manufacturer || '',
        form: medicine.form || 'Tablet',
        expiry_date: medicine.expiry_date || ''
      });
    }
  }, [medicine]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const getFieldError = (fieldName) => {
    return fieldErrors[fieldName] ? fieldErrors[fieldName][0] : null;
  };

  const getInputClassName = (fieldName) => {
    const baseClass = "form-control";
    const errorClass = getFieldError(fieldName) ? " is-invalid" : "";
    return baseClass + errorClass;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      // Transform form data to match backend expectations
      const backendData = {
        brand_name: formData.name,
        active_ingredient_id: formData.active_ingredient_id || 1, // Default to 1 if not provided
        dosage_strength: formData.dosage,
        price: parseFloat(formData.price),
        manufacturer: formData.manufacturer,
        form: formData.form || 'Tablet', // Default form
        therapeutic_class_id: formData.therapeutic_class_id || null,
        description: formData.description
      };

      console.log('Sending data to backend:', backendData);

      if (medicine) {
        await medicinesService.updateMedicine(medicine.id, backendData);
        showSuccess('Medicine updated successfully!');
      } else {
        await medicinesService.createMedicine(backendData);
        showSuccess('Medicine created successfully!');
      }
      onSave();
    } catch (err) {
      console.error('Form submission error:', err);
      console.log('Error response data:', err.response?.data);
      console.log('Error response errors:', err.response?.data?.errors);
      
      if (err.response?.data?.errors) {
        // Handle Laravel validation errors
        const backendErrors = err.response.data.errors;
        const mappedErrors = {};
        
        // Map backend field names to frontend field names
        if (backendErrors.brand_name) {
          mappedErrors.name = backendErrors.brand_name;
        }
        if (backendErrors.active_ingredient_id) {
          mappedErrors.active_ingredient_id = backendErrors.active_ingredient_id;
        }
        if (backendErrors.dosage_strength) {
          mappedErrors.dosage = backendErrors.dosage_strength;
        }
        if (backendErrors.price) {
          mappedErrors.price = backendErrors.price;
        }
        if (backendErrors.manufacturer) {
          mappedErrors.manufacturer = backendErrors.manufacturer;
        }
        if (backendErrors.form) {
          mappedErrors.form = backendErrors.form;
        }
        if (backendErrors.therapeutic_class_id) {
          mappedErrors.therapeutic_class_id = backendErrors.therapeutic_class_id;
        }
        if (backendErrors.description) {
          mappedErrors.description = backendErrors.description;
        }
        
        setFieldErrors(mappedErrors);
        
        // Show first error message as general error
        const firstError = Object.values(backendErrors)[0];
        if (firstError && firstError[0]) {
          setError(firstError[0]);
          showError(firstError[0]);
        }
      } else if (err.response?.data?.message) {
        // Handle Laravel error messages
        setError(err.response.data.message);
        showError(err.response.data.message);
      } else {
        const errorMessage = err.message || 'An error occurred while saving the medicine';
        setError(errorMessage);
        showError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="medicine-form">
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
            <label className="form-label">Medicine Name *</label>
            <input
              type="text"
              className={getInputClassName('name')}
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
            {getFieldError('name') && (
              <div className="invalid-feedback d-block">
                {getFieldError('name')}
              </div>
            )}
          </div>
        </div>
        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label">Active Ingredient ID *</label>
            <input
              type="number"
              className={getInputClassName('active_ingredient_id')}
              name="active_ingredient_id"
              value={formData.active_ingredient_id}
              onChange={handleChange}
              placeholder="Enter active ingredient ID (e.g., 1, 2, 3...)"
            />
            {getFieldError('active_ingredient_id') && (
              <div className="invalid-feedback d-block">
                {getFieldError('active_ingredient_id')}
              </div>
            )}
            <small className="text-muted">
              Enter the ID of the active ingredient. Common IDs: 1 (Paracetamol), 2 (Ibuprofen), 3 (Amoxicillin), 4 (Aspirin)
            </small>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label">Dosage *</label>
            <input
              type="text"
              className={getInputClassName('dosage')}
              name="dosage"
              value={formData.dosage}
              onChange={handleChange}
            />
            {getFieldError('dosage') && (
              <div className="invalid-feedback d-block">
                {getFieldError('dosage')}
              </div>
            )}
          </div>
        </div>
        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label">Price *</label>
            <input
              type="number"
              step="0.01"
              className={getInputClassName('price')}
              name="price"
              value={formData.price}
              onChange={handleChange}
            />
            {getFieldError('price') && (
              <div className="invalid-feedback d-block">
                {getFieldError('price')}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label">Stock Quantity *</label>
            <input
              type="number"
              className={getInputClassName('stock_quantity')}
              name="stock_quantity"
              value={formData.stock_quantity}
              onChange={handleChange}
            />
            {getFieldError('stock_quantity') && (
              <div className="invalid-feedback d-block">
                {getFieldError('stock_quantity')}
              </div>
            )}
          </div>
        </div>
        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label">Manufacturer</label>
            <input
              type="text"
              className={getInputClassName('manufacturer')}
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleChange}
            />
            {getFieldError('manufacturer') && (
              <div className="invalid-feedback d-block">
                {getFieldError('manufacturer')}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label">Form *</label>
            <select
              className={getInputClassName('form')}
              name="form"
              value={formData.form}
              onChange={handleChange}
            >
              <option value="Tablet">Tablet</option>
              <option value="Capsule">Capsule</option>
              <option value="Syrup">Syrup</option>
              <option value="Injection">Injection</option>
              <option value="Cream">Cream</option>
              <option value="Ointment">Ointment</option>
              <option value="Drops">Drops</option>
              <option value="Powder">Powder</option>
            </select>
            {getFieldError('form') && (
              <div className="invalid-feedback d-block">
                {getFieldError('form')}
              </div>
            )}
          </div>
        </div>
        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label">Therapeutic Class ID</label>
            <input
              type="number"
              className={getInputClassName('therapeutic_class_id')}
              name="therapeutic_class_id"
              value={formData.therapeutic_class_id}
              onChange={handleChange}
            />
            {getFieldError('therapeutic_class_id') && (
              <div className="invalid-feedback d-block">
                {getFieldError('therapeutic_class_id')}
              </div>
            )}
          </div>
        </div>
        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label">Expiry Date</label>
            <input
              type="date"
              className={getInputClassName('expiry_date')}
              name="expiry_date"
              value={formData.expiry_date}
              onChange={handleChange}
            />
            {getFieldError('expiry_date') && (
              <div className="invalid-feedback d-block">
                {getFieldError('expiry_date')}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Description</label>
        <textarea
          className={getInputClassName('description')}
          name="description"
          rows="3"
          value={formData.description}
          onChange={handleChange}
        />
        {getFieldError('description') && (
          <div className="invalid-feedback d-block">
            {getFieldError('description')}
          </div>
        )}
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
                <i className="fas fa-save me-2"></i>{medicine ? 'Update Medicine' : 'Create Medicine'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
