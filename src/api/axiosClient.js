import axios from 'axios';

const axiosClient = axios.create({
  baseURL:'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 3000,
});

export default axiosClient;

