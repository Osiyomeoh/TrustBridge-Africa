# HSCS Contract Deployment Guide

## Overview

This guide covers deploying Hedera Smart Contract Service (HSCS) contracts for the TRUST token economy. We provide multiple deployment methods to ensure compatibility and reliability.

## Prerequisites

1. **Hedera Account**: Testnet account with HBAR balance
2. **Environment Variables**: Properly configured `.env` file
3. **Node.js**: Version 16+ installed
4. **Dependencies**: All required packages installed

## Environment Setup

Create a `.env` file in the `trustbridge-backend` directory:

```bash
# Hedera Configuration
HEDERA_ACCOUNT_ID=0.0.1234567
HEDERA_PRIVATE_KEY=302e020100300506032b657004220420...
HEDERA_NETWORK=testnet
TRUST_TOKEN_ID=0.0.6934709

# Account Addresses for Distribution
TREASURY_ACCOUNT_ID=0.0.1234567
OPERATIONS_ACCOUNT_ID=0.0.1234567
STAKING_ACCOUNT_ID=0.0.1234567
```

## Deployment Methods

### Method 1: Hedera SDK (Recommended)

**Advantages:**
- Direct Hedera integration
- No additional dependencies
- Full control over deployment process
- Better error handling

**Steps:**

1. **Install Dependencies:**
```bash
cd trustbridge-backend
npm install @hashgraph/sdk
```

2. **Compile Contracts:**
```bash
cd contracts
npm install
npx hardhat compile
```

3. **Deploy Contracts:**
```bash
cd ..
node scripts/deploy-hscs-hedera-sdk.js
```

**Expected Output:**
```
🚀 Deploying HSCS Contracts using Hedera SDK...
📋 Configuration:
Account ID: 0.0.1234567
Network: testnet
Trust Token ID: 0.0.6934709
💰 Account balance: 100.0 HBAR

🔄 Compiling contracts...
✅ Contracts compiled successfully

🔄 Deploying TrustTokenExchange...
📁 Bytecode file created: 0.0.1234568
✅ TrustTokenExchange deployed to: 0.0.1234569

🔄 Deploying TrustTokenBurner...
📁 Bytecode file created: 0.0.1234570
✅ TrustTokenBurner deployed to: 0.0.1234571

🔄 Deploying TrustTokenStaking...
📁 Bytecode file created: 0.0.1234572
✅ TrustTokenStaking deployed to: 0.0.1234573

🎉 HSCS Contract Deployment Complete!
```

### Method 2: Hardhat with Hedera Plugin

**Advantages:**
- Familiar development environment
- Built-in testing capabilities
- Better debugging tools

**Steps:**

1. **Install Hardhat and Hedera Plugin:**
```bash
cd contracts
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
```

2. **Configure Hardhat:**
The `hardhat.config.js` is already configured for Hedera networks.

3. **Deploy Contracts:**
```bash
npx hardhat run scripts/deploy-hscs-hardhat.js --network hedera_testnet
```

### Method 3: Manual Bytecode Deployment

**For Advanced Users:**

1. **Compile to Bytecode:**
```bash
cd contracts
npx hardhat compile
```

2. **Extract Bytecode:**
```bash
# Bytecode will be in artifacts/contracts/[ContractName].sol/[ContractName].json
# Look for the "bytecode" field
```

3. **Deploy via Hedera SDK:**
Use the bytecode directly in a custom deployment script.

## Contract Verification

After deployment, verify your contracts on Hedera Explorer:

1. **Visit**: [Hedera Explorer](https://hashscan.io/testnet)
2. **Search**: Your contract address
3. **Verify**: Contract source code and bytecode

## Testing Deployed Contracts

### 1. Test Exchange Contract

```javascript
// Test exchange functionality
const exchangeStats = await contract.getExchangeStats();
console.log('Exchange Stats:', exchangeStats);
```

### 2. Test Burner Contract

```javascript
// Test fee calculation
const fee = await contract.calculateNftCreationFee("basic", "common");
console.log('NFT Creation Fee:', fee.toString());
```

### 3. Test Staking Contract

```javascript
// Test staking functionality
const stats = await contract.getGlobalStats();
console.log('Staking Stats:', stats);
```

## Integration with Backend

After successful deployment, update your backend configuration:

1. **Update Environment Variables:**
```bash
# Add to your .env file
TRUST_TOKEN_EXCHANGE_CONTRACT_ID=0.0.1234569
TRUST_TOKEN_BURNER_CONTRACT_ID=0.0.1234571
TRUST_TOKEN_STAKING_CONTRACT_ID=0.0.1234573
```

2. **Restart Backend Service:**
```bash
npm run start:dev
```

3. **Test Integration:**
```bash
# Test TRUST token exchange
curl -X POST http://localhost:3000/api/hedera/trust-token/exchange \
  -H "Content-Type: application/json" \
  -d '{"accountId":"0.0.1234567","hbarAmount":1.0}'
```

## Troubleshooting

### Common Issues:

1. **Insufficient HBAR Balance:**
   - Ensure account has at least 50 HBAR for deployment
   - Check balance: `hedera-cli account balance 0.0.1234567`

2. **Compilation Errors:**
   - Check Solidity version compatibility
   - Ensure all dependencies are installed
   - Verify contract syntax

3. **Deployment Failures:**
   - Check network connectivity
   - Verify account permissions
   - Ensure sufficient gas limits

4. **Contract Call Failures:**
   - Verify contract addresses
   - Check function parameters
   - Ensure proper ABI encoding

### Debug Commands:

```bash
# Check account balance
hedera-cli account balance 0.0.1234567

# Check contract state
hedera-cli contract call 0.0.1234569 getExchangeStats

# View transaction details
hedera-cli transaction get 0.0.1234567@1234567890.1234567890
```

## Security Considerations

1. **Private Key Security:**
   - Never commit private keys to version control
   - Use environment variables
   - Consider hardware wallets for mainnet

2. **Contract Permissions:**
   - Review access control mechanisms
   - Test with different user roles
   - Implement proper authorization

3. **Gas Limits:**
   - Set appropriate gas limits
   - Monitor gas usage
   - Implement gas estimation

## Next Steps

After successful deployment:

1. **Update Frontend**: Configure contract addresses
2. **Test Integration**: Verify end-to-end functionality
3. **Monitor Contracts**: Set up monitoring and alerts
4. **Documentation**: Update API documentation
5. **Production**: Deploy to mainnet when ready

## Support

For issues or questions:

1. **Hedera Documentation**: [docs.hedera.com](https://docs.hedera.com)
2. **Community Forum**: [Hedera Discord](https://discord.gg/hedera)
3. **GitHub Issues**: Create an issue in this repository

## Contract Addresses

After deployment, your contracts will be available at:

- **TrustTokenExchange**: `0.0.1234569`
- **TrustTokenBurner**: `0.0.1234571`
- **TrustTokenStaking**: `0.0.1234573`

These addresses will be saved to `contracts/deployments/hscs-hedera-sdk.json` for future reference.
