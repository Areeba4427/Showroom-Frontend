import React from 'react';

const SummaryCard = ({ title, value, subValue, icon, color }) => {
  // Debug logging
  console.log(`SummaryCard "${title}" rendering with value:`, value);
  
  // Format number values
  const formattedValue = typeof value === 'number' 
    ? value.toLocaleString() 
    : value;
  
  return (
    <div className="summary-card" style={{ borderTop: `4px solid ${color}` }}>
      <div className="summary-card-icon" style={{ color }}>
        {icon}
      </div>
      <div className="summary-card-content">
        <h3>{title}</h3>
        <h2>{formattedValue}</h2>
        {subValue && <p className="sub-value">{subValue}</p>}
      </div>
    </div>
  );
};

export default SummaryCard;