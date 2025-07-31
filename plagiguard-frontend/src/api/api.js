import axios from 'axios';

// Define the base URL for the API
const BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Create axios instance with custom config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },  timeout: 60000, // 60 second timeout
  validateStatus: function (status) {
    return status >= 200 && status < 500; // Handle all responses
  },
  // Retry configuration
  retry: 3,
  retryDelay: (retryCount) => {
    return retryCount * 1000; // time interval between retries
  }
});

// Add request interceptor to handle authentication
api.interceptors.request.use(
  (config) => {
    // Get the tokens from localStorage
    const admin = JSON.parse(localStorage.getItem('admin') || '{}');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Clone the headers to avoid mutation
    const headers = { ...config.headers };

    // Send admin token for admin routes, user token for other routes
    if (config.url?.includes('/admin/') && admin?.token) {
      headers.Authorization = `Bearer ${admin.token}`;
    } else if (user?.token) {
      headers.Authorization = `Bearer ${user.token}`;
    }

    // For FormData requests, remove Content-Type to let browser set it
    if (config.data instanceof FormData) {
      delete headers['Content-Type'];
    }

    // Merge headers back into config
    config.headers = headers;

    // Debug logging only in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Request:', {
        url: config.baseURL + config.url,
        method: config.method,
        headers: { ...headers, Authorization: headers.Authorization ? '[REDACTED]' : undefined },
        data: config.data instanceof FormData ? '[FormData]' : config.data
      });
    }

    return config;
  },
  (error) => {
    console.error('Request configuration error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If we don't have a config, we can't retry
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Don't retry these status codes
    const noRetryStatuses = [400, 401, 403, 404, 422];
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      if (originalRequest.url?.includes('/admin/')) {
        localStorage.removeItem('admin');
        window.location.href = '/admin/login';
      } else {
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // Handle retry logic
    if (
      error.response &&
      !noRetryStatuses.includes(error.response.status) &&
      !originalRequest._retry &&
      originalRequest.retry > 0
    ) {
      originalRequest._retry = true;
      originalRequest.retry--;

      // Wait before retrying
      await new Promise(resolve => 
        setTimeout(resolve, originalRequest.retryDelay(originalRequest.retry))
      );

      // Retry the request
      return api(originalRequest);
    }

    // Log error details in development
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', {
        url: originalRequest.url,
        method: originalRequest.method,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }

    return Promise.reject(error);
  }
);

export default api;
