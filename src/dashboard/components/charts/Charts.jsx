import React, { useState, useEffect } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { dashboardService } from "../../services/dashboard";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Charts() {
  const [chartsData, setChartsData] = useState({
    medicineShortage: [],
    dailyOrders: [],
    userRoles: []
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

  // Transform medicine shortage data from Chart.js to Recharts format
  const transformMedicineShortageData = (data) => {
    console.log('🔄 Transforming medicine shortage data:', data);
    if (!data || !data.labels || !data.datasets) {
      console.log('❌ Medicine shortage data is invalid:', { data, labels: data?.labels, datasets: data?.datasets });
      return [];
    }
    
    const transformed = data.labels.map((label, index) => ({
      pharmacy_name: label || `Pharmacy ${index + 1}`,
      shortage_count: data.datasets[0]?.data[index] || 0
    }));
    
    console.log('✅ Medicine shortage transformed:', transformed);
    return transformed;
  };

  // Transform daily orders data from Chart.js to Recharts format
  const transformDailyOrdersData = (data) => {
    console.log('🔄 Transforming daily orders data:', data);
    if (!data || !data.labels || !data.datasets) {
      console.log('❌ Daily orders data is invalid:', { data, labels: data?.labels, datasets: data?.datasets });
      return [];
    }
    
    const transformed = data.labels.map((label, index) => ({
      date: label,
      orders_count: data.datasets[0]?.data[index] || 0,
      revenue: 0 // Not available in current API
    }));
    
    console.log('✅ Daily orders transformed:', transformed);
    return transformed;
  };

  // Transform user roles data from Chart.js to Recharts format
  const transformUserRolesData = (data) => {
    console.log('🔄 Transforming user roles data:', data);
    if (!data || !data.labels || !data.datasets) {
      console.log('❌ User roles data is invalid:', { data, labels: data?.labels, datasets: data?.datasets });
      return [];
    }
    
    const transformed = data.labels.map((label, index) => ({
      name: label,
      count: data.datasets[0]?.data[index] || 0
    }));
    
    console.log('✅ User roles transformed:', transformed);
    return transformed;
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
  const allChartsEmpty = chartsData.medicineShortage.length === 0 && 
                        chartsData.dailyOrders.length === 0 && 
                        chartsData.userRoles.length === 0;

  console.log('📊 Charts data check:', {
    medicineShortage: chartsData.medicineShortage.length,
    dailyOrders: chartsData.dailyOrders.length,
    userRoles: chartsData.userRoles.length,
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
        <div className="col-md-6 mb-4">
          <div className="dashboard-card">
            <div className="card-header">
              <h3 className="card-title">Medicine Shortage</h3>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartsData.medicineShortage} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="pharmacy_name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                    fontSize={10}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [`${value} medicines`, 'Shortage Count']}
                    labelStyle={{ fontSize: '12px' }}
                  />
                  <Legend />
                  <Bar dataKey="shortage_count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* User Roles Chart */}
        <div className="col-md-6 mb-4">
          <div className="dashboard-card">
            <div className="card-header">
              <h3 className="card-title">User Roles Distribution</h3>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartsData.userRoles}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {chartsData.userRoles.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [`${value} users`, name]}
                    labelStyle={{ fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Daily Orders Chart */}
        <div className="col-12 mb-4">
          <div className="dashboard-card">
            <div className="card-header">
              <h3 className="card-title">Daily Orders Trend</h3>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartsData.dailyOrders} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    fontSize={10}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'orders_count') return [`${value} orders`, 'Orders Count'];
                      if (name === 'revenue') return [`$${value}`, 'Revenue'];
                      return [value, name];
                    }}
                    labelStyle={{ fontSize: '12px' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="orders_count" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
