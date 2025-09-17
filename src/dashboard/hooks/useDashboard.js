import { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboard';

// Custom hook for dashboard data
export const useDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [summary, setSummary] = useState(null);
  const [chartsData, setChartsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all dashboard data in parallel
        const [overviewData, summaryData, chartsDataResult] = await Promise.all([
          dashboardService.getOverview(),
          dashboardService.getSummary(),
          dashboardService.getChartsData(),
        ]);

        setOverview(overviewData);
        setSummary(summaryData);
        setChartsData(chartsDataResult);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);

      const [overviewData, summaryData, chartsDataResult] = await Promise.all([
        dashboardService.getOverview(),
        dashboardService.getSummary(),
        dashboardService.getChartsData(),
      ]);

      setOverview(overviewData);
      setSummary(summaryData);
      setChartsData(chartsDataResult);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  return {
    overview,
    summary,
    chartsData,
    loading,
    error,
    refetch,
  };
};
