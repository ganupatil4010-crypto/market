import axios from 'axios';

// Dynamically set the base URL
// When deploying, you will replace 'http://localhost:5000' with your live backend URL
const BASE_URL = import.meta.env.VITE_API_URL || 'https://market-h28s.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
});

export default api;
