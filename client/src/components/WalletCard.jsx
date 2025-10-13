import { Link } from 'react-router-dom';
import { Wallet, ArrowRight } from 'lucide-react';

const WalletCard = ({ wallet }) => {
  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Link to={`/wallet/${wallet.id}`} className="block">
      <div className="card hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Wallet className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{wallet.label}</h3>
              <p className="text-sm text-gray-500">{formatAddress(wallet.address)}</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
        </div>
        {wallet.transactions && wallet.transactions.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              {wallet.transactions.length} recent transactions
            </p>
          </div>
        )}
      </div>
    </Link>
  );
};

export default WalletCard;
