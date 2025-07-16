import axios from 'axios';

// Create API client with base configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      if (!config.headers) {
        config.headers = {};
      }
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('API Request without token to:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response successful:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('API Response error:', error.response?.status, error.config?.url, error.response?.data);
    
    if (error.response?.status === 401) {
      console.log('401 Unauthorized - clearing token and redirecting');
      // Handle unauthorized (e.g., redirect to login)
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?error=session_expired';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
