import React, { useState, useEffect } from 'react';
import { reviewsService } from '../../services/reviews';
import { useToast } from '../../hooks/useToast';
import Modal from '../../components/common/Modal';
import ReviewForm from '../../components/forms/ReviewForm';

export default function Reviews() {
  const { showSuccess, showError } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    fiveStar: 0,
    fourStar: 0,
    threeStar: 0,
    twoStar: 0,
    oneStar: 0,
    averageRating: 0
  });

  useEffect(() => {
    fetchReviews();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewsService.getReviews();
      console.log('Reviews response:', response);
      
      // Handle response structure
      let reviewsData = [];
      if (response.data && response.data.data && response.data.data.data) {
        reviewsData = response.data.data.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        reviewsData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        reviewsData = response.data;
      } else if (Array.isArray(response)) {
        reviewsData = response;
      }
      
      setReviews(reviewsData);
      
      // Calculate stats
      const total = reviewsData.length;
      const fiveStar = reviewsData.filter(r => r.rating === 5).length;
      const fourStar = reviewsData.filter(r => r.rating === 4).length;
      const threeStar = reviewsData.filter(r => r.rating === 3).length;
      const twoStar = reviewsData.filter(r => r.rating === 2).length;
      const oneStar = reviewsData.filter(r => r.rating === 1).length;
      const averageRating = total > 0 ? (reviewsData.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1) : 0;
      
      setStats({ total, fiveStar, fourStar, threeStar, twoStar, oneStar, averageRating });
    } catch (err) {
      setError(err.message);
      showError(err.message || 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleAddReview = () => {
    setSelectedReview(null);
    setShowModal(true);
  };

  const handleEditReview = (review) => {
    setSelectedReview(review);
    setShowModal(true);
  };

  const handleDeleteReview = (review) => {
    setReviewToDelete(review);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await reviewsService.deleteReview(reviewToDelete.id);
      showSuccess('Review deleted successfully!');
      fetchReviews();
      setShowDeleteConfirm(false);
      setReviewToDelete(null);
    } catch (err) {
      showError(err.message || 'Failed to delete review');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedReview(null);
  };

  const handleFormSave = () => {
    fetchReviews();
    setShowModal(false);
    setSelectedReview(null);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={index < rating ? 'text-warning' : 'text-muted'}>
        ★
      </span>
    ));
  };

  const filteredReviews = Array.isArray(reviews) ? reviews.filter(review => {
    const matchesSearch = review.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.medicine_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRating = ratingFilter === 'all' || review.rating.toString() === ratingFilter;
    
    return matchesSearch && matchesRating;
  }) : [];

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading reviews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  return (
    <div className="reviews-page">
      {/* Header - Clean Design */}
      <div className="horizon-card mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="card-title mb-1">Reviews Management</h2>
            <p className="text-muted mb-0">Manage customer reviews and ratings</p>
          </div>
          <div className="d-flex gap-2">
            <button 
              className="btn btn-outline-primary"
              onClick={fetchReviews}
              title="Refresh Data"
            >
              Refresh
            </button>
            <button className="btn btn-primary-gradient text-white border-0" onClick={handleAddReview}>
              Add Review
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards - Clean Design */}
      <div className="row mb-4">
        <div className="col-md-2">
          <div className="horizon-card text-center">
            <h6 className="mb-1 text-muted">Total Reviews</h6>
            <h3 className="mb-0 text-primary">{stats.total}</h3>
          </div>
        </div>
        <div className="col-md-2">
          <div className="horizon-card text-center">
            <h6 className="mb-1 text-muted">Average Rating</h6>
            <h3 className="mb-0 text-warning">{stats.averageRating}</h3>
          </div>
        </div>
        <div className="col-md-2">
          <div className="horizon-card text-center">
            <h6 className="mb-1 text-muted">5 Stars</h6>
            <h3 className="mb-0 text-success">{stats.fiveStar}</h3>
          </div>
        </div>
        <div className="col-md-2">
          <div className="horizon-card text-center">
            <h6 className="mb-1 text-muted">4 Stars</h6>
            <h3 className="mb-0 text-info">{stats.fourStar}</h3>
          </div>
        </div>
        <div className="col-md-2">
          <div className="horizon-card text-center">
            <h6 className="mb-1 text-muted">3 Stars</h6>
            <h3 className="mb-0 text-warning">{stats.threeStar}</h3>
          </div>
        </div>
        <div className="col-md-2">
          <div className="horizon-card text-center">
            <h6 className="mb-1 text-muted">2-1 Stars</h6>
            <h3 className="mb-0 text-danger">{stats.twoStar + stats.oneStar}</h3>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar - Clean Design */}
      <div className="horizon-card mb-4">
        <div className="row align-items-center">
          <div className="col-md-8">
            <input
              type="text"
              className="form-control"
              placeholder="Search reviews by user name, comment, or medicine name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <select 
              className="form-select"
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews Table - Clean Design */}
      <div className="horizon-card">
        <div className="table-responsive">
          {filteredReviews.length === 0 ? (
            <div className="text-center py-5">
              <h4 className="text-muted mb-3">
                {searchTerm || ratingFilter !== 'all' ? 'No reviews found' : 'No reviews available'}
              </h4>
              <p className="text-muted mb-4">
                {searchTerm ? `No reviews match your search "${searchTerm}"` : 
                 ratingFilter !== 'all' ? `No reviews found with the selected rating filter` :
                 "No reviews available in the system. Add your first review to get started."}
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
                {ratingFilter !== 'all' && (
                  <button 
                    className="btn btn-outline-warning"
                    onClick={() => setRatingFilter('all')}
                  >
                    Clear Rating Filter
                  </button>
                )}
                {!searchTerm && ratingFilter === 'all' && (
                  <button 
                    className="btn btn-primary-gradient text-white"
                    onClick={handleAddReview}
                  >
                    Add First Review
                  </button>
                )}
              </div>
            </div>
          ) : (
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th className="border-0 fw-bold">User Details</th>
                  <th className="border-0 fw-bold">Medicine</th>
                  <th className="border-0 fw-bold text-center">Rating</th>
                  <th className="border-0 fw-bold">Comment</th>
                  <th className="border-0 fw-bold">Date</th>
                  <th className="border-0 fw-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.map((review) => (
                  <tr key={review.id} className="review-row">
                    <td>
                      <div>
                        <h6 className="mb-1 fw-bold">{review.user_name}</h6>
                        <small className="text-muted">{review.user_email || 'No email'}</small>
                      </div>
                    </td>
                    <td>
                      <span className="text-muted">{review.medicine_name || 'N/A'}</span>
                    </td>
                    <td className="text-center">
                      <div>
                        <div className="mb-1">{renderStars(review.rating)}</div>
                        <small className="text-muted">{review.rating}/5</small>
                      </div>
                    </td>
                    <td>
                      <span className="text-muted">
                        {review.comment ? 
                          (review.comment.length > 50 ? 
                            review.comment.substring(0, 50) + '...' : 
                            review.comment) : 
                          'No comment'}
                      </span>
                    </td>
                    <td>
                      <span className="text-muted">
                        {review.created_at ? new Date(review.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-2 justify-content-center">
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEditReview(review)}
                          title="Edit Review"
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteReview(review)}
                          title="Delete Review"
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

      {/* Review Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleModalClose}
        title={selectedReview ? "Edit Review" : "Add New Review"}
        size="lg"
      >
        <ReviewForm
          review={selectedReview}
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
          <p>Are you sure you want to delete this review?</p>
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
