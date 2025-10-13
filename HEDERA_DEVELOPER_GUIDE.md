# Hedera Developer Implementation Guide

## Quick Start

### Prerequisites
- Node.js 16+ and npm/yarn
- HashPack wallet browser extension
- Hedera testnet account with HBAR

### Installation
```bash
# Install Hedera SDK
npm install @hashgraph/sdk

# Install HashPack WalletConnect
npm install @hashgraph/hedera-wallet-connect
```

## Core Implementation Patterns

### 1. Wallet Connection Setup

```typescript
// WalletContext.tsx
import { DAppConnector, HederaJsonRpcMethod, HederaSessionEvent, HederaChainId } from '@hashgraph/hedera-wallet-connect';
import { Client, LedgerId } from '@hashgraph/sdk';

const WALLETCONNECT_PROJECT_ID = '377d75bb6f86a2ffd427d032ff6ea7d3';

const connector = new DAppConnector(
  metadata,
  LedgerId.fromString('testnet'),
  WALLETCONNECT_PROJECT_ID,
  Object.values(HederaJsonRpcMethod),
  [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged],
  [HederaChainId.Testnet]
);
```

### 2. Token Creation Pattern

```typescript
// CreateDigitalAsset.tsx
import { TokenCreateTransaction, TokenType } from '@hashgraph/sdk';

const createHederaToken = async (signer, hederaClient, accountId) => {
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

  // Freeze transaction
  tokenCreateTx.freezeWithSigner(signer);
  
  // Sign transaction (triggers HashPack popup)
  const signedTokenTx = await signer.signTransaction(tokenCreateTx);
  
  // Execute transaction
  const tokenResponse = await signedTokenTx.execute(hederaClient);
  const receipt = await tokenResponse.getReceipt(hederaClient);
  
  return receipt.tokenId?.toString();
};
```

### 3. Error Handling Pattern

```typescript
const handleHederaTransaction = async (transactionFn) => {
  try {
    return await Promise.race([
      transactionFn(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Transaction timeout')), 30000)
      )
    ]);
  } catch (error) {
    if (error.message.includes('TOKEN_HAS_NO_SUPPLY_KEY')) {
      throw new Error('Token supply configuration error');
    } else if (error.message.includes('Request expired')) {
      throw new Error('Transaction expired, please try again');
    } else if (error.message.includes('Insufficient account balance')) {
      throw new Error('Insufficient HBAR for transaction fees');
    }
    throw error;
  }
};
```

### 4. Balance Checking Pattern

```typescript
// Use Mirror Node API instead of signer.getAccountBalance() to avoid protobuf bugs
const checkHederaBalance = async (accountId) => {
  try {
    const response = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}`);
    const accountData = await response.json();
    return accountData.balance?.balance || 0;
  } catch (error) {
    console.warn('Could not check balance:', error);
    return 0;
  }
};
```

## Common Patterns

### 1. Multi-Step Form with Validation

```typescript
const useMultiStepForm = (steps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  
  const canProceed = useMemo(() => {
    // Validation logic for current step
    return validateStep(currentStep, formData);
  }, [currentStep, formData]);
  
  const nextStep = () => {
    if (canProceed && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  return { currentStep, formData, setFormData, canProceed, nextStep };
};
```

### 2. File Upload with IPFS

```typescript
const uploadToIPFS = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      'pinata_api_key': process.env.REACT_APP_PINATA_API_KEY,
      'pinata_secret_api_key': process.env.REACT_APP_PINATA_SECRET_KEY,
    },
    body: formData
  });
  
  const result = await response.json();
  return result.IpfsHash;
};
```

### 3. Asset Storage Pattern

```typescript
const storeAsset = (assetData) => {
  const existingAssets = JSON.parse(localStorage.getItem('digitalAssets') || '[]');
  existingAssets.push({
    ...assetData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  localStorage.setItem('digitalAssets', JSON.stringify(existingAssets));
};

const getAssets = (ownerAddress) => {
  const allAssets = JSON.parse(localStorage.getItem('digitalAssets') || '[]');
  return allAssets.filter(asset => asset.owner === ownerAddress);
};
```

## Debugging Techniques

### 1. Transaction Debugging

```typescript
const debugTransaction = (tx) => {
  console.log('Transaction details:', {
    tokenName: tx._tokenName,
    tokenSymbol: tx._tokenSymbol,
    tokenType: tx._tokenType,
    initialSupply: tx._initialSupply?.toString(),
    treasuryAccount: tx._treasuryAccountId?.toString(),
    maxFee: tx._maxTransactionFee?.toString(),
    validDuration: tx._transactionValidDuration
  });
};
```

### 2. Signer Debugging

```typescript
const debugSigner = (signer) => {
  console.log('Signer details:', {
    type: typeof signer,
    constructor: signer?.constructor?.name,
    hasSignTransaction: typeof signer?.signTransaction,
    accountId: signer?.getAccountId?.()?.toString(),
    methods: Object.getOwnPropertyNames(signer)
  });
};
```

### 3. Network Debugging

```typescript
const debugNetwork = async (accountId) => {
  try {
    const response = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}`);
    const data = await response.json();
    console.log('Account data:', data);
  } catch (error) {
    console.error('Network error:', error);
  }
};
```

## Testing Strategies

### 1. Unit Tests

```typescript
// Test token creation
describe('Hedera Token Creation', () => {
  it('should create token with correct parameters', async () => {
    const mockSigner = createMockSigner();
    const mockClient = createMockClient();
    
    const tokenId = await createHederaToken(mockSigner, mockClient, '0.0.123');
    expect(tokenId).toBeDefined();
  });
});
```

### 2. Integration Tests

```typescript
// Test complete flow
describe('Digital Asset Creation Flow', () => {
  it('should create asset end-to-end', async () => {
    // 1. Connect wallet
    // 2. Fill form
    // 3. Upload files
    // 4. Create token
    // 5. Store asset
    // 6. Verify result
  });
});
```

### 3. Error Testing

```typescript
// Test error scenarios
describe('Error Handling', () => {
  it('should handle insufficient balance', async () => {
    const mockSigner = createMockSignerWithLowBalance();
    await expect(createHederaToken(mockSigner, mockClient, '0.0.123'))
      .rejects.toThrow('Insufficient HBAR');
  });
});
```

## Performance Optimization

### 1. Parallel Operations

```typescript
// Fetch multiple assets in parallel
const fetchAssets = async (assetIds) => {
  const promises = assetIds.map(id => getAssetById(id));
  return Promise.allSettled(promises);
};
```

### 2. Memoization

```typescript
// Memoize expensive calculations
const expensiveCalculation = useMemo(() => {
  return computeExpensiveValue(formData);
}, [formData]);
```

### 3. Lazy Loading

```typescript
// Lazy load components
const LazyComponent = React.lazy(() => import('./HeavyComponent'));

// Use with Suspense
<Suspense fallback={<Loading />}>
  <LazyComponent />
</Suspense>
```

## Security Best Practices

### 1. Input Validation

```typescript
const validateAssetData = (data) => {
  const schema = {
    name: { type: 'string', required: true, maxLength: 100 },
    description: { type: 'string', required: true, maxLength: 1000 },
    price: { type: 'string', required: true, pattern: /^\d+\.?\d*$/ }
  };
  
  return validate(data, schema);
};
```

### 2. Error Sanitization

```typescript
const sanitizeError = (error) => {
  const safeError = {
    message: error.message,
    code: error.code,
    // Don't expose sensitive information
  };
  return safeError;
};
```

### 3. Transaction Validation

```typescript
const validateTransaction = (tx) => {
  if (!tx._tokenName || tx._tokenName.length === 0) {
    throw new Error('Token name is required');
  }
  if (!tx._tokenSymbol || tx._tokenSymbol.length === 0) {
    throw new Error('Token symbol is required');
  }
  // Add more validations as needed
};
```

## Deployment Checklist

- [ ] Environment variables configured
- [ ] HashPack Project ID set
- [ ] IPFS API keys configured
- [ ] Hedera testnet endpoints verified
- [ ] Error handling tested
- [ ] User flows tested
- [ ] Performance optimized
- [ ] Security review completed

## Troubleshooting Guide

### Common Issues and Solutions

1. **HashPack Popup Not Appearing**
   - Check browser focus
   - Verify wallet connection
   - Ensure transaction is properly frozen

2. **Transaction Timeout**
   - Increase timeout values
   - Check network connectivity
   - Verify account balance

3. **Protobuf Errors**
   - Use Mirror Node API instead of signer methods
   - Avoid calling problematic methods

4. **WebSocket Connection Issues**
   - Use existing WalletContext instead of creating new connectors
   - Check Project ID configuration

This guide provides the essential patterns and practices for implementing Hedera integration in React applications.
