const { PrismaClient } = require('@prisma/client');

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'file:./test.db';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.FIREBASE_PRIVATE_KEY = 'test-private-key';
process.env.FIREBASE_CLIENT_EMAIL = 'test@test.com';

// Create a test database instance
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./test.db'
    }
  }
});

// Mock Firebase Admin SDK
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn()
  },
  auth: jest.fn(() => ({
    verifyIdToken: jest.fn()
  })),
  apps: []
}));

// Mock external APIs
jest.mock('../services/etherscan', () => ({
  fetchTransactionsFromEtherscan: jest.fn(),
  generateSummary: jest.fn()
}));

// Global test setup
beforeAll(async () => {
  // Setup test database
  await prisma.$connect();
  
  // Create database tables if they don't exist
  try {
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "email" TEXT NOT NULL UNIQUE,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`;
    
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "Wallet" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "address" TEXT NOT NULL,
      "label" TEXT,
      "userId" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
      UNIQUE("address", "userId")
    )`;
    
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "Transaction" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "hash" TEXT NOT NULL UNIQUE,
      "from" TEXT NOT NULL,
      "to" TEXT,
      "value" TEXT NOT NULL,
      "method" TEXT,
      "timestamp" DATETIME NOT NULL,
      "gasUsed" TEXT,
      "gasPrice" TEXT,
      "category" TEXT,
      "summary" TEXT,
      "walletId" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE
    )`;
    
    // Create test user
    await prisma.$executeRaw`INSERT OR IGNORE INTO "User" (id, email, createdAt, updatedAt) VALUES ('test-user-123', 'test@example.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;
  } catch (error) {
    console.log('Database tables already exist or error creating them:', error.message);
  }
});

afterAll(async () => {
  // Cleanup
  await prisma.$disconnect();
});

// Make prisma available globally for tests
global.prisma = prisma;
