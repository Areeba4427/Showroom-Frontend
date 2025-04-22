/**
 * Utility functions for date formatting and manipulation
 */

/**
 * Format a date string into a more readable format
 * @param {string} dateString - The date string to format (YYYY-MM-DD)
 * @returns {string} - Formatted date string (e.g., "Jan 5, 2023")
 */
export const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateString; // Return original string if date is invalid
    }
    
    // Format options
    const options = { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric'
    };
    
    return date.toLocaleDateString('en-US', options);
  };
  
  /**
   * Get the first day of the current month
   * @returns {string} - First day of current month in YYYY-MM-DD format
   */
  export const getFirstDayOfMonth = () => {
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    return firstDay.toISOString().split('T')[0];
  };
  
  /**
   * Get today's date
   * @returns {string} - Today's date in YYYY-MM-DD format
   */
  export const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };
  
  /**
   * Calculate the difference between two dates in days
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @returns {number} - Number of days between the dates
   */
  export const getDaysBetween = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  /**
   * Format a date to display with time
   * @param {string} dateString - The date string to format
   * @returns {string} - Formatted date and time string
   */
  export const formatDateTime = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateString; // Return original string if date is invalid
    }
    
    // Format options
    const options = { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return date.toLocaleDateString('en-US', options);
  };