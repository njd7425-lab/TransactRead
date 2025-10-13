const request = require('supertest');
const app = require('../index');

describe('Integration Tests', () => {
  test('GET /wallets/:id/transactions should return transactions', async () => {
    const response = await request(app)
      .get('/wallets/test-wallet-id/transactions')
      .set('Authorization', 'Bearer test-token');
    
    expect(response.status).toBe(200);
  });

  test('Health check endpoint', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('OK');
  });
});
