import React, { useState } from 'react';

const MetaMaskTest = () => {
  const [status, setStatus] = useState('Not tested');
  const [account, setAccount] = useState(null);
  const [error, setError] = useState(null);

  const testMetaMask = async () => {
    setStatus('Testing...');
    setError(null);
    setAccount(null);

    try {
      // Check if MetaMask is available
      if (typeof window === 'undefined' || !window.ethereum) {
        setStatus('MetaMask not detected');
        setError('MetaMask extension not found');
        return;
      }

      setStatus('MetaMask detected, checking accounts...');

      // First check existing accounts
      let accounts = await window.ethereum.request({
        method: 'eth_accounts',
      });

      console.log('Current accounts:', accounts);

      // If no accounts, request permission
      if (accounts.length === 0) {
        setStatus('No accounts found, requesting permission...');
        try {
          accounts = await window.ethereum.request({
            method: 'eth_requestAccounts',
          });
        } catch (requestErr) {
          console.error('Error requesting accounts:', requestErr);
          if (requestErr.code === 4001) {
            setStatus('User rejected connection');
            setError('User rejected the connection request. Please try again and click "Connect" in MetaMask.');
            return;
          } else if (requestErr.message && requestErr.message.includes('wallet must have at least 1 account')) {
            setStatus('MetaMask has no accounts');
            setError('MetaMask wallet must have at least 1 account. Please create an account in MetaMask first.');
            return;
          } else {
            setStatus('Connection request failed');
            setError(`Connection failed: ${requestErr.message}`);
            return;
          }
        }
      }

      console.log('Accounts after request:', accounts);

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setStatus('Connected successfully');
      } else {
        setStatus('No accounts found');
        setError('No accounts available. Make sure MetaMask is unlocked and has at least one account.');
      }
    } catch (err) {
      setStatus('Connection failed');
      setError(err.message);
      console.error('MetaMask test error:', err);
    }
  };

  const checkMetaMaskStatus = async () => {
    setStatus('Checking MetaMask status...');
    setError(null);

    try {
      // First check if we're in a browser environment
      if (typeof window === 'undefined') {
        setStatus('Not in browser environment');
        setError('This test must be run in a browser');
        return;
      }

      // Check if MetaMask is available
      if (!window.ethereum) {
        setStatus('MetaMask not detected');
        setError('MetaMask extension not found. Please install MetaMask from https://metamask.io/');
        return;
      }

      // Check if it's actually MetaMask
      if (!window.ethereum.isMetaMask) {
        setStatus('MetaMask not detected');
        setError('MetaMask extension not found. Please install MetaMask from https://metamask.io/');
        return;
      }

      setStatus('MetaMask detected, checking accounts...');

      // Check if MetaMask is locked by trying to get accounts
      let accounts = [];
      try {
        accounts = await window.ethereum.request({
          method: 'eth_accounts',
        });
      } catch (err) {
        console.error('Error getting accounts:', err);
        setStatus('MetaMask is locked');
        setError('MetaMask is locked. Please unlock MetaMask and try again.');
        return;
      }

      console.log('MetaMask status check - accounts:', accounts);

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setStatus(`MetaMask unlocked with ${accounts.length} account(s)`);
      } else {
        setStatus('MetaMask is locked or has no accounts');
        setError('MetaMask is locked or has no accounts. Please unlock MetaMask and ensure you have at least one account.');
      }
    } catch (err) {
      setStatus('Status check failed');
      setError(`Error: ${err.message || 'Unknown error'}`);
      console.error('MetaMask status check error:', err);
    }
  };

  const runDiagnostics = () => {
    setStatus('Running diagnostics...');
    setError(null);

    const diagnostics = {
      'Browser Environment': typeof window !== 'undefined' ? 'Yes' : 'No',
      'Window.ethereum': window.ethereum ? 'Available' : 'Not Available',
      'Is MetaMask': window.ethereum?.isMetaMask ? 'Yes' : 'No',
      'User Agent': navigator.userAgent,
      'Chain ID': window.ethereum?.chainId || 'Unknown',
      'Network Version': window.ethereum?.networkVersion || 'Unknown',
    };

    console.log('MetaMask Diagnostics:', diagnostics);
    
    setStatus('Diagnostics complete - check console for details');
    setError('Check browser console for detailed diagnostics');
  };

  const testSignMessage = async () => {
    if (!account) {
      setError('No account connected');
      return;
    }

    try {
      setStatus('Testing message signing...');
      
      const message = 'Hello from TransactRead!';
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, account],
      });

      setStatus('Message signed successfully');
      console.log('Signature:', signature);
    } catch (err) {
      setStatus('Signing failed');
      setError(err.message);
      console.error('Signing error:', err);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-blue-50">
      <h3 className="text-lg font-semibold mb-4">MetaMask Simple Test</h3>
      
      <div className="space-y-2 text-sm">
        <div><strong>Status:</strong> {status}</div>
        <div><strong>Account:</strong> {account || 'None'}</div>
        <div><strong>Error:</strong> {error || 'None'}</div>
        <div><strong>MetaMask Available:</strong> {typeof window !== 'undefined' && window.ethereum ? 'Yes' : 'No'}</div>
      </div>

      <div className="mt-4 space-x-2">
        <button
          onClick={runDiagnostics}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Run Diagnostics
        </button>
        
        <button
          onClick={checkMetaMaskStatus}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Check MetaMask Status
        </button>
        
        <button
          onClick={testMetaMask}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test MetaMask Connection
        </button>
        
        <button
          onClick={testSignMessage}
          disabled={!account}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Test Message Signing
        </button>
      </div>

      <div className="mt-4 text-xs text-gray-600">
        <div>User Agent: {navigator.userAgent}</div>
        <div>Window.ethereum: {window.ethereum ? 'Available' : 'Not Available'}</div>
        {window.ethereum && (
          <>
            <div>Chain ID: {window.ethereum.chainId || 'Unknown'}</div>
            <div>Is MetaMask: {window.ethereum.isMetaMask ? 'Yes' : 'No'}</div>
          </>
        )}
      </div>
    </div>
  );
};

export default MetaMaskTest;
