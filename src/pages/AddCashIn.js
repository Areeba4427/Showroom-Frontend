import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { addCashflow, getCreditSale, getCars } from '../api';

const AddCashflow = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    type: 'cash-in', // Default to cash-in
    category: '',
    description: '',
    paymentMethod: 'cash',
    relatedTo: '',
    relatedCredit: '',
    notes: '',
    entryMadeBy: '' // New field for person making the entry
  });
  
  const [loading, setLoading] = useState(false);
  const [cars, setCars] = useState([]);
  const [creditSales, setCreditSales] = useState([]);
  const [showVehicleSelect, setShowVehicleSelect] = useState(false);
  const [showCreditSelect, setShowCreditSelect] = useState(false);
  
  useEffect(() => {
    const fetchRelatedData = async () => {
      try {
        const [carsResponse, creditResponse] = await Promise.all([
          getCars(),
          getCreditSale({ status: 'active' })
        ]);
        
        setCars(carsResponse.data);
        setCreditSales(creditResponse.data);
      } catch (error) {
        console.error('Error fetching related data:', error);
      }
    };
    
    fetchRelatedData();
  }, []);
  
  useEffect(() => {
    // Show vehicle select for vehicle-sale category
    setShowVehicleSelect(['vehicle-sale', 'commission'].includes(formData.category));
    
    // Show credit sale select for credit-payment category
    setShowCreditSelect(['advance-payment', 'loan-repayment'].includes(formData.category));
  }, [formData.category]);
  
  const cashInCategories = [
    { value: '', label: 'Select Category / زمرہ منتخب کریں' },
    { value: 'vehicle-sale', label: 'Vehicle Sale / گاڑی کی فروخت' },
    { value: 'commission', label: 'Commission / کمیشن' },
    { value: 'advance-payment', label: 'Advance Payment / پیشگی ادائیگی' },
    { value: 'loan-repayment', label: 'Loan Repayment / قرض کی واپسی' },
    { value: 'other', label: 'Other / دیگر' }
  ];
  
  const cashOutCategories = [
    { value: '', label: 'Select Category / زمرہ منتخب کریں' },
    { value: 'vehicle-purchase', label: 'Vehicle Purchase / گاڑی کی خریداری' },
    { value: 'repair', label: 'Repair & Maintenance / مرمت اور دیکھ بھال' },
    { value: 'salary', label: 'Salary / تنخواہ' },
    { value: 'rent', label: 'Rent / کرایہ' },
    { value: 'utilities', label: 'Utilities / یوٹیلیٹیز' },
    { value: 'loan', label: 'Loan Given / قرض دیا' },
    { value: 'other', label: 'Other / دیگر' }
  ];
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'amount' ? (value === '' ? '' : parseFloat(value)) : value
    });
    
    // Reset category when type changes
    if (name === 'type') {
      setFormData(prev => ({
        ...prev,
        category: '',
        [name]: value
      }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || formData.amount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }
    
    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }
    
    if (!formData.entryMadeBy.trim()) {
      toast.error('Please enter the name of person making this entry');
      return;
    }
    
    setLoading(true);
    
    try {
      const cashflowData = {
        ...formData,
        addedBy: localStorage.getItem('userId') || 'system'
      };
      
      await addCashflow(cashflowData);
      toast.success(`${formData.type === 'cash-in' ? 'Cash In' : 'Cash Out'} transaction added successfully!`);
      navigate('/cashflow');
    } catch (error) {
      console.error('Error adding cashflow:', error);
      toast.error(`Failed to add ${formData.type === 'cash-in' ? 'Cash In' : 'Cash Out'} transaction`);
    } finally {
      setLoading(false);
    }
  };
  
  const getPageTitle = () => {
    return formData.type === 'cash-in' 
      ? 'Add Cash In / نقد اندر شامل کریں' 
      : 'Add Cash Out / نقد باہر شامل کریں';
  };
  
  const getSubmitButtonText = () => {
    if (loading) return 'Adding... / شامل کر رہا ہے...';
    return formData.type === 'cash-in' 
      ? 'Add Cash In / نقد اندر شامل کریں' 
      : 'Add Cash Out / نقد باہر شامل کریں';
  };
  
  return (
    <div className="add-cashflow">
      <div className="page-header">
        <h1>{getPageTitle()}</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="cashflow-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="type">Transaction Type / لین دین کی قسم<span className="required-indicator">*</span></label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              required
            >
              <option value="cash-in">Cash In / نقد اندر</option>
              <option value="cash-out">Cash Out / نقد باہر</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="date">Date / تاریخ<span className="required-indicator">*</span></label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="amount">Amount ($) / رقم<span className="required-indicator">*</span></label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              min="0.01"
              step="0.01"
              required
              placeholder="Enter amount / رقم درج کریں"
            />
          </div>
          <div className="form-group">
            <label htmlFor="entryMadeBy">Entry Made By / اندراج کرنے والا</label>
            <input
              type="text"
              id="entryMadeBy"
              name="entryMadeBy"
              value={formData.entryMadeBy}
              onChange={handleInputChange}
              placeholder="Enter name / نام درج کریں"
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Category / زمرہ <span className="required-indicator">*</span></label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              {(formData.type === 'cash-in' ? cashInCategories : cashOutCategories).map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="paymentMethod">Payment Method / ادائیگی کا طریقہ<span className="required-indicator">*</span></label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleInputChange}
              required
            >
              <option value="cash">Cash / نقد</option>
              <option value="card">Card / کارڈ</option>
              <option value="bank-transfer">Bank Transfer / بینک ٹرانسفر</option>
              <option value="check">Check / چیک</option>
              <option value="other">Other / دیگر</option>
            </select>
          </div>
        </div>
        
        <div className="form-row">
        <div className="form-group">
            <label htmlFor="paymentMethod">Payment Taken Out From / ادائیگی کی گئی <span className="required-indicator">*</span></label>
            <select
              id="paymentFrom"
              name="paymentFrom"
              value={formData.paymentFrom}
              onChange={handleInputChange}
              required
            >
              <option value="meezan">Meezan Bank</option>
              <option value="habib">Bank Al-Habib</option>
              <option value="home">Home</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description / تفصیل</label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter description / تفصیل درج کریں"
            />
          </div>
        </div>
        
        {showVehicleSelect && (
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="relatedTo">Related Vehicle / متعلقہ گاڑی</label>
              <select
                id="relatedTo"
                name="relatedTo"
                value={formData.relatedTo}
                onChange={handleInputChange}
              >
                <option value="">Select Vehicle / گاڑی منتخب کریں</option>
                {cars.map(car => (
                  <option key={car._id} value={car._id}>
                    {car.make} {car.model} - {car.registrationNumber || car.vin}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        
        {showCreditSelect && (
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="relatedCredit">Related Credit / متعلقہ کریڈٹ</label>
              <select
                id="relatedCredit"
                name="relatedCredit"
                value={formData.relatedCredit}
                onChange={handleInputChange}
              >
                <option value="">Select Credit / کریڈٹ منتخب کریں</option>
                {creditSales.map(credit => (
                  <option key={credit._id} value={credit._id}>
                    {credit.customerName} - {credit.vehicleDetails}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="notes">Notes / نوٹس</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Enter additional notes / اضافی نوٹس درج کریں"
              rows="3"
            ></textarea>
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {getSubmitButtonText()}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/cashflow')}
            disabled={loading}
          >
            Cancel / منسوخ کریں
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCashflow;