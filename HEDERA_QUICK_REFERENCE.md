# Hedera Integration - Quick Reference

## 🚀 Quick Start

### Essential Imports
```typescript
import { TokenCreateTransaction, TokenType } from '@hashgraph/sdk';
import { DAppConnector, HederaJsonRpcMethod, HederaSessionEvent, HederaChainId } from '@hashgraph/hedera-wallet-connect';
```

### Basic Token Creation
```typescript
const tokenCreateTx = new TokenCreateTransaction()
  .setTokenName('MyAsset')
  .setTokenSymbol('ASSET')
  .setTokenType(TokenType.FungibleCommon)
  .setDecimals(2)
  .setInitialSupply(1000)
  .setTreasuryAccountId(accountId)
  .setFreezeDefault(false)
  .setMaxTransactionFee(1000)
  .setTransactionValidDuration(120);

// Freeze, sign, and execute
tokenCreateTx.freezeWithSigner(signer);
const signedTx = await signer.signTransaction(tokenCreateTx);
const response = await signedTx.execute(hederaClient);
const receipt = await response.getReceipt(hederaClient);
const tokenId = receipt.tokenId?.toString();
```

## 🔧 Common Patterns

### Wallet Connection
```typescript
const { isConnected, accountId, signer, hederaClient } = useWallet();
```

### Balance Check (Mirror Node)
```typescript
const checkBalance = async (accountId) => {
  const response = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}`);
  const data = await response.json();
  return data.balance?.balance || 0;
};
```

### Error Handling
```typescript
try {
  const result = await hederaOperation();
} catch (error) {
  if (error.message.includes('TOKEN_HAS_NO_SUPPLY_KEY')) {
    // Handle supply key error
  } else if (error.message.includes('Request expired')) {
    // Handle timeout
  } else {
    // Generic error
  }
}
```

## 🐛 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| `TOKEN_HAS_NO_SUPPLY_KEY` | Use `TokenSupplyType.Infinite` |
| `signer.getPublicKey is not a function` | Remove the call, use proper transaction setup |
| WebSocket connection closed | Use existing WalletContext, don't create fresh connectors |
| Protobuf errors | Use Mirror Node API instead of signer methods |
| HashPack popup not appearing | Ensure browser focus, check transaction parameters |

## 📋 Configuration

### Environment Variables
```env
REACT_APP_HASHPACK_PROJECT_ID=377d75bb6f86a2ffd427d032ff6ea7d3
```

### Project ID
```typescript
const WALLETCONNECT_PROJECT_ID = '377d75bb6f86a2ffd427d032ff6ea7d3';
```

## 🔍 Debugging

### Check Wallet Status
```typescript
console.log('Wallet connected:', isConnected);
console.log('Account ID:', accountId);
console.log('Signer type:', typeof signer);
```

### Check Assets
```typescript
const assets = JSON.parse(localStorage.getItem('digitalAssets') || '[]');
console.log('Stored assets:', assets);
```

### Check Account Balance
```typescript
fetch('https://testnet.mirrornode.hedera.com/api/v1/accounts/0.0.6916959')
  .then(r => r.json())
  .then(data => console.log('Balance:', data.balance?.balance / 100000000, 'HBAR'));
```

## 📁 File Structure

```
src/
├── contexts/WalletContext.tsx          # HashPack integration
├── pages/CreateDigitalAsset.tsx        # Asset creation
├── pages/DigitalAssetTrading.tsx       # Trading interface
├── services/hederaAssetService.ts      # Asset management
└── components/UI/FileUpload.tsx        # IPFS uploads
```

## 🎯 Key Success Patterns

1. **Use WalletContext**: Don't create fresh connectors
2. **Mirror Node API**: For balance checks and account info
3. **Proper Error Handling**: Catch and handle Hedera-specific errors
4. **Transaction Freezing**: Always freeze before signing
5. **Timeout Management**: Set appropriate timeouts for user approval

## 🚨 Critical Notes

- **Never** call `signer.getAccountBalance()` - use Mirror Node API
- **Always** freeze transactions before signing
- **Use** existing WalletContext instead of creating new connectors
- **Set** proper timeouts for user approval (30s) and execution (60s)
- **Validate** all inputs before creating transactions

## 📞 Quick Help

### Test Token Created
- **ID**: `0.0.6920098`
- **Name**: `DigitalAsset_1759091190892`
- **Symbol**: `DIGIT`

### Test Account
- **Address**: `0.0.6916959`
- **Network**: Hedera Testnet

### Useful URLs
- **Mirror Node**: `https://testnet.mirrornode.hedera.com`
- **Hedera Portal**: `https://portal.hedera.com`
- **HashPack**: Browser extension required

---

**Status**: ✅ Production Ready | **Last Updated**: January 2025