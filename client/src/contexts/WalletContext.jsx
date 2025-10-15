import { createContext, useContext, useState } from 'react';
import { api } from '../services/api';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWallets = async () => {
    setLoading(true);
    try {
      const data = await api.getWallets();
      setWallets(data);
    } catch (error) {
      console.error('Error fetching wallets:', error);
    } finally {
      setLoading(false);
    }
  };

  const addWallet = async (address, label) => {
    try {
      const wallet = await api.addWallet(address, label);
      setWallets(prev => [...prev, wallet]);
      return wallet;
    } catch (error) {
      console.error('Error adding wallet:', error);
      throw error;
    }
  };

  const fetchTransactions = async (walletId) => {
    setLoading(true);
    try {
      const data = await api.getTransactions(walletId);
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncTransactions = async (walletId) => {
    try {
      await api.syncTransactions(walletId);
      await fetchTransactions(walletId);
    } catch (error) {
      console.error('Error syncing transactions:', error);
      throw error;
    }
  };

  const clearTransactions = async (walletId) => {
    try {
      await api.clearTransactions(walletId);
      setTransactions([]);
    } catch (error) {
      console.error('Error clearing transactions:', error);
      throw error;
    }
  };

  const value = {
    wallets,
    transactions,
    loading,
    fetchWallets,
    addWallet,
    fetchTransactions,
    syncTransactions,
    clearTransactions
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
