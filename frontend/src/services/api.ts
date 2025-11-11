import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
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
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout. Please try again.';
    } else if (!error.response) {
      // Network error - backend server is not running or wrong port
      // Don't clear token if it's just a network error (server might be temporarily down)
      const backendPort = '5001';
      error.message = `Network error. Please check if the backend server is running on port ${backendPort}. Current API URL: ${process.env.REACT_APP_API_URL || '/api (using proxy to port 5001)'}`;
      error.isNetworkError = true; // Flag to identify network errors
      // Keep token safe - don't clear it on network errors
    } else if (error.response.status === 401) {
      // Handle 401 Unauthorized - only clear token if it's actually invalid
      const token = localStorage.getItem('token');
      if (token) {
        // Only clear token if we get a 401 response (server says token is invalid)
        // This means server is running but token is bad
        localStorage.removeItem('token');
        
        // Only redirect if we're not already on login/register page
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/register') {
          const nextUrl = encodeURIComponent(currentPath);
          window.location.href = `/login?next=${nextUrl}`;
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
