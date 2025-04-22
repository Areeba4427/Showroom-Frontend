import axios from 'axios';

// const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const API_URL = 'https://showroom-backend-v8r9.onrender.com'

const api = axios.create({
  baseURL: API_URL
});

// Add cars
export const addCar = async (formData) => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  };
  
  return await api.post('/cars', formData, config);
};

// Get car by ID
export const getCarById = async (id) => {
  return await api.get(`/cars/${id}`);
};

// Update car
export const updateCar = async (id, formData) => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  };
  
  return await api.put(`/cars/${id}`, formData, config);
};

// Search cars
export const searchCars = async (query) => {
  return await api.get(`/cars/search?query=${query}`);
};

// Get all cars in inventory (bought)
export const getCars = async () => {
  return await api.get('/cars/get-all-cars');
};

// Get monthly statistics
export const monthlyStats = async () => {
  return await api.get('/cars/monthly-stats');
};

// Delete car
export const deleteCar = async (id) => {
  return await api.delete(`/cars/${id}`);
};

// Delete specific image
export const deleteCarImage = async (carId, imageId) => {
  return await api.delete(`/cars/images/${carId}/${imageId}`);
};



//CashFlow endpoints
// Get all cashflows (optional filters applied in the backend)
export const getCashflows = () => api.get('/cash-flow');

// Get cashflows with date range, type, and category filters
export const getCashflowsByDateRange = (startDate, endDate, type, category) => {
  // Build query params
  const params = new URLSearchParams();
  
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (type) params.append('type', type);
  if (category) params.append('category', category);
  
  return api.get(`/cash-flow?${params.toString()}`);
};

// Get daily cashflow for a specific date
export const getDailyCashflow = (date) => {
  const params = new URLSearchParams();
  params.append('date', date);
  
  return api.get(`/cash-flow/daily?${params.toString()}`);
};

// Update a cashflow entry
export const updateCashflow = (id, cashflowData) => {
  return api.put(`/cash-flow/${id}`, cashflowData);
};

// Delete a cashflow entry
export const deleteCashflow = (id) => {
  return api.delete(`/cash-flow/${id}`);
};

export const addCashflow = (data) => api.post('/cash-flow/add-cash' , data)





// Credit Sales endpoints
export const getallCreditSales = () => api.get('/credit-sale/get-all-credit-sales')
export const getCreditSale = (id) => api.get(`/credit-sale/get-credit-sale-entry/${id}`)
// First, check your API function implementation
// In your api.js file, make sure the addCreditSale function is properly implemented:



export const addCreditSale = async (formData) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };
    
    const response = await api.post('/credit-sale/add-credit-sale-entry', formData, config);
    return response?.data;
  } catch (error) {
    console.error('Error adding credit sale:', error);
    throw error;
  }
};
export const updateCreditSale = async (id, formData) => {
  try {
    const response = await api.put(`/credit-sale/update-credit-sale-entry/${id}`, formData);
    return response.data;
  } catch (error) {
    console.error('Error updating credit sale:', error);
    throw error;
  }
};



// Dashboard endpoints
export const getDashboardSummary = () => api.get('/dashboard/summary');
export const getMonthlySales = (year) => api.get(`/dashboard/monthly-sales${year ? `?year=${year}` : ''}`);

export default api;