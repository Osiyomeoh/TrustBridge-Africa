# Hedera Smart Contract Service (HSCS) Implementation Guide

## Overview

This guide documents the implementation of the TRUST token economy using **Hedera Smart Contract Service (HSCS)** combined with **Hedera Token Service (HTS)** for a hybrid approach that provides both native Hedera functionality and advanced smart contract capabilities.

## Architecture

```
Frontend (React) 
    ↓ ABI Calls via Backend
Backend (NestJS) 
    ↓ Contract Calls
HSCS Smart Contracts (Solidity)
    ↓ Native Calls  
HTS (TRUST Token) + HBAR Transfers
```

## Smart Contracts

### 1. TrustTokenExchange.sol
**Purpose**: Handles HBAR to TRUST token exchange with automatic distribution

**Key Features**:
- Exchange rate: 1 HBAR = 100 TRUST tokens
- Exchange fee: 0.1 HBAR (1%)
- Automatic HBAR distribution:
  - 60% → Community Treasury
  - 25% → Platform Operations
  - 10% → Staking Rewards Pool
  - 5% → Exchange Fee

**Functions**:
- `exchangeHbarForTrust()` - Main exchange function
- `calculateTrustAmount()` - Calculate TRUST tokens for HBAR amount
- `calculateExchangeFee()` - Calculate exchange fee
- `getExchangeStats()` - Get exchange statistics

### 2. TrustTokenBurner.sol
**Purpose**: Handles TRUST token burning for platform fees

**Key Features**:
- Tiered fee structure based on verification level and rarity
- Automatic fee calculation
- Burn tracking and statistics

**Fee Tiers**:
- **Basic**: 50 TRUST tokens
- **Premium Verification**: 100 TRUST tokens (2x multiplier)
- **Epic Rarity**: 100 TRUST tokens (2x multiplier)
- **Legendary Rarity**: 150 TRUST tokens (3x multiplier)

**Functions**:
- `burnForNftCreation()` - Burn tokens for NFT creation
- `calculateNftCreationFee()` - Calculate creation fee
- `updateFeeTier()` - Update fee structure

### 3. TrustTokenStaking.sol
**Purpose**: Handles TRUST token staking and rewards

**Key Features**:
- Minimum stake: 100 TRUST tokens
- Maximum stake: 1M TRUST tokens
- Staking duration: 30 days to 1 year
- APY rewards: 5% base + 2% bonus for long-term staking

**Functions**:
- `stake()` - Stake TRUST tokens
- `unstake()` - Unstake with rewards
- `claimReward()` - Claim staking rewards
- `calculateReward()` - Calculate pending rewards

## Backend Services

### HscsContractService
**File**: `src/hedera/hscs-contract.service.ts`

**Purpose**: Interacts with HSCS smart contracts using Hedera SDK

**Key Methods**:
- `exchangeHbarForTrust()` - Exchange HBAR for TRUST tokens
- `burnTrustTokens()` - Burn TRUST tokens
- `calculateNftCreationFee()` - Calculate NFT creation fee
- `stakeTrustTokens()` - Stake TRUST tokens
- `getExchangeInfo()` - Get exchange statistics

### API Endpoints

#### Exchange Endpoints
- `POST /api/hedera/trust-token/exchange` - Exchange HBAR for TRUST
- `GET /api/hedera/trust-token/exchange-info` - Get exchange information

#### Burning Endpoints
- `POST /api/hedera/trust-token/burn` - Burn TRUST tokens
- `POST /api/hedera/trust-token/calculate-fee` - Calculate NFT creation fee

#### Staking Endpoints
- `POST /api/hedera/trust-token/stake` - Stake TRUST tokens

## Frontend Integration

### TrustTokenService
**File**: `src/services/trust-token.service.ts`

**Updated Methods**:
- `exchangeHbarForTrust()` - Exchange HBAR for TRUST tokens
- `burnTrustTokens()` - Burn TRUST tokens
- `getExchangeInfo()` - Get exchange information

### Components Updated
- `TrustTokenPurchase.tsx` - Uses HSCS contract for exchange
- `CreateDigitalAsset.tsx` - Uses HSCS contract for burning

## Configuration

### Environment Variables
```env
# Hedera Configuration
HEDERA_ACCOUNT_ID=0.0.1234567
HEDERA_PRIVATE_KEY=your_private_key
HEDERA_NETWORK=testnet

# HSCS Contract Addresses
TRUST_TOKEN_EXCHANGE_CONTRACT_ID=0.0.1234568
TRUST_TOKEN_BURNER_CONTRACT_ID=0.0.1234569
TRUST_TOKEN_STAKING_CONTRACT_ID=0.0.1234570

# Account Addresses for Distribution
TREASURY_ACCOUNT_ID=0.0.1234567
OPERATIONS_ACCOUNT_ID=0.0.1234568
STAKING_ACCOUNT_ID=0.0.1234569
```

## Deployment Process

### 1. Deploy Smart Contracts
```bash
# Compile contracts
npx hardhat compile

# Deploy to Hedera testnet
npx hardhat run scripts/deploy.js --network hedera-testnet

# Update environment variables with deployed contract addresses
```

### 2. Initialize Backend
```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env

# Start backend
npm run start:dev
```

### 3. Deploy Frontend
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start frontend
npm start
```

## Usage Examples

### Exchange HBAR for TRUST Tokens
```typescript
// Frontend
const result = await TrustTokenService.exchangeHbarForTrust(
  accountId,
  1.0, // 1 HBAR
  treasuryAccountId,
  operationsAccountId,
  stakingAccountId
);

console.log(`Received ${result.trustAmount} TRUST tokens`);
console.log(`Transaction ID: ${result.transactionId}`);
```

### Burn TRUST Tokens for NFT Creation
```typescript
// Frontend
const transactionId = await TrustTokenService.burnTrustTokens(
  accountId,
  100, // 100 TRUST tokens
  'NFT_CREATION'
);

console.log(`Burned 100 TRUST tokens. Transaction ID: ${transactionId}`);
```

### Calculate NFT Creation Fee
```typescript
// Frontend
const fee = await TrustTokenService.calculateNftCreationFee(
  'premium', // verification level
  'legendary' // rarity
);

console.log(`NFT creation fee: ${fee} TRUST tokens`);
```

## Benefits of HSCS Approach

### 1. **Advanced Logic**
- Complex exchange logic with automatic distribution
- Tiered fee structures
- Sophisticated staking mechanisms

### 2. **EVM Compatibility**
- Familiar Solidity development
- ABI integration for frontend
- Standard smart contract patterns

### 3. **Hedera Integration**
- Native HBAR transfers
- HTS token operations
- Low transaction fees
- Fast finality

### 4. **Scalability**
- Smart contracts handle complex logic
- Backend focuses on API management
- Frontend uses standard ABI calls

## Security Considerations

### 1. **Access Control**
- Role-based permissions
- Admin-only functions
- Emergency pause capabilities

### 2. **Input Validation**
- Parameter validation
- Range checks
- Reentrancy protection

### 3. **Audit Trail**
- All transactions logged
- Event emissions
- Transaction IDs tracked

## Monitoring and Analytics

### 1. **Contract Events**
- Exchange events
- Burn events
- Staking events

### 2. **Statistics**
- Total HBAR received
- Total TRUST minted/burned
- Staking statistics

### 3. **Dashboard**
- Real-time metrics
- Transaction history
- User activity

## Future Enhancements

### 1. **Advanced Features**
- Governance voting
- Multi-signature treasury
- Cross-chain integration

### 2. **Optimizations**
- Gas optimization
- Batch operations
- Layer 2 integration

### 3. **Analytics**
- Advanced metrics
- Predictive analytics
- Risk assessment

## Troubleshooting

### Common Issues

1. **Contract Not Deployed**
   - Check contract addresses in environment variables
   - Verify deployment was successful

2. **Transaction Failures**
   - Check account balance
   - Verify gas limits
   - Check network status

3. **ABI Mismatch**
   - Ensure frontend uses correct ABI
   - Update contract addresses

### Debug Commands

```bash
# Check contract status
npx hardhat verify --network hedera-testnet <CONTRACT_ADDRESS>

# View contract events
npx hardhat console --network hedera-testnet

# Test contract functions
npx hardhat test
```

## Conclusion

The HSCS implementation provides a robust, scalable, and feature-rich TRUST token economy that combines the best of Hedera's native services with advanced smart contract capabilities. This hybrid approach ensures optimal performance while maintaining the flexibility to implement complex economic models.

For questions or support, please refer to the Hedera documentation or contact the development team.
