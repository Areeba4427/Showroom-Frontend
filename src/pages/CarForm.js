import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { addCar, searchCars, updateCar, getCarById } from '../api/index';

const CarForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get type from URL query params for new cars
  const queryParams = new URLSearchParams(location.search);
  const typeFromQuery = queryParams.get('type');
  
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    vehicleEngineNumber: '',
    vehicleRegistrationNumber: '',
    type: typeFromQuery || 'bought',
    name: '',
    idCardNumber: '',
    phoneNumber: '',
    address: '',
    price: '',
    commissionPaid: '',
    documentDetails: '',
    Date: new Date().toISOString().split('T')[0]
  });
  
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [ownershipHistory, setOwnershipHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  
  useEffect(() => {
    if (isEditMode) {
      const fetchCar = async () => {
        setLoading(true);
        try {
          const response = await getCarById(id);
          console.log("car id fetched", response);
          if (response.data) {
            const car = response.data;
            
            // Format date for input field
            const formattedDate = car.Date ? new Date(car.Date).toISOString().split('T')[0] : '';
            
            setFormData({
              vehicleEngineNumber: car.vehicleEngineNumber || '',
              vehicleRegistrationNumber: car.vehicleRegistrationNumber || '',
              type: car.type || 'bought',
              name: car.name || '',
              idCardNumber: car.idCardNumber || '',
              phoneNumber: car.phoneNumber || '',
              address: car.address || '',
              price: car.price || '',
              commissionPaid: car.commissionPaid || '',
              documentDetails: car.documentDetails || '',
              Date: formattedDate
            });
            
            // Set existing images if any
            if (car.images && car.images.length > 0) {
              setExistingImages(car.images);
            }
            
            // Set ownership history if any
            if (car.ownershipHistory && car.ownershipHistory.length > 0) {
              setOwnershipHistory(car.ownershipHistory);
            }
          } else {
            toast.error('Car not found / گاڑی نہیں ملی');
            navigate('/inventory');
          }
        } catch (error) {
          console.error('Error fetching car:', error);
          toast.error('Failed to fetch car data / گاڑی کا ڈیٹا حاصل کرنے میں ناکامی');
          navigate('/inventory');
        } finally {
          setLoading(false);
        }
      };
      
      fetchCar();
    }
  }, [id, isEditMode, navigate]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'price' || name === 'commissionPaid' ? 
        value === '' ? '' : parseFloat(value) : value
    });
  };
  
  const handleImageChange = (e) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setImages([...images, ...selectedFiles]);
    }
  };
  
  const removeSelectedImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };
  
  const removeExistingImage = (index) => {
    const imageToDelete = existingImages[index];
    setImagesToDelete([...imagesToDelete, imageToDelete]);
    
    const newExistingImages = [...existingImages];
    newExistingImages.splice(index, 1);
    setExistingImages(newExistingImages);
  };
  
  // Function to get image source
  const getImageSource = (image, index) => {
    if (imageErrors[index]) {
      return '/placeholder-car.png';
    }
    
    // Check if we have embedded base64 data
    if (image.imageData) {
      return image.imageData;
    }
    
    // Use the API endpoint path
    return `/api/cars/image/${id}/${image._id}`;
  };
  
  // Handle image loading errors
  const handleImageError = (index) => {
    setImageErrors(prev => ({
      ...prev,
      [index]: true
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Create FormData object for multipart/form-data submission
      const formDataToSubmit = new FormData();
      
      // Add all text fields
      Object.keys(formData).forEach(key => {
        formDataToSubmit.append(key, formData[key]);
      });
      
      // Add new images
      images.forEach(image => {
        formDataToSubmit.append('images', image);
      });
      
      // Add imagesToDelete if in edit mode - send only the image IDs
      if (isEditMode && imagesToDelete.length > 0) {
        // Extract just the IDs if they're objects with _id property
        const imageIds = imagesToDelete.map(img => img._id || img);
        formDataToSubmit.append('imagesToDelete', JSON.stringify(imageIds));
      }
      
      if (isEditMode) {
        const response = await updateCar(id, formDataToSubmit);
        
        if (response.status === 200) {
          toast.success('Car updated successfully! / گاڑی کامیابی سے اپ ڈیٹ ہو گئی');
          
          // Optionally refresh ownership history after update
          if (response.data && response.data.ownershipHistory) {
            setOwnershipHistory(response.data.ownershipHistory);
          }
          
          navigate('/inventory');
        } else {
          toast.error('Failed to update car / گاڑی اپڈیٹ کرنے میں ناکامی');
        }
      } else {
        await addCar(formDataToSubmit);
        toast.success('Car added successfully! / گاڑی کامیابی سے شامل ہو گئی');
        navigate('/inventory');
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'adding'} car:`, error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'add'} car / گاڑی ${isEditMode ? 'اپ ڈیٹ' : 'شامل'} کرنے میں ناکامی`);
    } finally {
      setLoading(false);
    }
  };
  
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
  
  const getFormTitle = () => {
    if (isEditMode) {
      return "Edit Car / گاڑی میں ترمیم کریں";
    } else {
      return formData.type === 'bought' 
        ? "Add Bought Car / خریدی گئی گاڑی شامل کریں" 
        : "Add Sold Car / بیچی گئی گاڑی شامل کریں";
    }
  };
  
  return (
    <div className="car-form-page">
      <div className="page-header">
        <h1>{getFormTitle()}</h1>
        
        {isEditMode && ownershipHistory.length > 0 && (
          <button 
            type="button" 
            className="btn btn-info history-toggle"
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? 'Hide History / تاریخ چھپائیں' : 'Show History / تاریخ دکھائیں'}
          </button>
        )}
      </div>
      
      {/* Ownership History Section */}
      {isEditMode && showHistory && ownershipHistory.length > 0 && (
        <div className="ownership-history-section">
          <h2>Ownership History / ملکیت کی تاریخ</h2>
          <div className="ownership-timeline">
            {ownershipHistory.map((record, index) => (
              <div key={index} className="history-record">
                <div className="history-record-header">
                  <strong>{record.recordType === 'initial' ? 'Initial Record' : 'Update'}</strong>
                  <span className="history-date">{formatDate(record.recordDate)}</span>
                </div>
                <div className="history-record-details">
                  <div className="history-detail-group">
                    <label>Name / نام:</label>
                    <span>{record.name}</span>
                  </div>
                  <div className="history-detail-group">
                    <label>ID Card / شناختی کارڈ:</label>
                    <span>{record.idCardNumber ? record.idCardNumber : ""}</span>
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
      
      <form onSubmit={handleSubmit} className="car-form" encType="multipart/form-data">
        <div className="form-section">
          <h3>Vehicle Details / گاڑی کی تفصیلات</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="vehicleEngineNumber">Engine Number / انجن نمبر<span className="required-indicator">*</span></label>
              <input
                type="text"
                id="vehicleEngineNumber"
                name="vehicleEngineNumber"
                value={formData.vehicleEngineNumber}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="vehicleRegistrationNumber">Registration Number / رجسٹریشن نمبر<span className="required-indicator">*</span></label>
              <input
                type="text"
                id="vehicleRegistrationNumber"
                name="vehicleRegistrationNumber"
                value={formData.vehicleRegistrationNumber}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="type">Transaction Type / لین دین کی قسم<span className="required-indicator">*</span></label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
                disabled={!isEditMode && typeFromQuery} // Disable if coming from type-specific button
              >
                <option value="bought">Bought / خریدا گیا</option>
                <option value="sold">Sold / بیچا گیا</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="Date">Vehicle Type <span className="required-indicator">*</span></label>
              <input
                type="text"
                id="vehicleType"
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div>
          <div className="form-group">
              <label htmlFor="Date">Transaction Date <span className="required-indicator">*</span></label>
              <input
                type="date"
                id="Date"
                name="Date"
                value={formData.Date}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Person Details / شخص کی تفصیلات</h3>
          {isEditMode && ownershipHistory.length > 0 && (
            <p className="history-note">
              <i>Note: Changes to person details will be saved in the car's history / نوٹ: شخص کی تفصیلات میں تبدیلیاں گاڑی کی تاریخ میں محفوظ کی جائیں گی</i>
            </p>
          )}
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Name / نام<span className="required-indicator">*</span></label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="idCardNumber">ID Card Number / شناختی کارڈ نمبر</label>
              <input
                type="text"
                id="idCardNumber"
                name="idCardNumber"
                value={formData.idCardNumber}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number / فون نمبر<span className="required-indicator">*</span></label>
              <input
                type="text"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="address">Address / پتہ<span className="required-indicator">*</span></label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Financial Details / مالی تفصیلات</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Price / قیمت<span className="required-indicator">*</span></label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="commissionPaid">Commission Paid / کمیشن ادا کیا گیا</label>
              <input
                type="number"
                id="commissionPaid"
                name="commissionPaid"
                value={formData.commissionPaid}
                onChange={handleInputChange}
                placeholder="Optional / اختیاری"
              />
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Images / تصاویر</h3>
          
          <div className="form-group">
            <label htmlFor="images">Upload Images / تصاویر اپلوڈ کریں (Maximum 5)</label>
            <input
              type="file"
              id="images"
              name="images"
              onChange={handleImageChange}
              accept="image/*"
              multiple
              className="file-input"
            />
            <p className="help-text">Select up to 5 images of the vehicle / گاڑی کی 5 تک تصاویر منتخب کریں</p>
          </div>
          
          {/* Show selected images preview */}
          {images.length > 0 && (
            <div className="image-preview-container">
              <h4>Selected Images / منتخب تصاویر</h4>
              <div className="image-preview-grid">
                {images.map((image, index) => (
                  <div key={index} className="image-preview-item">
                    <img 
                      src={URL.createObjectURL(image)} 
                      alt={`Selected ${index}`} 
                      className="image-preview"
                    />
                    <button 
                      type="button" 
                      className="remove-image-btn"
                      onClick={() => removeSelectedImage(index)}
                    >
                      Remove / ہٹائیں
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Show existing images for edit mode */}
          {isEditMode && existingImages.length > 0 && (
            <div className="image-preview-container">
              <h4>Existing Images / موجودہ تصاویر</h4>
              <div className="image-preview-grid">
                {existingImages.map((image, index) => (
                  <div key={index} className="image-preview-item">
                    <img 
                      src={getImageSource(image, index)} 
                      alt={image.name || `Car Image ${index + 1}`} 
                      className="image-preview"
                      onError={() => handleImageError(index)}
                    />
                    <button 
                      type="button" 
                      className="remove-image-btn"
                      onClick={() => removeExistingImage(index)}
                    >
                      Remove / ہٹائیں
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="form-section">
          <h3>Additional Information / اضافی معلومات</h3>
          
          <div className="form-group">
            <label htmlFor="documentDetails">Document Details / دستاویز کی تفصیلات</label>
            <textarea
              id="documentDetails"
              name="documentDetails"
              value={formData.documentDetails}
              onChange={handleInputChange}
              rows="4"
              placeholder="Enter any additional document details or notes / کوئی اضافی دستاویز کی تفصیلات یا نوٹس درج کریں"
            ></textarea>
          </div>
        </div>
        
        <div className="form-buttons">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading 
              ? (isEditMode ? 'Updating... / اپڈیٹ ہو رہا ہے' : 'Adding... / شامل ہو رہا ہے')
              : (isEditMode ? 'Update Car / گاڑی اپڈیٹ کریں' : 'Add Car / گاڑی شامل کریں')
            }
          </button>
          
          <button 
            type="button" 
            className="btn btn-cancel"
            onClick={() => navigate('/inventory')}
            disabled={loading}
          >
            Cancel / منسوخ کریں
          </button>
        </div>
      </form>
    </div>
  );
};

export default CarForm;