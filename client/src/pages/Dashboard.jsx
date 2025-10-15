import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { useNavigate } from 'react-router-dom';
import { Plus, LogOut, Wallet } from 'lucide-react';
import WalletCard from '../components/WalletCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { wallets, loading, fetchWallets } = useWallet();
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [walletLabel, setWalletLabel] = useState('');
  const [addingWallet, setAddingWallet] = useState(false);
  const [addressError, setAddressError] = useState('');
  const [labelError, setLabelError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchWallets();
  }, []);

  const { addWallet } = useWallet();

  const validateEthereumAddress = (address) => {
    // Basic Ethereum address validation
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethAddressRegex.test(address);
  };

  const handleAddWallet = async (e) => {
    e.preventDefault();
    setAddressError('');
    setLabelError('');

    const trimmedAddress = walletAddress.trim();
    const trimmedLabel = walletLabel.trim();
    
    if (!trimmedAddress) {
      setAddressError('Wallet address is required');
      return;
    }

    if (!validateEthereumAddress(trimmedAddress)) {
      setAddressError('Please enter a valid Ethereum address (0x followed by 40 hexadecimal characters)');
      return;
    }

    if (trimmedLabel && trimmedLabel.length > 50) {
      setLabelError('Label must be 50 characters or less');
      return;
    }

    setAddingWallet(true);
    try {
      await addWallet(trimmedAddress, walletLabel.trim() || undefined);
      setWalletAddress('');
      setWalletLabel('');
      setShowAddWallet(false);
    } catch (error) {
      console.error('Error adding wallet:', error);
      setAddressError(error.response?.data?.error || 'Failed to add wallet');
    } finally {
      setAddingWallet(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const closeAddWalletModal = () => {
    setShowAddWallet(false);
    setWalletAddress('');
    setWalletLabel('');
    setAddressError('');
    setLabelError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Wallet className="h-8 w-8 text-primary-600" />
              <h1 className="ml-2 text-xl font-bold text-gray-900">TransactRead</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Your Wallets</h2>
            <p className="text-gray-600">Manage and analyze your Ethereum wallets</p>
          </div>
          <button
            onClick={() => setShowAddWallet(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Wallet</span>
          </button>
        </div>

        {wallets.length === 0 ? (
          <div className="text-center py-12">
            <Wallet className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No wallets</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first wallet address.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowAddWallet(true)}
                className="btn-primary"
              >
                Add your first wallet
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wallets.map((wallet) => (
              <WalletCard key={wallet.id} wallet={wallet} />
            ))}
          </div>
        )}

        {showAddWallet && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Wallet</h3>
              <form onSubmit={handleAddWallet}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Wallet Address
                    </label>
                    <input
                      type="text"
                      value={walletAddress}
                      onChange={(e) => {
                        setWalletAddress(e.target.value);
                        setAddressError(''); // Clear error when user types
                      }}
                      className={`input mt-1 ${addressError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="0x..."
                      required
                    />
                    {addressError && (
                      <p className="mt-1 text-sm text-red-600">{addressError}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Label (Optional)
                    </label>
                    <input
                      type="text"
                      value={walletLabel}
                      onChange={(e) => {
                        setWalletLabel(e.target.value);
                        setLabelError(''); // Clear error when user types
                      }}
                      className={`input mt-1 ${labelError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="My Main Wallet"
                      maxLength={50}
                    />
                    {labelError && (
                      <p className="mt-1 text-sm text-red-600">{labelError}</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={closeAddWalletModal}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addingWallet}
                    className="btn-primary disabled:opacity-50"
                  >
                    {addingWallet ? 'Adding...' : 'Add Wallet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
