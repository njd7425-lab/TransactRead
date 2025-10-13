const categorizeTransaction = (transaction) => {
  const { method, from, to, value } = transaction;
  
  if (value === '0') {
    return 'Contract Interaction';
  }
  
  if (method && method !== '0x') {
    if (method.includes('swap') || method.includes('exchange')) {
      return 'Swap';
    }
    if (method.includes('transfer') || method.includes('mint')) {
      return 'NFT';
    }
    return 'Contract Interaction';
  }
  
  return 'Send';
};

const formatValue = (value) => {
  const wei = BigInt(value);
  const eth = Number(wei) / Math.pow(10, 18);
  return eth.toFixed(6);
};

const formatGas = (gasUsed, gasPrice) => {
  const gas = BigInt(gasUsed);
  const price = BigInt(gasPrice);
  const cost = gas * price;
  const eth = Number(cost) / Math.pow(10, 18);
  return eth.toFixed(6);
};

module.exports = {
  categorizeTransaction,
  formatValue,
  formatGas
};
