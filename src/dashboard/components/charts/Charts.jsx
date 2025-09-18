import React, { useState, useEffect } from "react";
import { dashboardService } from "../../services";
import { LineChart, BarChart, PieChart } from "../charts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Charts() {
  const [chartsData, setChartsData] = useState({
    medicineShortage: { series: [], options: {} },
    dailyOrders: { series: [], options: {} },
    userRoles: { series: [], options: {} }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchChartsData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchChartsData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching charts data...');
      
      const chartsResponse = await dashboardService.getChartsData();
      
      console.log('📊 Raw charts data:', chartsResponse);

      // Transform Chart.js format to Recharts format
      const transformedData = {
        medicineShortage: transformMedicineShortageData(chartsResponse.medicine_shortage),
        dailyOrders: transformDailyOrdersData(chartsResponse.daily_orders),
        userRoles: transformUserRolesData(chartsResponse.user_roles)
      };

      console.log('🔄 Transformed charts data:', transformedData);
      console.log('📈 Medicine Shortage:', transformedData.medicineShortage);
      console.log('📈 Daily Orders:', transformedData.dailyOrders);
      console.log('📈 User Roles:', transformedData.userRoles);

      setChartsData(transformedData);
      console.log('✅ Charts data set successfully');
    } catch (err) {
      console.error('❌ Charts fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      console.log('🏁 Charts loading completed');
    }
  };

  // Transform medicine shortage data to ApexCharts format
  const transformMedicineShortageData = (data) => {
    console.log('🔄 Transforming medicine shortage data:', data);
    if (!data || !data.labels || !data.datasets) {
      console.log('❌ Medicine shortage data is invalid:', { data, labels: data?.labels, datasets: data?.datasets });
      return { series: [], options: {} };
    }
    
    const series = [{
      name: 'Shortage Count',
      data: data.datasets[0]?.data || []
    }];
    
    const options = {
      chart: {
        type: 'bar',
        height: 350
      },
      xaxis: {
        categories: data.labels || []
      },
      title: {
        text: 'Medicine Shortage by Pharmacy'
      }
    };
    
    console.log('✅ Medicine shortage transformed:', { series, options });
    return { series, options };
  };

  // Transform daily orders data to ApexCharts format
  const transformDailyOrdersData = (data) => {
    console.log('🔄 Transforming daily orders data:', data);
    if (!data || !data.labels || !data.datasets) {
      console.log('❌ Daily orders data is invalid:', { data, labels: data?.labels, datasets: data?.datasets });
      return { series: [], options: {} };
    }
    
    const series = [{
      name: 'Orders Count',
      data: data.datasets[0]?.data || []
    }];
    
    const options = {
      chart: {
        type: 'line',
        height: 350
      },
      xaxis: {
        categories: data.labels || []
      },
      title: {
        text: 'Daily Orders Trend'
      }
    };
    
    console.log('✅ Daily orders transformed:', { series, options });
    return { series, options };
  };

  // Transform user roles data to ApexCharts format
  const transformUserRolesData = (data) => {
    console.log('🔄 Transforming user roles data:', data);
    if (!data || !data.labels || !data.datasets) {
      console.log('❌ User roles data is invalid:', { data, labels: data?.labels, datasets: data?.datasets });
      return { series: [], options: {} };
    }
    
    const series = data.datasets[0]?.data || [];
    const labels = data.labels || [];
    
    const options = {
      chart: {
        type: 'pie',
        height: 350
      },
      labels: labels,
      title: {
        text: 'User Roles Distribution'
      }
    };
    
    console.log('✅ User roles transformed:', { series, options });
    return { series, options };
  };

  console.log('🎨 Charts component render:', { loading, error, chartsData });

  if (loading) {
    console.log('⏳ Charts loading...');
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading charts...</p>
      </div>
    );
  }

  if (error) {
    console.log('❌ Charts error:', error);
    return (
      <div className="alert alert-danger" role="alert">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  // Check if all charts data is empty
  const allChartsEmpty = chartsData.medicineShortage.series.length === 0 && 
                        chartsData.dailyOrders.series.length === 0 && 
                        chartsData.userRoles.series.length === 0;

  console.log('📊 Charts data check:', {
    medicineShortage: chartsData.medicineShortage.series.length,
    dailyOrders: chartsData.dailyOrders.series.length,
    userRoles: chartsData.userRoles.series.length,
    allChartsEmpty
  });

  if (allChartsEmpty) {
    console.log('⚠️ All charts are empty');
    return (
      <div className="text-center py-5">
        <div className="alert alert-info" role="alert">
          <h4>No Chart Data Available</h4>
          <p>Charts will appear here once there is data to display.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="charts-container">
      <div className="row">
        {/* Medicine Shortage Chart */}
        {chartsData.medicineShortage.series.length > 0 && (
          <div className="col-md-6 mb-4">
            <BarChart
              chartData={chartsData.medicineShortage.series}
              chartOptions={chartsData.medicineShortage.options}
              title="Medicine Shortage by Pharmacy"
              height={350}
            />
          </div>
        )}

        {/* User Roles Chart */}
        {chartsData.userRoles.series.length > 0 && (
          <div className="col-md-6 mb-4">
            <PieChart
              chartData={chartsData.userRoles.series}
              chartOptions={chartsData.userRoles.options}
              title="User Roles Distribution"
              height={350}
            />
          </div>
        )}

        {/* Daily Orders Chart */}
        {chartsData.dailyOrders.series.length > 0 && (
          <div className="col-12 mb-4">
            <LineChart
              chartData={chartsData.dailyOrders.series}
              chartOptions={chartsData.dailyOrders.options}
              title="Daily Orders Trend"
              height={400}
            />
          </div>
        )}
      </div>
    </div>
  );
}
