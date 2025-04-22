
// src/components/cashflow/CashflowReport.js
import React from 'react';
import CategoryBreakdown from './breakdown';
import { formatDate } from '../../utils/dateUtils';

const CashflowReport = ({ reportData, onClose, onDownload }) => {
  const { dateRange, cashflowType, filteredCashflows, summary, categoryBreakdown } = reportData;
  
  const getReportTitle = () => {
    switch (cashflowType) {
      case 'cash-in':
        return 'Cash In Report / کیش ان رپورٹ';
      case 'cash-out':
        return 'Cash Out Report / کیش آؤٹ رپورٹ';
      default:
        return 'Complete Cashflow Report / مکمل نقد بہاؤ کی رپورٹ';
    }
  };
  
  return (
    <div className="cashflow-report">
      <div className="report-header">
        <h2>{getReportTitle()}</h2>
        <div className="report-period">
          <p>Period: {formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)}</p>
        </div>
      </div>
      
      <div className="report-summary">
        {cashflowType === 'all' && (
          <>
            <div className="report-total income">
              <h3>Total Cash In / کل نقد اندر</h3>
              <p>${summary.cashIn.toLocaleString()}</p>
            </div>
            <div className="report-total expense">
              <h3>Total Cash Out / کل نقد باہر</h3>
              <p>${summary.cashOut.toLocaleString()}</p>
            </div>
            <div className="report-total balance">
              <h3>Net Balance / خالص بیلنس</h3>
              <p className={summary.netBalance >= 0 ? 'positive' : 'negative'}>
                ${summary.netBalance.toLocaleString()}
              </p>
            </div>
          </>
        )}
        
        {cashflowType === 'cash-in' && (
          <div className="report-total income">
            <h3>Total Cash In / کل نقد اندر</h3>
            <p>${summary.cashIn.toLocaleString()}</p>
          </div>
        )}
        
        {cashflowType === 'cash-out' && (
          <div className="report-total expense">
            <h3>Total Cash Out / کل نقد باہر</h3>
            <p>${summary.cashOut.toLocaleString()}</p>
          </div>
        )}
      </div>
      
      <CategoryBreakdown 
        categoryTotals={categoryBreakdown} 
        cashflowType={cashflowType} 
      />
      
      <div className="report-actions">
        <button className="btn btn-primary" onClick={onDownload}>
          Download Report / رپورٹ ڈاؤن لوڈ کریں
        </button>
        <button className="btn btn-secondary" onClick={onClose}>
          Close Report / رپورٹ بند کریں
        </button>
      </div>
    </div>
  );
};

export default CashflowReport;