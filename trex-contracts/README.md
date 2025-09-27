# Trex Lightning DeFi Contracts

This repository contains smart contracts for the Trex Lightning DeFi system that integrates Lightning Network payments with DeFi functionality using Citrea's Schnorr signature verification precompiles. The protocol enables **liquidity mining** from Lightning Network to Citrea node hubs, incentivizing users to provide Lightning liquidity.

## 🎯 Protocol Overview

**Mining Lightning Liquidity for Citrea Node Hubs**

The Trex protocol creates a symbiotic relationship between Lightning Network liquidity providers and Citrea node operators:

- **Citrea Node Hubs** generate Lightning invoices to increase their inbound liquidity for routing
- **Users** pay these invoices, effectively providing liquidity to the nodes
- **Protocol** rewards liquidity providers with cBTC and reward tokens
- **Privacy** is preserved through Schnorr-Private-2.0 approach

## Contracts

### Original Version (Public)

1. **LightningOracle.sol** - Oracle contract that verifies Lightning Network payment proofs using Schnorr signatures via Citrea's precompile
2. **DeFiContract.sol** - Main DeFi contract that executes actions based on verified Lightning payments
3. **TrexToken.sol** - ERC20 token contract for the Trex ecosystem

### Schnorr-Private-2.0 Version (Privacy-Preserving)

4. **LightningOraclePrivate.sol** - Privacy-preserving oracle that accepts arbitrary msgHash without exposing Lightning invoice details
5. **DeFiContractPrivate.sol** - Incentive contract that allocates cBTC and reward tokens to liquidity providers
6. **TrexToken.sol** - Shared ERC20 token contract (used by both versions)

### Additional Contracts

7. **P256R1VerifyCaller.sol** - Example contract demonstrating secp256r1 signature verification

## Features

### Original Version

- **Lightning Payment Verification**: Verifies Lightning Network payment proofs using Schnorr signatures
- **Token Minting**: Automatically mints tokens when Lightning payments are verified
- **DeFi Actions**: Supports various DeFi actions like staking, voting, and custom actions
- **Oracle Integration**: Secure oracle-based payment verification system
- **Emergency Functions**: Owner-controlled emergency verification for testing

### Schnorr-Private-2.0 Version

- **Privacy-Preserving Verification**: Accepts arbitrary msgHash without exposing Lightning invoice details
- **Liquidity Mining Incentives**: Allocates cBTC and reward tokens to liquidity providers
- **Arbitrary Message Hash**: Contract treats msgHash as opaque data for maximum privacy
- **Bonus Multipliers**: Higher rewards for significant liquidity contributions
- **Protocol Statistics**: Comprehensive tracking of rewards and liquidity providers
- **Emergency Verification**: Owner-controlled emergency verification for testing

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

The deployment script deploys **both versions** of the contracts:

### Local Development (Anvil)

1. Start a local Anvil node:

```bash
anvil
```

2. Deploy both versions to local network:

```bash
forge script script/DeployTrexContracts.s.sol --rpc-url http://localhost:8545 --broadcast
```

**Deployment Output:**

```
=== Deployment Summary ===
TrexToken (shared): 0x309222b7833D3D0A59A8eBf9C64A5790bf43E2aA

Original Version:
  LightningOracle: 0xF99b791257ab50be7F235BC825E7d4B83942cf38
  DeFiContract: 0x56EF69e24c3bCa5135C18574b403273F1eB2Bd74

Schnorr-Private-2.0 Version:
  LightningOraclePrivate: 0x57eB75Df7f17aA5351f850040EeD5c66F945dF32
  DeFiContractPrivate: 0x5192Ffbc96b2E731649714B7b51d4cC4CA1fAB8F
```

### Citrea Testnet

Deploy both versions to Citrea testnet:

```bash
forge script script/DeployTrexContracts.s.sol --rpc-url citrea_testnet --broadcast --verify
```

### Citrea Mainnet

Deploy both versions to Citrea mainnet:

```bash
forge script script/DeployTrexContracts.s.sol --rpc-url citrea --broadcast --verify
```

## Contract Architecture

### Original Version (Public)

```
LightningOracle ←→ DeFiContract ←→ TrexToken
      ↑                ↑              ↑
   Verifies        Executes        Mints
   Payments        Actions         Tokens
```

### Schnorr-Private-2.0 Version (Privacy-Preserving)

```
LightningOraclePrivate ←→ DeFiContractPrivate ←→ TrexToken
         ↑                        ↑                    ↑
    Verifies Arbitrary        Allocates cBTC        Mints
    msgHash + Signature       + Reward Tokens      Tokens
    (Privacy-Preserving)      (Liquidity Mining)
```

### Deployment Order

1. **TrexToken** - Deploy the shared ERC20 token contract
2. **Original Contracts**:
   - **LightningOracle** - Deploy oracle contract
   - **DeFiContract** - Deploy main DeFi contract
3. **Schnorr-Private-2.0 Contracts**:
   - **LightningOraclePrivate** - Deploy privacy-preserving oracle
   - **DeFiContractPrivate** - Deploy liquidity mining incentive contract
4. **Setup** - Configure all contract relationships and set token minter

## Usage

### Original Version - Verifying Lightning Payments

The system verifies Lightning Network payments using Schnorr signatures. The verification process:

1. Payment hash and preimage are provided
2. Schnorr signature is verified using Citrea's precompile
3. If valid, the DeFi contract is notified
4. Tokens are minted to the payment recipient

### Schnorr-Private-2.0 Version - Privacy-Preserving Verification

The privacy-preserving approach works differently:

1. **Off-chain**: User computes `msgHash = hash(preimage + paymentHash + userAddress + timestamp)`
2. **On-chain**: User submits arbitrary `msgHash` + Schnorr signature (no Lightning details exposed)
3. **Verification**: Oracle verifies Schnorr signature for the arbitrary msgHash
4. **Rewards**: If valid, DeFi contract allocates cBTC + reward tokens to liquidity provider

```solidity
// Privacy-preserving verification
oraclePrivate.verifyPaymentProof(msgHash, publicKeyX, signature);

// Get liquidity provider rewards
defiPrivate.getCBTCBalance(userAddress);
defiPrivate.getRewardBalance(userAddress);
```

### Emergency Verification

For testing purposes, both versions support emergency verification:

```solidity
// Original version
oracle.emergencyVerifyPayment(paymentHash, amount);

// Private version
oraclePrivate.emergencyVerifyMessage(msgHash, publicKeyX);
```

### Liquidity Mining Incentives

The Schnorr-Private-2.0 version includes specialized incentive mechanisms:

- **cBTC allocation**: 1:1 Bitcoin-to-cBTC conversion
- **Reward tokens**: Additional protocol incentives
- **Bonus multipliers**: Higher rewards for significant liquidity contributions
- **Protocol statistics**: Track total rewards and liquidity providers

### Custom Actions

Both DeFi contracts support various actions:

- Token minting (automatic on payment verification)
- Fund unlocking
- NFT creation
- Custom actions (staking, voting, etc.)
- **Private version adds**: Liquidity boost actions, node operator rewards

## Security Considerations

### Original Version

- The oracle contract is the only entity that can trigger DeFi actions
- Emergency verification should only be used for testing
- All contracts include proper access controls and modifiers
- Payment hashes are tracked to prevent double-processing

### Schnorr-Private-2.0 Version

- **Privacy by design**: Lightning invoice details never exposed on-chain
- **Arbitrary msgHash**: Contract cannot determine msgHash origin or validity
- **Schnorr signature verification**: Trustless verification using Citrea precompiles
- **Message uniqueness**: Each msgHash can only be verified once
- **Future enhancement**: Off-chain trustless verification to ensure msgHash validity
- **Access controls**: Same security model as original version
- **Emergency functions**: Owner-controlled emergency verification for testing

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
