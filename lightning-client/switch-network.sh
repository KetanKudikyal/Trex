#!/bin/bash

# Script to switch between local Anvil and Citrea Testnet for lightning-client

NETWORK=${1:-local}

if [ "$NETWORK" = "testnet" ]; then
    echo "🔄 Switching to Citrea Testnet..."
    sed -i '' 's/USE_CITREA_TESTNET=false/USE_CITREA_TESTNET=true/' .env
    echo "✅ Switched to Citrea Testnet"
    echo "📡 RPC URL: https://rpc.testnet.citrea.xyz"
    echo "🔗 Contracts: Latest deployed on Citrea Testnet"
elif [ "$NETWORK" = "local" ]; then
    echo "🔄 Switching to Local Anvil..."
    sed -i '' 's/USE_CITREA_TESTNET=true/USE_CITREA_TESTNET=false/' .env
    echo "✅ Switched to Local Anvil"
    echo "📡 RPC URL: http://localhost:8545"
    echo "🔗 Contracts: Local deployment"
else
    echo "❌ Invalid network. Use: local or testnet"
    echo "Usage: $0 [local|testnet]"
    exit 1
fi

echo ""
echo "🔄 Restarting lightning-client..."
pkill -f "npm run dev:backend" 2>/dev/null || true
sleep 2
npm run dev:backend &
echo "✅ Lightning-client restarted"
echo ""
echo "📋 Current configuration:"
echo "Network: $NETWORK"
echo "Environment file: $(grep USE_CITREA_TESTNET .env)"
