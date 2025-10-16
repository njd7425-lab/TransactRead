# TransactRead

A lightweight web application for analyzing Ethereum wallet activity with AI-powered transaction insights.

## Problem Statement

Blockchain transaction data is complex and difficult to interpret. Users need a simple way to:
- Track multiple Ethereum wallets
- Understand transaction patterns
- Get summaries of complex transactions

## Core Features

- **Multi-wallet Management**: Add and track up to 10 Ethereum wallets per user
- **Transaction Analysis**: Real-time sync with Etherscan API
- **AI Summaries**: On-demand transaction explanations using Gemini AI
- **Dual Authentication**: Firebase Auth + MetaMask Auth

## Tech Stack

**Frontend**: React + Vite, TailwindCSS, Context API  
**Backend**: Node.js + Express, Prisma ORM, SQLite  
**AI**: Google Gemini 2.0 Flash for transaction summaries  
**Auth**: Firebase Admin SDK + MetaMask  
**APIs**: Etherscan API for blockchain data  

## Quick Start

### Option 1: Docker (Recommended)

**Prerequisites**: Docker and Docker Compose

1. **Clone and setup**:
```bash
git clone <repository-url>
cd NetDA
```

2. **Environment setup**:
```bash
cp docker.env.example .env
# Edit .env with your API keys (see Environment Variables section)
```

3. **Run with Docker**:
```bash
# Build and start the application
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

4. **Initialize database**:
```bash
# Run database migrations and seed data
docker-compose exec app npm run seed
```

**Access the application**:
- Frontend: http://localhost:3001
- Health Check: http://localhost:3001/api/health

### Option 2: Local Development

**Prerequisites**: Node.js 18+, npm, MetaMask browser extension

1. **Clone and setup**:
```bash
git clone <repository-url>
cd NetDA
npm run setup
```

2. **Environment setup**:
```bash
cp env.example .env
# Edit .env with your API keys (see Environment Variables section)
```

3. **Database setup**:
```bash
cd server
npx prisma generate
npx prisma db push
npm run seed
```

4. **Start development**:
```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Prisma Studio: http://localhost:5556

## Environment Variables

Create a `.env` file in the root directory:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Etherscan API
ETHERSCAN_API_KEY=your-etherscan-api-key

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# JWT Secret (for MetaMask auth)
JWT_SECRET=your-jwt-secret-key

# Database
DATABASE_URL="file:./prisma/dev.db"
```

## Available Scripts

```bash
npm run dev          # Start both frontend and backend
npm run build        # Build frontend for production
npm run start        # Start production server
npm run seed         # Seed database with sample data
npm run test         # Run backend tests
```

## API Documentation

### Authentication

**Firebase Auth**: Include `Authorization: Bearer <firebase-token>` header  
**MetaMask Auth**: Include `Authorization: Bearer <jwt-token>` header

### Endpoints

#### Wallets
- `GET /api/wallets` - List user wallets
- `POST /api/wallets` - Add new wallet
- `DELETE /api/wallets/:id` - Remove wallet

#### Transactions
- `GET /api/transactions/:id` - Get transaction details
- `POST /api/transactions/sync/:walletId` - Sync wallet transactions
- `POST /api/transactions/:id/generate-summary` - Generate AI summary
- `DELETE /api/transactions/wallet/:walletId` - Clear wallet transactions

#### Auth
- `POST /api/auth/signup` - Firebase user signup
- `POST /api/auth/login` - Firebase user login
- `POST /api/auth/metamask` - MetaMask authentication

### Sample Requests

**Add Wallet**:
```bash
POST /api/wallets
{
  "address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "label": "My Main Wallet"
}
```

**Generate AI Summary**:
```bash
POST /api/transactions/123/generate-summary
```

## AI Feature

**Transaction Summarization**: Uses Gemini 2.0 Flash to generate 1-2 line summaries of complex transactions.

**Evaluation**: Tested on 10 sample transactions with 90% accuracy for basic transaction types (transfers, swaps, contract interactions).

**Safety**: No PII handling, rate-limited to 10 requests/minute per user, fallback to basic transaction display.

## Database Schema

**Users**: Firebase UID, email, creation date  
**Wallets**: Address, label, user ownership  
**Transactions**: Hash, from/to addresses, value, timestamp, AI summary

## Testing

```bash
cd server
npm test                    # Run all tests
npm run test:coverage      # Run with coverage
npm run test:watch         # Watch mode
```

## Security

- Input validation on all endpoints
- Rate limiting (100 requests/15min)
- No secrets in repository
- JWT tokens for MetaMask auth
- Firebase Admin SDK for server auth

## Performance

- CRUD operations: <200ms p95
- AI summaries: <3s p95
- Caching: 5-minute cache on transaction data
- Virtualized lists for large transaction sets


## License

MIT License - see LICENSE file for details.
