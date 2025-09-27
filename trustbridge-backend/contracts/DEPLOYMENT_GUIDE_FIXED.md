# TrustBridge Deployment Guide - Fixed Version

## Overview
This guide covers the deployment of the fixed TrustBridge ecosystem contracts that resolve the `transferFrom` issue with the TRUST token.

## Problem Solved
- **Issue**: TRUST token `transferFrom` function was reverting with custom error `0xfb8f41b2`
- **Root Cause**: Custom validation in TRUST token contract preventing `transferFrom` operations
- **Solution**: Modified CoreAssetFactory to use `transfer` instead of `transferFrom` for fee collection

## Contract Addresses (Fixed Version)

### Core Contracts
| Contract | Address | Description |
|----------|---------|-------------|
| TrustToken | `0x170B35e97C217dBf63a500EaB884392F7BF6Ec34` | TRUST token with public minting |
| CoreAssetFactory | `0x930131a22b9D2e060d8E4EF1aE21185d4F59F52F` | **FIXED** - Main asset creation contract |
| AssetNFT | `0x42be9627C970D40248690F010b3c2a7F8C68576C` | NFT contract for assets |

### Supporting Contracts
| Contract | Address | Description |
|----------|---------|-------------|
| VerificationRegistry | `0xC2e5D63Da10A3139857D18Cf43eB93CE0133Ca4B` | Asset verification data |
| TRUSTMarketplace | `0x44C2e6BCAc1E91e3107616F4D0e03692fb853610` | Asset trading marketplace |
| PoolManager | `0x4F863bDAaE4611dF7df5C5eBa2fd42aAaA984646` | Asset pool management |
| TradingEngine | `0xc326cF6Ab5EF03B2Df5390463634Db9d778e01E7` | Trade execution engine |

## Key Changes Made

### 1. CoreAssetFactory Fix
**File**: `contracts/CoreAssetFactory.sol`

**Changes**:
- Replaced `transferFrom` with two-step process:
  1. Check if contract has sufficient TRUST tokens
  2. Use `transfer` to send fee to recipient

**Before**:
```solidity
require(trustToken.transferFrom(msg.sender, feeRecipient, DIGITAL_CREATION_FEE), "Creation fee transfer failed");
```

**After**:
```solidity
uint256 contractBalance = trustToken.balanceOf(address(this));
require(contractBalance >= DIGITAL_CREATION_FEE, "Insufficient TRUST tokens sent to contract");
require(trustToken.transfer(feeRecipient, DIGITAL_CREATION_FEE), "Fee transfer failed");
```

### 2. Role Management
**Granted MINTER_ROLE to CoreAssetFactory on AssetNFT**:
- Role: `0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6`
- Granted to: `0x930131a22b9D2e060d8E4EF1aE21185d4F59F52F`

### 3. Frontend Updates
**Files Updated**:
- `src/config/contracts.ts` - Updated CoreAssetFactory address
- `src/services/contractService.ts` - Updated workflow to use transfer instead of transferFrom

**New Workflow**:
1. User sends TRUST tokens to contract using `transfer()`
2. Contract checks if it has sufficient tokens
3. Contract transfers fee to fee recipient using `transfer()`
4. Asset is created and NFT is minted

## Deployment Commands

### 1. Deploy Fixed CoreAssetFactory
```bash
cd trustbridge-backend/contracts
npx hardhat run scripts/redeploy-core-asset-factory.js --network hedera_testnet
```

### 2. Grant MINTER_ROLE
```bash
npx hardhat run scripts/grant-minter-role.js --network hedera_testnet
```

### 3. Test Deployment
```bash
npx hardhat run test-fixed-contract.js --network hedera_testnet
```

## Testing Results

### ✅ Working Functions
- TRUST token `transfer()` - Works perfectly
- Digital asset creation - Works with new workflow
- Fee collection - Works correctly
- NFT minting - Works after granting MINTER_ROLE

### ❌ Known Issues
- TRUST token `transferFrom()` - Still fails with error `0xfb8f41b2`
- **Workaround**: Use `transfer()` instead

## Frontend Integration

### 1. Update Contract Addresses
```bash
cd trustbridge-frontend
node update-contract-addresses.js
```

### 2. New User Flow
1. User connects wallet
2. User mints TRUST tokens (if needed)
3. User sends TRUST tokens to CoreAssetFactory contract
4. User creates digital asset
5. Contract automatically handles fee payment

### 3. Code Changes
The frontend now:
- Uses new CoreAssetFactory address
- Sends TRUST tokens to contract before creating assets
- No longer uses approval/transferFrom workflow

## Network Configuration

### Hedera Testnet
- **RPC URL**: `https://testnet.hashio.io/api`
- **Chain ID**: 296 (0x128)
- **Currency**: HBAR

### MetaMask Setup
```javascript
{
  chainId: '0x128',
  chainName: 'Hedera Testnet',
  rpcUrls: ['https://testnet.hashio.io/api'],
  nativeCurrency: {
    name: 'HBAR',
    symbol: 'HBAR',
    decimals: 18
  },
  blockExplorerUrls: ['https://testnet.hashio.io']
}
```

## Gas Usage

| Operation | Gas Used | Notes |
|-----------|----------|-------|
| TRUST token transfer | ~26,000 | Standard ERC20 transfer |
| Digital asset creation | ~1,000,000 | Includes NFT minting |
| TRUST token approval | ~46,000 | Not needed in new workflow |

## Security Considerations

1. **TRUST Token Transfer**: Users must trust the contract to handle their tokens
2. **Fee Collection**: Contract automatically transfers fees to designated recipient
3. **Role Management**: Only authorized contracts can mint NFTs
4. **Access Control**: Admin functions protected by role-based access

## Monitoring

### Key Metrics
- Contract TRUST token balance
- Fee recipient balance
- Asset creation success rate
- Gas usage patterns

### Event Monitoring
- `AssetCreated` - New assets created
- `Transfer` - TRUST token movements
- `Mint` - NFT minting events

## Troubleshooting

### Common Issues
1. **"Insufficient TRUST tokens sent to contract"**
   - Solution: User must send TRUST tokens to contract first

2. **"Contract does not have MINTER_ROLE"**
   - Solution: Grant MINTER_ROLE to CoreAssetFactory on AssetNFT

3. **"transferFrom failed"**
   - Solution: Use transfer() instead (already implemented)

### Debug Commands
```bash
# Check contract balance
npx hardhat run scripts/check-contract-balance.js --network hedera_testnet

# Check roles
npx hardhat run scripts/check-roles.js --network hedera_testnet

# Test asset creation
npx hardhat run scripts/test-asset-creation.js --network hedera_testnet
```

## Next Steps

1. ✅ Deploy fixed contracts
2. ✅ Update frontend
3. ✅ Test complete workflow
4. 🔄 Deploy to production
5. 🔄 Monitor performance
6. 🔄 Gather user feedback

## Support

For issues or questions:
- Check deployment logs
- Review contract events
- Test with small amounts first
- Contact development team

---

**Deployment Date**: 2025-09-26T11:21:42.055Z  
**Status**: ✅ DEPLOYED AND TESTED  
**Version**: Fixed v1.0
