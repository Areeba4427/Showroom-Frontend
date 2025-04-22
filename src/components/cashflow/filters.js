

// src/components/cashflow/CashflowFilters.js
import React from 'react';

const CashflowFilters = ({ 
  dateRange, 
  cashflowType, 
  category, 
  onDateChange, 
  onTypeChange, 
  onCategoryChange, 
  onFilter, 
  onGenerateReport 
}) => {
  const categories = [
    { value: '', label: 'All Categories / تمام زمرہ جات' },
    { value: 'vehicle-sale', label: 'Vehicle Sale / گاڑی کی فروخت' },
    { value: 'vehicle-purchase', label: 'Vehicle Purchase / گاڑی کی خریداری' },
    { value: 'commission', label: 'Commission / کمیشن' },
    { value: 'salary', label: 'Salary / تنخواہ' },
    { value: 'rent', label: 'Rent / کرایہ' },
    { value: 'utilities', label: 'Utilities / یوٹیلیٹیز' },
    { value: 'maintenance', label: 'Maintenance / دیکھ بھال' },
    { value: 'advance-payment', label: 'Advance Payment / پیشگی ادائیگی' },
    { value: 'loan-repayment', label: 'Loan Repayment / قرض کی واپسی' },
    { value: 'other', label: 'Other / دیگر' }
  ];
  
  return (
    <div className="filter-container">
      <div className="filter-section date-filter">
        <h3 className="section-title">Date Range / تاریخ کی حد</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Start Date / شروع کی تاریخ</label>
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={onDateChange}
            />
          </div>
          <div className="form-group">
            <label>End Date / آخری تاریخ</label>
            <input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={onDateChange}
            />
          </div>
        </div>
      </div>
      
      <div className="filter-section cashflow-filter">
        <h3 className="section-title">Cashflow Type / نقد بہاؤ کی قسم</h3>
        <div className="cashflow-buttons">
          <button 
            className={`flow-btn ${cashflowType === 'all' ? 'active' : ''}`}
            onClick={() => onTypeChange('all')}
          >
            All / تمام
          </button>
          <button 
            className={`flow-btn in ${cashflowType === 'cash-in' ? 'active' : ''}`}
            onClick={() => onTypeChange('cash-in')}
          >
            Cash In / نقد اندر
          </button>
          <button 
            className={`flow-btn out ${cashflowType === 'cash-out' ? 'active' : ''}`}
            onClick={() => onTypeChange('cash-out')}
          >
            Cash Out / نقد باہر
          </button>
        </div>
      </div>
      
      <div className="filter-section category-filter">
        <h3 className="section-title">Category / زمرہ</h3>
        <select 
          value={category} 
          onChange={onCategoryChange}
          className="category-select"
        >
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>
      
      <div className="filter-actions">
        <button className="btn btn-primary" onClick={onFilter}>
          Apply Filters / فلٹرز لاگو کریں
        </button>
        <button className="btn btn-secondary" onClick={onGenerateReport}>
          Generate Report / رپورٹ تیار کریں
        </button>
      </div>
    </div>
  );
};

export default CashflowFilters;