# HSCS Contract Details - TrustBridge Hybrid Token Economy

## 🏗️ Deployed Contracts

### 1. TrustTokenExchange Contract
- **Contract ID**: `0.0.6935003`
- **Purpose**: HBAR to TRUST token exchange with distribution
- **Functions**:
  - `getExchangeInfo()`: Get exchange rate and distribution percentages
  - `calculateExchange(uint256 hbarAmount)`: Calculate TRUST tokens for HBAR amount
  - `distributeHbar()`: Distribute HBAR to platform accounts

### 2. TrustTokenBurner Contract
- **Contract ID**: `0.0.6935005`
- **Purpose**: TRUST token burning for platform fees
- **Functions**:
  - `burnTokens(uint256 amount, string reason)`: Burn TRUST tokens with reason
  - `calculateBurnFee(uint256 amount)`: Calculate burning fees

### 3. TrustTokenStaking Contract
- **Contract ID**: `0.0.6935008`
- **Purpose**: TRUST token staking for rewards
- **Functions**:
  - `stakeTokens(uint256 amount, uint256 duration)`: Stake TRUST tokens
  - `unstakeTokens(uint256 amount)`: Unstake TRUST tokens
  - `getStakingInfo(address user)`: Get user's staking information

## 🪙 TRUST Token Details
- **Token ID**: `0.0.6935064`
- **Type**: Fungible Common Token (HTS)
- **Supply Key**: Operator account (`0.0.6916959`)
- **Admin Key**: Operator account (`0.0.6916959`)
- **Treasury**: Operator account (`0.0.6916959`)

## 🔑 Account Details
- **Operator Account**: `0.0.6916959`
- **Treasury Account**: `0.0.6916959`
- **Operations Account**: `0.0.6916959`
- **Staking Account**: `0.0.6916959`

## 🌐 Network Details
- **Network**: Hedera Testnet
- **Node**: `https://testnet.hashio.io/api`
- **Mirror Node**: `https://testnet.mirrornode.hedera.com`

## 📋 Environment Variables
```env
# Hedera Configuration
HEDERA_NETWORK=testnet
HEDERA_OPERATOR_ID=0.0.6916959
HEDERA_PRIVATE_KEY=0x29b72f47916186bb1cf4b823429d99f6e5659703b0201a8381211a468a1e2a19

# HSCS Contract IDs
TRUST_TOKEN_EXCHANGE_CONTRACT_ID=0.0.6935003
TRUST_TOKEN_BURNER_CONTRACT_ID=0.0.6935005
TRUST_TOKEN_STAKING_CONTRACT_ID=0.0.6935008

# HTS Token ID
TRUST_TOKEN_ID=0.0.6935064

# Platform Accounts
TREASURY_ACCOUNT_ID=0.0.6916959
OPERATIONS_ACCOUNT_ID=0.0.6916959
STAKING_ACCOUNT_ID=0.0.6916959
```

## 🔄 API Endpoints

### Exchange Endpoints
- `POST /api/hedera/trust-token/hybrid/exchange` - Exchange HBAR for TRUST tokens
- `GET /api/hedera/trust-token/hybrid/exchange-info` - Get exchange information

### Burning Endpoints
- `POST /api/hedera/trust-token/hybrid/burn` - Burn TRUST tokens
- `POST /api/hedera/trust-token/hybrid/calculate-fee` - Calculate NFT creation fee

### Staking Endpoints
- `POST /api/hedera/trust-token/hybrid/stake` - Stake TRUST tokens
- `GET /api/hedera/trust-token/hybrid/balance/:accountId` - Get TRUST token balance

## 🎯 Frontend Integration Requirements

### 1. Wallet Connection
- Users must connect their Hedera wallet (HashPack, Blade, etc.)
- Frontend needs access to user's account ID and signing capability

### 2. Transaction Signing
- All HBAR transfers must be signed by user's wallet
- All TRUST token transfers must be signed by user's wallet
- Backend provides transaction data, frontend signs and submits

### 3. Contract Interaction
- Frontend needs to interact with HSCS contracts directly
- Use Hedera SDK for contract calls
- Handle transaction signing and submission

### 4. Error Handling
- Handle wallet connection errors
- Handle transaction signing errors
- Handle contract interaction errors
- Provide user-friendly error messages

## 🚀 Implementation Steps

1. **Update Frontend Services**: Modify services to use real contract addresses
2. **Implement Wallet Integration**: Add proper wallet connection and signing
3. **Update Components**: Modify components to handle real transactions
4. **Add Error Handling**: Implement comprehensive error handling
5. **Test Integration**: Test complete flow with real user signing

## 📊 Current Status
- ✅ Backend HSCS integration complete
- ✅ HTS token operations working
- ✅ Hybrid flow implemented
- ✅ Real transaction support added
- ⏳ Frontend integration pending
- ⏳ User wallet signing pending
