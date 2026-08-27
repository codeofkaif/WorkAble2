import axios from 'axios';

const getBaseUrl = (): string => {
  let url = (process.env.REACT_APP_API_URL || '/api').trim();
  if (url.startsWith('http') && !url.includes('/api')) {
    url = `${url.replace(/\/+$/, '')}/api`;
  }
  return url;
};

export const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 60000 // 60 seconds timeout
});

// Add a request interceptor to include token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // For file uploads, don't set Content-Type - let browser set it with boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  
  return config;
}, (error) => Promise.reject(error));

// Add response interceptor for better error handling and 401 redirect
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const serverMessage = error.response?.data?.message || error.response?.data?.error;

    if (serverMessage && typeof serverMessage === 'string') {
      error.message = serverMessage;
    } else if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout. Please try again.';
    } else if (!error.response) {
      // Network error - backend server is not running or wrong port
      const isDev = process.env.NODE_ENV === 'development';
      error.message = isDev
        ? `Network error. Please check if the backend server is running. Current API URL: ${process.env.REACT_APP_API_URL || '/api'}`
        : 'Unable to connect to the backend server. Please check your internet connection or try again shortly.';
      error.isNetworkError = true;
    } else if (error.response.status === 400) {
      error.message = serverMessage || 'Invalid request. Please check the entered details and try again.';
    } else if (error.response.status === 401) {
      // Handle 401 Unauthorized - only clear token if it's actually invalid
      const token = localStorage.getItem('token');
      if (token) {
        localStorage.removeItem('token');
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/register') {
          const nextUrl = encodeURIComponent(currentPath);
          window.location.href = `/login?next=${nextUrl}`;
        }
      }
    } else if (error.response.status === 403) {
      error.message = serverMessage || 'You do not have permission to perform this action.';
    } else if (error.response.status === 404) {
      error.message = serverMessage || 'Resource not found.';
    } else if (error.response.status >= 500) {
      error.message = serverMessage || 'Server error. Please try again in a few moments.';
    }
    return Promise.reject(error);
  }
);

export default api;
