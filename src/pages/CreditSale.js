import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaMoneyBillWave, FaArrowLeft, FaEye } from 'react-icons/fa';
import { getCreditSale, addCreditSale, updateCreditSale, getallCreditSales } from '../api';
import api from '../api'; // Import the api object for direct requests
import { toast } from 'react-toastify';

const CreditSale = () => {
  // State for the form
  const [formData, setFormData] = useState({
    vehicleType: '',
    vehicleRegistrationNumber: '',
    customerName: '',
    idCardNumber: '',
    phoneNumber: '',
    address: '',
    sellingPrice: '',
    advanceReceived: '',
    saleDate: new Date().toISOString().split('T')[0],
    expectedCompletionDate: '',
    notes: '',
    paymentMethod: 'cash'
  });

  // State for payment form
  const [paymentForm, setPaymentForm] = useState({
    creditSaleId: '',
    amount: '',
    paymentMethod: 'cash',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // State for list of credit sales
  const [creditSales, setCreditSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [detailedSale, setDetailedSale] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activeTab, setActiveTab] = useState('add');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
// Add this with your other state variables
const [totals, setTotals] = useState({
  totalSellingPrice: 0,
  totalPaid: 0,
  totalRemaining: 0,
  totalSales: 0,
  completedSales: 0,
  pendingSales: 0
});

  const [images, setImages] = useState([]);

  // Fetch credit sales on component mount
  useEffect(() => {
    fetchCreditSales();
  }, []);

  // Function to fetch credit sales
  const fetchCreditSales = async (filters = {}) => {
    try {
      setLoading(true);

      // Use the getCreditSales function and add query params if needed
      let response;
      if (Object.keys(filters).length === 0) {
        response = await getallCreditSales();
      } else {
        // Build query string from filters
        const queryParams = new URLSearchParams(filters).toString();
        response = await api.get(`/credit-sale/get-all-credit-sales`);
      }

      setCreditSales(response?.data);
      calculateTotals(response?.data);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to fetch credit sales');
      setLoading(false);
      console.error(err);
    }
  };

  // Function to fetch a single credit sale by ID
  const fetchCreditSaleById = async (id) => {
    try {
      console.log("in credit sale function", id)
      setLoading(true);
      const response = await getCreditSale(id);
      setDetailedSale(response.data);
      setLoading(false);
      setActiveTab('view');
    } catch (err) {
      toast.error('Failed to fetch credit sale details');
      setLoading(false);
      console.error(err);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle payment form changes
  const handlePaymentChange = (e) => {
    setPaymentForm({
      ...paymentForm,
      [e.target.name]: e.target.value
    });
  };


  const removeSelectedImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const removeExistingImage = (index) => {
    const imageToDelete = existingImages[index];
    setImagesToDelete([...imagesToDelete, imageToDelete]);

    const newExistingImages = [...existingImages];
    newExistingImages.splice(index, 1);
    setExistingImages(newExistingImages);
  };


  // Update your handleSubmit function:
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Create FormData object to handle files
      const processedFormData = new FormData();

      // Add all form fields to the FormData
      Object.keys(formData).forEach(key => {
        if (key !== 'images') {
          processedFormData.append(key, formData[key]);
        }
      });

      // Add each file to the FormData
      if (images.length > 0) {
        images.forEach(image => {
          processedFormData.append('images', image);
        });
      }

      console.log("Submitting form data:", processedFormData);

      let response;
      if (selectedSale) {
        response = await updateCreditSale(selectedSale._id, processedFormData); // Pass the ID here
        toast.success('Credit sale updated successfully!');
      } else {
        response = await addCreditSale(processedFormData);
        toast.success('Credit sale added successfully!');
      }

      resetForm();
      fetchCreditSales();
      setLoading(false);
    } catch (err) {
      ('Failed to save credit sale: ' + (err.response?.data?.message || err.message));
      setLoading(false);
      console.error(err);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setImages([...images, ...selectedFiles]);
    }
  };

  // Handle payment submission - FIXED
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Make sure we use the api object directly since there's no dedicated function
      const response = await api.post(`/credit-sale/add-payment/${paymentForm.creditSaleId}`, {
        amount: parseFloat(paymentForm.amount),
        paymentMethod: paymentForm.paymentMethod,
        date: paymentForm.date,
        notes: paymentForm.notes
      });

      toast.success('Payment added successfully!');
      setShowPaymentModal(false);
      resetPaymentForm();

      // If we're in the detail view, refresh the detailed sale data
      if (activeTab === 'view' && detailedSale) {
        console.log("id details", detailedSale._id)
        await fetchCreditSaleById(detailedSale._id);
      } else {
        fetchCreditSales();
      }

      setLoading(false);
    } catch (err) {
      toast.error('Failed to add payment: ' + (err.response?.data?.message || err.message));
      setLoading(false);
      console.error(err);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this credit sale?')) {
      try {
        setLoading(true);
        await api.delete(`/credit-sale/${id}`);
        toast.success('Credit sale deleted successfully!');

        // If we're in the detail view of the deleted item, go back to the list
        if (activeTab === 'view' && detailedSale && detailedSale._id === id) {
          setActiveTab('list');
          setDetailedSale(null);
        }

        fetchCreditSales();
        setLoading(false);
      } catch (err) {
        toast.error('Failed to delete credit sale');
        setLoading(false);
        console.error(err);
      }
    }
  };


  // Function to calculate totals
const calculateTotals = (sales) => {
  let totalSellingPrice = 0;
  let totalPaid = 0;
  let totalRemaining = 0;
  let completedSales = 0;
  let pendingSales = 0;

  sales.forEach(sale => {
    totalSellingPrice += sale.sellingPrice;
    
    const paid = sale.paymentHistory.reduce((sum, payment) => sum + payment.amount, 0);
    totalPaid += paid;
    
    totalRemaining += (sale.sellingPrice - paid);
    
    if (sale.status === 'completed') {
      completedSales++;
    } else if (sale.status === 'pending') {
      pendingSales++;
    }
  });

  setTotals({
    totalSellingPrice,
    totalPaid,
    totalRemaining,
    totalSales: sales.length,
    completedSales,
    pendingSales
  });
};

  // Reset form
  const resetForm = () => {
    setFormData({
      vehicleType: '',
      vehicleRegistrationNumber: '',
      customerName: '',
      idCardNumber: '',
      phoneNumber: '',
      address: '',
      sellingPrice: '',
      advanceReceived: '',
      saleDate: new Date().toISOString().split('T')[0],
      expectedCompletionDate: '',
      notes: '',
      paymentMethod: 'cash'
    });
    setSelectedSale(null);
  };

  // Reset payment form
  const resetPaymentForm = () => {
    setPaymentForm({
      creditSaleId: '',
      amount: '',
      paymentMethod: 'cash',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  // Handle edit
  const handleEdit = (sale) => {
    setSelectedSale(sale);
    setFormData({
      vehicleType: sale.vehicleType,
      vehicleRegistrationNumber: sale.vehicleRegistrationNumber,
      customerName: sale.customerName,
      idCardNumber: sale.idCardNumber,
      phoneNumber: sale.phoneNumber,
      address: sale.address,
      sellingPrice: sale.sellingPrice,
      advanceReceived: sale.advanceReceived,
      saleDate: new Date(sale.saleDate).toISOString().split('T')[0],
      expectedCompletionDate: sale.expectedCompletionDate ? new Date(sale.expectedCompletionDate).toISOString().split('T')[0] : '',
      notes: sale.notes || '',
      paymentMethod: 'cash'
    });
    setActiveTab('add');
  };


  // Add this function near the beginning of your component
  const getImageSource = (image) => {
    if (image.imageData) {
        return image.imageData;
      }
   

    // Check if image is a string URL
    if (typeof image === 'string') {
      return image;
    }

    // If image is an object with url property
    if (image.url) {
      return image.url;
    }

    // If it's an image object from the server with an _id
    if (image._id) {
      return `/api/credit-sale/image/${detailedSale._id}/${image._id}`;
    }

    // Fallback
    return '/placeholder-car.png';
  };

  // Handle view details
  const handleViewDetails = async (id) => {
    console.log("id details ======>", id)
    await fetchCreditSaleById(id);
  };

  // Open payment modal
  const openPaymentModal = (sale) => {
    setPaymentForm({
      ...paymentForm,
      creditSaleId: sale._id
    });
    setSelectedSale(sale);
    setShowPaymentModal(true);
  };

  // Handle search
  const handleSearch = async () => {
    try {
      setLoading(true);
      if (searchQuery.trim() === '') {
        fetchCreditSales({ status: filterStatus });
      } else {
        // Use a custom endpoint since searchCars is for cars specifically
        const response = await api.get(`/credit-sale/search?query=${encodeURIComponent(searchQuery)}`);
        setCreditSales(response.data);
      }
      setLoading(false);
    } catch (err) {
      toast.error('Search failed');
      setLoading(false);
      console.error(err);
    }
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const status = e.target.value;
    setFilterStatus(status);
    fetchCreditSales({ status });
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Calculate total paid
  const calculateTotalPaid = (sale) => {
    return sale.paymentHistory.reduce((sum, payment) => sum + payment.amount, 0);
  };

  return (
    <div className="credit-sale-container">
      {/* Alert messages */}
      {error && <div className="alert alert-danger">{error}<button onClick={() => setError('')}>×</button></div>}
      {success && <div className="alert alert-success">{success}<button onClick={() => toast.success('')}>×</button></div>}

      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === 'add' ? 'active' : ''}
          onClick={() => setActiveTab('add')}
        >
          {selectedSale ? 'Edit Credit Sale' : 'Add New Credit Sale'}
        </button>
        <button
          className={activeTab === 'list' ? 'active' : ''}
          onClick={() => { fetchCreditSales(); setActiveTab('list'); }}
        >
          View All Credit Sales
        </button>
        {activeTab === 'view' && (
          <button className="active">
            View Credit Sale Details
          </button>
        )}
      </div>

      {/* Add/Edit Credit Sale Form */}
      {activeTab === 'add' && (
        <div className="form-container">
          <h2>{selectedSale ? 'Edit Credit Sale' : 'Add New Credit Sale'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Vehicle Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Vehicle Type<span className="required-indicator">*</span></label>
                  <input
                    type="text"
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Registration Number<span className="required-indicator">*</span></label>
                  <input
                    type="text"
                    name="vehicleRegistrationNumber"
                    value={formData.vehicleRegistrationNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div>
              <div className="form-group">
                  <label>Engine Number<span className="required-indicator">*</span></label>
                  <input
                    type="text"
                    name="vehicleEngineNumber"
                    value={formData.vehicleEngineNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Customer Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Customer Name<span className="required-indicator">*</span></label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>ID Card Number</label>
                  <input
                    type="text"
                    name="idCardNumber"
                    value={formData.idCardNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number<span className="required-indicator">*</span></label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Address<span className="required-indicator">*</span></label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Financial Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Selling Price (Rs)<span className="required-indicator">*</span></label>
                  <input
                    type="number"
                    name="sellingPrice"
                    value={formData.sellingPrice}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Advance Received (Rs)<span className="required-indicator">*</span></label>
                  <input
                    type="number"
                    name="advanceReceived"
                    value={formData.advanceReceived}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {formData.sellingPrice && formData.advanceReceived && (
                <div className="remaining-amount">
                  Remaining Amount: Rs {parseFloat(formData.sellingPrice) - parseFloat(formData.advanceReceived)}
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Sale Date<span className="required-indicator">*</span></label>
                  <input
                    type="date"
                    name="saleDate"
                    value={formData.saleDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Expected Completion Date</label>
                  <input
                    type="date"
                    name="expectedCompletionDate"
                    value={formData.expectedCompletionDate}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {formData.advanceReceived > 0 && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Payment Method</label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleChange}
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="bank-transfer">Bank Transfer</option>
                      <option value="check">Check</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="form-section">
              <h3>Images / تصاویر</h3>

              <div className="form-group">
                <label htmlFor="images">Upload Images / تصاویر اپلوڈ کریں (Maximum 5)</label>
                <input
                  type="file"
                  id="images"
                  name="images"
                  onChange={handleImageChange}
                  accept="image/*"
                  multiple
                  className="file-input"
                />
                <p className="help-text">Select up to 5 images of the vehicle / گاڑی کی 5 تک تصاویر منتخب کریں</p>
              </div>

              {/* Show selected images preview */}
              {images.length > 0 && (
                <div className="image-preview-container">
                  <h4>Selected Images / منتخب تصاویر</h4>
                  <div className="image-preview-grid">
                    {images.map((image, index) => (
                      <div key={index} className="image-preview-item">
                        <img
                          src={URL.createObjectURL(image)} 
                          alt={`Selected ${index}`}
                          className="image-preview"
                        />
                         <input
              type="file"
              id="images"
              name="images"
              onChange={handleImageChange}
              accept="image/*"
              multiple
              className="file-input"
            />
                        <button
                          type="button"
                          className="remove-image-btn"
                          onClick={() => removeSelectedImage(index)}
                        >
                          Remove / ہٹائیں
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Show existing images for edit mode - FIXED THIS SECTION */}

            </div>

            <div className="form-section">
              <h3>Additional Information</h3>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                ></textarea>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {selectedSale ? 'Update Credit Sale' : 'Add Credit Sale'}
              </button>
              {selectedSale && (
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* List of Credit Sales */}
      {activeTab === 'list' && (
        <div className="list-container">
          <h2>Credit Sales List</h2>

          <div className="filter-container">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by customer name, reg. number, ID, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button onClick={handleSearch}><FaSearch /></button>
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading...</div>
          ) : creditSales.length === 0 ? (
            <div className="no-data">No credit sales found</div>
          ) : (
            <div className="table-responsive">
              <table className="credit-sales-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Vehicle</th>
                    <th>Customer</th>
                    <th>Contact</th>
                    <th>Sale Date</th>
                    <th>Selling Price</th>
                    <th>Amount Paid</th>
                    <th>Remaining</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {creditSales.map((sale , index) => {
                    const totalPaid = calculateTotalPaid(sale);
                    const remaining = sale.sellingPrice - totalPaid;

                    return (
                      <tr key={sale._id} className={`status-${sale.status}`}>
                        <td>{index + 1}</td>
                        <td>
                          <div className="cell-content">
                            <div>{sale.vehicleType}</div>
                            <div className="cell-subtitle">{sale.vehicleRegistrationNumber}</div>
                          </div>
                        </td>
                        <td>
                          <div className="cell-content">
                            <div>{sale.customerName}</div>
                            <div className="cell-subtitle">ID: {sale.idCardNumber}</div>
                          </div>
                        </td>
                        <td>
                          <div className="cell-content">
                            <div>{sale.phoneNumber}</div>
                            <div className="cell-subtitle truncate">{sale.address}</div>
                          </div>
                        </td>
                        <td>
                          <div className="cell-content">
                            <div>{formatDate(sale.saleDate)}</div>
                            <div className="cell-subtitle">Expected: {formatDate(sale.expectedCompletionDate)}</div>
                          </div>
                        </td>
                        <td className="amount">Rs {sale.sellingPrice.toLocaleString()}</td>
                        <td className="amount">Rs {totalPaid.toLocaleString()}</td>
                        <td className="amount remaining">Rs {remaining.toLocaleString()}</td>
                        <td>
                          <span className={`status-badge ${sale.status}`}>
                            {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                          </span>
                        </td>
                        <td className="actions">
                          <button
                            className="btn-small btn-view"
                            onClick={() => handleViewDetails(sale._id)}
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
{creditSales?.length > 0 && (
  <div className="totals-dashboard">
    <h3>Credit Sales Summary</h3>
    <div className="totals-cards">
      <div className="total-card">
        <div className="total-title">Total Sales</div>
        <div className="total-value">{totals.totalSales}</div>
        <div className="total-subtitle">
          <span className="completed">{totals.completedSales} Completed</span>
          <span className="pending">{totals.pendingSales} Pending</span>
        </div>
      </div>
      
      <div className="total-card">
        <div className="total-title">Total Value</div>
        <div className="total-value">Rs {totals.totalSellingPrice.toLocaleString()}</div>
      </div>
      
      <div className="total-card">
        <div className="total-title">Total Collected</div>
        <div className="total-value">Rs {totals.totalPaid.toLocaleString()}</div>
        <div className="total-subtitle">
          ({((totals.totalPaid / totals.totalSellingPrice) * 100).toFixed(1)}%)
        </div>
      </div>
      
      <div className="total-card">
        <div className="total-title">Total Outstanding</div>
        <div className="total-value">Rs {totals.totalRemaining.toLocaleString()}</div>
        <div className="total-subtitle">
          ({((totals.totalRemaining / totals.totalSellingPrice) * 100).toFixed(1)}%)
        </div>
      </div>
    </div>
    
    <div className="totals-chart">
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{width: `${(totals.totalPaid / totals.totalSellingPrice) * 100}%`}}
        ></div>
      </div>
      <div className="progress-labels">
        <span>0%</span>
        <span>Collection Progress</span>
        <span>100%</span>
      </div>
    </div>
  </div>
)}

            </div>
          )}
        </div>
      )}

      {/* Single Credit Sale Detail View */}
      {activeTab === 'view' && detailedSale && (
        <div className="detail-container">
          <div className="detail-header">
            <button
              className="btn-back"
              onClick={() => { setActiveTab('list'); setDetailedSale(null); }}
            >
              <FaArrowLeft /> Back to List
            </button>
            <div className="detail-header-actions">
              {/* <button
                className="btn-medium btn-edit"
                onClick={() => handleEdit(detailedSale)}
              >
                <FaEdit /> Edit
              </button> */}
              {detailedSale.status !== 'completed' && detailedSale.status !== 'cancelled' && (
                <button
                  className="btn-medium btn-payment"
                  onClick={() => openPaymentModal(detailedSale)}
                >
                  <FaMoneyBillWave /> Add Payment
                </button>
              )}
              <button
                className="btn-medium btn-delete"
                onClick={() => handleDelete(detailedSale._id)}
              >
                <FaTrash /> Delete
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <div className="detail-content">
              <div className="detail-section">
                <h3>Overview</h3>
                <div className="detail-info-card">
                  <div className="detail-info-header">
                    <h2>{detailedSale.vehicleType}</h2>
                    <span className={`status-badge ${detailedSale.status}`}>
                      {detailedSale.status.charAt(0).toUpperCase() + detailedSale.status.slice(1)}
                    </span>
                  </div>

                  <div className="detail-info-row">
                    <div className="detail-info-item">
                      <span className="info-label">Registration Number</span>
                      <span className="info-value">{detailedSale.vehicleRegistrationNumber}</span>
                    </div>

                    <div className="detail-info-item">
                      <span className="info-label">Engine Number</span>
                      <span className="info-value">{detailedSale.vehicleEngineNumber}</span>
                    </div>

                    <div className="detail-info-item">
                      <span className="info-label">Sale Date</span>
                      <span className="info-value">{formatDate(detailedSale.saleDate)}</span>
                    </div>

                    <div className="detail-info-item">
                      <span className="info-label">Expected Completion</span>
                      <span className="info-value">{formatDate(detailedSale.expectedCompletionDate)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-section detail-half">
                  <h3>Customer Information</h3>
                  <div className="detail-info-card">
                    <div className="detail-info-item">
                      <span className="info-label">Name</span>
                      <span className="info-value">{detailedSale.customerName}</span>
                    </div>

                    <div className="detail-info-item">
                      <span className="info-label">ID Card Number</span>
                      <span className="info-value">{detailedSale.idCardNumber ? detailedSale.idCardNumber : ""}</span>
                    </div>

                    <div className="detail-info-item">
                      <span className="info-label">Phone Number</span>
                      <span className="info-value">{detailedSale.phoneNumber}</span>
                    </div>

                    <div className="detail-info-item">
                      <span className="info-label">Address</span>
                      <span className="info-value">{detailedSale.address}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section detail-half">
                  <h3>Financial Summary</h3>
                  <div className="detail-info-card">
                    <div className="detail-info-item">
                      <span className="info-label">Selling Price</span>
                      <span className="info-value">Rs {detailedSale.sellingPrice.toLocaleString()}</span>
                    </div>

                    <div className="detail-info-item">
                      <span className="info-label">Advance Received</span>
                      <span className="info-value">Rs {detailedSale.advanceReceived.toLocaleString()}</span>
                    </div>

                    <div className="detail-info-item">
                      <span className="info-label">Total Paid</span>
                      <span className="info-value">Rs {calculateTotalPaid(detailedSale).toLocaleString()}</span>
                    </div>

                    <div className="detail-info-item highlight">
                      <span className="info-label">Remaining Balance</span>
                      <span className="info-value">Rs {(detailedSale.sellingPrice - calculateTotalPaid(detailedSale)).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {detailedSale.notes && (
                <div className="detail-section">
                  <h3>Notes</h3>
                  <div className="detail-info-card">
                    <p>{detailedSale.notes}</p>
                  </div>
                </div>
              )}

              {/* Payment History Section */}
              <div className="detail-section">
                <h3>Payment History</h3>
                {detailedSale.paymentHistory && detailedSale.paymentHistory.length > 0 ? (
                  <div className="payment-history-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Amount</th>
                          <th>Payment Method</th>
                          <th>Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailedSale.paymentHistory.map((payment, index) => (
                          <tr key={index}>
                            <td>{formatDate(payment.date)}</td>
                            <td className="amount">Rs {payment.amount.toLocaleString()}</td>
                            <td>{payment.paymentMethod}</td>
                            <td>{payment.notes || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="no-data">No payment records found.</div>
                )}
              </div>

              {detailedSale.images && detailedSale.images.length > 0 && (
  <div className="detail-section">
    <h3>Images</h3>
    <div className="car-images-section">
      <div className="carousel-container">
        <div className="main-image-container">
          {detailedSale.images.length > 1 && (
            <button 
              className="carousel-arrow carousel-arrow-left" 
              onClick={() => {
                setSelectedImageIndex(prev => 
                  prev === 0 ? detailedSale.images.length - 1 : prev - 1
                );
              }}
              aria-label="Previous image"
            >
              &#10094;
            </button>
          )}
          
          <img 
            src={getImageSource(detailedSale.images[selectedImageIndex || 0])}
            alt={`${detailedSale.vehicleRegistrationNumber}`}
            className="car-main-image"
            onError={(e) => {e.target.src = '/placeholder-car.png';}}
          />
          
          {detailedSale.images.length > 1 && (
            <button 
              className="carousel-arrow carousel-arrow-right" 
              onClick={() => {
                setSelectedImageIndex(prev => 
                  (prev + 1) % detailedSale.images.length
                );
              }}
              aria-label="Next image"
            >
              &#10095;
            </button>
          )}
          
          {detailedSale.images.length > 1 && (
            <div className="image-counter">
              {(selectedImageIndex || 0) + 1} / {detailedSale.images.length}
            </div>
          )}
        </div>
        
        {detailedSale.images.length > 1 && (
          <div className="thumbnails-container">
            {detailedSale.images.map((image, index) => (
              <div 
                key={index} 
                className={`thumbnail-item ${index === (selectedImageIndex || 0) ? 'active' : ''}`}
                onClick={() => setSelectedImageIndex(index)}
              >
                <img 
                  src={getImageSource(image)} 
                  alt={`Thumbnail ${index + 1}`}
                  className="thumbnail-image"
                  onError={(e) => {e.target.src = '/placeholder-car.png';}}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
)}
            </div>
          )}
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Update Payment</h3>
              <button className="close-btn" onClick={() => setShowPaymentModal(false)}>×</button>
            </div>

            {selectedSale && (
              <div className="modal-body">
                <div className="sale-summary">
                  <p><strong>Vehicle:</strong> {selectedSale.vehicleType} ({selectedSale.vehicleRegistrationNumber})</p>
                  <p><strong>Customer:</strong> {selectedSale.customerName}</p>
                  <p><strong>Total Price:</strong> Rs {selectedSale.sellingPrice.toLocaleString()}</p>
                  <p><strong>Total Paid:</strong> Rs {calculateTotalPaid(selectedSale).toLocaleString()}</p>
                  <p><strong>Remaining:</strong> Rs {(selectedSale.sellingPrice - calculateTotalPaid(selectedSale)).toLocaleString()}</p>
                </div>

                <form onSubmit={handlePaymentSubmit}>
                  <div className="form-group">
                    <label>Payment Amount (Rs) <span className="required-indicator">*</span></label>
                    <input
                      type="number"
                      name="amount"
                      value={paymentForm.amount}
                      onChange={handlePaymentChange}
                      required
                      max={selectedSale.sellingPrice - calculateTotalPaid(selectedSale)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Payment Method</label>
                    <select
                      name="paymentMethod"
                      value={paymentForm.paymentMethod}
                      onChange={handlePaymentChange}
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="bank-transfer">Bank Transfer</option>
                      <option value="check">Check</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Payment Date <span className="required-indicator">*</span></label>
                    <input
                      type="date"
                      name="date"
                      value={paymentForm.date}
                      onChange={handlePaymentChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Notes</label>
                    <textarea
                      name="notes"
                      value={paymentForm.notes}
                      onChange={handlePaymentChange}
                      rows="2"
                    ></textarea>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-primary">Update Payment</button>
                    <button type="button" className="btn-secondary" onClick={() => setShowPaymentModal(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditSale;