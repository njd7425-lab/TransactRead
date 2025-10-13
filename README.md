# TransactRead

A lightweight web app that helps users analyze and interpret their Ethereum wallet activity. By connecting their wallet address, users can view categorized transaction histories, AI-generated summaries, and smart insights — all fetched from the Etherscan API and enhanced by an LLM-powered summarizer.

## 🎯 Problem Statement

Blockchain wallets are transparent but hard to interpret. A typical Etherscan page shows raw transaction data with cryptic contract calls, making it difficult for average users to understand where their funds are going. TransactRead aims to turn raw blockchain data into readable financial insights.

## 👤 Target Users

- **Crypto Enthusiasts & Learners** — who want to understand their wallet activity beyond hashes
- **Developers & Builders** — needing quick semantic summaries of transactions for testing or demos
- **Casual Users** — exploring wallet patterns (inflows/outflows, NFT transfers, gas usage)

## 🧩 Core Features

### 1. Wallet Lookup
- Users can enter or save an Ethereum address
- Fetch transactions using Etherscan API
- Display key data (hash, from/to, method, value, timestamp)

### 2. AI Transaction Summaries
- Use OpenAI GPT API to summarize wallet activity
- Example outputs: "Most of your outgoing transactions were Uniswap swaps"
- Summaries cached to reduce cost and latency

### 3. Transaction Categorization
- Auto-tag transactions as Send / Receive / Swap / NFT / Contract Interaction
- Uses simple heuristics and Etherscan's methodId

### 4. User Profiles (Auth)
- Email/password auth via Firebase Auth
- Each user can save up to 3 wallet addresses
- Profile page shows saved wallets and summaries

### 5. Transaction Detail View
- Click into a transaction to see detailed information
- Hash, method, from/to, gas, time, token
- LLM-generated one-line summary

## 🖥️ Frontend

**Tech Stack:** React (Vite), TailwindCSS, Context API for state

**Screens:**
- Login / Signup – Firebase Auth
- Dashboard (List View) – Saved wallets + summary
- Wallet Detail (List + Filter) – Transaction list, search by hash or tag
- Transaction Detail Page – Rich info + AI summary

**UX Requirements:**
- Loading / Empty / Error states
- Responsive layout (desktop + mobile)
- Accessible (alt text, contrast, keyboard nav)

## 🧠 AI Feature

**Feature:** Transaction Summarization
**Model:** OpenAI GPT-3.5-turbo
**Prompt Design:**
- System: You are a helpful assistant that explains Ethereum transactions simply
- User: Summarize this transaction JSON in plain English

**Safety:**
- No personal data sent to model
- Rate-limited + cached summaries
- Graceful fallback: "Summary unavailable — try again later"

## ⚙️ Backend

**Tech Stack:**
- Node.js (Express)
- SQLite + Prisma ORM
- Firebase Auth for user identity
- Etherscan API for on-chain data

**Entities:**
- User: id, email, createdAt
- Wallet: id, address, userId (FK), label
- Transaction: id, hash, walletId (FK), from, to, value, method, timestamp, summary

**API (REST):**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/signup | Create new account |
| POST | /auth/login | Login user |
| GET | /wallets | List user wallets |
| POST | /wallets | Add new wallet |
| GET | /wallets/:id/transactions | Fetch + summarize transactions |
| GET | /transactions/:id | Get detailed transaction info |

## 💾 Data Layer

**Database:** SQLite (via Prisma ORM)
- Simple, self-contained, and portable for grading
- Schema defined in `prisma/schema.prisma`
- Seed script populates sample data

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd NetDA
   ```

2. **Install dependencies**
   ```bash
   npm run setup
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   Edit `.env` with your API keys:
   - `ETHERSCAN_API_KEY` - Get from [Etherscan](https://etherscan.io/apis)
   - `OPENAI_API_KEY` - Get from [OpenAI](https://platform.openai.com/api-keys)
   - `FIREBASE_API_KEY` - Get from [Firebase Console](https://console.firebase.google.com/)

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001

### Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build the frontend for production
- `npm run seed` - Populate database with sample data
- `npm run test` - Run tests
- `npm start` - Start production server

## 🧪 Testing

The project includes basic testing setup:

- **Integration tests** - Test API endpoints
- **Unit tests** - Test individual functions
- **Etherscan API tests** - Test external API integration

Run tests with:
```bash
npm run test
```

## 📊 Seed Data

The seed script creates:
- 2 sample users
- 3 sample wallets
- 10-15 mock transactions with AI summaries

Run seeding with:
```bash
npm run seed
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./dev.db"
ETHERSCAN_API_KEY="your_etherscan_api_key"
OPENAI_API_KEY="your_openai_api_key"
FIREBASE_API_KEY="your_firebase_api_key"
FIREBASE_AUTH_DOMAIN="your_project.firebaseapp.com"
FIREBASE_PROJECT_ID="your_project_id"
JWT_SECRET="your_jwt_secret"
PORT=3001
```

### Firebase Setup

1. Create a Firebase project
2. Enable Authentication with Email/Password
3. Get your Firebase config
4. Update the environment variables

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

## 🧭 Future Enhancements

- Multi-chain support (Polygon, Base)
- Real-time transaction stream (WebSocket)
- MongoDB integration for scalable event logs
- AI classification model for transaction type prediction

## 📄 API Documentation

### Authentication Endpoints

**POST /auth/signup**
- Creates a new user account
- Body: `{ email, uid }`
- Returns: User object

**POST /auth/login**
- Authenticates user
- Body: `{ email, uid }`
- Returns: User object

### Wallet Endpoints

**GET /wallets**
- Lists all wallets for authenticated user
- Returns: Array of wallet objects

**POST /wallets**
- Adds a new wallet
- Body: `{ address, label? }`
- Returns: Wallet object

**GET /wallets/:id/transactions**
- Fetches transactions for a wallet
- Returns: Array of transaction objects

### Transaction Endpoints

**GET /transactions/:id**
- Gets detailed transaction information
- Returns: Transaction object

**POST /transactions/sync/:walletId**
- Syncs transactions from Etherscan
- Returns: Success message

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**TransactRead** - Making blockchain data human-readable, one transaction at a time.
