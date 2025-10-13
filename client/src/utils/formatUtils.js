export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatValue = (value) => {
  if (!value) return '0';
  const eth = Number(value) / Math.pow(10, 18);
  return eth.toFixed(6);
};

export const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString();
};

export const formatDateTime = (timestamp) => {
  return new Date(timestamp).toLocaleString();
};

export const formatGas = (gasUsed, gasPrice) => {
  if (!gasUsed || !gasPrice) return 'N/A';
  const gas = BigInt(gasUsed);
  const price = BigInt(gasPrice);
  const cost = gas * price;
  const eth = Number(cost) / Math.pow(10, 18);
  return eth.toFixed(6);
};

export const getCategoryColor = (category) => {
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
