import React, { createContext, useContext, useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboard';

const DashboardContext = createContext();

export const useDashboardContext = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboardContext must be used within a DashboardProvider');
  }
  return context;
};

export const DashboardProvider = ({ children }) => {
  const [overview, setOverview] = useState(null);
  const [summary, setSummary] = useState(null);
  const [chartsData, setChartsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [overviewResponse, summaryResponse, chartsResponse] = await Promise.all([
        dashboardService.getOverview(),
        dashboardService.getSummary(),
        dashboardService.getChartsData(),
      ]);

      // Extract data from API response structure
      const overviewData = overviewResponse.data || overviewResponse;
      const summaryData = summaryResponse.data || summaryResponse;
      const chartsDataResult = chartsResponse.data || chartsResponse;

      // Debug: Log the raw data
      console.log('Raw overview data:', overviewData);
      console.log('Raw summary data:', summaryData);

      // Transform overview data to match frontend expectations
      const transformedOverview = {
        total_medicines: overviewData.additional_statistics?.total_orders || 0,
        total_orders: overviewData.additional_statistics?.total_orders || 0,
        total_users: overviewData.total_active_users || 0,
        total_revenue: 0, // Not available in current API
        new_orders: overviewData.additional_statistics?.pending_orders || 0,
        total_prescriptions: overviewData.additional_statistics?.total_prescriptions || 0,
        total_donations: overviewData.total_donations || 0,
        processed_prescriptions: overviewData.processed_prescriptions || 0,
        active_orders: overviewData.active_orders_count || 0,
        medicine_shortage_percentage: overviewData.medicine_shortage_percentage || 0,
        active_users_by_role: overviewData.active_users_by_role || {},
        last_updated: overviewData.last_updated
      };

      console.log('Transformed overview:', transformedOverview);

      setOverview(transformedOverview);
      setSummary(summaryData);
      setChartsData(chartsDataResult);
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const value = {
    overview,
    summary,
    chartsData,
    loading,
    error,
    sidebarCollapsed,
    toggleSidebar,
    refetch: fetchDashboardData,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};
