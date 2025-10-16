import axios from 'axios';
import { getAuth } from 'firebase/auth';

const API_BASE_URL = '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Add authentication token interceptor
apiClient.interceptors.request.use(async (config) => {
  try {
    // First check for MetaMask authentication token
    const metaMaskToken = localStorage.getItem('authToken');
    if (metaMaskToken) {
      config.headers.Authorization = `Bearer ${metaMaskToken}`;
      return config;
    }
    
    // If no MetaMask token, try Firebase
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.log('No authentication available, proceeding without token');
  }
  
  return config;
});

export const api = {
  async getWallets() {
    const response = await apiClient.get('/wallets');
    return response.data;
  },

  async addWallet(address, label) {
    const response = await apiClient.post('/wallets', { address, label });
    return response.data;
  },

  async getTransactions(walletId) {
    const response = await apiClient.get(`/wallets/${walletId}/transactions`);
    return response.data;
  },

  async getTransaction(transactionId) {
    const response = await apiClient.get(`/transactions/${transactionId}`);
    return response.data;
  },

  async syncTransactions(walletId) {
    const response = await apiClient.post(`/transactions/sync/${walletId}`);
    return response.data;
  },

  async generateSummary(transactionId) {
    const response = await apiClient.post(`/transactions/${transactionId}/generate-summary`);
    return response.data;
  },

  async clearTransactions(walletId) {
    const response = await apiClient.delete(`/transactions/wallet/${walletId}`);
    return response.data;
  },

  async signUp(email, uid) {
    const response = await apiClient.post('/auth/signup', { email, uid });
    return response.data;
  },

  async signIn(email, uid) {
    const response = await apiClient.post('/auth/login', { email, uid });
    return response.data;
  },

  // Generic post method for MetaMask authentication
  async post(url, data) {
    const response = await apiClient.post(url, data);
    return response;
  }
};
