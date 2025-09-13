#!/bin/bash

# TrustBridge Hedera Deployment Script
# For Hedera Africa Hackathon 2025

set -e

echo "🚀 TrustBridge Hedera Deployment Script"
echo "========================================"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please create .env file with your Hedera credentials:"
    echo "HEDERA_TESTNET_PRIVATE_KEY=your_private_key"
    echo "HEDERA_TESTNET_ACCOUNT_ID=your_account_id"
    exit 1
fi

# Load environment variables
source .env

# Check if required variables are set
if [ -z "$HEDERA_TESTNET_PRIVATE_KEY" ]; then
    echo "❌ HEDERA_TESTNET_PRIVATE_KEY not set in .env file"
    exit 1
fi

echo "✅ Environment variables loaded"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Compile contracts
echo "🔨 Compiling contracts..."
npx hardhat compile

# Run tests first
echo "🧪 Running tests..."
npx hardhat test test/Phase1-Security.test.ts
npx hardhat test test/Phase2-EdgeCases.test.ts
npx hardhat test test/Phase3-Integration.test.ts
npx hardhat test test/Phase4-Performance.test.ts
npx hardhat test test/Phase5-Economic.test.ts

echo "✅ All tests passed!"

# Deploy to testnet
echo "🌐 Deploying to Hedera Testnet..."
npx hardhat run scripts/deploy-hedera.ts --network hedera_testnet

# Setup initial attestors
echo "👥 Setting up initial attestors..."
npx hardhat run scripts/setup-initial-attestors.ts --network hedera_testnet

echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Check deployment info in deployments/hedera_testnet.json"
echo "2. Verify contracts on Hedera Explorer: https://hashscan.io/testnet"
echo "3. Test the platform with real transactions"
echo "4. Deploy to mainnet when ready for production"
echo ""
echo "🏆 Ready for Hedera Africa Hackathon 2025!"

# Optional: Deploy to mainnet
read -p "Deploy to Hedera Mainnet? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌐 Deploying to Hedera Mainnet..."
    npx hardhat run scripts/deploy-hedera.ts --network hedera_mainnet
    npx hardhat run scripts/setup-initial-attestors.ts --network hedera_mainnet
    echo "🎉 Mainnet deployment completed!"
fi
