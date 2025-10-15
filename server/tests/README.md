# Backend API Tests

This directory contains unit tests for the TransactRead backend API.

## Test Structure

- `wallets.test.js` - Tests for wallet management endpoints
- `transactions.test.js` - Tests for transaction sync and AI summary endpoints
- `setup.js` - Test configuration and setup

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Coverage

The tests cover:

### Wallet API (`/api/wallets`)
- ✅ Creating new wallets with valid Ethereum addresses
- ✅ Rejecting invalid addresses
- ✅ Preventing duplicate wallets per user
- ✅ Retrieving user wallets
- ✅ Getting transactions for specific wallets

### Transaction API (`/api/transactions`)
- ✅ Syncing transactions from Etherscan
- ✅ Generating AI summaries for transactions
- ✅ Handling API quota errors with fallbacks
- ✅ Clearing all transactions for a wallet
- ✅ Error handling for non-existent resources

## Test Database

Tests use a separate SQLite test database (`test.db`) to avoid affecting development data.

## Mocking

- Firebase Admin SDK is mocked to avoid authentication issues
- External APIs (Etherscan, Gemini) are mocked to ensure consistent test results
- Database operations use a test-specific Prisma client instance
