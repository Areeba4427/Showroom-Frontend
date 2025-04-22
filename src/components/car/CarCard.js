import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCar, FaIdCard, FaPhoneAlt, FaMoneyBillWave, FaCalendarAlt } from 'react-icons/fa';

const CarCard = ({ car, refreshCars }) => {
  // State to track image loading errors
  const [imageError, setImageError] = useState(false);
  
  // Format date for display
  const formattedDate = car.Date ? new Date(car.Date).toLocaleDateString() : '';
  
  // Get the image source - prioritize the embedded base64 data
  const getImageSource = () => {
    if (imageError) {
      return '/placeholder-car.png';
    }
    
    if (car.images && car.images.length > 0 && car.images[0].imageData) {
      // Use embedded base64 data
      return car.images[0].imageData;
    }
    
    // Fallback to placeholder
    return '/placeholder-car.png';
  };
  
  // Handle image errors without causing infinite loops
  const handleImageError = () => {
    if (!imageError) {
      console.log('Image failed to load, using placeholder');
      setImageError(true);
    }
  };
  
  return (
    <div className="car-card">
      <div className="card-header">
        <span className={`transaction-badge ${car.type}`}>
          {car.type === 'bought' ? 'Bought / خریدا گیا' : 'Sold / بیچا گیا'}
        </span>
        <h3>{car.vehicleType || 'Vehicle'} - {car.vehicleRegistrationNumber}</h3>
      </div>

      <div className="car-image-container">
        <img 
          src={getImageSource()}
          alt={`${car.vehicleRegistrationNumber}`}
          className="car-thumbnail"
          onError={handleImageError}
        />
      </div>
      
      <div className="card-body">
        <div className="car-info">
          <div className="info-item">
            <FaCar /> <span>Engine Number: {car.vehicleEngineNumber}</span>
          </div>
          <div className="info-item">
            <FaIdCard /> <span>Person: {car.name}</span>
          </div>
          <div className="info-item">
            <FaPhoneAlt /> <span>Phone: {car.phoneNumber}</span>
          </div>
          <div className="info-item">
            <FaMoneyBillWave /> <span>Price: {car.price?.toLocaleString() || '-'}</span>
          </div>
          {car.commissionPaid && (
            <div className="info-item">
              <FaMoneyBillWave /> <span>Commission: {car.commissionPaid?.toLocaleString() || '-'}</span>
            </div>
          )}
          <div className="info-item">
            <FaCalendarAlt /> <span>Transaction Date: {formattedDate}</span>
          </div>
        </div>
      </div>
      
      <div className="card-actions">
        <Link 
          to={`/car-details?identifier=${car.vehicleRegistrationNumber}&type=registration`} 
          className="btn btn-view"
        >
          View Details / تفصیلات دیکھیں
        </Link>
        <Link to={`/edit-car/${car._id}`} className="btn btn-edit">
          Edit / ترمیم کریں
        </Link>
      </div>
    </div>
  );
};

export default CarCard;