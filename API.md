# TransactRead API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication

### Firebase Authentication
Include Firebase ID token in Authorization header:
```
Authorization: Bearer <firebase-id-token>
```

### MetaMask Authentication
Include JWT token in Authorization header:
```
Authorization: Bearer <jwt-token>
```

## Endpoints

### Wallets

#### List Wallets
```http
GET /wallets
```

**Response:**
```json
[
  {
    "id": "wallet-id",
    "address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "label": "My Main Wallet",
    "transactions": [
      {
        "id": "tx-id",
        "hash": "0x...",
        "value": "1.5",
        "timestamp": "2024-01-15T10:30:00Z"
      }
    ]
  }
]
```

#### Add Wallet
```http
POST /wallets
Content-Type: application/json

{
  "address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "label": "My Main Wallet"
}
```

**Response:**
```json
{
  "id": "wallet-id",
  "address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "label": "My Main Wallet",
  "userId": "user-uid"
}
```

**Errors:**
- `400` - Invalid Ethereum address format
- `409` - Wallet already exists
- `403` - Wallet limit exceeded (max 10)

#### Delete Wallet
```http
DELETE /wallets/:id
```

**Response:**
```json
{
  "message": "Wallet deleted successfully"
}
```

### Transactions

#### Get Transaction Details
```http
GET /transactions/:id
```

**Response:**
```json
{
  "id": "tx-id",
  "hash": "0x...",
  "from": "0x...",
  "to": "0x...",
  "value": "1.5",
  "timestamp": "2024-01-15T10:30:00Z",
  "summary": "Transfer of 1.5 ETH to exchange",
  "wallet": {
    "id": "wallet-id",
    "address": "0x...",
    "label": "My Wallet"
  }
}
```

#### Sync Wallet Transactions
```http
POST /transactions/sync/:walletId
```

**Response:**
```json
{
  "message": "Transactions synced successfully",
  "count": 15
}
```

#### Generate AI Summary
```http
POST /transactions/:id/generate-summary
```

**Response:**
```json
{
  "summary": "Transfer of 1.5 ETH to Binance exchange for trading",
  "confidence": 0.95
}
```

#### Clear Wallet Transactions
```http
DELETE /transactions/wallet/:walletId
```

**Response:**
```json
{
  "message": "Transactions cleared successfully",
  "count": 15
}
```

### Authentication

#### Firebase Signup
```http
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "uid": "firebase-uid"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "uid": "firebase-uid",
    "email": "user@example.com"
  }
}
```

#### Firebase Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "uid": "firebase-uid"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "uid": "firebase-uid",
    "email": "user@example.com"
  }
}
```

#### MetaMask Authentication
```http
POST /auth/metamask
Content-Type: application/json

{
  "address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "signature": "0x...",
  "message": "Sign this message to authenticate"
}
```

**Response:**
```json
{
  "token": "jwt-token",
  "user": {
    "address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "type": "metamask"
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid Ethereum address format"
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Wallet limit exceeded (max 10)"
}
```

### 404 Not Found
```json
{
  "error": "Wallet not found"
}
```

### 429 Too Many Requests
```json
{
  "error": "Rate limit exceeded"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to fetch wallets"
}
```

## Rate Limits

- **General API**: 100 requests per 15 minutes
- **AI Summaries**: 10 requests per minute
- **Transaction Sync**: 5 requests per minute

## Data Models

### Wallet
```typescript
interface Wallet {
  id: string;
  address: string;        // Ethereum address
  label: string;          // User-defined label
  userId: string;         // Owner user ID
  createdAt: Date;
  updatedAt: Date;
}
```

### Transaction
```typescript
interface Transaction {
  id: string;
  hash: string;           // Transaction hash
  from: string;           // Sender address
  to: string;             // Recipient address
  value: string;          // ETH amount
  timestamp: Date;        // Block timestamp
  summary?: string;       // AI-generated summary
  walletId: string;       // Associated wallet
}
```

### User
```typescript
interface User {
  uid: string;           // Firebase UID or MetaMask address
  email?: string;        // Email (Firebase users only)
  type: 'firebase' | 'metamask';
  createdAt: Date;
}
```

## Testing

### Sample Test Data
The seed script creates:
- 2 test users (Firebase + MetaMask)
- 3 wallets with sample transactions
- AI summaries for recent transactions

### Run Tests
```bash
cd server
npm test                 # Unit tests
npm run test:coverage    # Coverage report
```

### Test Endpoints
```bash
# Test wallet creation
curl -X POST http://localhost:3001/api/wallets \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"address":"0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6","label":"Test Wallet"}'

# Test transaction sync
curl -X POST http://localhost:3001/api/transactions/sync/<wallet-id> \
  -H "Authorization: Bearer <token>"
```
