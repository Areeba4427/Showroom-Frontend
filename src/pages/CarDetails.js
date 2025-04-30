import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { deleteCar, searchCars, getCarById } from '../api';
import CarOwnershipHistory from '../components/car/CarOwnershipHistory';


const CarDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState({});
  const [showHistory, setShowHistory] = useState(false);

  // Check if we're coming from a search with a specific identifier
  const queryParams = new URLSearchParams(location.search);
  const searchIdentifier = queryParams.get('identifier');
  const identifierType = queryParams.get('type'); // registration, idcard, name, phone
  
  // Get the image source for the currently selected image
  const getImageSource = (index) => {
    if (imageErrors[index]) {
      return '/placeholder-car.png';
    }
    
    if (!car || !car.images || car.images.length === 0) {
      return '/placeholder-car.png';
    }
    
    const image = car.images[index];
    
    // Check if we have embedded base64 data
    if (image && image.imageData) {
      return image.imageData;
    }
    
    // Use the API endpoint path
    return `/api/cars/image/${car._id}/${image._id}`;
  };
  
  // Handle image errors
  const handleImageError = (index) => {
    setImageErrors(prev => ({
      ...prev,
      [index]: true
    }));
  };

  useEffect(() => {
    const fetchCarDetails = async () => {
      setLoading(true);
      try {
        // If we have a search identifier, use search endpoint instead of ID lookup
        if (searchIdentifier && identifierType) {
          const response = await searchCars(searchIdentifier);
          if (response.data && response.data.length > 0) {
            // Find the exact match if multiple results
            let matchedCar;
            
            switch(identifierType) {
              case 'registration':
                matchedCar = response.data.find(car => 
                  car.vehicleRegistrationNumber.toLowerCase() === searchIdentifier.toLowerCase());
                break;
              case 'idcard':
                matchedCar = response.data.find(car => 
                  car.idCardNumber.toLowerCase() === searchIdentifier.toLowerCase());
                break;
              case 'name':
                matchedCar = response.data.find(car => 
                  car.name.toLowerCase() === searchIdentifier.toLowerCase());
                break;
              case 'phone':
                matchedCar = response.data.find(car => 
                  car.phoneNumber === searchIdentifier);
                break;
              default:
                matchedCar = response.data[0]; // Default to first result
            }
            
            if (matchedCar) {
              setCar(matchedCar);
            } else {
              toast.error('Exact match not found / مماثل گاڑی نہیں ملی');
              navigate('/inventory');
            }
          } else {
            toast.error('Car not found / گاڑی نہیں ملی');
            navigate('/inventory');
          }
        } else if (location.state && location.state.carId) {
          // If we have a car ID from location state
          const response = await getCarById(location.state.carId);
          if (response.data) {
            setCar(response.data);
          } else {
            toast.error('Car not found / گاڑی نہیں ملی');
            navigate('/inventory');
          }
        } else {
          toast.error('No car identifier provided / کوئی گاڑی شناخت کنندہ فراہم نہیں کیا گیا');
          navigate('/inventory');
        }
      } catch (error) {
        console.error('Error fetching car details:', error);
        toast.error('Failed to load car details / گاڑی کی تفصیلات لوڈ کرنے میں ناکامی');
        navigate('/inventory');
      } finally {
        setLoading(false);
      }
    };

    fetchCarDetails();
  }, [navigate, searchIdentifier, identifierType, location.state]);


  // Navigate to the previous image
  const goToPrevImage = () => {
    if (car?.images?.length > 0) {
      setSelectedImageIndex((prevIndex) => 
        prevIndex === 0 ? car.images.length - 1 : prevIndex - 1
      );
    }
  };

  // Navigate to the next image
  const goToNextImage = () => {
    if (car?.images?.length > 0) {
      setSelectedImageIndex((prevIndex) => 
        (prevIndex + 1) % car.images.length
      );
    }
  };

  // Function to handle thumbnail click
  const handleThumbnailClick = (index) => {
    setSelectedImageIndex(index);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="loading">Loading... / لوڈ ہو رہا ہے</div>;
  }

  if (!car) {
    return <div className="not-found">Car not found / گاڑی نہیں ملی</div>;
  }

  // Format date for display
  const formattedDate = car.Date ? new Date(car.Date).toLocaleDateString() : '';

  return (
    <div className="car-details-page">
      <div className="page-header">
        <h1>Vehicle Details / گاڑی کی تفصیلات</h1>
        <div className="header-actions">
          <Link to={`/edit-car/${car._id}`} className="btn btn-edit">
            Edit / ترمیم کریں
          </Link>
          
          {car.ownershipHistory && car.ownershipHistory.length > 0 && (
            <button 
              type="button" 
              className="btn btn-info history-toggle"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? 'Hide History / تاریخ چھپائیں' : 'Show History / تاریخ دکھائیں'}
            </button>
          )}
          
          <Link to="/inventory" className="btn btn-back">
            Back / واپس
          </Link>
        </div>
      </div>

      {/* Ownership History Section */}
      {showHistory && car.ownershipHistory && car.ownershipHistory.length > 0 && (
        <div className="ownership-history-section">
          <h2>Ownership History / ملکیت کی تاریخ</h2>
          <div className="ownership-timeline">
            {car.ownershipHistory.map((record, index) => (
              <div key={index} className="history-record">
                <div className="history-record-header">
                  <strong>{record.recordType === 'initial' ? 'Initial Record' : record.recordType === 'transfer' ? 'Transfer' : 'Update'}</strong>
                  <span className="history-date">{formatDate(record.createdAt)}</span>
                </div>
                <div className="history-record-details">
                  <div className="history-detail-group">
                    <label>Name / نام:</label>
                    <span>{record.name}</span>
                  </div>
                  <div className="history-detail-group">
                    <label>ID Card / شناختی کارڈ:</label>
                    <span>{record.idCardNumber ? record.idCardNumber : "-"}</span>
                  </div>
                  <div className="history-detail-group">
                    <label>Phone / فون:</label>
                    <span>{record.phoneNumber}</span>
                  </div>
                  <div className="history-detail-group">
                    <label>Address / پتہ:</label>
                    <span>{record.address}</span>
                  </div>
                  <div className="history-detail-group">
                    <label>Price / قیمت:</label>
                    <span>{record.price?.toLocaleString()}</span>
                  </div>
                  {record.commissionPaid && (
                    <div className="history-detail-group">
                      <label>Commission / کمیشن:</label>
                      <span>{record.commissionPaid?.toLocaleString()}</span>
                    </div>
                  )}
                  {record.notes && (
                    <div className="history-detail-group">
                      <label>Notes / نوٹس:</label>
                      <span>{record.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="details-card">
        <div className="card-header">
          <span className={`transaction-badge ${car.type}`}>
            {car.type === 'bought' ? 'Bought / خریدا گیا' : 'Sold / بیچا گیا'}
          </span>
          <h2>{car.vehicleType || 'Vehicle'} - {car.vehicleRegistrationNumber}</h2>
        </div>

        {car.images && car.images.length > 0 && (
          <div className="car-images-section">
            <div className="carousel-container">
              <div className="main-image-container">
                <button 
                  className="carousel-arrow carousel-arrow-left" 
                  onClick={goToPrevImage}
                  aria-label="Previous image"
                >
                  &#10094;
                </button>
                
                <img 
                  src={getImageSource(selectedImageIndex)}
                  alt={`${car.vehicleRegistrationNumber}`}
                  className="car-main-image"
                  onError={() => handleImageError(selectedImageIndex)}
                />
                
                <button 
                  className="carousel-arrow carousel-arrow-right" 
                  onClick={goToNextImage}
                  aria-label="Next image"
                >
                  &#10095;
                </button>
                
                {car.images.length > 1 && (
                  <div className="image-counter">
                    {selectedImageIndex + 1} / {car.images.length}
                  </div>
                )}
              </div>
              
              {car.images.length > 1 && (
                <div className="thumbnails-container">
                  {car.images.map((image, index) => (
                    <div 
                      key={image._id || index} 
                      className={`thumbnail-item ${index === selectedImageIndex ? 'active' : ''}`}
                      onClick={() => handleThumbnailClick(index)}
                    >
                      <img 
                        src={getImageSource(index)} 
                        alt={`Thumbnail ${index + 1}`}
                        className="thumbnail-image"
                        onError={() => handleImageError(index)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="details-sections">
          <div className="details-section">
            <h3>Vehicle Information / گاڑی کی معلومات</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="label">Vehicle Type:</span>
                <span className="value">{car.vehicleType || '-'}</span>
              </div>
              <div className="detail-item">
                <span className="label">Registration Number:</span>
                <span className="value">{car.vehicleRegistrationNumber}</span>
              </div>
              {car.vehicleEngineNumber && (
                <div className="detail-item">
                  <span className="label">Engine Number:</span>
                  <span className="value">{car.vehicleEngineNumber}</span>
                </div>
              )}
              <div className="detail-item">
                <span className="label">Transaction Type:</span>
                <span className="value">{car.type === 'bought' ? 'Bought' : 'Sold'}</span>
              </div>
              <div className="detail-item">
                <span className="label">Transaction Date:</span>
                <span className="value">{formattedDate}</span>
              </div>
            </div>
          </div>

          <div className="details-section">
            <h3>Person Information / شخص کی معلومات</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="label">Name:</span>
                <span className="value">{car.name}</span>
              </div>
              <div className="detail-item">
                <span className="label">ID Card Number:</span>
                <span className="value">{car.idCardNumber ? car.idCardNumber : ""}</span>
              </div>
              <div className="detail-item">
                <span className="label">Phone Number:</span>
                <span className="value">{car.phoneNumber}</span>
              </div>
              <div className="detail-item">
                <span className="label">Address:</span>
                <span className="value">{car.address}</span>
              </div>
            </div>
          </div>

          <div className="details-section">
            <h3>Financial Details / مالی تفصیلات</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="label">Price:</span>
                <span className="value">{car.price?.toLocaleString() || '-'}</span>
              </div>
              <div className="detail-item">
                <span className="label">Commission Paid:</span>
                <span className="value">{car.commissionPaid?.toLocaleString() || '-'}</span>
              </div>
            </div>
          </div>

          {car.documentDetails && (
            <div className="details-section">
              <h3>Additional Information / اضافی معلومات</h3>
              <div className="details-grid">
                <div className="detail-item full-width">
                  <span className="label">Document Details:</span>
                  <span className="value document-details">{car.documentDetails}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarDetails;