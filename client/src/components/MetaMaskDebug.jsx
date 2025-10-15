import React from 'react';
import { useMetaMask } from '../contexts/MetaMaskContext';

const MetaMaskDebug = () => {
  const { 
    account, 
    isConnected, 
    isConnecting, 
    error, 
    connectMetaMask, 
    authenticateWithMetaMask,
    isMetaMaskInstalled 
  } = useMetaMask();

  const handleConnect = async () => {
    console.log('Manual connect attempt...');
    await connectMetaMask();
  };

  const handleAuth = async () => {
    console.log('Manual auth attempt...');
    await authenticateWithMetaMask();
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">MetaMask Debug Info</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>MetaMask Installed:</strong> {isMetaMaskInstalled ? 'Yes' : 'No'}
        </div>
        <div>
          <strong>Connected:</strong> {isConnected ? 'Yes' : 'No'}
        </div>
        <div>
          <strong>Connecting:</strong> {isConnecting ? 'Yes' : 'No'}
        </div>
        <div>
          <strong>Account:</strong> {account || 'None'}
        </div>
        <div>
          <strong>Error:</strong> {error || 'None'}
        </div>
      </div>

      <div className="mt-4 space-x-2">
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
        </button>
        
        <button
          onClick={handleAuth}
          disabled={!isConnected || isConnecting}
          className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
        >
          Authenticate
        </button>
      </div>

      <div className="mt-4">
        <h4 className="font-medium">Browser Info:</h4>
        <div className="text-xs text-gray-600">
          <div>User Agent: {navigator.userAgent}</div>
          <div>Ethereum: {window.ethereum ? 'Available' : 'Not Available'}</div>
          {window.ethereum && (
            <div>Ethereum Chain ID: {window.ethereum.chainId || 'Unknown'}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetaMaskDebug;
