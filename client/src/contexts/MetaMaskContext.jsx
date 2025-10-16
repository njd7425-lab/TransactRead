import React, { createContext, useContext, useState, useEffect } from 'react';
// import { ethers } from 'ethers';
import { api } from '../services/api';

const MetaMaskContext = createContext();

export const useMetaMask = () => {
  const context = useContext(MetaMaskContext);
  if (!context) {
    throw new Error('useMetaMask must be used within a MetaMaskProvider');
  }
  return context;
};

export const MetaMaskProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    const hasEthereum = typeof window !== 'undefined' && window.ethereum;
    console.log('MetaMask check:', { hasEthereum, ethereum: window.ethereum });
    return hasEthereum;
  };

  // Connect to MetaMask
  const connectMetaMask = async () => {
    console.log('Attempting to connect to MetaMask...');
    
    if (!isMetaMaskInstalled()) {
      console.log('MetaMask not installed');
      setError('MetaMask is not installed. Please install MetaMask to continue.');
      return false;
    }

    setIsConnecting(true);
    setError(null);

    try {
      console.log('Requesting accounts from MetaMask...');
      
      // First, check if we already have accounts
      let accounts = await window.ethereum.request({
        method: 'eth_accounts',
      });

      console.log('Current accounts:', accounts);

      // If no accounts, request permission
      if (accounts.length === 0) {
        console.log('No accounts found, requesting permission...');
        accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
      }

      console.log('MetaMask accounts after request:', accounts);

      if (accounts.length > 0) {
        const account = accounts[0];
        console.log('Connected to account:', account);
        setAccount(account);
        setIsConnected(true);
        return account;
      } else {
        console.log('No accounts found after request');
        setError('No accounts found. Please make sure MetaMask is unlocked and has at least one account.');
        return false;
      }
    } catch (err) {
      console.error('Error connecting to MetaMask:', err);
      if (err.code === 4001) {
        setError('Please connect your MetaMask account to continue.');
      } else if (err.code === -32002) {
        setError('MetaMask connection request is already pending. Please check your MetaMask extension.');
      } else if (err.message && err.message.includes('wallet must have at least 1 account')) {
        setError('MetaMask wallet must have at least 1 account. Please create an account in MetaMask first.');
      } else {
        setError(`Failed to connect to MetaMask: ${err.message || 'Unknown error'}`);
      }
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  // Sign a message for authentication
  const signMessage = async (message) => {
    if (!account) {
      throw new Error('No account connected');
    }

    try {
      // Use MetaMask's personal_sign method directly
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, account],
      });
      return signature;
    } catch (err) {
      console.error('Error signing message:', err);
      throw new Error('Failed to sign message');
    }
  };

  // Authenticate with MetaMask (login/signup)
  const authenticateWithMetaMask = async () => {
    try {
      console.log('Starting MetaMask authentication...');
      
      const account = await connectMetaMask();
      if (!account) {
        console.log('No account returned from connectMetaMask');
        return false;
      }

      console.log('Account connected:', account);

      // Create a unique message for this authentication attempt
      const timestamp = Date.now();
      const message = `TransactRead Authentication\n\nAccount: ${account}\nTimestamp: ${timestamp}\n\nClick "Sign" to authenticate with TransactRead.`;

      console.log('Signing message:', message);

      // Sign the message
      const signature = await signMessage(message);
      console.log('Message signed successfully');

      console.log('Sending authentication request to backend...');
      // Send to backend for verification
      const response = await api.post('/auth/metamask', {
        address: account,
        message,
        signature,
        timestamp
      });

      console.log('Backend response:', response.data);

      if (response.data.success) {
        // Store the authentication token
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('Authentication successful, user data:', response.data.user);
        console.log('Stored in localStorage:', {
          token: response.data.token,
          user: response.data.user
        });
        return response.data.user;
      }

      console.log('Authentication failed - no success flag');
      return false;
    } catch (err) {
      console.error('MetaMask authentication error:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      if (err.response?.data?.error) {
        setError(`Authentication failed: ${err.response.data.error}`);
      } else if (err.message) {
        setError(`Authentication failed: ${err.message}`);
      } else {
        setError('Authentication failed. Please try again.');
      }
      return false;
    }
  };

  // Disconnect MetaMask
  const disconnect = () => {
    setAccount(null);
    setIsConnected(false);
    setError(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (isMetaMaskInstalled()) {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts',
          });

          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setIsConnected(true);
          }
        } catch (err) {
          console.error('Error checking MetaMask connection:', err);
        }
      }
    };

    checkConnection();

    // Listen for account changes
    if (isMetaMaskInstalled()) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          setAccount(accounts[0]);
          setIsConnected(true);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, []);

  const value = {
    account,
    isConnected,
    isConnecting,
    error,
    connectMetaMask,
    authenticateWithMetaMask,
    disconnect,
    isMetaMaskInstalled: isMetaMaskInstalled()
  };

  return (
    <MetaMaskContext.Provider value={value}>
      {children}
    </MetaMaskContext.Provider>
  );
};
