# API Documentation

## Overview

The Lightning Client API provides endpoints for managing atomic swaps between Lightning Network and Citrea using Schnorr signature proofs.

## Base URL

- Development: `http://localhost:3001/api`
- Production: `https://your-domain.com/api`

## Authentication

Currently, no authentication is required. In production, consider implementing API keys or JWT tokens.

## Response Format

All responses are in JSON format. Error responses include an `error` field with a descriptive message.

### Success Response

```json
{
  "data": "response_data"
}
```

### Error Response

```json
{
  "error": "Error message describing what went wrong"
}
```

## Lightning Network API

### GET /lightning/address/:address

Fetch Lightning address data and capabilities.

**Parameters:**

- `address` (string, required): Lightning address (e.g., `user@domain.com`)

**Response:**

```json
{
  "address": "user@domain.com",
  "lnurlpData": {
    "callback": "https://domain.com/lnurlp/callback",
    "maxSendable": 1000000,
    "minSendable": 1000,
    "metadata": "[[\"text/plain\",\"Payment description\"]]",
    "tag": "payRequest"
  },
  "keysendData": {
    "callback": "https://domain.com/keysend/callback",
    "maxSendable": 1000000,
    "minSendable": 1000,
    "tag": "keysend"
  },
  "isSupported": true
}
```

### POST /lightning/invoice

Request an invoice from a Lightning address.

**Request Body:**

```json
{
  "address": "user@domain.com",
  "amount": 1000,
  "description": "Payment description (optional)"
}
```

**Response:**

```json
{
  "paymentRequest": "lnbc10u1p3...",
  "paymentHash": "abc123...",
  "amount": 1000,
  "description": "Payment description",
  "timestamp": 1234567890,
  "expiry": 3600
}
```

### POST /lightning/verify

Verify if an invoice has been paid.

**Request Body:**

```json
{
  "paymentRequest": "lnbc10u1p3..."
}
```

**Response:**

```json
{
  "isPaid": true,
  "invoice": {
    "paymentRequest": "lnbc10u1p3...",
    "paymentHash": "abc123...",
    "amount": 1000,
    "description": "Payment description",
    "timestamp": 1234567890,
    "expiry": 3600
  },
  "preimage": "def456..." // Only present if paid
}
```

### POST /lightning/proof

Create a payment proof with Schnorr signature.

**Request Body:**

```json
{
  "paymentHash": "abc123...",
  "preimage": "def456...",
  "amount": 1000,
  "lightningAddress": "user@domain.com"
}
```

**Response:**

```json
{
  "paymentHash": "abc123...",
  "preimage": "def456...",
  "signature": "r_value_s_value_concatenated...",
  "publicKey": "public_key_hex...",
  "timestamp": 1234567890,
  "amount": 1000
}
```

### POST /lightning/boost

Create a boost payment (value-for-value).

**Request Body:**

```json
{
  "address": "user@domain.com",
  "amount": 1000,
  "metadata": {
    "app_name": "Lightning Client",
    "app_version": "1.0.0",
    "name": "Sender Name",
    "sender_name": "Sender Name"
  }
}
```

**Response:**

```json
{
  "preimage": "def456..."
}
```

### POST /lightning/zap

Create a zap payment (Nostr integration).

**Request Body:**

```json
{
  "address": "user@domain.com",
  "amount": 1000,
  "options": {
    "comment": "Awesome post!",
    "relays": ["wss://relay.damus.io"],
    "e": "event_id",
    "p": "pubkey"
  }
}
```

**Response:**

```json
{
  "preimage": "def456..."
}
```

## Swap API

### POST /swap/create

Create a new atomic swap.

**Request Body:**

```json
{
  "lightningAddress": "recipient@lightning.address",
  "amount": 1000,
  "defiAction": {
    "type": "release_tokens",
    "recipient": "0x...",
    "amount": 1000,
    "metadata": {
      "description": "Swap description"
    }
  }
}
```

**Response:**

```json
{
  "id": "swap_1234567890_abc123",
  "lightningAddress": "recipient@lightning.address",
  "amount": 1000,
  "defiAction": {
    "type": "release_tokens",
    "recipient": "0x...",
    "amount": 1000,
    "metadata": {
      "description": "Swap description"
    }
  },
  "status": "pending",
  "createdAt": 1234567890
}
```

### GET /swap/:id

Get swap details by ID.

**Parameters:**

- `id` (string, required): Swap ID

**Response:**

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
  "status": "completed",
  "createdAt": 1234567890,
  "paymentProof": {
    "paymentHash": "abc123...",
    "preimage": "def456...",
    "signature": "r_value_s_value...",
    "publicKey": "public_key_hex...",
    "timestamp": 1234567890,
    "amount": 1000
  },
  "transactionHash": "0x..."
}
```

### GET /swap

List all swaps with optional filtering.

**Query Parameters:**

- `status` (string, optional): Filter by status (`pending`, `paid`, `verified`, `completed`, `failed`)

**Response:**

```json
[
  {
    "id": "swap_1234567890_abc123",
    "lightningAddress": "recipient@lightning.address",
    "amount": 1000,
    "defiAction": {
      "type": "release_tokens",
      "recipient": "0x...",
      "amount": 1000
    },
    "status": "completed",
    "createdAt": 1234567890
  }
]
```

### POST /swap/:id/payment

Process a Lightning payment for a swap.

**Parameters:**

- `id` (string, required): Swap ID

**Request Body:**

```json
{
  "paymentHash": "abc123..."
}
```

**Response:**

```json
{
  "success": true
}
```

### POST /swap/:id/verify

Verify payment proof and complete swap.

**Parameters:**

- `id` (string, required): Swap ID

**Request Body:**

```json
{
  "preimage": "def456..."
}
```

**Response:**

```json
{
  "success": true
}
```

### GET /swap/stats

Get swap statistics.

**Response:**

```json
{
  "total": 100,
  "pending": 5,
  "paid": 10,
  "verified": 15,
  "completed": 65,
  "failed": 5
}
```

## Oracle API

### POST /oracle/verify

Verify a payment proof on-chain.

**Request Body:**

```json
{
  "proof": {
    "paymentHash": "abc123...",
    "preimage": "def456...",
    "signature": "r_value_s_value...",
    "publicKey": "public_key_hex...",
    "timestamp": 1234567890,
    "amount": 1000
  }
}
```

**Response:**

```json
{
  "isValid": true,
  "paymentHash": "abc123...",
  "amount": 1000,
  "timestamp": 1234567890
}
```

### GET /oracle/payment/:hash

Check if a payment has been verified on-chain.

**Parameters:**

- `hash` (string, required): Payment hash

**Response:**

```json
{
  "isVerified": true
}
```

### GET /oracle/payment/:hash/details

Get payment details from the oracle contract.

**Parameters:**

- `hash` (string, required): Payment hash

**Response:**

```json
{
  "amount": 1000,
  "timestamp": 1234567890,
  "verified": true
}
```

### GET /oracle/transaction/:hash

Get transaction details.

**Parameters:**

- `hash` (string, required): Transaction hash

**Response:**

```json
{
  "hash": "0x...",
  "from": "0x...",
  "to": "0x...",
  "value": "1000000000000000000",
  "gasUsed": "21000",
  "status": "confirmed",
  "blockNumber": 12345,
  "timestamp": 1234567890
}
```

### GET /oracle/block

Get current block number.

**Response:**

```json
{
  "blockNumber": 12345
}
```

### GET /oracle/wallet

Get wallet information.

**Response:**

```json
{
  "address": "0x...",
  "balance": "1.5"
}
```

## WebSocket API

Connect to `ws://localhost:3002` for real-time updates.

### Connection

```javascript
const ws = new WebSocket("ws://localhost:3002");
```

### Subscribe to Payment Updates

```javascript
ws.send(
  JSON.stringify({
    type: "subscribe_payment",
    paymentHash: "abc123...",
  })
);
```

### Subscribe to Swap Updates

```javascript
ws.send(
  JSON.stringify({
    type: "subscribe_swap",
    swapId: "swap_1234567890_abc123",
  })
);
```

### Event Messages

#### Payment Verified Event

```json
{
  "type": "payment_event",
  "event": {
    "type": "PaymentVerified",
    "paymentHash": "abc123...",
    "verifier": "0x...",
    "amount": 1000,
    "timestamp": 1234567890,
    "transactionHash": "0x..."
  }
}
```

#### Payment Rejected Event

```json
{
  "type": "payment_event",
  "event": {
    "type": "PaymentRejected",
    "paymentHash": "abc123...",
    "reason": "Invalid signature",
    "transactionHash": "0x..."
  }
}
```

#### Swap Updated Event

```json
{
  "type": "swap_updated",
  "swap": {
    "id": "swap_1234567890_abc123",
    "status": "completed",
    "transactionHash": "0x..."
  }
}
```

## Error Codes

| Code | Description                            |
| ---- | -------------------------------------- |
| 400  | Bad Request - Invalid input parameters |
| 404  | Not Found - Resource not found         |
| 500  | Internal Server Error - Server error   |

## Rate Limiting

Currently, no rate limiting is implemented. In production, consider implementing rate limiting to prevent abuse.

## CORS

CORS is enabled for all origins in development. In production, configure CORS to only allow trusted domains.

## Examples

### Complete Swap Flow

1. **Create Swap**:

   ```bash
   curl -X POST http://localhost:3001/api/swap/create \
     -H "Content-Type: application/json" \
     -d '{
       "lightningAddress": "test@getalby.com",
       "amount": 1000,
       "defiAction": {
         "type": "release_tokens",
         "recipient": "0x...",
         "amount": 1000
       }
     }'
   ```

2. **Request Invoice**:

   ```bash
   curl -X POST http://localhost:3001/api/lightning/invoice \
     -H "Content-Type: application/json" \
     -d '{
       "address": "test@getalby.com",
       "amount": 1000,
       "description": "Test payment"
     }'
   ```

3. **Verify Payment**:

   ```bash
   curl -X POST http://localhost:3001/api/lightning/verify \
     -H "Content-Type: application/json" \
     -d '{
       "paymentRequest": "lnbc10u1p3..."
     }'
   ```

4. **Process Payment**:

   ```bash
   curl -X POST http://localhost:3001/api/swap/swap_123/payment \
     -H "Content-Type: application/json" \
     -d '{
       "paymentHash": "abc123..."
     }'
   ```

5. **Verify and Complete**:
   ```bash
   curl -X POST http://localhost:3001/api/swap/swap_123/verify \
     -H "Content-Type: application/json" \
     -d '{
       "preimage": "def456..."
     }'
   ```
