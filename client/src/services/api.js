import axios from 'axios';
import { getAuth } from 'firebase/auth';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(async (config) => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

export const api = {
  async getWallets() {
    const response = await api.get('/wallets');
    return response.data;
  },

  async addWallet(address, label) {
    const response = await api.post('/wallets', { address, label });
    return response.data;
  },

  async getTransactions(walletId) {
    const response = await api.get(`/wallets/${walletId}/transactions`);
    return response.data;
  },

  async getTransaction(transactionId) {
    const response = await api.get(`/transactions/${transactionId}`);
    return response.data;
  },

  async syncTransactions(walletId) {
    const response = await api.post(`/transactions/sync/${walletId}`);
    return response.data;
  },

  async signUp(email, uid) {
    const response = await api.post('/auth/signup', { email, uid });
    return response.data;
  },

  async signIn(email, uid) {
    const response = await api.post('/auth/login', { email, uid });
    return response.data;
  }
};
