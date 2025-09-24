// src/utils/helpers.js

/**
 * Format date to readable string
 * @param {string|Date} date - Date string or Date object
 * @param {string} format - 'short', 'medium', 'long', 'datetime'
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'medium') => {
  if (!date) return 'N/A';
  
  const d = new Date(date);
  
  if (isNaN(d.getTime())) return 'Invalid Date';
  
  switch (format) {
    case 'short':
      return d.toLocaleDateString();
    case 'medium':
      return d.toLocaleString();
    case 'long':
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    case 'datetime':
      return d.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    default:
      return d.toLocaleString();
  }
};

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (USD, KES, etc.)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (typeof amount !== 'number') return 'N/A';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

/**
 * Validate phone number (Kenyan format for STK Push)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
export const validatePhoneNumber = (phone) => {
  if (!phone) return false;
  
  // Remove any spaces, dashes, or plus signs
  const cleanPhone = phone.replace(/[\s\-+]/g, '');
  
  // Check Kenyan format: 2547XXXXXXXX or 07XXXXXXXX
  const kenyanPattern = /^(?:2547|07)\d{8}$/;
  
  return kenyanPattern.test(cleanPhone);
};

/**
 * Format phone number for display
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return 'N/A';
  
  const cleanPhone = phone.replace(/[\s\-+]/g, '');
  
  // Format as +254 7XX XXX XXX
  if (cleanPhone.startsWith('254') && cleanPhone.length === 12) {
    return `+${cleanPhone.substring(0, 3)} ${cleanPhone.substring(3, 6)} ${cleanPhone.substring(6, 9)} ${cleanPhone.substring(9, 12)}`;
  }
  
  // Format as 07XX XXX XXX
  if (cleanPhone.startsWith('07') && cleanPhone.length === 10) {
    return `${cleanPhone.substring(0, 3)} ${cleanPhone.substring(3, 6)} ${cleanPhone.substring(6, 10)}`;
  }
  
  return phone;
};

/**
 * Get status badge class based on status
 * @param {string} status - Status string
 * @returns {string} CSS class name
 */
export const getStatusBadgeClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'scheduled':
    case 'pending':
      return 'status-badge--pending';
    case 'completed':
    case 'paid':
      return 'status-badge--completed';
    case 'cancelled':
    case 'failed':
      return 'status-badge--cancelled';
    case 'active':
      return 'status-badge--active';
    case 'inactive':
      return 'status-badge--inactive';
    case 'unread':
      return 'status-badge--unread';
    case 'read':
      return 'status-badge--read';
    case 'resolved':
      return 'status-badge--resolved';
    default:
      return 'status-badge--default';
  }
};

/**
 * Get status badge text based on status
 * @param {string} status - Status string
 * @returns {string} Formatted status text
 */
export const getStatusBadgeText = (status) => {
  if (!status) return 'N/A';
  
  // Capitalize first letter and replace underscores with spaces
  return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
};

/**
 * Filter array by search term
 * @param {Array} array - Array to filter
 * @param {string} searchTerm - Search term
 * @param {Array} keys - Array of keys to search in
 * @returns {Array} Filtered array
 */
export const filterBySearch = (array, searchTerm, keys = ['name']) => {
  if (!searchTerm) return array;
  
  return array.filter(item => {
    return keys.some(key => {
      const value = item[key];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return false;
    });
  });
};

/**
 * Sort array by key
 * @param {Array} array - Array to sort
 * @param {string} key - Key to sort by
 * @param {string} direction - 'asc' or 'desc'
 * @returns {Array} Sorted array
 */
export const sortByKey = (array, key, direction = 'asc') => {
  return [...array].sort((a, b) => {
    if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Format time to 12-hour format
 * @param {string} time - Time string (HH:MM)
 * @returns {string} Formatted time (e.g., "2:30 PM")
 */
export const formatTime = (time) => {
  if (!time) return 'N/A';
  
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  
  return `${hour12}:${minutes} ${ampm}`;
};

/**
 * Get initials from name
 * @param {string} name - Full name
 * @returns {string} Initials (e.g., "JD" for "John Doe")
 */
export const getInitials = (name) => {
  if (!name) return 'N/A';
  
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

/**
 * Format error message for display
 * @param {Error|Object} error - Error object or response
 * @returns {string} Formatted error message
 */
export const formatErrorMessage = (error) => {
  if (error?.response?.data?.msg) {
    return error.response.data.msg;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Set item in localStorage with expiration
 * @param {string} key - Key to set
 * @param {any} value - Value to set
 * @param {number} ttl - Time to live in seconds (optional)
 */
export const setLocalStorageItem = (key, value, ttl) => {
  const item = {
    value: value,
    expiry: ttl ? Date.now() + ttl * 1000 : null
  };
  localStorage.setItem(key, JSON.stringify(item));
};

/**
 * Get item from localStorage with expiration check
 * @param {string} key - Key to get
 * @returns {any} Value or null if expired/doesn't exist
 */
export const getLocalStorageItem = (key) => {
  const itemStr = localStorage.getItem(key);
  
  if (!itemStr) {
    return null;
  }
  
  try {
    const item = JSON.parse(itemStr);
    
    // Check if expired
    if (item.expiry && Date.now() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    
    return item.value;
  } catch (err) {
    console.error('Error parsing localStorage item:', err);
    return null;
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  return !!token && !!user;
};

/**
 * Get user role
 * @returns {string} User role or 'guest'
 */
export const getUserRole = () => {
  const user = localStorage.getItem('user');
  
  if (user) {
    try {
      return JSON.parse(user).role || 'guest';
    } catch (err) {
      console.error('Error parsing user:', err);
      return 'guest';
    }
  }
  
  return 'guest';
};

/**
 * Sleep function for delays
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after ms milliseconds
 */
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Generate random ID
 * @returns {string} Random ID
 */
export const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  if (typeof num !== 'number') return 'N/A';
  
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/**
 * Check if object is empty
 * @param {Object} obj - Object to check
 * @returns {boolean} True if empty
 */
export const isEmpty = (obj) => {
  return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
};

/**
 * Deep clone object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }
  
  if (typeof obj === 'object') {
    const cloned = {};
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  
  return obj;
};