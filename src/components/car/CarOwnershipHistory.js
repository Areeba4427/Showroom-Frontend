import React, { useState } from 'react';

const CarOwnershipHistory = ({ ownershipHistory }) => {
  const [expandedRecords, setExpandedRecords] = useState({});
  
  if (!ownershipHistory || ownershipHistory.length === 0) {
    return null;
  }
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const toggleExpand = (index) => {
    setExpandedRecords(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  
  const getRecordTypeBadge = (recordType) => {
    let badgeText;
    let badgeClass;
    
    switch (recordType) {
      case 'initial':
        badgeText = 'Initial Record / پہلا ریکارڈ';
        badgeClass = 'record-type-initial';
        break;
      case 'update':
        badgeText = 'Update / اپڈیٹ';
        badgeClass = 'record-type-update';
        break;
      case 'transfer':
        badgeText = 'Transfer / منتقلی';
        badgeClass = 'record-type-transfer';
        break;
      default:
        badgeText = recordType;
        badgeClass = '';
    }
    
    return (
      <span className={`record-type-badge ${badgeClass}`}>
        {badgeText}
      </span>
    );
  };
  
  console.log("ownership history,",ownershipHistory)
  return (
    <div className="ownership-history-container">
      <div className="ownership-history-header">
        <h2>Ownership History / ملکیت کی تاریخ</h2>
        <span className="record-count">{ownershipHistory.length} records</span>
      </div>
      
      <div className="history-timeline">
        <div className="timeline-connector"></div>
        
        {ownershipHistory.map((record, index) => (
          <div 
            key={index} 
            className={`history-record ${expandedRecords[index] ? 'expanded' : ''}`}
          >
            <div 
              className="history-record-header"
              onClick={() => toggleExpand(index)}
            >
              <div className="header-left">
                {getRecordTypeBadge(record.recordType)}
              </div>
              
            </div>
            
            {expandedRecords[index] && (
              <div className="history-record-content">
                <div className="record-details">
                  <div className="detail-group">
                    <span className="detail-label">Name / نام:</span>
                    <span className="detail-value">{record.name}</span>
                  </div>
                  
                  <div className="detail-group">
                    <span className="detail-label">ID Card / شناختی کارڈ:</span>
                    <span className="detail-value">{record.idCardNumber}</span>
                  </div>
                  
                  <div className="detail-group">
                    <span className="detail-label">Phone / فون:</span>
                    <span className="detail-value">{record.phoneNumber}</span>
                  </div>
                  
                  <div className="detail-group">
                    <span className="detail-label">Address / پتہ:</span>
                    <span className="detail-value">{record.address}</span>
                  </div>
                  
                  <div className="detail-group">
                    <span className="detail-label">Price / قیمت:</span>
                    <span className="detail-value">{record.price?.toLocaleString()} Rs</span>
                  </div>

                  <div className="detail-group">
                    <span className="detail-label">Date :</span>
                    <span className="detail-value">{record.createdAt}</span>
                  </div>
                  
                  {record.commissionPaid && (
                    <div className="detail-group">
                      <span className="detail-label">Commission / کمیشن:</span>
                      <span className="detail-value">{record.commissionPaid?.toLocaleString()} Rs</span>
                    </div>
                  )}
                  
                  {record.notes && (
                    <div className="detail-group full-width">
                      <span className="detail-label">Notes / نوٹس:</span>
                      <div className="notes-content">
                        {record.notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CarOwnershipHistory;