// src/components/cashflow/CashflowSummary.js
import React from 'react';

const CashflowSummary = ({ summary }) => {
  const { cashIn, cashOut, netBalance } = summary;
  
  return (
    <div className="summary-boxes">
      <div className="summary-box income">
        <h3>Total Cash In / کل نقد اندر</h3>
        <p>${cashIn.toLocaleString()}</p>
      </div>
      <div className="summary-box expense">
        <h3>Total Cash Out / کل نقد باہر</h3>
        <p>${cashOut.toLocaleString()}</p>
      </div>
      <div className="summary-box balance">
        <h3>Net Balance / خالص بیلنس</h3>
        <p className={netBalance >= 0 ? 'positive' : 'negative'}>
          ${netBalance.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default CashflowSummary;