
// src/components/cashflow/CategoryBreakdown.js
import React from 'react';

const CategoryBreakdown = ({ categoryTotals, cashflowType }) => {
  // Get the maximum total for scaling bars
  const getMaxTotal = () => {
    if (cashflowType === 'cash-in') {
      return Math.max(...categoryTotals.map(cat => cat.totalIn)) || 1;
    } else if (cashflowType === 'cash-out') {
      return Math.max(...categoryTotals.map(cat => cat.totalOut)) || 1;
    } else {
      return Math.max(...categoryTotals.map(cat => Math.abs(cat.net))) || 1;
    }
  };
  
  // Format category for display
  const formatCategory = (category) => {
    return category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };
  
  const maxTotal = getMaxTotal();
  
  return (
    <div className="category-breakdown">
      <h3>Category Breakdown / زمرہ کی تقسیم</h3>
      
      {categoryTotals.length > 0 ? (
        <div className="category-list">
          {categoryTotals.map((cat, index) => {
            let displayAmount, barWidth, barColor;
            
            if (cashflowType === 'cash-in') {
              displayAmount = cat.totalIn;
              barWidth = (cat.totalIn / maxTotal) * 100;
              barColor = '#2ecc71'; // Green for cash in
            } else if (cashflowType === 'cash-out') {
              displayAmount = cat.totalOut;
              barWidth = (cat.totalOut / maxTotal) * 100;
              barColor = '#e74c3c'; // Red for cash out
            } else {
              displayAmount = cat.net;
              barWidth = (Math.abs(cat.net) / maxTotal) * 100;
              barColor = cat.net >= 0 ? '#2ecc71' : '#e74c3c'; // Green for positive, red for negative
            }
            
            return (
              <div key={index} className="category-item">
                <div className="category-info">
                  <span className="category-name">{formatCategory(cat.category)}</span>
                  <span className={`category-amount ${displayAmount >= 0 ? 'positive' : 'negative'}`}>
                    ${Math.abs(displayAmount).toLocaleString()}
                  </span>
                </div>
                <div className="category-bar">
                  <div 
                    className="category-fill" 
                    style={{ width: `${barWidth}%`, backgroundColor: barColor }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p>No category data available / زمرہ کا کوئی ڈیٹا دستیاب نہیں ہے</p>
      )}
    </div>
  );
};

export default CategoryBreakdown;
