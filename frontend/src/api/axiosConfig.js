// api/axiosConfig.js
import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // This adds the /api prefix to all requests
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Important if you're using cookies for authentication
});

// Add an interceptor to include the JWT token from localStorage in every request
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  response => response,
  error => {
    // Handle common errors here (e.g., 401 unauthorized)
    if (error.response && error.response.status === 401) {
      // Optionally redirect to login page or refresh token
      console.log('Authentication error - redirecting to login');
      // window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
