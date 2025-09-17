import React, { useState, useEffect } from "react";
import { MdSave, MdDownload, MdSettings } from "react-icons/md";
import { settingsService } from "../../services/settings";

export default function Settings() {
  const [settings, setSettings] = useState({});
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchSettings();
    fetchPermissions();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await settingsService.getSettings();
      setSettings(response.data || {});
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await settingsService.getPermissions();
      setPermissions(response.data || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await settingsService.updateSettings(settings);
      alert('Settings saved successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSavePermissions = async () => {
    try {
      setSaving(true);
      await settingsService.updatePermissions(permissions);
      alert('Permissions updated successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadReport = async (type) => {
    try {
      const response = await settingsService.getReports(type);
      // Create download link
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-report.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading settings...</p>
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
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="card-title mb-0">Settings</h2>
        <button 
          className="btn btn-primary"
          onClick={activeTab === 'general' ? handleSaveSettings : handleSavePermissions}
          disabled={saving}
        >
          <MdSave className="me-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <MdSettings className="me-2" />
            General Settings
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'permissions' ? 'active' : ''}`}
            onClick={() => setActiveTab('permissions')}
          >
            Permissions
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            Reports
          </button>
        </li>
      </ul>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">General Settings</h3>
          </div>
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Application Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.app_name || ''}
                  onChange={(e) => setSettings({...settings, app_name: e.target.value})}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Contact Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={settings.contact_email || ''}
                  onChange={(e) => setSettings({...settings, contact_email: e.target.value})}
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Max File Size (MB)</label>
                <input
                  type="number"
                  className="form-control"
                  value={settings.max_file_size || ''}
                  onChange={(e) => setSettings({...settings, max_file_size: e.target.value})}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Session Timeout (minutes)</label>
                <input
                  type="number"
                  className="form-control"
                  value={settings.session_timeout || ''}
                  onChange={(e) => setSettings({...settings, session_timeout: e.target.value})}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Permissions */}
      {activeTab === 'permissions' && (
        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">User Permissions</h3>
          </div>
          <div className="row">
            <div className="col-md-6">
              <h5>Admin Permissions</h5>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={permissions.admin_can_manage_users || false}
                  onChange={(e) => setPermissions({...permissions, admin_can_manage_users: e.target.checked})}
                />
                <label className="form-check-label">Manage Users</label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={permissions.admin_can_manage_medicines || false}
                  onChange={(e) => setPermissions({...permissions, admin_can_manage_medicines: e.target.checked})}
                />
                <label className="form-check-label">Manage Medicines</label>
              </div>
            </div>
            <div className="col-md-6">
              <h5>Doctor Permissions</h5>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={permissions.doctor_can_view_prescriptions || false}
                  onChange={(e) => setPermissions({...permissions, doctor_can_view_prescriptions: e.target.checked})}
                />
                <label className="form-check-label">View Prescriptions</label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={permissions.doctor_can_approve_prescriptions || false}
                  onChange={(e) => setPermissions({...permissions, doctor_can_approve_prescriptions: e.target.checked})}
                />
                <label className="form-check-label">Approve Prescriptions</label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reports */}
      {activeTab === 'reports' && (
        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">Generate Reports</h3>
          </div>
          <div className="row">
            <div className="col-md-4">
              <div className="card">
                <div className="card-body text-center">
                  <h5 className="card-title">Users Report</h5>
                  <p className="card-text">Generate a report of all users</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleDownloadReport('users')}
                  >
                    <MdDownload className="me-2" />
                    Download
                  </button>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card">
                <div className="card-body text-center">
                  <h5 className="card-title">Orders Report</h5>
                  <p className="card-text">Generate a report of all orders</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleDownloadReport('orders')}
                  >
                    <MdDownload className="me-2" />
                    Download
                  </button>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card">
                <div className="card-body text-center">
                  <h5 className="card-title">Medicines Report</h5>
                  <p className="card-text">Generate a report of all medicines</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleDownloadReport('medicines')}
                  >
                    <MdDownload className="me-2" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
