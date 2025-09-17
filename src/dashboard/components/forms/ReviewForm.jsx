import React, { useState, useEffect } from 'react';
import { reviewsService } from '../../services/reviews';
import { useToast } from '../../hooks/useToast';

export default function ReviewForm({ review, onSave, onCancel }) {
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    medicine_name: '',
    rating: 5,
    comment: ''
  });
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (review) {
      setFormData({
        user_name: review.user_name || '',
        user_email: review.user_email || '',
        medicine_name: review.medicine_name || '',
        rating: review.rating || 5,
        comment: review.comment || ''
      });
    }
  }, [review]);

  const handleInputChange = (e) => {
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

  const handleRatingChange = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating: rating
    }));
  };

  const getFieldError = (fieldName) => {
    return fieldErrors[fieldName] || null;
  };

  const getInputClassName = (fieldName) => {
    const baseClass = 'form-control';
    const errorClass = getFieldError(fieldName) ? 'is-invalid' : '';
    return `${baseClass} ${errorClass}`.trim();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});

    try {
      if (review) {
        await reviewsService.updateReview(review.id, formData);
        showSuccess('Review updated successfully!');
      } else {
        await reviewsService.createReview(formData);
        showSuccess('Review created successfully!');
      }
      onSave();
    } catch (err) {
      console.error('Review form error:', err);
      
      if (err.response && err.response.data && err.response.data.errors) {
        // Laravel validation errors
        const errors = err.response.data.errors;
        const fieldErrorsMap = {};
        
        Object.keys(errors).forEach(field => {
          fieldErrorsMap[field] = errors[field][0];
        });
        
        setFieldErrors(fieldErrorsMap);
        showError('Please fix the validation errors below');
      } else if (err.response && err.response.data && err.response.data.message) {
        // Backend error message
        showError(err.response.data.message);
      } else {
        // Generic error
        showError(err.message || 'An error occurred while saving the review');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <button
        key={index}
        type="button"
        className={`btn btn-sm ${index < rating ? 'btn-warning' : 'btn-outline-warning'} me-1`}
        onClick={() => handleRatingChange(index + 1)}
        style={{ fontSize: '1.2rem' }}
      >
        ★
      </button>
    ));
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-md-6">
          <div className="mb-3">
            <label htmlFor="user_name" className="form-label">User Name *</label>
            <input
              type="text"
              className={getInputClassName('user_name')}
              id="user_name"
              name="user_name"
              value={formData.user_name}
              onChange={handleInputChange}
              placeholder="Enter user name"
            />
            {getFieldError('user_name') && (
              <div className="invalid-feedback">
                {getFieldError('user_name')}
              </div>
            )}
          </div>
        </div>
        <div className="col-md-6">
          <div className="mb-3">
            <label htmlFor="user_email" className="form-label">User Email</label>
            <input
              type="email"
              className={getInputClassName('user_email')}
              id="user_email"
              name="user_email"
              value={formData.user_email}
              onChange={handleInputChange}
              placeholder="Enter user email"
            />
            {getFieldError('user_email') && (
              <div className="invalid-feedback">
                {getFieldError('user_email')}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="mb-3">
            <label htmlFor="medicine_name" className="form-label">Medicine Name *</label>
            <input
              type="text"
              className={getInputClassName('medicine_name')}
              id="medicine_name"
              name="medicine_name"
              value={formData.medicine_name}
              onChange={handleInputChange}
              placeholder="Enter medicine name"
            />
            {getFieldError('medicine_name') && (
              <div className="invalid-feedback">
                {getFieldError('medicine_name')}
              </div>
            )}
          </div>
        </div>
        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label">Rating *</label>
            <div className="d-flex align-items-center">
              {renderStars(formData.rating)}
              <span className="ms-2 text-muted">({formData.rating}/5)</span>
            </div>
            {getFieldError('rating') && (
              <div className="text-danger small mt-1">
                {getFieldError('rating')}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor="comment" className="form-label">Comment</label>
        <textarea
          className={getInputClassName('comment')}
          id="comment"
          name="comment"
          rows="4"
          value={formData.comment}
          onChange={handleInputChange}
          placeholder="Enter your review comment"
        />
        {getFieldError('comment') && (
          <div className="invalid-feedback">
            {getFieldError('comment')}
          </div>
        )}
      </div>

      <div className="d-flex gap-2 justify-content-end">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              {review ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            review ? 'Update Review' : 'Create Review'
          )}
        </button>
      </div>
    </form>
  );
}
