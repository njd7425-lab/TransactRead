import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Clock, Zap, Hash, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const TransactionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingSummary, setGeneratingSummary] = useState(false);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const data = await api.getTransaction(id);
        setTransaction(data);
      } catch (error) {
        console.error('Error fetching transaction:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [id]);

  const handleGenerateSummary = async () => {
    setGeneratingSummary(true);
    try {
      const response = await api.generateSummary(id);
      setTransaction(prev => ({
        ...prev,
        summary: response.summary
      }));
    } catch (error) {
      console.error('Error generating summary:', error);
      alert('Failed to generate summary. Please try again.');
    } finally {
      setGeneratingSummary(false);
    }
  };

  const formatValue = (value) => {
    const eth = Number(value) / Math.pow(10, 18);
    return eth.toFixed(6);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatGas = (gasUsed, gasPrice) => {
    if (!gasUsed || !gasPrice) return 'N/A';
    const gas = BigInt(gasUsed);
    const price = BigInt(gasPrice);
    const cost = gas * price;
    const eth = Number(cost) / Math.pow(10, 18);
    return eth.toFixed(6);
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Send':
        return 'text-red-600 bg-red-100';
      case 'Receive':
        return 'text-green-600 bg-green-100';
      case 'Swap':
        return 'text-blue-600 bg-blue-100';
      case 'NFT':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Transaction not found</h2>
          <p className="text-gray-600 mb-4">The transaction you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-900">Transaction Details</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(transaction.category)}`}>
                {transaction.category}
              </span>
            </div>
            {transaction.summary ? (
              <p className="mt-2 text-gray-600">{transaction.summary}</p>
            ) : (
              <div className="mt-2">
                <button
                  onClick={handleGenerateSummary}
                  disabled={generatingSummary}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className={`h-4 w-4 ${generatingSummary ? 'animate-spin' : ''}`} />
                  <span>{generatingSummary ? 'Generating...' : 'Generate AI Summary'}</span>
                </button>
                <p className="mt-1 text-sm text-gray-500">
                  Get an AI-powered explanation of this transaction
                </p>
              </div>
            )}
          </div>

          <div className="px-6 py-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Hash</label>
                <div className="flex items-center space-x-2">
                  <Hash className="h-4 w-4 text-gray-400" />
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                    {transaction.hash}
                  </code>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Timestamp</label>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{formatDate(transaction.timestamp)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Address</label>
                <div className="text-sm bg-gray-100 px-3 py-2 rounded font-mono break-all">
                  {transaction.from}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To Address</label>
                <div className="text-sm bg-gray-100 px-3 py-2 rounded font-mono break-all">
                  {transaction.to}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
                <div className="text-lg font-semibold text-gray-900">
                  {formatValue(transaction.value)} ETH
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gas Cost</label>
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {formatGas(transaction.gasUsed, transaction.gasPrice)} ETH
                  </span>
                </div>
              </div>
            </div>

            {transaction.method && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Method ID</label>
                <div className="text-sm bg-gray-100 px-3 py-2 rounded font-mono">
                  {transaction.method}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200">
              <a
                href={`https://etherscan.io/tx/${transaction.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700"
              >
                <ExternalLink className="h-4 w-4" />
                <span>View on Etherscan</span>
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TransactionDetail;
