import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownLeft, Zap, Image } from 'lucide-react';

const TransactionCard = ({ transaction }) => {
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Send':
        return <ArrowUpRight className="w-4 h-4 text-red-500" />;
      case 'Receive':
        return <ArrowDownLeft className="w-4 h-4 text-green-500" />;
      case 'Swap':
        return <Zap className="w-4 h-4 text-blue-500" />;
      case 'NFT':
        return <Image className="w-4 h-4 text-purple-500" />;
      default:
        return <Zap className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatValue = (value) => {
    const eth = Number(value) / Math.pow(10, 18);
    return eth.toFixed(6);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <Link to={`/transaction/${transaction.id}`} className="block">
      <div className="card hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getCategoryIcon(transaction.category)}
            <div>
              <p className="font-medium text-gray-900">
                {transaction.category} Transaction
              </p>
              <p className="text-sm text-gray-500">
                {formatDate(transaction.timestamp)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium text-gray-900">
              {formatValue(transaction.value)} ETH
            </p>
            <p className="text-sm text-gray-500">
              {transaction.category}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TransactionCard;
