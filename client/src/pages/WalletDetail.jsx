import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { ArrowLeft, RefreshCw, Search, Filter, Trash2 } from 'lucide-react';
import TransactionCard from '../components/TransactionCard';
import LoadingSpinner from '../components/LoadingSpinner';

const WalletDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { transactions, loading, fetchTransactions, syncTransactions, clearTransactions } = useWallet();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [syncing, setSyncing] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    fetchTransactions(id);
  }, [id]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncTransactions(id);
    } catch (error) {
      console.error('Error syncing transactions:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleClear = async () => {
    if (window.confirm('Are you sure you want to clear all transactions? This action cannot be undone.')) {
      setClearing(true);
      try {
        await clearTransactions(id);
      } catch (error) {
        console.error('Error clearing transactions:', error);
        alert('Failed to clear transactions. Please try again.');
      } finally {
        setClearing(false);
      }
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.summary?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'Send', 'Receive', 'Swap', 'NFT', 'Contract Interaction'];

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
          <div className="flex items-center h-16">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Wallet Transactions</h2>
            <p className="text-gray-600">{transactions.length} transactions found</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleClear}
              disabled={clearing || transactions.length === 0}
              className="btn-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className={`h-4 w-4 ${clearing ? 'animate-pulse' : ''}`} />
              <span>{clearing ? 'Clearing...' : 'Clear All'}</span>
            </button>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing...' : 'Sync Transactions'}</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions by hash or summary..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="input"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || categoryFilter !== 'all' ? 'No matching transactions' : 'No transactions found'}
            </h3>
            <p className="text-gray-500">
              {searchTerm || categoryFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'This wallet has no transaction history yet.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <TransactionCard key={transaction.id} transaction={transaction} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default WalletDetail;
