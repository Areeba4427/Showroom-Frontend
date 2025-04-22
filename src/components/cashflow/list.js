
// src/components/cashflow/CashflowList.js
import React from 'react';
import CashflowItem from './item';

const CashflowList = ({ cashflows, loading, cashflowType }) => {
  const getTitle = () => {
    switch (cashflowType) {
      case 'cash-in':
        return 'Cash In Entries / نقد اندر کے اندراجات';
      case 'cash-out':
        return 'Cash Out Entries / نقد باہر کے اندراجات';
      default:
        return 'All Cashflow Entries / تمام نقد بہاؤ کے اندراجات';
    }
  };

  if (loading) {
    return <div className="loading">Loading cashflow entries... / نقد بہاؤ کے اندراجات لوڈ ہو رہے ہیں...</div>;
  }

  return (
    <div className="cashflow-list">
      <h3>{getTitle()}</h3>
      
      {cashflows.length > 0 ? (
        <div className="cashflow-items">
          {cashflows.map(cashflow => (
            <CashflowItem key={cashflow._id} cashflow={cashflow} />
          ))}
        </div>
      ) : (
        <div className="no-data">No cashflow entries found / کوئی نقد بہاؤ کا اندراج نہیں ملا</div>
      )}
    </div>
  );
};

export default CashflowList;
