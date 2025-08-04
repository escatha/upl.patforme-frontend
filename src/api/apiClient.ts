import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api', // ✅ Change ici si ton backend est sur le port 3001
  // baseURL: 'http://localhost:5000/api', // ✅ ou ici si backend est sur le port 5000
  timeout: 10000,
});

export default apiClient;
