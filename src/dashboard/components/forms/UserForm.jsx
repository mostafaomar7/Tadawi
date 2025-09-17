import React, { useState, useEffect } from 'react';
import { usersService } from '../../services/users';

export default function UserForm({ user, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'patient',
    status: 'active',
    address: '',
    date_of_birth: '',
    gender: '',
    emergency_contact: '',
    profile_image: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        password: '', // Don't pre-fill password for security
        role: user.role || 'patient',
        status: user.status || 'active',
        address: user.address || '',
        date_of_birth: user.date_of_birth || '',
        gender: user.gender || '',
        emergency_contact: user.emergency_contact || '',
        profile_image: null
      });
    }
  }, [user]);

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
      profile_image: file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Only include password if it's provided (for new users or password updates)
      if (formData.password) {
        formDataToSend.append('password', formData.password);
      }

      console.log('Sending user data to backend:', Object.fromEntries(formDataToSend));

      if (user) {
        await usersService.updateUser(user.id, formDataToSend);
      } else {
        await usersService.createUser(formDataToSend);
      }
      onSave();
    } catch (err) {
      console.error('User form submission error:', err);
      if (err.response?.data?.errors) {
        // Handle validation errors
        const errorMessages = Object.values(err.response.data.errors).flat();
        setError(errorMessages.join(', '));
      } else {
        setError(err.message || 'An error occurred while saving the user');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-form">
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
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter full name"
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter email address"
              />
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-control"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">
                Password {!user && '*'}
                {user && <small className="text-muted"> (Leave blank to keep current password)</small>}
              </label>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!user}
                  placeholder={user ? "Enter new password (optional)" : "Enter password"}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Role and Status */}
        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Role *</label>
              <select
                className="form-control"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="pharmacy">Pharmacy</option>
                <option value="admin">Admin</option>
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Date of Birth</label>
              <input
                type="date"
                className="form-control"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Gender</label>
              <select
                className="form-control"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Address and Contact */}
        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Address</label>
              <textarea
                className="form-control"
                name="address"
                rows="3"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter address"
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Emergency Contact</label>
              <input
                type="tel"
                className="form-control"
                name="emergency_contact"
                value={formData.emergency_contact}
                onChange={handleChange}
                placeholder="Enter emergency contact number"
              />
            </div>
          </div>
        </div>

        {/* Profile Image */}
        <div className="mb-3">
          <label className="form-label">Profile Image</label>
          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={handleFileChange}
          />
          <small className="text-muted">
            Upload a profile image (JPG, PNG, GIF - Max 2MB)
          </small>
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
                <i className="fas fa-save me-2"></i>{user ? 'Update User' : 'Create User'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}