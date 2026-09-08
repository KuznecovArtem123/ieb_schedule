import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_PATH,
  headers: {
    'Content-Type': 'application/json',
  },
});

const templateService = {
  get: async (route) => {
    const response = await axiosClient.get(route);
    return response.data;
  }
};

export default axiosClient;
