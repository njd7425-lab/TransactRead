const axios = require('axios');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ETHERSCAN_API_URL = 'https://api.etherscan.io/api';

const fetchTransactionsFromEtherscan = async (address) => {
  try {
    const response = await axios.get(ETHERSCAN_API_URL, {
      params: {
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
    const prompt = `Summarize this Ethereum transaction in plain English: ${JSON.stringify(transaction)}`;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that explains Ethereum transactions simply.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 100,
      temperature: 0.7
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating summary:', error);
    return 'Summary unavailable — try again later.';
  }
};

module.exports = {
  fetchTransactionsFromEtherscan,
  generateSummary
};
