import axios from 'axios';

const axiosClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 30000000,
});

// Add request interceptor to include token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosClient;

