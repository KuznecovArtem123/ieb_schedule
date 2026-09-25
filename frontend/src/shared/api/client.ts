import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_PATH,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15_000
});

export default axiosClient;