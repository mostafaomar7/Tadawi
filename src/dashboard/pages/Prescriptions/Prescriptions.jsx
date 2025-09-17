import React, { useState, useEffect } from 'react';
import { prescriptionsService } from '../../services/prescriptions';
import { useToast } from '../../hooks/useToast';
import Modal from '../../components/common/Modal';
import PrescriptionForm from '../../components/forms/PrescriptionForm';

export default function Prescriptions() {
  const { showSuccess, showError } = useToast();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [prescriptionToDelete, setPrescriptionToDelete] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    processed: 0,
    uploaded: 0
  });

  useEffect(() => {
    fetchPrescriptions();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await prescriptionsService.getPrescriptions();
      console.log('Prescriptions response:', response);
      
      // Handle response structure
      let prescriptionsData = [];
      if (response.data && response.data.data && response.data.data.data) {
        prescriptionsData = response.data.data.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        prescriptionsData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        prescriptionsData = response.data;
      } else if (Array.isArray(response)) {
        prescriptionsData = response;
      }
      
      setPrescriptions(prescriptionsData);
      
      // Calculate stats
      const total = prescriptionsData.length;
      const pending = prescriptionsData.filter(p => p.status === 'pending').length;
      const approved = prescriptionsData.filter(p => p.status === 'approved').length;
      const rejected = prescriptionsData.filter(p => p.status === 'rejected').length;
      const processed = prescriptionsData.filter(p => p.status === 'processed').length;
      const uploaded = prescriptionsData.filter(p => p.status === 'uploaded').length;
      
      setStats({ total, pending, approved, rejected, processed, uploaded });
    } catch (err) {
      setError(err.message);
      showError(err.message || 'Failed to fetch prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPrescription = () => {
    setSelectedPrescription(null);
    setShowModal(true);
  };

  const handleEditPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setShowModal(true);
  };

  const handleDeletePrescription = (prescription) => {
    setPrescriptionToDelete(prescription);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await prescriptionsService.deletePrescription(prescriptionToDelete.id);
      showSuccess('Prescription deleted successfully!');
      fetchPrescriptions();
      setShowDeleteConfirm(false);
      setPrescriptionToDelete(null);
    } catch (err) {
      showError(err.message || 'Failed to delete prescription');
    }
  };

  const handleStatusUpdate = async (prescriptionId, status) => {
    try {
      await prescriptionsService.updatePrescriptionStatus(prescriptionId, status);
      showSuccess(`Prescription ${status} successfully!`);
      fetchPrescriptions();
    } catch (err) {
      showError(err.message || 'Failed to update prescription status');
    }
  };

  const handleApprove = async (prescriptionId) => {
    try {
      await prescriptionsService.approvePrescription(prescriptionId);
      showSuccess('Prescription approved successfully!');
      fetchPrescriptions();
    } catch (err) {
      showError(err.message || 'Failed to approve prescription');
    }
  };

  const handleReject = async (prescriptionId) => {
    const reason = prompt('Please enter rejection reason:');
    if (reason) {
      try {
        await prescriptionsService.rejectPrescription(prescriptionId, reason);
        showSuccess('Prescription rejected successfully!');
        fetchPrescriptions();
      } catch (err) {
        showError(err.message || 'Failed to reject prescription');
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedPrescription(null);
  };

  const handleFormSave = () => {
    fetchPrescriptions();
    setShowModal(false);
    setSelectedPrescription(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      case 'processed': return 'info';
      case 'uploaded': return 'primary';
      default: return 'secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'processed': return 'Processed';
      case 'uploaded': return 'Uploaded';
      default: return 'Unknown';
    }
  };

  const filteredPrescriptions = Array.isArray(prescriptions) ? prescriptions.filter(prescription => {
    const matchesSearch = prescription.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || prescription.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) : [];

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading prescriptions...</p>
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
    <div className="prescriptions-page">
      {/* Header - Clean Design */}
      <div className="horizon-card mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="card-title mb-1">Prescriptions Management</h2>
            <p className="text-muted mb-0">Manage patient prescriptions and medical records</p>
          </div>
          <div className="d-flex gap-2">
            <button 
              className="btn btn-outline-primary"
              onClick={fetchPrescriptions}
              title="Refresh Data"
            >
              Refresh
            </button>
            <button className="btn btn-primary-gradient text-white border-0" onClick={handleAddPrescription}>
              Add Prescription
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
            <h6 className="mb-1 text-muted">Processed</h6>
            <h3 className="mb-0 text-info">{stats.processed}</h3>
          </div>
        </div>
        <div className="col-md-2">
          <div className="horizon-card text-center">
            <h6 className="mb-1 text-muted">Uploaded</h6>
            <h3 className="mb-0 text-primary">{stats.uploaded}</h3>
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
              placeholder="Search prescriptions by patient name, doctor name, or notes..."
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
              <option value="processed">Processed</option>
              <option value="uploaded">Uploaded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Prescriptions Table - Clean Design */}
      <div className="horizon-card">
        <div className="table-responsive">
          {filteredPrescriptions.length === 0 ? (
            <div className="text-center py-5">
              <h4 className="text-muted mb-3">
                {searchTerm || statusFilter !== 'all' ? 'No prescriptions found' : 'No prescriptions available'}
              </h4>
              <p className="text-muted mb-4">
                {searchTerm ? `No prescriptions match your search "${searchTerm}"` : 
                 statusFilter !== 'all' ? `No prescriptions found with the selected status filter` :
                 "No prescriptions available in the system. Add your first prescription to get started."}
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
                    onClick={handleAddPrescription}
                  >
                    Add First Prescription
                  </button>
                )}
              </div>
            </div>
          ) : (
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th className="border-0 fw-bold">Patient Details</th>
                  <th className="border-0 fw-bold">Doctor</th>
                  <th className="border-0 fw-bold">Date</th>
                  <th className="border-0 fw-bold text-center">Status</th>
                  <th className="border-0 fw-bold">Notes</th>
                  <th className="border-0 fw-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrescriptions.map((prescription) => (
                  <tr key={prescription.id} className="prescription-row">
                    <td>
                      <div>
                        <h6 className="mb-1 fw-bold">{prescription.patient_name}</h6>
                        <small className="text-muted">{prescription.patient_phone || 'No phone'}</small>
                      </div>
                    </td>
                    <td>
                      <span className="text-muted">{prescription.doctor_name || 'N/A'}</span>
                    </td>
                    <td>
                      <span className="text-muted">
                        {prescription.created_at ? new Date(prescription.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className={`badge bg-${getStatusColor(prescription.status)} text-white px-3 py-2`}>
                        {getStatusText(prescription.status)}
                      </span>
                    </td>
                    <td>
                      <span className="text-muted">
                        {prescription.notes ? 
                          (prescription.notes.length > 50 ? 
                            prescription.notes.substring(0, 50) + '...' : 
                            prescription.notes) : 
                          'No notes'}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-2 justify-content-center">
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEditPrescription(prescription)}
                          title="Edit Prescription"
                        >
                          Edit
                        </button>
                        {prescription.status === 'pending' && (
                          <>
                            <button 
                              className="btn btn-sm btn-outline-success"
                              onClick={() => handleApprove(prescription.id)}
                              title="Approve Prescription"
                            >
                              Approve
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleReject(prescription.id)}
                              title="Reject Prescription"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeletePrescription(prescription)}
                          title="Delete Prescription"
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

      {/* Prescription Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleModalClose}
        title={selectedPrescription ? "Edit Prescription" : "Add New Prescription"}
        size="lg"
      >
        <PrescriptionForm
          prescription={selectedPrescription}
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
          <p>Are you sure you want to delete this prescription?</p>
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