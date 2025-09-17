import React, { useState, useEffect } from 'react';
import { donationsService } from '../../services/donations';
import { useToast } from '../../hooks/useToast';
import Modal from '../../components/common/Modal';
import DonationForm from '../../components/forms/DonationForm';

export default function Donations() {
  const { showSuccess, showError } = useToast();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [donationToDelete, setDonationToDelete] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    completed: 0,
    in_transit: 0
  });

  useEffect(() => {
    fetchDonations();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const response = await donationsService.getDonations();
      console.log('Donations response:', response);
      
      // Handle response structure
      let donationsData = [];
      if (response.data && response.data.data && response.data.data.data) {
        donationsData = response.data.data.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        donationsData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        donationsData = response.data;
      } else if (Array.isArray(response)) {
        donationsData = response;
      }
      
      setDonations(donationsData);
      
      // Calculate stats
      const total = donationsData.length;
      const pending = donationsData.filter(d => d.status === 'pending').length;
      const approved = donationsData.filter(d => d.status === 'approved').length;
      const rejected = donationsData.filter(d => d.status === 'rejected').length;
      const completed = donationsData.filter(d => d.status === 'completed').length;
      const in_transit = donationsData.filter(d => d.status === 'in_transit').length;
      
      setStats({ total, pending, approved, rejected, completed, in_transit });
    } catch (err) {
      setError(err.message);
      showError(err.message || 'Failed to fetch donations');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDonation = () => {
    setSelectedDonation(null);
    setShowModal(true);
  };

  const handleEditDonation = (donation) => {
    setSelectedDonation(donation);
    setShowModal(true);
  };

  const handleDeleteDonation = (donation) => {
    setDonationToDelete(donation);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await donationsService.deleteDonation(donationToDelete.id);
      showSuccess('Donation deleted successfully!');
      fetchDonations();
      setShowDeleteConfirm(false);
      setDonationToDelete(null);
    } catch (err) {
      showError(err.message || 'Failed to delete donation');
    }
  };


  const handleApprove = async (donationId) => {
    try {
      await donationsService.approveDonation(donationId);
      showSuccess('Donation approved successfully!');
      fetchDonations();
    } catch (err) {
      showError(err.message || 'Failed to approve donation');
    }
  };

  const handleReject = async (donationId) => {
    const reason = prompt('Please enter rejection reason:');
    if (reason) {
      try {
        await donationsService.rejectDonation(donationId, reason);
        showSuccess('Donation rejected successfully!');
        fetchDonations();
      } catch (err) {
        showError(err.message || 'Failed to reject donation');
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedDonation(null);
  };

  const handleFormSave = () => {
    fetchDonations();
    setShowModal(false);
    setSelectedDonation(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      case 'completed': return 'info';
      case 'in_transit': return 'primary';
      default: return 'secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'completed': return 'Completed';
      case 'in_transit': return 'In Transit';
      default: return 'Unknown';
    }
  };

  const filteredDonations = Array.isArray(donations) ? donations.filter(donation => {
    const matchesSearch = donation.donor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         donation.donor_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         donation.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         donation.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || donation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) : [];

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading donations...</p>
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
    <div className="donations-page">
      {/* Header - Clean Design */}
      <div className="horizon-card mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="card-title mb-1">Donations Management</h2>
            <p className="text-muted mb-0">Manage charitable donations and contributions</p>
          </div>
          <div className="d-flex gap-2">
            <button 
              className="btn btn-outline-primary"
              onClick={fetchDonations}
              title="Refresh Data"
            >
              Refresh
            </button>
            <button className="btn btn-primary-gradient text-white border-0" onClick={handleAddDonation}>
              Add Donation
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
            <h6 className="mb-1 text-muted">Approved</h6>
            <h3 className="mb-0 text-success">{stats.approved}</h3>
          </div>
        </div>
        <div className="col-md-2">
          <div className="horizon-card text-center">
            <h6 className="mb-1 text-muted">Rejected</h6>
            <h3 className="mb-0 text-danger">{stats.rejected}</h3>
          </div>
        </div>
        <div className="col-md-2">
          <div className="horizon-card text-center">
            <h6 className="mb-1 text-muted">Completed</h6>
            <h3 className="mb-0 text-info">{stats.completed}</h3>
          </div>
        </div>
        <div className="col-md-2">
          <div className="horizon-card text-center">
            <h6 className="mb-1 text-muted">In Transit</h6>
            <h3 className="mb-0 text-primary">{stats.in_transit}</h3>
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
              placeholder="Search donations by donor name, email, description, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <select 
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
              <option value="in_transit">In Transit</option>
            </select>
          </div>
        </div>
      </div>

      {/* Donations Table - Clean Design */}
      <div className="horizon-card">
        <div className="table-responsive">
          {filteredDonations.length === 0 ? (
            <div className="text-center py-5">
              <h4 className="text-muted mb-3">
                {searchTerm || statusFilter !== 'all' ? 'No donations found' : 'No donations available'}
              </h4>
              <p className="text-muted mb-4">
                {searchTerm ? `No donations match your search "${searchTerm}"` : 
                 statusFilter !== 'all' ? `No donations found with the selected status filter` :
                 "No donations available in the system. Add your first donation to get started."}
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
                    onClick={handleAddDonation}
                  >
                    Add First Donation
                  </button>
                )}
              </div>
            </div>
          ) : (
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th className="border-0 fw-bold">Donor Details</th>
                  <th className="border-0 fw-bold">Description</th>
                  <th className="border-0 fw-bold">Location</th>
                  <th className="border-0 fw-bold">Date</th>
                  <th className="border-0 fw-bold text-center">Status</th>
                  <th className="border-0 fw-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonations.map((donation) => (
                  <tr key={donation.id} className="donation-row">
                    <td>
                      <div>
                        <h6 className="mb-1 fw-bold">{donation.donor_name}</h6>
                        <small className="text-muted">{donation.donor_email || 'No email'}</small>
                      </div>
                    </td>
                    <td>
                      <span className="text-muted">
                        {donation.description ? 
                          (donation.description.length > 50 ? 
                            donation.description.substring(0, 50) + '...' : 
                            donation.description) : 
                          'No description'}
                      </span>
                    </td>
                    <td>
                      <span className="text-muted">{donation.location || 'N/A'}</span>
                    </td>
                    <td>
                      <span className="text-muted">
                        {donation.created_at ? new Date(donation.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className={`badge bg-${getStatusColor(donation.status)} text-white px-3 py-2`}>
                        {getStatusText(donation.status)}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-2 justify-content-center">
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEditDonation(donation)}
                          title="Edit Donation"
                        >
                          Edit
                        </button>
                        {donation.status === 'pending' && (
                          <>
                            <button 
                              className="btn btn-sm btn-outline-success"
                              onClick={() => handleApprove(donation.id)}
                              title="Approve Donation"
                            >
                              Approve
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleReject(donation.id)}
                              title="Reject Donation"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteDonation(donation)}
                          title="Delete Donation"
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

      {/* Donation Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleModalClose}
        title={selectedDonation ? "Edit Donation" : "Add New Donation"}
        size="lg"
      >
        <DonationForm
          donation={selectedDonation}
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
          <p>Are you sure you want to delete this donation?</p>
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