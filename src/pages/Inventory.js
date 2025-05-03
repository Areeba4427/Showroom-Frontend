import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCars, searchCars } from '../api';
import CarCard from '../components/car/CarCard';
import { FaSearch, FaPlusCircle, FaCar, FaEye, FaEyeSlash } from 'react-icons/fa';

const Inventory = () => {
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [visiblePrices, setVisiblePrices] = useState({});
  const [totals, setTotals] = useState({
    totalCars: 0,
    boughtCars: 0,
    soldCars: 0,
    totalBoughtValue: 0,
    totalSoldValue: 0,
    netValue: 0,
    carsInInventory: 0
  });

  // Toggle price visibility for a specific car
  const togglePriceVisibility = (carId) => {
    setVisiblePrices(prev => ({
      ...prev,
      [carId]: !prev[carId]
    }));
  };

  // Calculate inventory totals
  const calculateInventoryTotals = (carsData) => {
    let totalBoughtValue = 0;
    let totalSoldValue = 0;
    let boughtCars = 0;
    let soldCars = 0;

    carsData.forEach(car => {
      for(let i=0;i<car.ownershipHistory.length;i++){
        if(car.ownershipHistory[i].recordType == 'initial'){
          totalBoughtValue += car.ownershipHistory[i].price;
        }
      }
      boughtCars++;
      if (car.type === 'sold') {
        totalSoldValue += car.price || 0;
        soldCars++;
      }
    });

    const carsInInventory = boughtCars - soldCars;

    setTotals({
      totalCars: carsData.length,
      boughtCars,
      soldCars,
      totalBoughtValue,
      totalSoldValue,
      netValue: totalSoldValue - totalBoughtValue,
      carsInInventory
    });
  };

  const fetchCars = async () => {
    try {
      setLoading(true);
      const response = await getCars();
      setCars(response.data);
      setFilteredCars(response.data);
      calculateInventoryTotals(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cars:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  // Search function that uses the API directly
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      // Empty search - show all cars
      setFilteredCars(cars);
      return;
    }

    try {
      setSearchLoading(true);
      const response = await searchCars(searchTerm);
      setFilteredCars(response.data);
      calculateInventoryTotals(response.data);
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
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        handleSearch();
      } else {
        setFilteredCars(cars);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, cars]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

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
        <h1>Buy and Sell</h1>
        <div className="add-car-button">
          <Link to="/car-form?type=bought" className="btn btn-success">
            <FaPlusCircle /> Add Car
          </Link>
        </div>
      </div>

      <div className="dashboard-card list-container">
        <div className="inventory-header">
          <h3 className="section-title">Complete Inventory</h3>

          {/* Integrated Search Bar */}
          <div className="search-section">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search by registration number, ID card, name or phone"
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
                {searchLoading ? 'Searching...' : <><FaSearch /> Search</>}
              </button>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="credit-sales-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Registration Number</th>
                <th>Engine Number</th>
                <th>Type</th>
                <th>Name</th>
                <th>ID Card</th>
                <th>Phone</th>
                <th>Price</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {searchLoading ? (
                <tr>
                  <td colSpan="10" className="loading">Searching...</td>
                </tr>
              ) : filteredCars.length > 0 ? (
                filteredCars.map((car, index) => (
                  <tr key={car._id}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="cell-content">
                        <div>{car?.vehicleRegistrationNumber}</div>
                      </div>
                    </td>
                    <td>
                      <div className="cell-content">
                        <div>{car?.vehicleEngineNumber}</div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${car.type}`}>
                        {car?.type === 'bought' ? 'Bought' : 'Sold'}
                      </span>
                    </td>
                    <td>
                      <div className="cell-content">
                        <div>{car?.name}</div>
                      </div>
                    </td>
                    <td>
                      <div className="cell-content">
                        <div>{car?.idCardNumber ? car.idCardNumber : ""}</div>
                      </div>
                    </td>
                    <td>
                      <div className="cell-content">
                        <div>{car.phoneNumber}</div>
                      </div>
                    </td>
                    <td className="amount price-cell">
                      {visiblePrices[car._id] ? (
                        <>
                          Rs {car?.price?.toLocaleString() || 'N/A'}
                          <button 
                            className="toggle-price-btn" 
                            onClick={() => togglePriceVisibility(car._id)}
                            title="Hide Price"
                          >
                            <FaEyeSlash />
                          </button>
                        </>
                      ) : (
                        <button 
                          className="toggle-price-btn" 
                          onClick={() => togglePriceVisibility(car._id)}
                          title="Show Price"
                        >
                          <FaEye />
                        </button>
                      )}
                    </td>
                    <td>
                      <div className="cell-content">
                        <div>{formatDate(car.Date)}</div>
                      </div>
                    </td>
                    <td>
                      <div className="card-actions">
                        <Link
                          to={`/car-details?identifier=${car?.vehicleRegistrationNumber}&type=registration`}
                          className="btn btn-view"
                        >
                          View Details
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="no-data">
                    {searchTerm ? "No matching cars found" : "No cars found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {filteredCars.length > 0 && (
            <div className="totals-dashboard">
              <h3>Inventory Summary</h3>
              <div className="totals-cards">
                <div className="total-card">
                  <div className="total-title">Total Vehicles</div>
                  <div className="total-value">{totals.totalCars}</div>
                </div>
                <div className="total-card">
                  <div className="total-title">Cars Bought</div>
                  <div className="total-value">{totals.boughtCars}</div>
                </div>
                <div className="total-card">
                  <div className="total-title">Cars Sold</div>
                  <div className="total-value">{totals.soldCars}</div>
                </div>
                <div className="total-card">
                  <div className="total-title">Cars In Inventory</div>
                  <div className="total-value">{totals.carsInInventory}</div>
                </div>
                <div className="total-card">
                  <div className="total-title">Bought Value</div>
                  <div className="total-value">
                    <button 
                      className="toggle-summary-price-btn" 
                      onClick={() => setVisiblePrices(prev => ({...prev, 'boughtValue': !prev['boughtValue']}))}
                      title={visiblePrices['boughtValue'] ? "Hide Value" : "Show Value"}
                    >
                      {visiblePrices['boughtValue'] ? (
                        <>Rs {totals.totalBoughtValue.toLocaleString()} <FaEyeSlash /></>
                      ) : (
                        <FaEye />
                      )}
                    </button>
                  </div>
                </div>
                <div className="total-card">
                  <div className="total-title">Sold Value</div>
                  <div className="total-value">
                    <button 
                      className="toggle-summary-price-btn" 
                      onClick={() => setVisiblePrices(prev => ({...prev, 'soldValue': !prev['soldValue']}))}
                      title={visiblePrices['soldValue'] ? "Hide Value" : "Show Value"}
                    >
                      {visiblePrices['soldValue'] ? (
                        <>Rs {totals.totalSoldValue.toLocaleString()} <FaEyeSlash /></>
                      ) : (
                        <FaEye />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .price-cell {
          position: relative;
          min-width: 120px;
        }
        
        .toggle-price-btn, .toggle-summary-price-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #0066cc;
          padding: 0;
          margin-left: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        
        .toggle-summary-price-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: inherit;
          font-weight: inherit;
          font-size: inherit;
          display: inline-flex;
          align-items: center;
          padding: 0;
        }
        
        .toggle-summary-price-btn svg {
          margin-left: 8px;
        }
      `}</style>
    </div>
  );
};

export default Inventory;