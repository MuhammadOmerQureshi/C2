import axios from 'axios';

// Create and name axios instance "api"
const api = axios.create({
  baseURL: 'https://c2-85uf.onrender.com/api',
  withCredentials: true,
});

// Add request interceptor to include Authorization header
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Export "api" so other modules can import it
export default api;
