import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercept requests to add the JWT token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('blink_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept responses to extract data and handle 401s
api.interceptors.response.use(
  (response) => {
    // If our backend returned the standard format { success, data, message }
    if (response.data && response.data.success !== undefined) {
      return response.data;
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('blink_token');
      localStorage.removeItem('blink_user');
      // If we aren't already on the login page, redirect
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
