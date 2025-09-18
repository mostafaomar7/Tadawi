import React, { useState, useEffect } from "react";
import {
  MdAttachMoney,
  MdAddTask,
  MdMedication,
  MdPeople,
  MdShoppingCart,
  MdAssignment,
} from "react-icons/md";
import { dashboardService } from "../../services";
import Charts from "../../components/charts/Charts";
import MiniStatistics from "../../components/cards/MiniStatistics";
import IconBox from "../../components/icons/IconBox";

export default function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getOverview();
        setOverview(data);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading dashboard...</p>
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
    <div className="dashboard-main">
      {/* Statistics Cards - Horizon UI Style */}
      <div className="row g-4 mb-4">
        {/* Total Medicines */}
        <div className="col-xl-2 col-md-4 col-sm-6">
          <MiniStatistics
            startContent={
              <IconBox
                bg="linear-gradient(90deg, #4481EB 0%, #04BEFE 100%)"
              >
                <MdMedication size={28} color="white" />
              </IconBox>
            }
            name="Total Medicines"
            value={overview?.total_medicines || '0'}
          />
        </div>

        {/* Total Orders */}
        <div className="col-xl-2 col-md-4 col-sm-6">
          <MiniStatistics
            startContent={
              <IconBox
                bg="linear-gradient(90deg, #00C49F 0%, #00B894 100%)"
              >
                <MdShoppingCart size={28} color="white" />
              </IconBox>
            }
            name="Total Orders"
            value={overview?.total_orders || '0'}
          />
        </div>

        {/* Total Users */}
        <div className="col-xl-2 col-md-4 col-sm-6">
          <MiniStatistics
            startContent={
              <IconBox
                bg="linear-gradient(90deg, #17A2B8 0%, #138496 100%)"
              >
                <MdPeople size={28} color="white" />
              </IconBox>
            }
            name="Total Users"
            value={overview?.total_users || '0'}
          />
        </div>

        {/* Revenue */}
        <div className="col-xl-2 col-md-4 col-sm-6">
          <MiniStatistics
            startContent={
              <IconBox
                bg="linear-gradient(90deg, #FFC107 0%, #FF8F00 100%)"
              >
                <MdAttachMoney size={28} color="white" />
              </IconBox>
            }
            name="Revenue"
            value={`$${overview?.total_revenue || '0'}`}
          />
        </div>

        {/* New Orders */}
        <div className="col-xl-2 col-md-4 col-sm-6">
          <MiniStatistics
            startContent={
              <IconBox
                bg="linear-gradient(90deg, #6F42C1 0%, #5A32A3 100%)"
              >
                <MdAddTask size={28} color="white" />
              </IconBox>
            }
            name="New Orders"
            value={overview?.new_orders || '0'}
          />
        </div>

        {/* Prescriptions */}
        <div className="col-xl-2 col-md-4 col-sm-6">
          <MiniStatistics
            startContent={
              <IconBox
                bg="linear-gradient(90deg, #DC3545 0%, #C82333 100%)"
              >
                <MdAssignment size={28} color="white" />
              </IconBox>
            }
            name="Prescriptions"
            value={overview?.total_prescriptions || '0'}
          />
        </div>
      </div>

      {/* Dashboard Overview - Horizon UI Style */}
      <div className="horizon-card mb-4">
        <div className="w-100">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="card-title mb-0">📊 Dashboard Overview</h2>
            <div className="badge bg-primary-gradient text-white px-3 py-2">
              Live Data
            </div>
          </div>
          
          <p className="text-muted mb-4 fs-5">
            Welcome to <strong>Tadawi Dashboard</strong>. Here you can manage medicines, orders, users, and more with real-time insights.
          </p>
          
          {/* Quick Stats Summary */}
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="p-4 bg-light rounded-3">
                <h5 className="text-primary mb-3 d-flex align-items-center">
                  <i className="fas fa-chart-line me-2"></i>
                  System Status
                </h5>
                <div className="row g-3">
                  <div className="col-6">
                    <div className="text-center p-3 bg-white rounded-2 shadow-sm">
                      <i className="fas fa-users text-primary fs-4 mb-2"></i>
                      <h6 className="mb-1">{overview?.total_users || '0'}</h6>
                      <small className="text-muted">Active Users</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="text-center p-3 bg-white rounded-2 shadow-sm">
                      <i className="fas fa-pills text-success fs-4 mb-2"></i>
                      <h6 className="mb-1">{overview?.total_medicines || '0'}</h6>
                      <small className="text-muted">Medicines</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="text-center p-3 bg-white rounded-2 shadow-sm">
                      <i className="fas fa-shopping-cart text-warning fs-4 mb-2"></i>
                      <h6 className="mb-1">{overview?.new_orders || '0'}</h6>
                      <small className="text-muted">New Orders</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="text-center p-3 bg-white rounded-2 shadow-sm">
                      <i className="fas fa-file-medical text-danger fs-4 mb-2"></i>
                      <h6 className="mb-1">{overview?.total_prescriptions || '0'}</h6>
                      <small className="text-muted">Prescriptions</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="p-4 bg-light rounded-3">
                <h5 className="text-primary mb-3 d-flex align-items-center">
                  <i className="fas fa-bolt me-2"></i>
                  Quick Actions
                </h5>
                <div className="d-grid gap-2">
                  <button className="btn btn-primary-gradient text-white border-0 py-2">
                    <i className="fas fa-plus me-2"></i>Add New Medicine
                  </button>
                  <button className="btn btn-success-gradient text-white border-0 py-2">
                    <i className="fas fa-eye me-2"></i>View All Orders
                  </button>
                  <button className="btn btn-info-gradient text-white border-0 py-2">
                    <i className="fas fa-users me-2"></i>Manage Users
                  </button>
                  <button className="btn btn-warning-gradient text-white border-0 py-2">
                    <i className="fas fa-chart-line me-2"></i>View Reports
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics & Reports - Horizon UI Style */}
      <div className="horizon-card mb-4">
        <div className="w-100">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="card-title mb-1">📈 Analytics & Reports</h2>
              <p className="text-muted mb-0">Interactive charts showing key metrics and trends</p>
            </div>
            <div className="d-flex gap-2">
              <div className="badge bg-success-gradient text-white px-3 py-2">
                <i className="fas fa-sync-alt me-1"></i>Real-time
              </div>
              <div className="badge bg-info-gradient text-white px-3 py-2">
                <i className="fas fa-chart-bar me-1"></i>3 Charts
              </div>
            </div>
          </div>
          
          {/* Analytics Summary */}
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="text-center p-4 bg-primary-gradient text-white rounded-3">
                <i className="fas fa-users fs-2 mb-2"></i>
                <h3 className="mb-1">{overview?.total_users || '0'}</h3>
                <p className="mb-0 opacity-75">Total Active Users</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="text-center p-4 bg-success-gradient text-white rounded-3">
                <i className="fas fa-shopping-cart fs-2 mb-2"></i>
                <h3 className="mb-1">{overview?.total_orders || '0'}</h3>
                <p className="mb-0 opacity-75">Total Orders</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="text-center p-4 bg-warning-gradient text-white rounded-3">
                <i className="fas fa-clock fs-2 mb-2"></i>
                <h3 className="mb-1">{overview?.new_orders || '0'}</h3>
                <p className="mb-0 opacity-75">New Orders Today</p>
              </div>
            </div>
          </div>
          
          {/* Chart Description */}
          <div className="p-4 bg-light rounded-3">
            <h6 className="text-primary mb-3 d-flex align-items-center">
              <i className="fas fa-info-circle me-2"></i>
              Chart Information
            </h6>
            <div className="row g-3">
              <div className="col-md-4">
                <div className="d-flex align-items-center p-3 bg-white rounded-2">
                  <div className="icon-box bg-danger-gradient me-3">
                    <i className="fas fa-exclamation-triangle icon"></i>
                  </div>
                  <div>
                    <h6 className="mb-1">Medicine Shortage</h6>
                    <small className="text-muted">Shows which pharmacies have low stock</small>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="d-flex align-items-center p-3 bg-white rounded-2">
                  <div className="icon-box bg-info-gradient me-3">
                    <i className="fas fa-users icon"></i>
                  </div>
                  <div>
                    <h6 className="mb-1">User Roles</h6>
                    <small className="text-muted">Distribution of users by role</small>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="d-flex align-items-center p-3 bg-white rounded-2">
                  <div className="icon-box bg-success-gradient me-3">
                    <i className="fas fa-chart-line icon"></i>
                  </div>
                  <div>
                    <h6 className="mb-1">Daily Orders</h6>
                    <small className="text-muted">Order trends over the last 6 days</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts Component */}
      <Charts />
    </div>
  );
}
