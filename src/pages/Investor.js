import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaPlusCircle, FaUserTie, FaTrash, FaEdit, FaEye } from 'react-icons/fa';
import { getallInvestors, getInvestor, addInvestor, updateInvestor, deleteInvestor, deleteTransaction, addTransaction, getTransactions } from '../api';

const InvestorManagement = () => {
  // State variables
  const [investors, setInvestors] = useState([]);
  const [filteredInvestors, setFilteredInvestors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [investorDetails, setInvestorDetails] = useState(null);
  const [showInvestorDetails, setShowInvestorDetails] = useState(false);

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [selectedInvestor, setSelectedInvestor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    notes: ''
  });
  const [transactionData, setTransactionData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    type: 'investment',
    notes: ''
  });

  // Totals calculation
  const [totals, setTotals] = useState({
    totalInvestors: 0,
    totalInvestment: 0,
    totalRepayment: 0,
    netInvestment: 0
  });

  // Calculate investment totals
  const calculateInvestmentTotals = (investorsData) => {
    let totalInvestment = 0;
    let totalRepayment = 0;

    investorsData.forEach(investor => {
      if (investor.transactions && investor.transactions.length > 0) {
        investor.transactions.forEach(transaction => {
          if (transaction.type === 'investment') {
            totalInvestment += transaction.amount || 0;
          } else if (transaction.type === 'repayment') {
            totalRepayment += transaction.amount || 0;
          }
        });
      }
    });

    setTotals({
      totalInvestors: investorsData.length,
      totalInvestment,
      totalRepayment,
      netInvestment: totalInvestment - totalRepayment
    });
  };

  // Fetch all investors
  const fetchInvestors = async () => {
    try {
      setLoading(true);
      const response = await getallInvestors();
      setInvestors(response.data);
      setFilteredInvestors(response.data);
      calculateInvestmentTotals(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching investors:', error);
      setLoading(false);
    }
  };

  // Fetch single investor details
  const fetchInvestorDetails = async (id) => {
    try {
      setLoading(true);
      const response = await getInvestor(id);
      setInvestorDetails(response.data);
      setShowInvestorDetails(true);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching investor details:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestors();
  }, []);

  // Handle search functionality
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      // Empty search - show all investors
      setFilteredInvestors(investors);
      return;
    }

    setSearchLoading(true);
    const results = investors.filter(investor => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        investor.name.toLowerCase().includes(searchTermLower) ||
        (investor.notes && investor.notes.toLowerCase().includes(searchTermLower))
      );
    });
    
    setFilteredInvestors(results);
    calculateInvestmentTotals(results);
    setSearchLoading(false);
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
        setFilteredInvestors(investors);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, investors]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle transaction form input changes
  const handleTransactionInputChange = (e) => {
    const { name, value } = e.target;
    setTransactionData({
      ...transactionData,
      [name]: name === 'amount' ? parseFloat(value) : value
    });
  };

  // Submit add/edit investor form
  const handleSubmitInvestor = async (e) => {
    e.preventDefault();
    try {
      if (selectedInvestor) {
        // Update existing investor
        await updateInvestor(selectedInvestor._id, formData);
      } else {
        // Add new investor
        await addInvestor(formData);
      }
      
      // Reset form and refresh list
      setFormData({ name: '', notes: '' });
      setSelectedInvestor(null);
      setShowAddForm(false);
      fetchInvestors();
    } catch (error) {
      console.error('Error saving investor:', error);
      alert('Error saving investor. Please try again.');
    }
  };

  // Submit transaction form
  const handleSubmitTransaction = async (e) => {
    e.preventDefault();
    try {
      await addTransaction(selectedInvestor._id, transactionData);
      
      // Reset form and refresh list
      setTransactionData({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        type: 'investment',
        notes: ''
      });
      setShowTransactionForm(false);
      fetchInvestors();
      
      // Refresh investor details if viewing
      if (showInvestorDetails && selectedInvestor) {
        fetchInvestorDetails(selectedInvestor._id);
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Error adding transaction. Please try again.');
    }
  };

  // Handle edit investor
  const handleEditInvestor = (investor) => {
    setSelectedInvestor(investor);
    setFormData({
      name: investor.name,
      notes: investor.notes || ''
    });
    setShowAddForm(true);
  };

  // Handle delete investor
  const handleDeleteInvestor = async (id) => {
    if (window.confirm('Are you sure you want to delete this investor?')) {
      try {
        await deleteInvestor(id);
        fetchInvestors();
        setShowInvestorDetails(false);
      } catch (error) {
        console.error('Error deleting investor:', error);
        alert('Error deleting investor. Please try again.');
      }
    }
  };

  // Handle add transaction
  const handleAddTransaction = (investor) => {
    setSelectedInvestor(investor);
    setShowTransactionForm(true);
  };

  // Handle delete transaction
  const handleDeleteTransaction = async (investorId, transactionId) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteTransaction(investorId, transactionId);
        fetchInvestors();
        
        // Refresh investor details if viewing
        if (showInvestorDetails) {
          fetchInvestorDetails(investorId);
        }
      } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('Error deleting transaction. Please try again.');
      }
    }
  };

  // Calculate investor's balance
  const calculateInvestorBalance = (transactions) => {
    if (!transactions || transactions.length === 0) return 0;
    
    let balance = 0;
    transactions.forEach(transaction => {
      if (transaction.type === 'investment') {
        balance += transaction.amount;
      } else if (transaction.type === 'repayment') {
        balance -= transaction.amount;
      }
    });
    
    return balance;
  };

  // Handle view investor details
  const handleViewInvestor = async (investor) => {
    setSelectedInvestor(investor);
    await fetchInvestorDetails(investor._id);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">Loading Data...</div>
      </div>
    );
  }

  return (
    <div className="inventory-container">
      <div className="page-header">
        <h1>Investors Management</h1>
        <div className="add-car-button">
          <button 
            className="btn btn-success"
            onClick={() => {
              setSelectedInvestor(null);
              setFormData({ name: '', notes: '' });
              setShowAddForm(true);
            }}
          >
            <FaPlusCircle /> Add Investor
          </button>
        </div>
      </div>

      {/* Add/Edit Investor Form */}
      {showAddForm && (
        <div className="form-container dashboard-card">
          <h3>{selectedInvestor ? 'Edit Investor' : 'Add New Investor'}</h3>
          <form onSubmit={handleSubmitInvestor}>
            <div className="form-group">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label htmlFor="notes">Notes:</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="form-control"
              />
            </div>
            <div className="form-buttons">
              <button type="submit" className="btn btn-primary">
                {selectedInvestor ? 'Update' : 'Save'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Transaction Form */}
      {showTransactionForm && selectedInvestor && (
        <div className="form-container dashboard-card">
          <h3>Add Transaction for {selectedInvestor.name}</h3>
          <form onSubmit={handleSubmitTransaction}>
            <div className="form-group">
              <label htmlFor="date">Date:</label>
              <input
                type="date"
                id="date"
                name="date"
                value={transactionData.date}
                onChange={handleTransactionInputChange}
                required
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label htmlFor="type">Type:</label>
              <select
                id="type"
                name="type"
                value={transactionData.type}
                onChange={handleTransactionInputChange}
                className="form-control"
              >
                <option value="investment">Investment</option>
                <option value="repayment">Repayment</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="amount">Amount:</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={transactionData.amount}
                onChange={handleTransactionInputChange}
                required
                min="1"
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label htmlFor="transactionNotes">Notes:</label>
              <textarea
                id="transactionNotes"
                name="notes"
                value={transactionData.notes}
                onChange={handleTransactionInputChange}
                className="form-control"
              />
            </div>
            <div className="form-buttons">
              <button type="submit" className="btn btn-primary">
                Save Transaction
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setShowTransactionForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Investor Details View */}
      {showInvestorDetails && investorDetails && (
        <div className="dashboard-card investor-details">
          <div className="investor-details-header">
            <button 
              className="btn btn-secondary"
              onClick={() => setShowInvestorDetails(false)}
            >
              Back to List
            </button>

            <div className="investor-actions">
            <button
              onClick={() => handleEditInvestor(investorDetails)}
              className="btn btn-edit"
            >
              <FaEdit /> Edit Investor
            </button>
            <button
              onClick={() => handleAddTransaction(investorDetails)}
              className="btn btn-primary"
            >
              <FaPlusCircle /> Add Transaction
            </button>
            <button
              onClick={() => handleDeleteInvestor(investorDetails._id)}
              className="btn btn-danger"
            >
              <FaTrash /> Delete Investor
            </button>
          </div>
          </div>
          
          <div className="investor-info">
          <h3>Investor Details: {investorDetails.name}</h3>
            <p><strong>Notes:</strong> {investorDetails.notes || 'N/A'}</p>
            <p>
              <strong>Current Balance:</strong> 
              <span className={`amount ${calculateInvestorBalance(investorDetails.transactions) >= 0 ? 'negative' : 'positive'}`}>
                Rs {Math.abs(calculateInvestorBalance(investorDetails.transactions)).toLocaleString()} 
                {calculateInvestorBalance(investorDetails.transactions) >= 0 ? ' (Debit)' : ' (Credit)'}
              </span>
            </p>
          </div>
          
        
          
          <h4>Transactions</h4>
          {investorDetails.transactions && investorDetails.transactions.length > 0 ? (
            <div className="table-responsive">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {investorDetails.transactions.map((transaction, index) => (
                    <tr key={transaction._id}>
                      <td>{index + 1}</td>
                      <td>{formatDate(transaction.date)}</td>
                      <td>{transaction.type === 'investment' ? 'Investment' : 'Repayment'}</td>
                      <td>Rs {transaction.amount.toLocaleString()}</td>
                      <td>{transaction.notes || 'N/A'}</td>
                      <td>
                        <button
                          onClick={() => handleDeleteTransaction(investorDetails._id, transaction._id)}
                          className="btn btn-danger btn-sm"
                        >
                          <FaTrash /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No transactions found for this investor.</p>
          )}
        </div>
      )}

      {/* Investors List */}
      {!showInvestorDetails && (
        <div className="dashboard-card list-container">
          <div className="inventory-header">
            <h3 className="section-title">Investors List</h3>
            
            {/* Search Bar */}
            <div className="search-section">
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Search by name or notes"
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
                  <th>Name</th>
                  <th>Notes</th>
                  <th>Balance</th>
                  <th>Last Transaction</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {searchLoading ? (
                  <tr>
                    <td colSpan="6" className="loading">Searching...</td>
                  </tr>
                ) : filteredInvestors.length > 0 ? (
                  filteredInvestors.map((investor, index) => {
                    const balance = calculateInvestorBalance(investor.transactions);
                    const lastTransaction = investor.transactions && investor.transactions.length > 0 
                      ? investor.transactions[0] 
                      : null;
                      
                    return (
                      <tr key={investor._id}>
                        <td>{index + 1}</td>
                        <td>
                          <div className="cell-content">
                            <div>{investor.name}</div>
                          </div>
                        </td>
                        <td>
                          <div className="cell-content">
                            <div>{investor.notes || 'N/A'}</div>
                          </div>
                        </td>
                        <td className={`amount ${balance >= 0 ? 'positive' : 'negative'}`}>
                          Rs {Math.abs(balance).toLocaleString()} {balance >= 0 ? '(Credit)' : '(Debit)'}
                        </td>
                        <td>
                          {lastTransaction ? (
                            <div className="cell-content">
                              <div>
                                {lastTransaction.type === 'investment' ? 'Investment' : 'Repayment'} - 
                                Rs {lastTransaction.amount.toLocaleString()} on {formatDate(lastTransaction.date)}
                              </div>
                            </div>
                          ) : (
                            'No transactions'
                          )}
                        </td>
                        <td>
                          <div className="card-actions">
                            {/* <button
                              onClick={() => handleAddTransaction(investor)}
                              className="btn btn-primary"
                            >
                              <FaPlusCircle /> Add Transaction
                            </button> */}
                            <button
                              onClick={() => handleViewInvestor(investor)}
                              className="btn btn-view"
                            >
                              <FaEye />
                            </button>
                            {/* <button
                              onClick={() => handleDeleteInvestor(investor._id)}
                              className="btn btn-danger"
                            >
                              <FaTrash /> Delete
                            </button> */}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="no-data">
                      {searchTerm ? "No matching investors found" : "No investors found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {filteredInvestors.length > 0 && (
              <div className="totals-dashboard">
                <h3>Investment Summary</h3>
                <div className="totals-cards">
                  <div className="total-card">
                    <div className="total-title">Total Investors</div>
                    <div className="total-value">{totals.totalInvestors}</div>
                  </div>
                  <div className="total-card">
                    <div className="total-title">Total Investment</div>
                    <div className="total-value">Rs {totals.totalInvestment.toLocaleString()}</div>
                  </div>
                  <div className="total-card">
                    <div className="total-title">Total Repayment</div>
                    <div className="total-value">Rs {totals.totalRepayment.toLocaleString()}</div>
                  </div>
                  <div className="total-card">
                    <div className="total-title">Net Investment</div>
                    <div className="total-value">Rs {totals.netInvestment.toLocaleString()}</div>
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

export default InvestorManagement;