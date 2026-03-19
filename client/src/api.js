import axios from 'axios';

// Dynamically set the base URL
// When deploying, you will replace 'http://localhost:5000' with your live backend URL
const BASE_URL = import.meta.env.VITE_API_URL || 'https://market-h28s.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
});

// Add a request interceptor to include user role/auth headers
api.interceptors.request.use((config) => {
  const savedUser = localStorage.getItem('loggedInUser');
  if (savedUser) {
    const { role } = JSON.parse(savedUser);
    config.headers['x-user-role'] = role;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
