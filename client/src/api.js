import axios from 'axios';

const API_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && !window.location.hostname.includes("localhost")
    ? "https://grama-seva-api.onrender.com"
    : "http://localhost:3000");

const api = axios.create({
  baseURL: API_URL,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gs_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses (expired/invalid token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('gs_token');
      localStorage.removeItem('gs_current_user');
      // Don't redirect here, let the components handle it
    }
    return Promise.reject(error);
  }
);

export default api;
