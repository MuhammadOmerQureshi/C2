// frontend/src/api/axiosConfig.js
import axios from 'axios';

// 1) Create and name your axios instance "api"
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// 2) Use that same "api" for interceptors
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 3) Export "api" so other modules can import it
export default api;
