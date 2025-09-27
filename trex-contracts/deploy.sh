#!/bin/bash

# Trex Contracts Deployment Script
# Usage: ./deploy.sh [network]
# Networks: local, testnet, mainnet

set -e

NETWORK=${1:-local}

echo "🚀 Deploying Trex Lightning DeFi Contracts to $NETWORK network..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please copy env.example to .env and configure it."
    exit 1
fi

# Source environment variables
source .env

# Validate required environment variables
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ PRIVATE_KEY not set in .env file"
    exit 1
fi

# Set deployment parameters based on network
case $NETWORK in
    local)
        RPC_URL="http://localhost:8545"
        VERIFY=false
        echo "📡 Deploying to local Anvil node..."
        ;;
    testnet)
        if [ -z "$CITREA_TESTNET_RPC_URL" ]; then
            echo "❌ CITREA_TESTNET_RPC_URL not set in .env file"
            exit 1
        fi
        RPC_URL="$CITREA_TESTNET_RPC_URL"
        VERIFY=true
        echo "📡 Deploying to Citrea Testnet..."
        ;;
    mainnet)
        if [ -z "$CITREA_RPC_URL" ]; then
            echo "❌ CITREA_RPC_URL not set in .env file"
            exit 1
        fi
        RPC_URL="$CITREA_RPC_URL"
        VERIFY=true
        echo "📡 Deploying to Citrea Mainnet..."
        echo "⚠️  WARNING: You are deploying to MAINNET. Make sure you have tested thoroughly!"
        read -p "Are you sure you want to continue? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "❌ Deployment cancelled"
            exit 1
        fi
        ;;
    *)
        echo "❌ Invalid network. Use: local, testnet, or mainnet"
        exit 1
        ;;
esac

# Build contracts
echo "🔨 Building contracts..."
forge build

# Run tests
echo "🧪 Running tests..."
forge test

# Deploy contracts
echo "📦 Deploying contracts..."

if [ "$VERIFY" = true ]; then
    forge script script/DeployTrexContracts.s.sol \
        --rpc-url "$RPC_URL" \
        --broadcast \
        --verify
else
    forge script script/DeployTrexContracts.s.sol \
        --rpc-url "$RPC_URL" \
        --broadcast
fi

echo "✅ Deployment completed successfully!"

# Display deployment summary
echo ""
echo "📋 Deployment Summary:"
echo "Network: $NETWORK"
echo "RPC URL: $RPC_URL"
echo "Verified: $VERIFY"
echo ""
echo "🔗 Check the deployment output above for contract addresses"
echo "📄 Contract artifacts are available in ./out/"