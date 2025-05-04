// src/pages/CashflowDashboard.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaFilter, FaFileExport, FaCalendarAlt, FaEdit, FaTrash, FaArrowUp } from 'react-icons/fa';
import {
  getCashflows,
  getCashflowsByDateRange,
  getDailyCashflow,
  deleteCashflow,
  updateCashflow
} from '../api';

const CashflowDashboard = () => {
  const navigate = useNavigate();
  const [cashflows, setCashflows] = useState([]);
  const [filteredCashflows, setFilteredCashflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [cashflowType, setCashflowType] = useState('all'); // 'all', 'cash-in', or 'cash-out'
  const [category, setCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [dailyView, setDailyView] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  useEffect(() => {
    // Fetch cashflows for the past month by default
    fetchCashflowsByDate();
  }, []);

  useEffect(() => {
    // Filter cashflows based on type and category
    if (cashflows.length) {
      let filtered = [...cashflows];

      if (cashflowType === 'cash-in') {
        filtered = filtered.filter(cf => cf.type === 'cash-in');
      } else if (cashflowType === 'cash-out') {
        filtered = filtered.filter(cf => cf.type === 'cash-out');
      }

      if (category) {
        filtered = filtered.filter(cf => cf.category === category);
      }

      setFilteredCashflows(filtered);
    }
  }, [cashflows, cashflowType, category]);

  // In your fetchCashflowsByDate function
  const fetchCashflowsByDate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCashflowsByDateRange(
        dateRange.startDate,
        dateRange.endDate,
        cashflowType !== 'all' ? cashflowType : null,
        category || null
      );

      // Ensure we're setting an array
      const data = Array.isArray(response.data) ? response.data : [];
      setCashflows(data);
      setFilteredCashflows(data);
      setShowFilters(false);
      setDailyView(false);
    } catch (error) {
      console.error('Error fetching cashflows by date range:', error);
      setError('Failed to fetch cashflow data. Please try again.');
      // Initialize with empty arrays to prevent errors
      setCashflows([]);
      setFilteredCashflows([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyCashflow = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getDailyCashflow(selectedDate);

      // Extract the entries array from the response
      const data = response.data && response.data.entries
        ? response.data.entries
        : [];

      setCashflows(data);
      setFilteredCashflows(data);
    } catch (error) {
      console.error('Error fetching daily cashflow:', error);
      setError('Failed to fetch daily cashflow data. Please try again.');
      // Initialize with empty arrays to prevent errors
      setCashflows([]);
      setFilteredCashflows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange({
      ...dateRange,
      [name]: value
    });
  };

  const handleSelectedDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleCashflowTypeChange = (type) => {
    setCashflowType(type);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const toggleViewMode = () => {
    if (dailyView) {
      fetchCashflowsByDate();
    } else {
      setDailyView(true);
      fetchDailyCashflow();
    }
  };



  // Handle delete cashflow
  const handleDeleteClick = (id) => {
    // Set the ID to confirm deletion
    setConfirmDelete(id);
  };

  // Confirm deletion
  const confirmDeleteCashflow = async () => {
    if (!confirmDelete) return;
    
    setLoading(true);
    try {
      await deleteCashflow(confirmDelete);
      
      // Remove the deleted cashflow from state
      const updatedCashflows = cashflows.filter(cf => cf._id !== confirmDelete);
      setCashflows(updatedCashflows);
      setFilteredCashflows(updatedCashflows);
      
      // Show success message
      setActionSuccess('Cashflow entry deleted successfully');
      
      // Clear the success message after 3 seconds
      setTimeout(() => {
        setActionSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error deleting cashflow:', error);
      setError('Failed to delete cashflow entry. Please try again.');
    } finally {
      setLoading(false);
      setConfirmDelete(null); // Clear the confirmation state
    }
  };

  // Cancel deletion
  const cancelDelete = () => {
    setConfirmDelete(null);
  };

  const exportCashflowData = () => {
    // CSV export functionality
    try {
      const headers = ['Date', 'Entry Made by', 'Category', 'Type', 'Amount', 'Payment Method', 'Payment From', 'Notes'];

      let csvContent = headers.join(',') + '\n';

      filteredCashflows.forEach(cf => {
        const row = [
          new Date(cf.date).toLocaleDateString(),
          `"${cf.entryMadeBy ? cf.entryMadeBy.replace(/"/g, '""') : 'N/A'}"`, // Handle quotes in description
          cf.category || 'N/A',
          cf.type,
          cf.amount,
          cf.paymentMethod || 'N/A',
          cf.paymentFrom || 'N/A',
          `"${cf.notes ? cf.notes.replace(/"/g, '""') : ''}"`
        ];

        csvContent += row.join(',') + '\n';
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.setAttribute('href', url);
      link.setAttribute('download', `cashflow-export-${dailyView ? selectedDate : dateRange.startDate + '-to-' + dateRange.endDate}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting cashflow data:', error);
      setError('Failed to export cashflow data. Please try again.');
    }
  };

  // Get categories for dropdown
  const categories = [...new Set(cashflows.map(cf => cf.category).filter(Boolean))];

  // Calculate totals for summary
  const calculateSummary = () => {
    const cashIn = filteredCashflows
      .filter(cf => cf.type === 'cash-in')
      .reduce((sum, cf) => sum + cf.amount, 0);

    const cashOut = filteredCashflows
      .filter(cf => cf.type === 'cash-out')
      .reduce((sum, cf) => sum + cf.amount, 0);

    return {
      cashIn,
      cashOut,
      balance: cashIn - cashOut
    };
  };

  // Calculate breakdown by payment location
  const calculateLocationBreakdown = () => {
    const locations = ['Meezan Bank', 'Habib Bank', 'Punjab Bank', 'MCB Bank', 'Home'];
    const locationNames = {
      'Meezan Bank': 'Meezan Bank',
      'Habib Bank': 'Bank Al-Habib',
      'Punjab Bank': 'Punjab Bank',
      'MCB Bank': 'MCB Bank',
      'Home': 'Home',
    };

    // Initialize result object
    const breakdown = {
      cashIn: {},
      cashOut: {}
    };

    // Initialize all locations with zero amounts
    locations.forEach(location => {
      breakdown.cashIn[location] = 0;
      breakdown.cashOut[location] = 0;
    });

    // Calculate totals for each location
    filteredCashflows.forEach(cf => {
      const location = cf.paymentFrom || 'Home'; // Default to 'Home' if no location specified
      const type = cf.type === 'cash-in' ? 'cashIn' : 'cashOut';

      // Make sure the location exists in our breakdown
      if (breakdown[type][location] !== undefined) {
        breakdown[type][location] += cf.amount;
      }
    });

    // Format the data for display
    return {
      locations: locations.map(loc => ({
        id: loc,
        name: locationNames[loc],
        cashIn: breakdown.cashIn[loc],
        cashOut: breakdown.cashOut[loc],
        balance: breakdown.cashIn[loc] - breakdown.cashOut[loc]
      })),
      totals: {
        cashIn: Object.values(breakdown.cashIn).reduce((sum, amount) => sum + amount, 0),
        cashOut: Object.values(breakdown.cashOut).reduce((sum, amount) => sum + amount, 0),
        balance: Object.values(breakdown.cashIn).reduce((sum, amount) => sum + amount, 0) -
          Object.values(breakdown.cashOut).reduce((sum, amount) => sum + amount, 0)
      }
    };
  };

  const summary = calculateSummary();
  const locationBreakdown = calculateLocationBreakdown();

  // Location Breakdown Table Component
  const LocationBreakdownTable = ({ breakdown }) => {
    return (
      <div className="location-breakdown">
        <h3>Payment Location Breakdown <span className="urdu-text">/ ادائیگی مقام کی تفصیل</span></h3>
        <table className="location-breakdown-table">
          <thead>
            <tr>
              <th>Location <span className="urdu-text">/ جگہ</span></th>
              <th>Cash In <span className="urdu-text">/ نقد اندر</span></th>
              <th>Cash Out <span className="urdu-text">/ نقد باہر</span></th>
              <th>Balance <span className="urdu-text">/ بیلنس</span></th>
            </tr>
          </thead>
          <tbody>
            {breakdown.locations.map(location => (
              <tr key={location.id}>
                <td>{location.name}</td>
                <td className="cash-in-amount">${location.cashIn.toLocaleString()}</td>
                <td className="cash-out-amount">${location.cashOut.toLocaleString()}</td>
                <td className={location.balance >= 0 ? 'positive-balance' : 'negative-balance'}>
                  ${location.balance.toLocaleString()}
                </td>
              </tr>
            ))}
            <tr className="total-row">
              <td><strong>Total</strong></td>
              <td className="cash-in-amount"><strong>${breakdown.totals.cashIn.toLocaleString()}</strong></td>
              <td className="cash-out-amount"><strong>${breakdown.totals.cashOut.toLocaleString()}</strong></td>
              <td className={breakdown.totals.balance >= 0 ? 'positive-balance' : 'negative-balance'}>
                <strong>${breakdown.totals.balance.toLocaleString()}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  // Delete confirmation modal
  const DeleteConfirmationModal = () => {
    if (!confirmDelete) return null;

    return (
      <div className="delete-modal-overlay">
        <div className="delete-modal">
          <h3>Confirm Delete</h3>
          <p>Are you sure you want to delete this cashflow entry? This action cannot be undone.</p>
          <div className="delete-modal-actions">
            <button className="btn btn-secondary" onClick={cancelDelete}>Cancel</button>
            <button className="btn btn-danger" onClick={confirmDeleteCashflow}>Delete</button>
          </div>
        </div>
      </div>
    );
  };

  if (loading && !cashflows.length) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading cashflow data...</p>
      </div>
    );
  }

  return (
    <div className="cashflow-container">
      <div className="cashflow-header">
        <h1>Cashflow Management</h1>
        <div className="cashflow-actions">
          <button className="btn btn-outline-secondary" onClick={() => setShowFilters(!showFilters)}>
            <FaFilter /> {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <button className="btn btn-outline-secondary" onClick={toggleViewMode}>
            <FaCalendarAlt /> {dailyView ? 'Switch to Date Range' : 'Switch to Daily View'}
          </button>
          <button className="btn btn-outline-primary" onClick={exportCashflowData}>
            <FaFileExport /> Export
          </button>
          <div className="cashflow-actions cashflow-actions-two">
            <Link to="/add-cash-in" className="btn btn-success">
              <FaArrowUp /> Add Cash Entry
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {actionSuccess && (
        <div className="alert alert-success" role="alert">
          {actionSuccess}
        </div>
      )}

      {showFilters && (
        <div className="filter-panel">
          <h3>Filters <span className="urdu-text">/ فلٹرز</span></h3>
          <div className="filter-controls">
            {dailyView ? (
              <div className="filter-group">
                <label><FaCalendarAlt /> Select Date <span className="urdu-text">/ تاریخ منتخب کریں</span></label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleSelectedDateChange}
                  className="form-control"
                />
              </div>
            ) : (
              <div className="filter-group">
                <label><FaCalendarAlt /> Date Range <span className="urdu-text">/ تاریخ کی حد</span></label>
                <div className="date-inputs">
                  <input
                    type="date"
                    name="startDate"
                    value={dateRange.startDate}
                    onChange={handleDateChange}
                    className="form-control"
                  />
                  <span>to</span>
                  <input
                    type="date"
                    name="endDate"
                    value={dateRange.endDate}
                    onChange={handleDateChange}
                    className="form-control"
                  />
                </div>
              </div>
            )}

            <div className="filter-group">
              <label>Type <span className="urdu-text">/ قسم</span></label>
              <div className="btn-group">
                <button
                  className={`btn ${cashflowType === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleCashflowTypeChange('all')}
                >
                  All
                </button>
                <button
                  className={`btn ${cashflowType === 'cash-in' ? 'btn-success' : 'btn-outline-success'}`}
                  onClick={() => handleCashflowTypeChange('cash-in')}
                >
                  Cash In
                </button>
                <button
                  className={`btn ${cashflowType === 'cash-out' ? 'btn-danger' : 'btn-outline-danger'}`}
                  onClick={() => handleCashflowTypeChange('cash-out')}
                >
                  Cash Out
                </button>
              </div>
            </div>

            <div className="filter-group">
              <label>Category <span className="urdu-text">/ زمرہ</span></label>
              <select
                className="form-control"
                value={category}
                onChange={handleCategoryChange}
              >
                <option value="">All Categories</option>
                {categories.map((cat, index) => (
                  <option key={index} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <button
              className="btn btn-primary"
              onClick={dailyView ? fetchDailyCashflow : fetchCashflowsByDate}
            >
              Apply Filters <span className="urdu-text">/ فلٹرز لاگو کریں</span>
            </button>
          </div>
        </div>
      )}

      {/* Location Breakdown Section */}
      <LocationBreakdownTable breakdown={locationBreakdown} />

      <div className="cashflow-table-container">
        <h3>
          {dailyView
            ? `Cashflow Entries for ${new Date(selectedDate).toLocaleDateString()}`
            : 'Cashflow Entries'}
          <span className="urdu-text">/ نقد بہاؤ اندراجات</span>
        </h3>
        <table className="cashflow-table">
          <thead>
            <tr>
              <th># <span className="urdu-text"></span></th>
              <th>Date <span className="urdu-text">/ تاریخ</span></th>
              <th>Entry Made by <span className="urdu-text">/ اندراج کرنے والا</span></th>
              <th>Category <span className="urdu-text">/ زمرہ</span></th>
              <th>Type <span className="urdu-text">/ قسم</span></th>
              <th>Amount <span className="urdu-text">/ رقم</span></th>
              <th>Payment Method</th>
              <th>Payment From</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && cashflows.length > 0 ? (
              <tr>
                <td colSpan="9" className="text-center">Loading...</td>
              </tr>
            ) : filteredCashflows.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center">No cashflow entries found</td>
              </tr>
            ) : (
              filteredCashflows.map((cf, index) => (
                <tr key={cf._id} className={cf.type === 'cash-in' ? 'cash-in-row' : 'cash-out-row'}>
                  <td>{index + 1}</td>
                  <td>{new Date(cf.date).toLocaleDateString()}</td>
                  <td>{cf.entryMadeBy}</td>
                  <td>{cf.category || 'N/A'}</td>
                  <td>{cf.type === 'cash-in' ? 'Cash In' : 'Cash Out'}</td>
                  <td className={cf.type === 'cash-in' ? 'cash-in-amount' : 'cash-out-amount'}>
                    ${cf.amount.toLocaleString()}
                  </td>
                  <td>{cf.paymentMethod || 'N/A'}</td>
                  <td>{cf.paymentFrom || 'N/A'}</td>
                  <td className="action-buttons">
                    <button 
                      className="btn btn-sm btn-outline-danger ms-2"
                      onClick={() => handleDeleteClick(cf._id)}
                      title="Delete cashflow entry"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal />

      {/* CSS for the delete modal */}
      <style jsx>{`
        .delete-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .delete-modal {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          width: 400px;
          max-width: 90%;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        
        .delete-modal h3 {
          margin-top: 0;
          color: #dc3545;
        }
        
        .delete-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }
        
        .action-buttons {
          white-space: nowrap;
        }
        
        .ms-2 {
          margin-left: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default CashflowDashboard;