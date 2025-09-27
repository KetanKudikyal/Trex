# Trex Lightning DeFi Contracts

This repository contains smart contracts for the Trex Lightning DeFi system that integrates Lightning Network payments with DeFi functionality using Citrea's Schnorr signature verification precompiles.

## Contracts

### Core Contracts

1. **LightningOracle.sol** - Oracle contract that verifies Lightning Network payment proofs using Schnorr signatures via Citrea's precompile
2. **DeFiContract.sol** - Main DeFi contract that executes actions based on verified Lightning payments
3. **TrexToken.sol** - ERC20 token contract for the Trex ecosystem

### Additional Contracts

4. **P256R1VerifyCaller.sol** - Example contract demonstrating secp256r1 signature verification

## Features

- **Lightning Payment Verification**: Verifies Lightning Network payment proofs using Schnorr signatures
- **Token Minting**: Automatically mints tokens when Lightning payments are verified
- **DeFi Actions**: Supports various DeFi actions like staking, voting, and custom actions
- **Oracle Integration**: Secure oracle-based payment verification system
- **Emergency Functions**: Owner-controlled emergency verification for testing

## Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- Node.js (for testing)

## Setup

1. Clone the repository and navigate to the contracts directory:

```bash
cd trex-contracts
```

2. Install dependencies:

```bash
forge install
```

3. Copy the environment file and add your configuration:

```bash
cp env.example .env
```

4. Edit `.env` with your configuration:

```bash
# Add your private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Add RPC URLs for your target networks
CITREA_RPC_URL=https://rpc.citrea.xyz
CITREA_TESTNET_RPC_URL=https://rpc-testnet.citrea.xyz
```

## Building

Compile the contracts:

```bash
forge build
```

## Testing

Run the test suite:

```bash
forge test
```

Run tests with gas reporting:

```bash
forge test --gas-report
```

## Deployment

### Local Development (Anvil)

1. Start a local Anvil node:

```bash
anvil
```

2. Deploy to local network:

```bash
forge script script/DeployTrexContracts.s.sol --rpc-url http://localhost:8545 --broadcast
```

### Citrea Testnet

Deploy to Citrea testnet:

```bash
forge script script/DeployTrexContracts.s.sol --rpc-url citrea_testnet --broadcast --verify
```

### Citrea Mainnet

Deploy to Citrea mainnet:

```bash
forge script script/DeployTrexContracts.s.sol --rpc-url citrea --broadcast --verify
```

## Contract Architecture

```
LightningOracle ←→ DeFiContract ←→ TrexToken
      ↑                ↑              ↑
   Verifies        Executes        Mints
   Payments        Actions         Tokens
```

### Deployment Order

1. **TrexToken** - Deploy the ERC20 token contract
2. **LightningOracle** - Deploy the oracle contract (initially with zero DeFi contract address)
3. **DeFiContract** - Deploy the main DeFi contract with oracle and token addresses
4. **Setup** - Configure the oracle to point to the DeFi contract and set the token minter

## Usage

### Verifying Lightning Payments

The system verifies Lightning Network payments using Schnorr signatures. The verification process:

1. Payment hash and preimage are provided
2. Schnorr signature is verified using Citrea's precompile
3. If valid, the DeFi contract is notified
4. Tokens are minted to the payment recipient

### Emergency Verification

For testing purposes, the owner can use emergency verification:

```solidity
oracle.emergencyVerifyPayment(paymentHash, amount);
```

### Custom Actions

The DeFi contract supports various actions:

- Token minting (automatic on payment verification)
- Fund unlocking
- NFT creation
- Custom actions (staking, voting, etc.)

## Security Considerations

- The oracle contract is the only entity that can trigger DeFi actions
- Emergency verification should only be used for testing
- All contracts include proper access controls and modifiers
- Payment hashes are tracked to prevent double-processing

## Gas Optimization

The contracts are optimized for gas efficiency:

- Uses Solidity 0.8.19 with optimizer enabled
- Efficient storage patterns
- Minimal external calls

## Network Compatibility

These contracts are specifically designed for Citrea network, which provides:

- Schnorr signature verification precompile at `0x0200`
- secp256r1 signature verification precompile at `0x0100`
- EVM compatibility with additional cryptographic primitives

## License

MIT License - see individual contract files for details.
