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
    console.log('API Response successful:', response.config.url);
    return response;
  },
  (error) => {
    console.log('API Response error:', error.response?.status, error.config?.url);
    
    if (error.response?.status === 401) {
      console.log('401 Unauthorized - triggering session expired');
      // Handle unauthorized (e.g., redirect to login)
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      
      // THIS IS WHERE YOUR error=session_expired IS COMING FROM
      window.location.href = '/login?error=session_expired';
      // // Replace with:
      // console.log('Would redirect to login with session_expired, but skipping for debug');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
