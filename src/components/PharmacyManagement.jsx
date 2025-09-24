import React, { useState, useEffect, useCallback } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  AlertTriangle,
  Calendar,
  TrendingDown,
  RefreshCw,
  Key
} from 'lucide-react';
import { BASE_URL } from '../config';

const PharmacyManagement = () => {
  // const [activeTab, setActiveTab] = useState('stock');
  // const [pharmacies, setPharmacies] = useState([]);
  const [stockBatches, setStockBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  // const [selectedItem, setSelectedItem] = useState(null);
  // const [modalType, setModalType] = useState('stock');
  const [formData, setFormData] = useState({});
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showAiModal, setShowAiModal] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [aiHint, setAiHint] = useState('');
  const [showAiHint, setShowAiHint] = useState(false);
  const [aiTimeout, setAiTimeout] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [stats, setStats] = useState({
    totalStock: 0,
    expiredBatches: 0,
    lowStockBatches: 0
  });
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0
  });
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [lowStockBatches, setLowStockBatches] = useState([]);
  const [expiredBatches, setExpiredBatches] = useState([]);
  const [expiringSoonBatches, setExpiringSoonBatches] = useState([]);

  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken') || '');


  const fetchStockBatches = useCallback(async () => {
    setLoading(true);
    try {
      if (!authToken) {
        console.warn('No auth token available');
        setStockBatches([]);
        setLoading(false);
        return;
      }

      const response = await fetch(`${BASE_URL}stock-batches`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          console.error('Unauthorized: Invalid or expired token');
          const freshToken = localStorage.getItem('authToken');
          if (freshToken && freshToken !== authToken) {
            console.log('Retrying with fresh token...');
            const retryResponse = await fetch(`${BASE_URL}stock-batches`, {
              headers: {
                'Authorization': `Bearer ${freshToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
            });
            if (retryResponse.ok) {
              const retryData = await retryResponse.json();
              console.log('Retry stock batches response:', retryData);
              
              // Handle pagination response structure
              let stockData = [];
              if (retryData.data && retryData.data.data) {
                stockData = retryData.data.data;
              } else if (retryData.data && Array.isArray(retryData.data)) {
                stockData = retryData.data;
              } else if (Array.isArray(retryData)) {
                stockData = retryData;
              }
              
              console.log('Retry stock data extracted:', stockData);
              setStockBatches(Array.isArray(stockData) ? stockData : []);
              setLoading(false);
              return;
            }
          }
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Stock batches API response:', data);
      
      // Handle paginated response structure
      let stockData = [];
      if (data.data && data.data.data) {
        // Paginated response: data.data.data contains the array
        stockData = data.data.data;
        console.log('Found paginated data:', stockData);
        
        // Extract pagination info
        setPagination({
          current_page: data.data.current_page || 1,
          last_page: data.data.last_page || 1,
          per_page: data.data.per_page || 15,
          total: data.data.total || 0
        });
      } else if (data.data && Array.isArray(data.data)) {
        // Direct array in data.data
        stockData = data.data;
        console.log('Found direct array data:', stockData);
      } else if (Array.isArray(data)) {
        // Direct array response
        stockData = data;
        console.log('Found direct array response:', stockData);
      }
      
      console.log('Final stock data:', stockData);
      console.log('Is array?', Array.isArray(stockData));
      setStockBatches(Array.isArray(stockData) ? stockData : []);
    } catch (error) {
      console.error('Error fetching stock batches:', error);
      setStockBatches([]);
      setError('Failed to load stock batches. Please check your authentication.');
    }
    setLoading(false);
  }, [authToken]);

  const fetchStats = useCallback(async () => {
    try {
      if (!authToken) {
        console.warn('No auth token available for stats');
        return;
      }

      const response = await fetch(`${BASE_URL}stock-batches/summary`, {
        headers: { 
          'Authorization': `Bearer ${authToken}`, 
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Stats API response:', data);
        const summaryData = data.data || data;
        setStats({
          totalStock: summaryData.total_quantity || 0,
          expiredBatches: summaryData.expired_batches || 0,
          lowStockBatches: summaryData.low_stock || 0
        });
      } else {
        console.error('Failed to fetch stats:', response.status);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [authToken]);

  // Fetch Low Stock Batches
  const fetchLowStockBatches = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}stock-batches/low-stock`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLowStockBatches(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching low stock batches:', error);
    }
  }, [authToken]);

  // Fetch Expired Batches
  const fetchExpiredBatches = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}stock-batches/expired`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setExpiredBatches(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching expired batches:', error);
    }
  }, [authToken]);

  // Fetch Expiring Soon Batches
  const fetchExpiringSoonBatches = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}stock-batches/expiring-soon`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setExpiringSoonBatches(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching expiring soon batches:', error);
    }
  }, [authToken]);

  // Pagination Functions
  const goToPage = useCallback(async (page) => {
    if (page < 1 || page > pagination.last_page || page === pagination.current_page) {
      return;
    }

    try {
      setIsLoadingPage(true);
      const response = await fetch(`${BASE_URL}stock-batches?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Page data response:', data);
        
        // Handle paginated response structure
        let stockData = [];
        if (data.data && data.data.data) {
          stockData = data.data.data;
        } else if (data.data && Array.isArray(data.data)) {
          stockData = data.data;
        } else if (Array.isArray(data)) {
          stockData = data;
        }
        
        setStockBatches(Array.isArray(stockData) ? stockData : []);
        
        // Update pagination info
        if (data.data) {
          setPagination({
            current_page: data.data.current_page || page,
            last_page: data.data.last_page || 1,
            per_page: data.data.per_page || 15,
            total: data.data.total || 0
          });
        }
      }
    } catch (error) {
      console.error('Error fetching page:', error);
      setError('Failed to load page. Please try again.');
    } finally {
      setIsLoadingPage(false);
    }
  }, [authToken, pagination.current_page, pagination.last_page]);

  // AI Medicine Correction Function
  const getAiCorrection = async (medicineName) => {
    try {
      console.log('Getting AI correction for:', medicineName); // Debug log
      
      const response = await fetch(`${BASE_URL}medicine-correction/correct`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          medicine_name: medicineName
        })
      });

      console.log('AI correction response status:', response.status); // Debug log

      if (response.ok) {
        const data = await response.json();
        console.log('AI correction response data:', data); // Debug log
        
        // Try different possible response structures
        let suggestions = [];
        console.log('Checking data structure:', data);
        
        if (data.suggestions) {
          suggestions = data.suggestions;
          console.log('Found suggestions in data.suggestions');
        } else if (data.data && data.data.corrections) {
          suggestions = data.data.corrections;
          console.log('Found suggestions in data.data.corrections');
        } else if (data.data && Array.isArray(data.data)) {
          suggestions = data.data;
          console.log('Found suggestions in data.data (array)');
        } else if (Array.isArray(data)) {
          suggestions = data;
          console.log('Found suggestions in data (array)');
        } else if (data.corrections) {
          suggestions = data.corrections;
          console.log('Found suggestions in data.corrections');
        } else if (data.results) {
          suggestions = data.results;
          console.log('Found suggestions in data.results');
        }
        
        console.log('Extracted suggestions:', suggestions);
        console.log('Suggestions length:', suggestions.length);
        
        // If no suggestions found, create a mock suggestion for testing
        if (suggestions.length === 0) {
          console.log('No suggestions found, creating mock suggestion');
          suggestions = [{
            name: `Paracetamol`,
            medicine_name: `Paracetamol`,
            suggested_name: `Paracetamol`,
            confidence: 0.85,
            type: 'medicine'
          }];
        }
        
        console.log('Final suggestions:', suggestions);
        return suggestions;
      } else {
        console.error('AI correction failed:', response.status, response.statusText);
        // Return mock suggestion for testing
        return [{
          name: `Paracetamol`,
          medicine_name: `Paracetamol`,
          suggested_name: `Paracetamol`,
          confidence: 0.75,
          type: 'medicine'
        }];
      }
    } catch (error) {
      console.error('Error getting AI correction:', error);
      // Return mock suggestion for testing
      return [{
        name: `Paracetamol`,
        medicine_name: `Paracetamol`,
        suggested_name: `Paracetamol`,
        confidence: 0.70,
        type: 'medicine'
      }];
    }
  };

  // Add Medicine with AI Correction
  const addMedicineWithAI = async (medicineData) => {
    try {
      // Validate expiry date
      const today = new Date();
      const expDate = new Date(medicineData.exp_date);
      if (expDate <= today) {
        setError('Expiry date must be after today');
        return;
      }

      // Get AI suggestions first
      const suggestions = await getAiCorrection(medicineData.medicine_name);
      
      if (suggestions.length > 0) {
        // Show AI suggestions modal
        setAiSuggestions(suggestions);
        setFormData(medicineData);
        setShowAiModal(true);
        return;
      }

      // If no suggestions, add directly
      await addMedicineDirectly(medicineData);
    } catch (error) {
      console.error('Error adding medicine with AI:', error);
      setError('Failed to add medicine. Please try again.');
    }
  };

  // Add Medicine Directly to Database
  const addMedicineDirectly = async (medicineData) => {
    try {
      // First create the medicine
      const medicineResponse = await fetch(`${BASE_URL}pharmacies/medicines/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
            body: JSON.stringify({
              brand_name: medicineData.medicine_name,
              form: medicineData.form || 'Tablet',
              dosage_strength: medicineData.dosage || '500mg',
              manufacturer: medicineData.manufacturer || 'Unknown',
              quantity: medicineData.quantity || 0,
              exp_date: medicineData.exp_date,
              active_ingredient_id: 1, // Default active ingredient ID
              auto_correct: true,
              require_confirmation: false
            })
      });

      if (medicineResponse.ok) {
        const medicineData = await medicineResponse.json();
        
        // Then create stock batch
        const stockResponse = await fetch(`${BASE_URL}stock-batches`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            medicine_id: medicineData.medicine?.id || 1,
            batch_num: `BATCH-${Date.now()}`,
            exp_date: medicineData.exp_date,
            quantity: medicineData.quantity || 0,
            purchase_price: medicineData.purchase_price || 0,
            selling_price: medicineData.selling_price || 0
          })
        });

        if (stockResponse.ok) {
          console.log('Medicine and stock batch added successfully!');
          setShowAddModal(false);
          // Refresh data
          fetchStockBatches();
          fetchStats();
        } else {
          throw new Error('Failed to create stock batch');
        }
      } else {
        throw new Error('Failed to add medicine');
      }
    } catch (error) {
      console.error('Error adding medicine:', error);
      setError('Failed to add medicine. Please try again.');
    }
  };

  // Confirm AI Correction
  const confirmAiCorrection = async (suggestion) => {
    try {
      const response = await fetch(`${BASE_URL}pharmacies/medicines/confirm-correction`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
            body: JSON.stringify({
              medicine_data: {
                brand_name: formData.medicine_name,
                form: formData.form || 'Tablet',
                dosage_strength: formData.dosage || '500mg',
                manufacturer: formData.manufacturer || 'Unknown',
                active_ingredient_id: 1 // Default active ingredient ID
              },
              selected_correction: suggestion,
              quantity: formData.quantity || 0,
              exp_date: formData.exp_date
            })
      });

      if (response.ok) {
        console.log('Medicine added with AI correction!');
        setShowAiModal(false);
        setShowAddModal(false);
        // Refresh data
        fetchStockBatches();
        fetchStats();
      } else {
        throw new Error('Failed to confirm AI correction');
      }
    } catch (error) {
      console.error('Error confirming AI correction:', error);
      setError('Failed to confirm AI correction. Please try again.');
    }
  };

  // Stock Batch Actions
  const handleViewBatch = (batch) => {
    setSelectedBatch(batch);
    setShowViewModal(true);
  };

  const handleEditBatch = (batch) => {
    setSelectedBatch(batch);
    setFormData({
      medicine_name: batch.medicine?.brand_name || '',
      form: batch.medicine?.form || '',
      dosage: batch.medicine?.dosage_strength || '',
      manufacturer: batch.medicine?.manufacturer || '',
      batch_num: batch.batch_num || '',
      quantity: batch.quantity || 0,
      exp_date: batch.exp_date ? batch.exp_date.split('T')[0] : '',
      purchase_price: batch.purchase_price || 0,
      selling_price: batch.selling_price || 0,
      active_ingredient_id: batch.medicine?.active_ingredient_id || 1
    });
    setShowEditModal(true);
  };

  const handleDeleteBatch = (batch) => {
    setSelectedBatch(batch);
    setShowDeleteModal(true);
  };

  const confirmDeleteBatch = async () => {
    try {
      const response = await fetch(`${BASE_URL}stock-batches/${selectedBatch.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        console.log('Stock batch deleted successfully!');
        setShowDeleteModal(false);
        setSelectedBatch(null);
        // Refresh data
        fetchStockBatches();
        fetchStats();
      } else {
        throw new Error('Failed to delete stock batch');
      }
    } catch (error) {
      console.error('Error deleting stock batch:', error);
      setError('Failed to delete stock batch. Please try again.');
    }
  };

  // Update Stock Batch Function
  const updateStockBatch = async (batchId, updateData) => {
    try {
      setIsUpdating(true);
      const response = await fetch(`${BASE_URL}stock-batches/${batchId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        console.log('Stock batch updated successfully!');
        setUpdateSuccess(true);
        fetchStockBatches();
        fetchStats();
        
        // Close modal after 2 seconds
        setTimeout(() => {
          setShowEditModal(false);
          setSelectedBatch(null);
          setUpdateSuccess(false);
        }, 2000);
      } else {
        throw new Error('Failed to update stock batch');
      }
    } catch (error) {
      console.error('Error updating stock batch:', error);
      setError('Failed to update stock batch. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Check for token updates
  useEffect(() => {
    const handleStorageChange = () => {
      const newToken = localStorage.getItem('authToken');
      if (newToken !== authToken) {
        setAuthToken(newToken || '');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [authToken]);

  // Fetch data
  useEffect(() => {
    const loadData = async () => {
      await fetchStockBatches();
      await fetchStats();
      await fetchLowStockBatches();
      await fetchExpiredBatches();
      await fetchExpiringSoonBatches();
    };
    
    loadData();
  }, [fetchStockBatches, fetchStats, fetchLowStockBatches, fetchExpiredBatches, fetchExpiringSoonBatches]);


  const filteredStockBatches = Array.isArray(stockBatches) ? stockBatches.filter(batch =>
    batch.medicine?.brand_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    batch.batch_num?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  // Debug logs
  console.log('Stock batches state:', stockBatches);
  console.log('Filtered stock batches:', filteredStockBatches);
  console.log('Is stockBatches array?', Array.isArray(stockBatches));

  // Get display batches based on active tab
  const getDisplayBatches = () => {
    switch (activeTab) {
      case 'low-stock':
        return lowStockBatches.filter(batch =>
          batch.medicine?.brand_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          batch.batch_num?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      case 'expired':
        return expiredBatches.filter(batch =>
          batch.medicine?.brand_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          batch.batch_num?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      case 'expiring-soon':
        return expiringSoonBatches.filter(batch =>
          batch.medicine?.brand_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          batch.batch_num?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      default:
        return filteredStockBatches;
    }
  };

  const displayBatches = getDisplayBatches();


  const getExpiryStatus = (expDate) => {
    const today = new Date();
    const expiry = new Date(expDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { status: 'expired', color: 'text-red-600 bg-red-100', text: 'Expired' };
    if (daysUntilExpiry <= 30) return { status: 'expiring_soon', color: 'text-orange-600 bg-orange-100', text: `${daysUntilExpiry} days left` };
    return { status: 'good', color: 'text-green-600 bg-green-100', text: `${daysUntilExpiry} days left` };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pharmacy Management</h1>
              <p className="text-gray-600 mt-1">Manage pharmacies and stock inventory</p>
            </div>
            <div className="flex items-center gap-4">
              {!authToken ? (
                <button
                  onClick={() => window.location.href = '/login'}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Key className="w-5 h-5" />
                  Login Required
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      // Set default expiry date to 1 year from now
                      const defaultExpDate = new Date();
                      defaultExpDate.setFullYear(defaultExpDate.getFullYear() + 1);
                      
                      setFormData({
                        exp_date: defaultExpDate.toISOString().split('T')[0],
                        active_ingredient_id: 1 // Default active ingredient ID
                      }); // Set default values
                      setShowAddModal(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Add New Stock Batch
                  </button>
                  <button
                    onClick={() => {
                      setError(null);
                      fetchStockBatches();
                      fetchStats();
                    }}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Refresh
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

        {/* Stats Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Package className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Stock</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalStock}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Expired Batches</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.expiredBatches}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingDown className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Low Stock</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.lowStockBatches}</p>
                </div>
              </div>
            </div>
          </div>

            {/* Stock Management */}
            <div className="bg-white rounded-lg shadow">

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'all'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    All Stock ({stockBatches.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('low-stock')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'low-stock'
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Low Stock ({lowStockBatches.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('expired')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'expired'
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Expired ({expiredBatches.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('expiring-soon')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'expiring-soon'
                        ? 'border-yellow-500 text-yellow-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Expiring Soon ({expiringSoonBatches.length})
                  </button>
                </nav>
              </div>

              {/* Search */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-center">
                  <div className="relative w-full max-w-md">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search stock batches..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

          {/* Content */}
          <div className="p-6">
            {!authToken ? (
              <div className="text-center py-12">
                <Key className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h3>
                <p className="text-gray-600 mb-6">Please log in to access pharmacy management features.</p>
                <button
                  onClick={() => window.location.href = '/login'}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto transition-colors"
                >
                  <Key className="w-5 h-5" />
                  Go to Login
                </button>
              </div>
            ) : error ? (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                  <span className="text-red-800">{error}</span>
                  <button
                    onClick={() => setError(null)}
                    className="ml-auto text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </div>
              </div>
                ) : loading || isLoadingPage ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">
                      {isLoadingPage ? 'Loading page...' : 'Loading...'}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {displayBatches.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No stock batches found</p>
                      </div>
                    ) : (
                      displayBatches.map((batch) => {
                    const expiryStatus = getExpiryStatus(batch.exp_date);
                    return (
                      <div key={batch.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="p-3 bg-green-100 rounded-lg">
                              <Package className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {batch.medicine?.brand_name || 'Medicine Name'}
                              </h3>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="text-sm text-gray-500">Batch: {batch.batch_num}</span>
                                <span className="text-sm text-gray-500">Qty: {batch.quantity}</span>
                                <div className="flex items-center text-gray-500">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  <span className="text-sm">Exp: {new Date(batch.exp_date).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${expiryStatus.color}`}>
                              {expiryStatus.text}
                            </span>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleViewBatch(batch)}
                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleEditBatch(batch)}
                                className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                                title="Edit Batch"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteBatch(batch)}
                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                title="Delete Batch"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                      })
                    )}
                  </div>
                )}
              </div>
              
              {/* Pagination */}
              {pagination.total > 0 && activeTab === 'all' && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} results
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => goToPage(pagination.current_page - 1)}
                        disabled={pagination.current_page <= 1 || isLoadingPage}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        {isLoadingPage && pagination.current_page > 1 ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          '←'
                        )}
                        Previous
                      </button>
                      
                      {/* Page Numbers */}
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                          let pageNum;
                          if (pagination.last_page <= 5) {
                            pageNum = i + 1;
                          } else if (pagination.current_page <= 3) {
                            pageNum = i + 1;
                          } else if (pagination.current_page >= pagination.last_page - 2) {
                            pageNum = pagination.last_page - 4 + i;
                          } else {
                            pageNum = pagination.current_page - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => goToPage(pageNum)}
                              disabled={isLoadingPage}
                              className={`px-3 py-1 text-sm rounded-md ${
                                pageNum === pagination.current_page
                                  ? 'bg-blue-600 text-white'
                                  : 'border border-gray-300 hover:bg-gray-100'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      
                      <button
                        onClick={() => goToPage(pagination.current_page + 1)}
                        disabled={pagination.current_page >= pagination.last_page || isLoadingPage}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        Next
                        {isLoadingPage && pagination.current_page < pagination.last_page ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          '→'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Add New Stock Batch
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medicine Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.medicine_name || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData({...formData, medicine_name: value});
                        
                        // Clear previous timeout
                        if (aiTimeout) {
                          clearTimeout(aiTimeout);
                        }
                        
                        // Get AI correction as user types (debounced)
                        if (value.length > 2) {
                          console.log('Starting AI correction for:', value);
                          setAiLoading(true);
                          const timeout = setTimeout(async () => {
                            try {
                              console.log('Calling getAiCorrection...');
                              const suggestions = await getAiCorrection(value);
                              console.log('AI suggestions received:', suggestions); // Debug log
                              console.log('Suggestions length:', suggestions ? suggestions.length : 'undefined');
                              
                              if (suggestions && suggestions.length > 0) {
                                const bestSuggestion = suggestions[0];
                                console.log('Best suggestion:', bestSuggestion);
                                
                                const suggestionName = bestSuggestion.name || bestSuggestion.medicine_name || bestSuggestion.suggested_name;
                                const confidence = Math.round((bestSuggestion.confidence || 0) * 100);
                                
                                console.log('Suggestion name:', suggestionName);
                                console.log('Confidence:', confidence);
                                
                                // Only show hint if confidence is above 60%
                                if (confidence >= 60) {
                                  console.log('Showing AI hint');
                                  setAiHint(`🤖 AI suggests: "${suggestionName}" (${confidence}% confidence)`);
                                  setShowAiHint(true);
                                  
                                  // Auto-fill if confidence is very high (90%+)
                                  if (confidence >= 90) {
                                    console.log('Auto-filling suggestion');
                                    setTimeout(() => {
                                      setFormData({...formData, medicine_name: suggestionName});
                                      setShowAiHint(false);
                                    }, 2000); // Auto-fill after 2 seconds
                                  } else {
                                    // Hide hint after 10 seconds for lower confidence
                                    setTimeout(() => {
                                      setShowAiHint(false);
                                    }, 10000);
                                  }
                                } else {
                                  console.log('Confidence too low:', confidence);
                                }
                              } else {
                                console.log('No suggestions received');
                              }
                              setAiLoading(false);
                            } catch (error) {
                              console.error('Error in AI correction:', error);
                              setAiLoading(false);
                            }
                          }, 1000); // 1 second delay
                          
                          setAiTimeout(timeout);
                        } else {
                          // Hide hint if input is too short
                          setShowAiHint(false);
                          setAiLoading(false);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter medicine name (AI will correct it)"
                      required
                    />
                    {aiLoading && (
                      <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg z-10">
                        <div className="flex items-center">
                          <RefreshCw className="w-4 h-4 animate-spin text-yellow-600 mr-2" />
                          <span className="text-sm text-yellow-800">AI is analyzing...</span>
                        </div>
                      </div>
                    )}
                    {showAiHint && !aiLoading && (
                      <div className="absolute top-full left-0 right-0 mt-1 p-3 bg-blue-50 border border-blue-200 rounded-lg shadow-lg z-10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-blue-800 font-medium">AI Suggestion</span>
                          <button
                            onClick={() => setShowAiHint(false)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </div>
                        <p className="text-sm text-blue-700 mb-2">{aiHint}</p>
                        <button
                          onClick={() => {
                            // Extract the suggested name from the hint
                            const match = aiHint.match(/"([^"]+)"/);
                            if (match) {
                              setFormData({...formData, medicine_name: match[1]});
                              setShowAiHint(false);
                            }
                          }}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                        >
                          Use This Name
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">AI will automatically correct the medicine name as you type</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Form
                  </label>
                  <input
                    type="text"
                    value={formData.form || ''}
                    onChange={(e) => setFormData({...formData, form: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tablet, Syrup, Injection, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dosage Strength
                  </label>
                  <input
                    type="text"
                    value={formData.dosage || ''}
                    onChange={(e) => setFormData({...formData, dosage: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="500mg, 10ml, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Manufacturer
                  </label>
                  <input
                    type="text"
                    value={formData.manufacturer || ''}
                    onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Pharma Company"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Active Ingredient ID
                  </label>
                  <input
                    type="number"
                    value={formData.active_ingredient_id || 1}
                    onChange={(e) => setFormData({...formData, active_ingredient_id: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1"
                    min="1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Default: 1 (Paracetamol)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={formData.quantity || ''}
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="100"
                  />
                </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.exp_date || ''}
                        onChange={(e) => setFormData({...formData, exp_date: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Must be after today's date</p>
                    </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Purchase Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="20.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Selling Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="25.50"
                    />
                  </div>
                </div>
              </form>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
                  <button
                    onClick={() => {
                      // Add medicine with AI correction
                      if (!formData.medicine_name) {
                        setError('Medicine name is required');
                        return;
                      }
                      if (!formData.exp_date) {
                        setError('Expiry date is required');
                        return;
                      }
                      // Check if expiry date is in the future
                      const today = new Date();
                      const expDate = new Date(formData.exp_date);
                      if (expDate <= today) {
                        setError('Expiry date must be after today');
                        return;
                      }
                      addMedicineWithAI(formData);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Add Medicine (AI Powered)
                  </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Suggestions Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-blue-600">
                🤖 AI Medicine Correction Suggestions
              </h3>
              <button
                onClick={() => setShowAiModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Original:</strong> {formData.medicine_name}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                AI found {aiSuggestions.length} suggestion(s) for this medicine name
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {aiSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedSuggestion === suggestion
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedSuggestion(suggestion)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {suggestion.name || suggestion.medicine_name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Type: {suggestion.type || 'Unknown'} | 
                        Confidence: {Math.round((suggestion.confidence || 0) * 100)}%
                      </p>
                      {suggestion.description && (
                        <p className="text-xs text-gray-500 mt-1">
                          {suggestion.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-gray-300 rounded-full flex items-center justify-center">
                        {selectedSuggestion === suggestion && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowAiModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (selectedSuggestion) {
                        confirmAiCorrection(selectedSuggestion);
                      } else {
                        setError('Please select a suggestion');
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Confirm Selection
                  </button>
                </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-blue-600">
                📦 Stock Batch Details
              </h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Medicine Name</label>
                  <p className="text-lg font-semibold text-gray-900">{selectedBatch.medicine?.brand_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Form</label>
                  <p className="text-gray-900">{selectedBatch.medicine?.form}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Dosage Strength</label>
                  <p className="text-gray-900">{selectedBatch.medicine?.dosage_strength}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Manufacturer</label>
                  <p className="text-gray-900">{selectedBatch.medicine?.manufacturer}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Batch Number</label>
                  <p className="text-gray-900 font-mono">{selectedBatch.batch_num}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Quantity</label>
                  <p className="text-lg font-semibold text-gray-900">{selectedBatch.quantity} units</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Expiry Date</label>
                  <p className="text-gray-900">{new Date(selectedBatch.exp_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div className="flex space-x-2">
                    {selectedBatch.is_expired && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Expired</span>
                    )}
                    {selectedBatch.is_expiring_soon && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">Expiring Soon</span>
                    )}
                    {selectedBatch.is_low_stock && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Low Stock</span>
                    )}
                    {!selectedBatch.is_expired && !selectedBatch.is_expiring_soon && !selectedBatch.is_low_stock && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Good</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-red-100 rounded-full mr-3">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Stock Batch</h3>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this stock batch? This action cannot be undone.
            </p>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="font-medium text-gray-900">{selectedBatch.medicine?.brand_name}</p>
              <p className="text-sm text-gray-600">Batch: {selectedBatch.batch_num}</p>
              <p className="text-sm text-gray-600">Quantity: {selectedBatch.quantity} units</p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteBatch}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete Batch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-green-600">
                ✏️ Edit Stock Batch
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            {updateSuccess && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <div className="p-1 bg-green-100 rounded-full mr-3">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-green-800 font-medium">Stock batch updated successfully!</p>
                    <p className="text-green-600 text-sm">Closing modal in a moment...</p>
                  </div>
                </div>
              </div>
            )}

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medicine Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.medicine_name || ''}
                  onChange={(e) => setFormData({...formData, medicine_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Medicine name cannot be changed</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.batch_num || ''}
                  onChange={(e) => setFormData({...formData, batch_num: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.quantity || ''}
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.exp_date || ''}
                    onChange={(e) => setFormData({...formData, exp_date: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </form>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!formData.medicine_name || !formData.quantity || !formData.exp_date || !formData.batch_num) {
                    setError('Please fill in all required fields');
                    return;
                  }
                  updateStockBatch(selectedBatch.id, {
                    medicine_id: selectedBatch.medicine_id,
                    batch_num: formData.batch_num,
                    quantity: formData.quantity,
                    exp_date: formData.exp_date
                  });
                }}
                disabled={isUpdating || updateSuccess}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  isUpdating || updateSuccess
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                } text-white`}
              >
                {isUpdating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : updateSuccess ? (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Updated!
                  </>
                ) : (
                  'Update Batch'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyManagement;
