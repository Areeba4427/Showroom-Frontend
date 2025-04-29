import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCars, searchCars } from '../api';
import CarCard from '../components/car/CarCard';
import { FaSearch } from 'react-icons/fa';

const Inventory = () => {
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('filter'); // Default to filter tab
  const [hasSearched, setHasSearched] = useState(false); // Track if search has been performed
  const [totals, setTotals] = useState({
    totalCars: 0,
    boughtCars: 0,
    soldCars: 0,
    totalBoughtValue: 0,
    totalSoldValue: 0,
    netValue: 0
  });


  // Add this function to calculate totals
  const calculateInventoryTotals = (carsData) => {
    let totalBoughtValue = 0;
    let totalSoldValue = 0;
    let boughtCars = 0;
    let soldCars = 0;

    carsData.forEach(car => {
      if (car.type === 'bought') {
        totalBoughtValue += car.price || 0;
        boughtCars++;
      } else if (car.type === 'sold') {
        totalSoldValue += car.price || 0;
        soldCars++;
      }
    });

    setTotals({
      totalCars: carsData.length,
      boughtCars,
      soldCars,
      totalBoughtValue,
      totalSoldValue,
      netValue: totalSoldValue - totalBoughtValue
    });
  };

  const fetchCars = async () => {
    try {
      setLoading(true);
      const response = await getCars();
      setCars(response.data);
      calculateInventoryTotals(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cars:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch all cars when switching to "all" tab
    if (activeTab === 'all') {
      fetchCars();
    }
  }, [activeTab]);

  // Search function that uses the API directly
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      // Empty search - show no results instead of all cars
      setFilteredCars([]);
      setHasSearched(true);
      return;
    }

    try {
      setSearchLoading(true);
      const response = await searchCars(searchTerm);
      setFilteredCars(response.data);
      setHasSearched(true); // Mark that a search has been performed
    } catch (error) {
      console.error('Error searching cars:', error);
      setFilteredCars([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle search when user presses Enter
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Debounce search for typing
  useEffect(() => {
    if (searchTerm) {
      const delayDebounceFn = setTimeout(() => {
        handleSearch();
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchTerm]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Reset search and filtered results when switching to filter tab
  useEffect(() => {
    if (activeTab === 'filter') {
      setHasSearched(false);
      setFilteredCars([]);
      setSearchTerm('');
    }
  }, [activeTab]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">Loading Data... / ڈیٹا لوڈ ہو رہا ہے...</div>
      </div>
    );
  }

  return (
    <div className="inventory-container">
      <div className="page-header">
        <h1>Buy and Sell / خرید و فروخت</h1>
      </div>

      {/* Tabs similar to CreditSale component */}
      <div className="tabs">
        <button
          className={activeTab === 'filter' ? 'active' : ''}
          onClick={() => setActiveTab('filter')}
        >
          Filter Inventory / فلٹر انوینٹری
        </button>
        <button
          className={activeTab === 'all' ? 'active' : ''}
          onClick={() => setActiveTab('all')}
        >
          View All Inventory / تمام انوینٹری دیکھیں
        </button>
      </div>

      {/* Filter Tab */}
      {activeTab === 'filter' && (
        <div className="dashboard-card">
          <div className="filters-container">
            {/* Search Bar - Now with search button and better styling */}
            <div className="filter-section search-section">
              <h3 className="section-title">Search / تلاش کریں</h3>
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Search by registration number, ID card, name or phone / رجسٹریشن نمبر، آئی ڈی کارڈ، نام یا فون سے تلاش کریں"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className="search-input"
                />
                <button
                  onClick={handleSearch}
                  className="search-button btn btn-primary"
                  disabled={searchLoading}
                >
                  {searchLoading ? 'Searching...' : 'Search / تلاش'}
                </button>
              </div>
            </div>
          </div>

          <div className="results-container">
            <div className="results-header">
              <h3 className="section-title">Cars Found / گاڑیاں ملیں</h3>
            </div>

            <div className="car-list">
              {searchLoading ? (
                <div className="loading">Searching...</div>
              ) : hasSearched ? (
                filteredCars.length > 0 ? (
                  filteredCars.map(car => (
                    <CarCard key={car._id} car={car} refreshCars={handleSearch} />
                  ))
                ) : (
                  <div className="no-data">
                    {searchTerm ? "No matching cars found / کوئی گاڑی نہیں ملی" : "No cars found / کوئی گاڑی نہیں ملی"}
                  </div>
                )
              ) : (
                <div className="search-prompt">
                  Enter search criteria to find cars / گاڑیاں تلاش کرنے کے لیے تلاش کے معیار درج کریں
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* All Inventory Tab - Updated with improved styling */}
      {activeTab === 'all' && (
        <div className="dashboard-card list-container">
          <div className="inventory-header">
            <h3 className="section-title">Complete Inventory / مکمل انوینٹری</h3>
          </div>

          <div className="table-responsive">
            <table className="credit-sales-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Registration Number / رجسٹریشن نمبر</th>
                  <th>Engine Number / انجن نمبر</th>
                  <th>Type / قسم</th>
                  <th>Name / نام</th>
                  <th>ID Card / شناختی کارڈ</th>
                  <th>Phone / فون</th>
                  <th>Price / قیمت</th>
                  <th>Date / تاریخ</th>
                  <th>Actions / کارروائیاں </th>
                </tr>
              </thead>
              <tbody>
                {cars.length > 0 ? (
                  cars.map((car, index) => (
                    <tr key={car._id}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="cell-content">
                          <div>{car.vehicleRegistrationNumber}</div>
                        </div>
                      </td>
                      <td>
                        <div className="cell-content">
                          <div>{car.vehicleEngineNumber}</div>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${car.type}`}>
                          {car.type === 'bought' ? 'Bought / خریدی گئی' : 'Sold / فروخت شدہ'}
                        </span>
                      </td>
                      <td>
                        <div className="cell-content">
                          <div>{car.name}</div>
                        </div>
                      </td>
                      <td>
                        <div className="cell-content">
                          <div>{car.idCardNumber ? car.idCardNumber : ""}</div>
                        </div>
                      </td>
                      <td>
                        <div className="cell-content">
                          <div>{car.phoneNumber}</div>
                        </div>
                      </td>
                      <td className="amount">Rs {car.price?.toLocaleString() || 'N/A'}</td>
                      <td>
                        <div className="cell-content">
                          <div>{formatDate(car.Date)}</div>
                        </div>
                      </td>
                      <td>
                        <div className="card-actions">
                          <Link
                            to={`/car-details?identifier=${car.vehicleRegistrationNumber}&type=registration`}
                            className="btn btn-view"
                          >
                            View Details / تفصیلات دیکھیں
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="no-data">No cars found / کوئی گاڑی نہیں ملی</td>
                  </tr>
                )}
              </tbody>
            </table>

            {cars.length > 0 && (
              <div className="totals-dashboard">
                <h3>Inventory Summary</h3>
                <div className="totals-cards">
                  <div className="total-card">
                    <div className="total-title">Total Vehicles</div>
                    <div className="total-value">{totals.totalCars}</div>
                  </div>

                  <div className="total-card">
                    <div className="total-title">Bought Value</div>
                    <div className="total-value">Rs {totals.totalBoughtValue.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;