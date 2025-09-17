import React, { useState, useEffect } from "react";
import { 
  MdToggleOn,
  MdToggleOff
} from "react-icons/md";
import { medicinesService } from "../../services/medicines";
import { useToast } from "../../hooks/useToast";
import Modal from "../../components/common/Modal";
import MedicineForm from "../../components/forms/MedicineForm";

export default function Medicines() {
  const { showSuccess, showError } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [medicineToDelete, setMedicineToDelete] = useState(null);
  const [stockFilter, setStockFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0
  });

  useEffect(() => {
    fetchMedicines();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const response = await medicinesService.getMedicines();
      console.log('Medicines response:', response);
      
      // Handle response structure
      let medicinesData = [];
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        medicinesData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        medicinesData = response.data;
      } else if (Array.isArray(response)) {
        medicinesData = response;
      }
      
      // Transform data to include status
      const transformedData = medicinesData.map(medicine => ({
        ...medicine,
        status: medicine.status || 'active'
      }));
      
      setMedicines(transformedData);
      
      // Calculate stats
      const total = transformedData.length;
      const inStock = transformedData.filter(m => m.total_quantity > 5).length;
      const lowStock = transformedData.filter(m => m.total_quantity >= 1 && m.total_quantity <= 5).length;
      const outOfStock = transformedData.filter(m => m.total_quantity === 0).length;
      
      setStats({ total, inStock, lowStock, outOfStock });
    } catch (err) {
      setError(err.message);
      showError(err.message || 'Failed to fetch medicines');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedicine = () => {
    setSelectedMedicine(null);
    setShowModal(true);
  };

  const handleEditMedicine = (medicine) => {
    setSelectedMedicine(medicine);
    setShowModal(true);
  };

  const handleDeleteMedicine = (medicine) => {
    setMedicineToDelete(medicine);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await medicinesService.deleteMedicine(medicineToDelete.id);
      showSuccess('Medicine deleted successfully!');
      fetchMedicines();
      setShowDeleteConfirm(false);
      setMedicineToDelete(null);
    } catch (err) {
      showError(err.message || 'Failed to delete medicine');
    }
  };

  const handleToggleStatus = async (medicine) => {
    try {
      const newStatus = medicine.status === 'active' ? 'inactive' : 'active';
      await medicinesService.updateMedicine(medicine.id, { status: newStatus });
      showSuccess(`Medicine ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
      fetchMedicines();
    } catch (err) {
      showError(err.message || 'Failed to update medicine status');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedMedicine(null);
  };

  const handleFormSave = () => {
    fetchMedicines();
    setShowModal(false);
    setSelectedMedicine(null);
  };

  const filteredMedicines = Array.isArray(medicines) ? medicines.filter(medicine => {
    const matchesSearch = medicine.brand_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medicine.active_ingredient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medicine.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStock = stockFilter === 'all' || 
                        (stockFilter === 'in' && medicine.total_quantity > 5) ||
                        (stockFilter === 'low' && medicine.total_quantity >= 1 && medicine.total_quantity <= 5) ||
                        (stockFilter === 'out' && medicine.total_quantity === 0);
                        
    const matchesStatus = statusFilter === 'all' || medicine.status === statusFilter;
    
    return matchesSearch && matchesStock && matchesStatus;
  }) : [];

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading medicines...</p>
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
    <div className="medicines-page">
      {/* Header - Clean Design */}
      <div className="horizon-card mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="card-title mb-1">Medicines Management</h2>
            <p className="text-muted mb-0">Manage your medicine inventory and stock levels</p>
          </div>
          <div className="d-flex gap-2">
            <button 
              className="btn btn-outline-primary"
              onClick={fetchMedicines}
              title="Refresh Data"
            >
              Refresh
            </button>
            <button className="btn btn-primary-gradient text-white border-0" onClick={handleAddMedicine}>
              Add Medicine
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards - Clean Design */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="horizon-card text-center">
            <h6 className="mb-1 text-muted">Total Medicines</h6>
            <h3 className="mb-0 text-primary">{stats.total}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="horizon-card text-center">
            <h6 className="mb-1 text-muted">In Stock</h6>
            <h3 className="mb-0 text-success">{stats.inStock}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="horizon-card text-center">
            <h6 className="mb-1 text-muted">Low Stock</h6>
            <h3 className="mb-0 text-warning">{stats.lowStock}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="horizon-card text-center">
            <h6 className="mb-1 text-muted">Out of Stock</h6>
            <h3 className="mb-0 text-danger">{stats.outOfStock}</h3>
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
              placeholder="Search medicines by name, active ingredient, or manufacturer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <select 
              className="form-select"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
            >
              <option value="all">All Stock</option>
              <option value="in">In Stock (&gt;5)</option>
              <option value="low">Low Stock (1-5)</option>
              <option value="out">Out of Stock (0)</option>
            </select>
          </div>
          <div className="col-md-3">
            <select 
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Medicines Table - Clean Design */}
      <div className="horizon-card">
        
        
        <div className="table-responsive">
          {filteredMedicines.length === 0 ? (
            <div className="text-center py-5">
              <h4 className="text-muted mb-3">
                {searchTerm || stockFilter !== 'all' || statusFilter !== 'all' ? 'No medicines found' : 'No medicines available'}
              </h4>
              <p className="text-muted mb-4">
                {searchTerm ? `No medicines match your search "${searchTerm}"` : 
                 stockFilter !== 'all' ? `No medicines found with the selected stock filter` :
                 statusFilter !== 'all' ? `No medicines found with the selected status filter` :
                 "No medicines available in the system. Add your first medicine to get started."}
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
                {stockFilter !== 'all' && (
                  <button 
                    className="btn btn-outline-warning"
                    onClick={() => setStockFilter('all')}
                  >
                    Clear Stock Filter
                  </button>
                )}
                {statusFilter !== 'all' && (
                  <button 
                    className="btn btn-outline-info"
                    onClick={() => setStatusFilter('all')}
                  >
                    Clear Status Filter
                  </button>
                )}
                {!searchTerm && stockFilter === 'all' && statusFilter === 'all' && (
                  <button 
                    className="btn btn-primary-gradient text-white"
                    onClick={handleAddMedicine}
                  >
                    Add First Medicine
                  </button>
                )}
              </div>
            </div>
          ) : (
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th className="border-0 fw-bold">Medicine Details</th>
                  <th className="border-0 fw-bold">Active Ingredient</th>
                  <th className="border-0 fw-bold">Dosage & Form</th>
                  <th className="border-0 fw-bold text-center">Price</th>
                  <th className="border-0 fw-bold text-center">Stock Status</th>
                  <th className="border-0 fw-bold text-center">Status</th>
                  <th className="border-0 fw-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMedicines.map((medicine) => (
                  <tr key={medicine.id} className="medicine-row">
                    <td>
                      <div>
                        <h6 className="mb-1 fw-bold">{medicine.brand_name}</h6>
                        <small className="text-muted">{medicine.manufacturer}</small>
                      </div>
                    </td>
                    <td>
                      <span className="text-muted">{medicine.active_ingredient?.name || 'N/A'}</span>
                    </td>
                    <td>
                      <div>
                        <span className="fw-bold">{medicine.dosage_strength}</span>
                        <br />
                        <small className="text-muted">{medicine.form}</small>
                      </div>
                    </td>
                    <td className="text-center">
                      <strong className="text-success">${medicine.price}</strong>
                    </td>
                    <td className="text-center">
                      <div>
                        <span className="fw-bold">{medicine.total_quantity || 0}</span>
                        <br />
                        {medicine.total_quantity === 0 && (
                          <small className="text-danger">Out of Stock</small>
                        )}
                        {medicine.total_quantity >= 1 && medicine.total_quantity <= 5 && (
                          <small className="text-warning">Low Stock</small>
                        )}
                        {medicine.total_quantity > 5 && (
                          <small className="text-success">In Stock</small>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex justify-content-center">
                        <button 
                          className={`btn btn-sm ${medicine.status === 'active' ? 'btn-success' : 'btn-secondary'} d-flex align-items-center`}
                          onClick={() => handleToggleStatus(medicine)}
                          title={`${medicine.status === 'active' ? 'Deactivate' : 'Activate'} Medicine`}
                        >
                          {medicine.status === 'active' ? (
                            <>
                              <MdToggleOn className="me-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <MdToggleOff className="me-1" />
                              Inactive
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex gap-2 justify-content-center">
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEditMedicine(medicine)}
                          title="Edit Medicine"
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteMedicine(medicine)}
                          title="Delete Medicine"
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

      {/* Medicine Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleModalClose}
        title={selectedMedicine ? "Edit Medicine" : "Add New Medicine"}
        size="lg"
      >
        <MedicineForm
          medicine={selectedMedicine}
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
          <p>Are you sure you want to delete <strong>{medicineToDelete?.brand_name}</strong>?</p>
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