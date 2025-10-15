const request = require('supertest');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import routes
const transactionRoutes = require('../routes/transactions');
const { fetchTransactionsFromEtherscan, generateSummary } = require('../services/etherscan');

describe('Transaction API Endpoints', () => {
  let app;
  let testWallet;

  beforeAll(async () => {
    // Create Express app for testing
    app = express();
    
    // Apply middleware
    app.use(helmet());
    app.use(cors());
    app.use(express.json());
    
    // Mock authentication middleware
    app.use((req, res, next) => {
      req.user = { uid: 'test-user-123', email: 'test@example.com' };
      next();
    });
    
    // Apply routes
    app.use('/api/transactions', transactionRoutes);
    
    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({ error: 'Something went wrong!' });
    });

    // Create test wallet
    testWallet = await global.prisma.wallet.create({
      data: {
        address: '0x4444444444444444444444444444444444444444',
        label: 'Test Wallet for Transactions',
        userId: 'test-user-123'
      }
    });
  });

  afterAll(async () => {
    // Clean up test data
    if (global.prisma) {
      await global.prisma.transaction.deleteMany({
        where: { walletId: testWallet.id }
      });
      await global.prisma.wallet.deleteMany({
        where: { userId: 'test-user-123' }
      });
    }
  });

  describe('POST /api/transactions/sync/:walletId', () => {
    it('should sync transactions successfully', async () => {
      // Mock the fetchTransactionsFromEtherscan function
      const mockTransactions = [
        {
          hash: '0xabc123',
          from: '0x1111111111111111111111111111111111111111',
          to: '0x2222222222222222222222222222222222222222',
          value: '1000000000000000000',
          method: '0x',
          timestamp: new Date('2023-01-01'),
          gasUsed: '21000',
          gasPrice: '20000000000'
        }
      ];

      fetchTransactionsFromEtherscan.mockResolvedValue(mockTransactions);

      const response = await request(app)
        .post(`/api/transactions/sync/${testWallet.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('synced successfully');

      // Verify transaction was created in database
      const transactions = await global.prisma.transaction.findMany({
        where: { walletId: testWallet.id }
      });
      expect(transactions).toHaveLength(1);
      expect(transactions[0].hash).toBe('0xabc123');
    });

    it('should handle Etherscan API errors', async () => {
      // Mock API error
      fetchTransactionsFromEtherscan.mockRejectedValue(new Error('Etherscan API error'));

      const response = await request(app)
        .post(`/api/transactions/sync/${testWallet.id}`)
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 for non-existent wallet', async () => {
      const response = await request(app)
        .post('/api/transactions/sync/non-existent-id')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not found');
    });
  });

  describe('POST /api/transactions/:id/generate-summary', () => {
    let testTransaction;

    beforeEach(async () => {
      // Create test transaction
      testTransaction = await global.prisma.transaction.create({
        data: {
          hash: '0xtest123',
          from: '0x1111111111111111111111111111111111111111',
          to: '0x2222222222222222222222222222222222222222',
          value: '1000000000000000000',
          method: '0x',
          timestamp: new Date('2023-01-01'),
          gasUsed: '21000',
          gasPrice: '20000000000',
          walletId: testWallet.id,
          category: 'Send',
          summary: null
        }
      });
    });

    afterEach(async () => {
      // Clean up test transaction
      if (testTransaction) {
        await global.prisma.transaction.delete({
          where: { id: testTransaction.id }
        });
      }
    });

    it('should generate AI summary successfully', async () => {
      const mockSummary = 'This is a test transaction summary';
      generateSummary.mockResolvedValue(mockSummary);

      const response = await request(app)
        .post(`/api/transactions/${testTransaction.id}/generate-summary`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('summary', mockSummary);
      expect(response.body.message).toContain('generated successfully');

      // Verify summary was saved to database
      const updatedTransaction = await global.prisma.transaction.findUnique({
        where: { id: testTransaction.id }
      });
      expect(updatedTransaction.summary).toBe(mockSummary);
    });

    it('should handle AI API quota errors with fallback', async () => {
      // Mock quota error
      const quotaError = new Error('Rate limit exceeded');
      quotaError.status = 429;
      quotaError.code = 'insufficient_quota';
      generateSummary.mockRejectedValue(quotaError);

      const response = await request(app)
        .post(`/api/transactions/${testTransaction.id}/generate-summary`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('quota');
      expect(response.body).toHaveProperty('summary');

      // Verify fallback summary was saved
      const updatedTransaction = await global.prisma.transaction.findUnique({
        where: { id: testTransaction.id }
      });
      expect(updatedTransaction.summary).toBeTruthy();
    });

    it('should return 404 for non-existent transaction', async () => {
      const response = await request(app)
        .post('/api/transactions/non-existent-id/generate-summary')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not found');
    });
  });

  describe('DELETE /api/transactions/wallet/:walletId', () => {
    beforeEach(async () => {
      // Clean up any existing transactions first
      await global.prisma.transaction.deleteMany({
        where: { walletId: testWallet.id }
      });

      // Create test transactions
      await global.prisma.transaction.createMany({
        data: [
          {
            hash: '0xtest1',
            from: '0x1111111111111111111111111111111111111111',
            to: '0x2222222222222222222222222222222222222222',
            value: '1000000000000000000',
            method: '0x',
            timestamp: new Date('2023-01-01'),
            gasUsed: '21000',
            gasPrice: '20000000000',
            walletId: testWallet.id,
            category: 'Send'
          },
          {
            hash: '0xtest2',
            from: '0x3333333333333333333333333333333333333333',
            to: '0x4444444444444444444444444444444444444444',
            value: '2000000000000000000',
            method: '0x',
            timestamp: new Date('2023-01-02'),
            gasUsed: '21000',
            gasPrice: '20000000000',
            walletId: testWallet.id,
            category: 'Receive'
          }
        ]
      });
    });

    it('should clear all transactions for wallet', async () => {
      const response = await request(app)
        .delete(`/api/transactions/wallet/${testWallet.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('deletedCount');
      expect(response.body.message).toContain('cleared successfully');
      expect(response.body.deletedCount).toBe(2);

      // Verify transactions were deleted
      const remainingTransactions = await global.prisma.transaction.findMany({
        where: { walletId: testWallet.id }
      });
      expect(remainingTransactions).toHaveLength(0);
    });

    it('should return 404 for non-existent wallet', async () => {
      const response = await request(app)
        .delete('/api/transactions/wallet/non-existent-id')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not found');
    });
  });
});
