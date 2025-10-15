const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const ETHERSCAN_API_URL = 'https://api.etherscan.io/v2/api';

const fetchTransactionsFromEtherscan = async (address) => {
  try {
    const response = await axios.get(ETHERSCAN_API_URL, {
      params: {
        chainid: '1', // Ethereum Mainnet
        module: 'account',
        action: 'txlist',
        address,
        startblock: 0,
        endblock: 99999999,
        sort: 'desc',
        apikey: process.env.ETHERSCAN_API_KEY
      }
    });

    if (response.data.status !== '1') {
      throw new Error('Etherscan API error');
    }

    return response.data.result.map(tx => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      method: tx.methodId,
      timestamp: new Date(parseInt(tx.timeStamp) * 1000),
      gasUsed: tx.gasUsed,
      gasPrice: tx.gasPrice
    }));
  } catch (error) {
    console.error('Error fetching from Etherscan:', error);
    throw error;
  }
};

const generateSummary = async (transaction) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const prompt = `Provide a simple 1-2 line summary of this Ethereum transaction: ${JSON.stringify(transaction)}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return response.text();
  } catch (error) {
    console.error('Error generating summary:', error);
    throw error; // Re-throw the error so it can be handled by the route
  }
};

module.exports = {
  fetchTransactionsFromEtherscan,
  generateSummary
};
