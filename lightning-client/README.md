# Lightning Client - Scriptless Atomic Swaps

A complete implementation of scriptless atomic swaps between Lightning Network and Citrea using Schnorr signature proofs verified by a Citrea Lightning Oracle contract.

## 🚀 Features

- **Scriptless Atomic Swaps**: Exchange Lightning Network payments for Citrea tokens without HTLCs
- **Schnorr Signature Verification**: Uses Citrea's secp256k1 precompile for efficient signature verification
- **Lightning Web SDK Integration**: Built with `@getalby/lightning-tools` for Lightning Network operations
- **Real-time Updates**: WebSocket support for live payment monitoring
- **Modern UI**: Responsive web interface with real-time status updates
- **Oracle Contract**: Smart contract for on-chain payment verification
- **DeFi Integration**: Conditional actions based on verified payments

## 🏗️ Architecture

The system implements the following flow:

1. **Lightning Payment**: User pays a Lightning invoice
2. **Proof Generation**: Lightning receiver generates Schnorr signature proof
3. **Oracle Verification**: Citrea Lightning Oracle verifies the signature using precompile
4. **DeFi Action**: DeFi contract triggers conditional action (e.g., release tokens)

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Lightning       │    │ Citrea Lightning │    │ Citrea DeFi     │
│ Receiver        │───▶│ Oracle Contract  │───▶│ Contract        │
│                 │    │                  │    │                 │
│ Generates       │    │ Verifies Schnorr │    │ Triggers Action │
│ Schnorr Proof   │    │ Signature        │    │ (Release Tokens)│
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📦 Installation

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd lightning-client
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:

   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development servers**:
   ```bash
   npm run dev
   ```

This will start:

- Backend server on `http://localhost:3001`
- Frontend development server on `http://localhost:3000`
- WebSocket server on `http://localhost:3002`

## ⚙️ Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Lightning Network Configuration
LIGHTNING_RPC_URL=
LIGHTNING_MACAROON=

# Citrea Network Configuration
CITREA_RPC_URL=
CITREA_PRIVATE_KEY=y

# Oracle Contract Configuration
ORACLE_CONTRACT_ADDRESS=
DEFI_CONTRACT_ADDRESS=

# WebSocket Configuration
WS_PORT=3002
```

### Smart Contracts

Deploy the provided smart contracts to Citrea:

1. **LightningOracle.sol**: Oracle contract for payment verification
2. **DeFiContract.sol**: DeFi contract for conditional actions

## 🔧 Usage

### Creating an Atomic Swap

1. **Open the web interface** at `http://localhost:3000`
2. **Click "Create Swap"** to start a new atomic swap
3. **Enter swap details**:
   - Lightning address of the recipient
   - Amount in satoshis
   - DeFi action type (release tokens, unlock funds, etc.)
4. **Generate Lightning invoice** for payment
5. **Pay the invoice** using your Lightning wallet
6. **Wait for verification** - the system will automatically verify the payment and trigger the DeFi action

### API Endpoints

#### Lightning Network API

- `GET /api/lightning/address/:address` - Fetch Lightning address data
- `POST /api/lightning/invoice` - Request an invoice
- `POST /api/lightning/verify` - Verify payment
- `POST /api/lightning/proof` - Create payment proof
- `POST /api/lightning/boost` - Create boost payment
- `POST /api/lightning/zap` - Create zap payment

#### Swap API

- `POST /api/swap/create` - Create new swap
- `GET /api/swap/:id` - Get swap details
- `GET /api/swap` - List all swaps
- `POST /api/swap/:id/payment` - Process payment
- `POST /api/swap/:id/verify` - Verify and complete swap
- `GET /api/swap/stats` - Get swap statistics

#### Oracle API

- `POST /api/oracle/verify` - Verify payment proof on-chain
- `GET /api/oracle/payment/:hash` - Check payment verification
- `GET /api/oracle/payment/:hash/details` - Get payment details
- `GET /api/oracle/transaction/:hash` - Get transaction details
- `GET /api/oracle/block` - Get current block number
- `GET /api/oracle/wallet` - Get wallet information

### WebSocket Events

Connect to `ws://localhost:3002` for real-time updates:

```javascript
const ws = new WebSocket("ws://localhost:3002");

// Subscribe to payment updates
ws.send(
  JSON.stringify({
    type: "subscribe_payment",
    paymentHash: "your_payment_hash",
  })
);

// Subscribe to swap updates
ws.send(
  JSON.stringify({
    type: "subscribe_swap",
    swapId: "your_swap_id",
  })
);
```

## 🔐 Security

### Schnorr Signature Verification

The system uses BIP-340 Schnorr signatures for payment proofs:

1. **Message Creation**: `lightning_payment:${paymentHash}:${preimage}:${amount}:${timestamp}`
2. **Signature Generation**: Uses `noble-secp256k1` library
3. **On-chain Verification**: Uses Citrea's secp256k1 precompile at address `0x0000000000000000000000000000000000000200`

### Smart Contract Security

- **Access Control**: Only authorized contracts can trigger actions
- **Payment Verification**: Each payment can only be verified once
- **Emergency Functions**: Owner can manually verify payments if needed
- **Reentrancy Protection**: Safe external calls

## 🧪 Testing

Run the test suite:

```bash
npm test
```

### Manual Testing

1. **Start the servers**:

   ```bash
   npm run dev
   ```

2. **Test Lightning integration**:

   - Use a test Lightning address (e.g., `test@getalby.com`)
   - Create a small test swap
   - Verify payment processing

3. **Test Oracle integration**:
   - Check oracle status in the web interface
   - Verify payment proofs on-chain
   - Monitor transaction confirmations

## 📚 API Documentation

### Request/Response Examples

#### Create Swap

**Request**:

```json
POST /api/swap/create
{
  "lightningAddress": "recipient@lightning.address",
  "amount": 1000,
  "defiAction": {
    "type": "release_tokens",
    "recipient": "0x...",
    "amount": 1000
  }
}
```

**Response**:

```json
{
  "id": "swap_1234567890_abc123",
  "lightningAddress": "recipient@lightning.address",
  "amount": 1000,
  "defiAction": {
    "type": "release_tokens",
    "recipient": "0x...",
    "amount": 1000
  },
  "status": "pending",
  "createdAt": 1234567890
}
```

#### Payment Proof

**Request**:

```json
POST /api/lightning/proof
{
  "paymentHash": "abc123...",
  "preimage": "def456...",
  "amount": 1000,
  "lightningAddress": "recipient@lightning.address"
}
```

**Response**:

```json
{
  "paymentHash": "abc123...",
  "preimage": "def456...",
  "signature": "r_value_s_value...",
  "publicKey": "public_key_hex...",
  "timestamp": 1234567890,
  "amount": 1000
}
```

## 🚀 Deployment

### Production Build

```bash
npm run build
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/
EXPOSE 3001

CMD ["node", "dist/backend/server.js"]
```

### Environment Setup

1. **Set up Citrea node** with Schnorr precompile support
2. **Deploy smart contracts** to Citrea
3. **Configure Lightning node** with proper RPC access
4. **Set up reverse proxy** for production deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Add tests for new functionality
5. Commit your changes: `git commit -am 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [@getalby/lightning-tools](https://github.com/getAlby/js-lightning-tools) for Lightning Network integration
- [noble-secp256k1](https://github.com/paulmillr/noble-secp256k1) for Schnorr signature support
- [Citrea](https://citrea.xyz) for the Schnorr precompile implementation
- [BIP-340](https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki) for Schnorr signature specification

## 📞 Support

For support and questions:

- Create an issue on GitHub
- Join our Discord community
- Check the documentation wiki

---

**⚡ Built with Lightning ⚡**
