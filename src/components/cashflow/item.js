

// src/components/cashflow/CashflowItem.js
import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/dateUtils';

const CashflowItem = ({ cashflow }) => {
  const {
    _id,
    date,
    type,
    amount,
    category,
    description,
    paymentMethod,
    relatedTo,
    relatedCredit
  } = cashflow;
  
  // Format category for display
  const formatCategory = (category) => {
    return category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };
  
  return (
    <div className={`cashflow-item ${type === 'cash-in' ? 'cash-in' : 'cash-out'}`}>
      <div className="cashflow-date">
        <div className="date">{formatDate(date)}</div>
        <span className={`badge ${type === 'cash-in' ? 'badge-success' : 'badge-danger'}`}>
          {type === 'cash-in' ? 'Cash In' : 'Cash Out'}
        </span>
      </div>
      
      // src/components/cashflow/CashflowItem.js (Continued)
      <div className="cashflow-details">
        <h4 className="description">{description}</h4>
        <div className="meta-info">
          <span className="category">{formatCategory(category)}</span>
          <span className="payment-method">Via: {paymentMethod}</span>
          {relatedTo && <span className="related">Vehicle Related</span>}
          {relatedCredit && <span className="related">Credit Sale Related</span>}
        </div>
      </div>
      
      <div className="cashflow-amount">
        <span className={`amount ${type === 'cash-in' ? 'positive' : 'negative'}`}>
          {type === 'cash-in' ? '+' : '-'}${Math.abs(amount).toLocaleString()}
        </span>
      </div>
      
      <div className="cashflow-actions">
        <Link to={`/edit-cashflow/${_id}`} className="btn-icon">
          <i className="fas fa-edit"></i>
        </Link>
      </div>
    </div>
  );
};

export default CashflowItem;
