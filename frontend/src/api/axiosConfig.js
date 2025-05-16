import axios from 'axios';

<<<<<<< HEAD
// 1) Create and name your axios instance "api"
=======
// Create and name axios instance "api"
>>>>>>> c615c2fd63428fac6b70bab20292ffa5fc6afb61
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
});

<<<<<<< HEAD
// // 2) Use that same "api" for interceptors
// api.interceptors.request.use(config => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// 3) Export "api" so other modules can import it
export default api;
=======
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
>>>>>>> c615c2fd63428fac6b70bab20292ffa5fc6afb61
