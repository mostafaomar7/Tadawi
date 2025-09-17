import React, { useState, useEffect } from "react";
import { MdSearch, MdClose } from "react-icons/md";
import { dashboardService } from "../../services/dashboard";

export default function GlobalSearch({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState({
    users: [],
    medicines: [],
    global: []
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const performSearch = React.useCallback(async () => {
    try {
      setLoading(true);
      const [globalResults, usersResults, medicinesResults] = await Promise.all([
        dashboardService.globalSearch(searchTerm),
        dashboardService.searchUsers(searchTerm),
        dashboardService.searchMedicines(searchTerm)
      ]);

      setSearchResults({
        global: globalResults.data || [],
        users: usersResults.data || [],
        medicines: medicinesResults.data || []
      });
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (searchTerm.length > 2) {
      performSearch();
    } else {
      setSearchResults({ users: [], medicines: [], global: [] });
    }
  }, [searchTerm, performSearch]);


  const handleClose = () => {
    setSearchTerm("");
    setSearchResults({ users: [], medicines: [], global: [] });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="global-search-overlay" onClick={handleClose}>
      <div className="global-search-modal" onClick={(e) => e.stopPropagation()}>
        {/* Search Header */}
        <div className="search-header">
          <div className="search-input-container">
            <MdSearch className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search everything..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            <button className="close-btn" onClick={handleClose}>
              <MdClose />
            </button>
          </div>
        </div>

        {/* Search Tabs */}
        <div className="search-tabs">
          <button 
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Results
          </button>
          <button 
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button 
            className={`tab-btn ${activeTab === 'medicines' ? 'active' : ''}`}
            onClick={() => setActiveTab('medicines')}
          >
            Medicines
          </button>
        </div>

        {/* Search Results */}
        <div className="search-results">
          {loading && (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Searching...</span>
              </div>
            </div>
          )}

          {!loading && searchTerm.length <= 2 && (
            <div className="text-center py-4 text-muted">
              Type at least 3 characters to search
            </div>
          )}

          {!loading && searchTerm.length > 2 && (
            <>
              {/* All Results */}
              {activeTab === 'all' && (
                <div>
                  {searchResults.global.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                      No results found
                    </div>
                  ) : (
                    <div className="results-list">
                      {searchResults.global.map((result, index) => (
                        <div key={index} className="result-item">
                          <div className="result-title">{result.title || result.name}</div>
                          <div className="result-description">{result.description}</div>
                          <div className="result-type">{result.type}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Users Results */}
              {activeTab === 'users' && (
                <div>
                  {searchResults.users.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                      No users found
                    </div>
                  ) : (
                    <div className="results-list">
                      {searchResults.users.map((user) => (
                        <div key={user.id} className="result-item">
                          <div className="d-flex align-items-center">
                            <img
                              src={user.profile_picture || "https://via.placeholder.com/32x32"}
                              alt={user.name}
                              className="rounded-circle me-3"
                              width="32"
                              height="32"
                            />
                            <div>
                              <div className="result-title">{user.name}</div>
                              <div className="result-description">{user.email}</div>
                              <div className="result-type">User - {user.role}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Medicines Results */}
              {activeTab === 'medicines' && (
                <div>
                  {searchResults.medicines.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                      No medicines found
                    </div>
                  ) : (
                    <div className="results-list">
                      {searchResults.medicines.map((medicine) => (
                        <div key={medicine.id} className="result-item">
                          <div className="result-title">{medicine.name}</div>
                          <div className="result-description">
                            {medicine.active_ingredient} - {medicine.dosage}
                          </div>
                          <div className="result-type">
                            Medicine - ${medicine.price} - Stock: {medicine.stock_quantity}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
