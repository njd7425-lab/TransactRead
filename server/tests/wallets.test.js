const request = require('supertest');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import routes
const walletRoutes = require('../routes/wallets');

describe('Wallet API Endpoints', () => {
  let app;
  let server;

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
    app.use('/api/wallets', walletRoutes);
    
    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({ error: 'Something went wrong!' });
    });
  });

  afterAll(async () => {
    // Clean up test data
    if (global.prisma) {
      await global.prisma.wallet.deleteMany({
        where: { userId: 'test-user-123' }
      });
    }
  });

  describe('POST /api/wallets', () => {
    it('should create a new wallet with valid data', async () => {
      const walletData = {
        address: '0x1234567890123456789012345678901234567890',
        label: 'Test Wallet'
      };

      const response = await request(app)
        .post('/api/wallets')
        .send(walletData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('address', walletData.address);
      expect(response.body).toHaveProperty('label', walletData.label);
      expect(response.body).toHaveProperty('userId', 'test-user-123');
    });

    it('should reject invalid Ethereum address', async () => {
      const invalidWalletData = {
        address: 'invalid-address',
        label: 'Invalid Wallet'
      };

      const response = await request(app)
        .post('/api/wallets')
        .send(invalidWalletData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject duplicate wallet address for same user', async () => {
      const walletData = {
        address: '0x9876543210987654321098765432109876543210',
        label: 'Duplicate Wallet'
      };

      // Create first wallet
      await request(app)
        .post('/api/wallets')
        .send(walletData)
        .expect(201);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/wallets')
        .send(walletData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('already exists');
    });

    it('should reject empty address', async () => {
      const invalidData = {
        address: '',
        label: 'Empty Address Wallet'
      };

      const response = await request(app)
        .post('/api/wallets')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('required');
    });
  });

  describe('GET /api/wallets', () => {
    beforeEach(async () => {
      // Clean up before each test
      if (global.prisma) {
        await global.prisma.wallet.deleteMany({
          where: { userId: 'test-user-123' }
        });
      }
    });

    it('should return empty array when no wallets exist', async () => {
      const response = await request(app)
        .get('/api/wallets')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return user wallets with transactions', async () => {
      // Create test wallets
      const wallet1 = await global.prisma.wallet.create({
        data: {
          address: '0x1111111111111111111111111111111111111111',
          label: 'Wallet 1',
          userId: 'test-user-123'
        }
      });

      const wallet2 = await global.prisma.wallet.create({
        data: {
          address: '0x2222222222222222222222222222222222222222',
          label: 'Wallet 2',
          userId: 'test-user-123'
        }
      });

      const response = await request(app)
        .get('/api/wallets')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('address');
      expect(response.body[0]).toHaveProperty('label');
      expect(response.body[0]).toHaveProperty('transactions');
    });
  });

  describe('GET /api/wallets/:id/transactions', () => {
    let testWallet;

    beforeEach(async () => {
      // Create test wallet
      testWallet = await global.prisma.wallet.create({
        data: {
          address: '0x3333333333333333333333333333333333333333',
          label: 'Test Wallet for Transactions',
          userId: 'test-user-123'
        }
      });
    });

    afterEach(async () => {
      // Clean up
      if (testWallet) {
        await global.prisma.wallet.delete({
          where: { id: testWallet.id }
        });
      }
    });

    it('should return transactions for valid wallet', async () => {
      const response = await request(app)
        .get(`/api/wallets/${testWallet.id}/transactions`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 404 for non-existent wallet', async () => {
      const response = await request(app)
        .get('/api/wallets/non-existent-id/transactions')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not found');
    });
  });
});
