const { fetchTransactionsFromEtherscan } = require('../services/etherscan');

describe('Etherscan API', () => {
  test('should handle API errors gracefully', async () => {
    const mockAxios = jest.fn().mockRejectedValue(new Error('API Error'));
    
    await expect(fetchTransactionsFromEtherscan('invalid-address')).rejects.toThrow();
  });
});
