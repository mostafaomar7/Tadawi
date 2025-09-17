import React, { useState, useEffect } from "react";
import { 
  MdSearch, 
  MdEdit, 
  MdDelete, 
  MdAdd, 
  MdPerson,
  MdFilterList,
  MdRefresh,
  MdCheckCircle,
  MdToggleOn,
  MdToggleOff
} from "react-icons/md";
import { usersService } from "../../services/users";
import { useToast } from "../../hooks/useToast";
import Modal from "../../components/common/Modal";
import UserForm from "../../components/forms/UserForm";

export default function Users() {
  const { showSuccess, showError } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    doctors: 0,
    pharmacies: 0,
    active: 0
  });

  useEffect(() => {
    fetchUsers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersService.getUsers();
      console.log('Users response:', response);
      
      // Handle response structure: response.data.data.data
      let usersData = [];
      if (response.data && response.data.data && response.data.data.data) {
        usersData = response.data.data.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        usersData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        usersData = response.data;
      } else if (Array.isArray(response)) {
        usersData = response;
      }
      
      setUsers(usersData);
      
      // Calculate stats
      const total = usersData.length;
      const doctors = usersData.filter(u => u.role === 'doctor').length;
      const pharmacies = usersData.filter(u => u.role === 'pharmacy').length;
      const active = usersData.filter(u => u.status === 'active').length;
      
      setStats({ total, doctors, pharmacies, active });
    } catch (err) {
      setError(err.message);
      showError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = Array.isArray(users) ? users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.role?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  }) : [];

  const handleAddUser = () => {
    setSelectedUser(null);
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await usersService.deleteUser(userToDelete.id);
      showSuccess('User deleted successfully!');
      fetchUsers();
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    } catch (err) {
      setError(err.message);
      showError(err.message || 'Failed to delete user');
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      await usersService.updateUser(user.id, { status: newStatus });
      showSuccess(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
      fetchUsers();
    } catch (err) {
      showError(err.message || 'Failed to update user status');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const handleFormSave = () => {
    fetchUsers();
    setShowModal(false);
    setSelectedUser(null);
  };


  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading users...</p>
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
    <div className="users-page">
      {/* Header - Clean Design */}
      <div className="horizon-card mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="card-title mb-1">Users Management</h2>
            <p className="text-muted mb-0">Manage system users and their roles</p>
          </div>
          <div className="d-flex gap-2">
            <button 
              className="btn btn-outline-primary"
              onClick={fetchUsers}
              title="Refresh Data"
            >
              Refresh
            </button>
            <button className="btn btn-primary-gradient text-white border-0" onClick={handleAddUser}>
              Add User
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards - Clean Design */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="horizon-card text-center">
            <h6 className="mb-1 text-muted">Total Users</h6>
            <h3 className="mb-0 text-primary">{stats.total}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="horizon-card text-center">
            <h6 className="mb-1 text-muted">Doctors</h6>
            <h3 className="mb-0 text-info">{stats.doctors}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="horizon-card text-center">
            <h6 className="mb-1 text-muted">Pharmacies</h6>
            <h3 className="mb-0 text-warning">{stats.pharmacies}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="horizon-card text-center">
            <h6 className="mb-1 text-muted">Active</h6>
            <h3 className="mb-0 text-success">{stats.active}</h3>
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
              placeholder="Search users by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <select 
              className="form-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="doctor">Doctors</option>
              <option value="pharmacy">Pharmacies</option>
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

      {/* Users Table - Clean Design */}
      <div className="horizon-card">
       
        
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th className="border-0 fw-bold">
                  <div className="d-flex align-items-center">
                    <div className="icon-box bg-primary-gradient me-2" style={{width: '24px', height: '24px'}}>
                      <MdPerson className="icon" style={{fontSize: '12px'}} />
                    </div>
                    User Details
                  </div>
                </th>
                <th className="border-0 fw-bold">
                  <div className="d-flex align-items-center">
                    <div className="icon-box bg-info-gradient me-2" style={{width: '24px', height: '24px'}}>
                      <i className="fas fa-envelope icon" style={{fontSize: '12px'}}></i>
                    </div>
                    Email
                  </div>
                </th>
                <th className="border-0 fw-bold">
                  <div className="d-flex align-items-center">
                    <div className="icon-box bg-warning-gradient me-2" style={{width: '24px', height: '24px'}}>
                      <i className="fas fa-user-tag icon" style={{fontSize: '12px'}}></i>
                    </div>
                    Role
                  </div>
                </th>
                <th className="border-0 fw-bold text-center">
                  <div className="d-flex align-items-center justify-content-center">
                    <div className="icon-box bg-info-gradient me-2" style={{width: '24px', height: '24px'}}>
                      <MdToggleOn className="icon" style={{fontSize: '12px'}} />
                    </div>
                    Status
                  </div>
                </th>
                <th className="border-0 fw-bold text-center">
                  <div className="d-flex align-items-center justify-content-center">
                    <div className="icon-box bg-secondary-gradient me-2" style={{width: '24px', height: '24px'}}>
                      <i className="fas fa-cogs icon" style={{fontSize: '12px'}}></i>
                    </div>
                    Actions
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="medicine-row">
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="icon-box bg-primary-gradient me-3" style={{width: '48px', height: '48px'}}>
                        <MdPerson className="icon" style={{fontSize: '20px'}} />
                      </div>
                      <div>
                        <h6 className="mb-1 fw-bold">{user.name}</h6>
                        <small className="text-muted">ID: {user.id}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="icon-box bg-info-gradient me-2" style={{width: '32px', height: '32px'}}>
                        <i className="fas fa-envelope icon" style={{fontSize: '14px'}}></i>
                      </div>
                      <span className="text-muted">{user.email}</span>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="icon-box bg-warning-gradient me-2" style={{width: '32px', height: '32px'}}>
                        <i className={`fas ${user.role === 'doctor' ? 'fa-user-md' : 'fa-clinic-medical'} icon`} style={{fontSize: '14px'}}></i>
                      </div>
                      <span className={`badge ${user.role === 'doctor' ? 'bg-primary-gradient' : 'bg-success-gradient'} text-white px-3 py-2`}>
                        {user.role}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex justify-content-center">
                      <button 
                        className={`btn btn-sm ${user.status === 'active' ? 'btn-success' : 'btn-secondary'} d-flex align-items-center`}
                        onClick={() => handleToggleStatus(user)}
                        title={`${user.status === 'active' ? 'Deactivate' : 'Activate'} User`}
                      >
                        {user.status === 'active' ? (
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
                        className="btn btn-sm btn-outline-primary d-flex align-items-center"
                        onClick={() => handleEditUser(user)}
                        title="Edit User"
                      >
                        <MdEdit className="me-1" />
                        Edit
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-danger d-flex align-items-center"
                        onClick={() => handleDeleteUser(user)}
                        title="Delete User"
                      >
                        <MdDelete className="me-1" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredUsers.length === 0 && (
        <div className="horizon-card">
          <div className="text-center py-5">
            <div className="icon-box bg-warning-gradient mx-auto mb-4" style={{width: '100px', height: '100px'}}>
              <MdPerson className="icon" style={{fontSize: '40px'}} />
            </div>
            <h4 className="text-muted mb-3">
              {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' ? 'No users found' : 'No users available'}
            </h4>
            <p className="text-muted mb-4">
              {searchTerm ? `No users match your search "${searchTerm}"` : 
               roleFilter !== 'all' ? `No users found with the selected role filter` :
               statusFilter !== 'all' ? `No users found with the selected status filter` :
               "No users available in the system. Add your first user to get started."}
            </p>
            <div className="d-flex gap-3 justify-content-center">
              {searchTerm && (
                <button 
                  className="btn btn-outline-primary"
                  onClick={() => setSearchTerm("")}
                >
                  <i className="fas fa-times me-2"></i>Clear Search
                </button>
              )}
              {roleFilter !== 'all' && (
                <button 
                  className="btn btn-outline-warning"
                  onClick={() => setRoleFilter('all')}
                >
                  <MdFilterList className="me-2" />
                  Clear Role Filter
                </button>
              )}
              {statusFilter !== 'all' && (
                <button 
                  className="btn btn-outline-info"
                  onClick={() => setStatusFilter('all')}
                >
                  <MdToggleOn className="me-2" />
                  Clear Status Filter
                </button>
              )}
              {!searchTerm && roleFilter === 'all' && statusFilter === 'all' && (
                <button 
                  className="btn btn-primary-gradient text-white"
                  onClick={handleAddUser}
                >
                  <MdAdd className="me-2" />
                  Add First User
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* User Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleModalClose}
        title={selectedUser ? "Edit User" : "Add New User"}
        size="lg"
      >
        <UserForm
          user={selectedUser}
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
          <p>Are you sure you want to delete <strong>{userToDelete?.name}</strong>?</p>
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
