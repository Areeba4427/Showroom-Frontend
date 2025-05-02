import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCars, searchCars } from '../api';
import CarCard from '../components/car/CarCard';
import { FaSearch, FaPlusCircle, FaCar } from 'react-icons/fa';

const Inventory = () => {
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [totals, setTotals] = useState({
    totalCars: 0,
    boughtCars: 0,
    soldCars: 0,
    totalBoughtValue: 0,
    totalSoldValue: 0,
    netValue: 0,
    carsInInventory: 0
  });

  // Calculate inventory totals
  const calculateInventoryTotals = (carsData) => {
    let totalBoughtValue = 0;
    let totalSoldValue = 0;
    let boughtCars = 0;
    let soldCars = 0;

    carsData.forEach(car => {
      for(let i=0;i<car.ownershipHistory.length;i++){
        // console.log(car.ownershipHistory.length  , car.ownershipHistory.recordType)
        if(car.ownershipHistory[i].recordType == 'initial'){
          // console.log(car.ownershipHistory[i].price)
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
        <h1>Buy and Sell / خرید و فروخت</h1>
        <div className="add-car-button">
          <Link to="/car-form?type=bought" className="btn btn-success">
            <FaPlusCircle /> Add Car <span className="urdu-text">/ گاڑی شامل کریں</span>
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
              <td className="amount">Rs {car?.price?.toLocaleString() || 'N/A'}</td>
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
            <div className="total-value">Rs {totals.totalBoughtValue.toLocaleString()}</div>
          </div>
          <div className="total-card">
            <div className="total-title">Sold Value</div>
            <div className="total-value">Rs {totals.totalSoldValue.toLocaleString()}</div>
          </div>
        </div>
      </div>
    )}
  </div>
</div>

    </div>
  );
};

export default Inventory;