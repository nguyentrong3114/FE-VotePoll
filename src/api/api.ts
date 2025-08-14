import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND || 'http://localhost:5236',
  headers: {
    'Content-Type': 'application/json',
  },
});
export default apiClient;