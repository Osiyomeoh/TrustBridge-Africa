# Digital Asset Creation Flow - Complete Process

## 🎯 Overview

The digital asset creation flow in TrustBridge allows users to create unique digital assets on the Hedera network using HashPack wallet integration. Here's the complete step-by-step process:

## 📋 Step-by-Step Flow

### **Step 1: User Authentication & Wallet Connection**
```
User opens CreateDigitalAsset page
    ↓
Check if HashPack wallet is connected
    ↓
If not connected → Show "Connect Wallet" button
    ↓
User clicks "Connect Wallet" → HashPack popup appears
    ↓
User approves connection → Wallet connected ✅
```

**Code Location**: `WalletContext.tsx`
```typescript
const { isConnected, accountId, signer, hederaClient } = useWallet();
```

### **Step 2: Multi-Step Form - Basic Information**
```
User fills out form fields:
    ↓
- Asset Name (required)
- Description (required)
- Asset Type (digital/physical)
- Category (dropdown selection)
- Location (optional)
    ↓
Form validation runs in real-time
    ↓
"Next" button enabled when valid ✅
```

**Code Location**: `CreateDigitalAsset.tsx` - Step 1
```typescript
const [formData, setFormData] = useState({
  name: '',
  description: '',
  assetType: 'digital',
  category: 0,
  location: ''
});
```

### **Step 3: Multi-Step Form - Pricing & Details**
```
User sets pricing information:
    ↓
- Total Value (in HBAR)
- Royalty Percentage (0-100%)
- Tradeable (yes/no)
- Auctionable (yes/no)
    ↓
Form validation ensures valid pricing
    ↓
"Next" button enabled when valid ✅
```

**Code Location**: `CreateDigitalAsset.tsx` - Step 2
```typescript
const [formData, setFormData] = useState({
  totalValue: '',
  royaltyPercentage: '2.5',
  isTradeable: true,
  isAuctionable: false
});
```

### **Step 4: File Upload - Images & Documents**
```
User uploads files:
    ↓
- Primary Image (required)
- Additional Images (optional)
- Documents (optional)
    ↓
Files uploaded to IPFS via Pinata API
    ↓
IPFS URLs returned and stored
    ↓
File previews shown to user
    ↓
"Next" button enabled when primary image uploaded ✅
```

**Code Location**: `CreateDigitalAsset.tsx` - Step 3
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
  
  return response.json();
};
```

### **Step 5: Collection Information (Optional)**
```
User can create or join a collection:
    ↓
- Collection Name (optional)
- Collection Description (optional)
- Collection Image (optional)
    ↓
Collection data stored with asset
    ↓
"Next" button always enabled ✅
```

**Code Location**: `CreateDigitalAsset.tsx` - Step 4
```typescript
const [formData, setFormData] = useState({
  collectionName: '',
  collectionDescription: '',
  collectionImage: ''
});
```

### **Step 6: Review & Confirmation**
```
User reviews all entered information:
    ↓
- Basic Information summary
- Pricing details
- Uploaded files preview
- Collection information
    ↓
User can go back to edit any step
    ↓
"Create Asset" button enabled ✅
```

**Code Location**: `CreateDigitalAsset.tsx` - Step 5
```typescript
const canProceed = useMemo(() => {
  return currentStep === 6 && 
         formData.name && 
         formData.description && 
         uploadedFiles.length > 0 && 
         !isUploading;
}, [currentStep, formData, uploadedFiles, isUploading]);
```

### **Step 7: Hedera Token Creation**
```
User clicks "Create Asset"
    ↓
Check HBAR balance for transaction fees
    ↓
Create Hedera Token using HTS:
    ↓
- Token Name: "DigitalAsset_[timestamp]"
- Token Symbol: First 5 chars of asset type
- Token Type: FungibleCommon
- Decimals: 2
- Initial Supply: 1000
- Treasury Account: User's account
    ↓
Freeze transaction with signer
    ↓
Request HashPack approval (popup appears)
    ↓
User approves transaction in HashPack
    ↓
Execute transaction on Hedera network
    ↓
Get transaction receipt with Token ID ✅
```

**Code Location**: `CreateDigitalAsset.tsx` - handleSubmit()
```typescript
const tokenCreateTx = new TokenCreateTransaction()
  .setTokenName(tokenName)
  .setTokenSymbol(tokenSymbol)
  .setTokenType(TokenType.FungibleCommon)
  .setDecimals(2)
  .setInitialSupply(1000)
  .setTreasuryAccountId(accountId)
  .setFreezeDefault(false)
  .setMaxTransactionFee(1000)
  .setTransactionValidDuration(120);

// Freeze and sign
tokenCreateTx.freezeWithSigner(signer);
const signedTokenTx = await signer.signTransaction(tokenCreateTx);

// Execute
const tokenResponse = await signedTokenTx.execute(hederaClient);
const receipt = await tokenResponse.getReceipt(hederaClient);
const assetTokenId = receipt.tokenId?.toString();
```

### **Step 8: Asset Data Storage**
```
Token created successfully
    ↓
Create comprehensive asset data object:
    ↓
- Token ID from Hedera
- All form data
- IPFS URLs for files
- Owner information
- Timestamps
- Status: "VERIFIED"
    ↓
Store in localStorage for immediate access
    ↓
Show success notification to user
    ↓
Redirect to Assets page or show success message ✅
```

**Code Location**: `CreateDigitalAsset.tsx` - Asset storage
```typescript
const assetData = {
  tokenId: assetTokenId,
  fileId: 'metadata-stored-in-backend',
  topicId: 'events-logged-in-backend',
  name: formData.name,
  description: formData.description,
  imageURI: uploadedFiles[0]?.ipfsUrl || '',
  documentURI: formData.documentURI || '',
  owner: accountId,
  currency: 'HBAR',
  priceInHBAR: formData.totalValue,
  status: 'VERIFIED',
  assetType: formData.assetType,
  category: formData.category,
  location: formData.location,
  tags: [],
  isTradeable: formData.isTradeable,
  isAuctionable: formData.isAuctionable,
  royaltyPercentage: formData.royaltyPercentage,
  collection: {
    name: formData.collectionName,
    description: formData.collectionDescription,
    image: formData.collectionImage
  }
};

// Store in localStorage
const existingAssets = JSON.parse(localStorage.getItem('digitalAssets') || '[]');
existingAssets.push(assetData);
localStorage.setItem('digitalAssets', JSON.stringify(existingAssets));
```

## 🔄 Data Flow Diagram

```
User Input → Form Validation → File Upload → Hedera Token Creation → Asset Storage
     ↓              ↓              ↓              ↓                    ↓
  Basic Info    Real-time      IPFS Upload    HTS Transaction    localStorage
  Pricing       Validation     Pinata API     HashPack Sign      Success UI
  Files         Error Handling File URLs      Network Execution   Redirect
  Collection    Step Navigation Preview       Token ID           Asset List
```

## ⚡ Key Technical Components

### **1. Form State Management**
```typescript
const [currentStep, setCurrentStep] = useState(1);
const [formData, setFormData] = useState<DigitalAssetForm>({...});
const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
const [isCreating, setIsCreating] = useState(false);
```

### **2. Step Navigation**
```typescript
const steps = [
  { id: 1, title: 'Basic Information', description: 'Asset details' },
  { id: 2, title: 'Pricing & Details', description: 'Value and settings' },
  { id: 3, title: 'Upload Files', description: 'Images and documents' },
  { id: 4, title: 'Collection', description: 'Optional grouping' },
  { id: 5, title: 'Review', description: 'Confirm details' }
];
```

### **3. Validation Logic**
```typescript
const canProceed = useMemo(() => {
  switch (currentStep) {
    case 1: return formData.name && formData.description;
    case 2: return formData.totalValue && !isNaN(parseFloat(formData.totalValue));
    case 3: return uploadedFiles.length > 0;
    case 4: return true; // Optional step
    case 5: return true; // Review step
    default: return false;
  }
}, [currentStep, formData, uploadedFiles]);
```

### **4. Error Handling**
```typescript
try {
  // Hedera operations
} catch (error) {
  if (error.message.includes('TOKEN_HAS_NO_SUPPLY_KEY')) {
    // Handle specific Hedera errors
  } else if (error.message.includes('Request expired')) {
    // Handle timeout errors
  } else {
    // Generic error handling
  }
}
```

## 🎯 Success Criteria

### **User Experience**
- ✅ Intuitive multi-step form
- ✅ Real-time validation feedback
- ✅ Clear progress indication
- ✅ Error messages and recovery
- ✅ Success confirmation

### **Technical Requirements**
- ✅ HashPack wallet integration
- ✅ Hedera token creation
- ✅ IPFS file uploads
- ✅ Data persistence
- ✅ Error handling

### **Business Logic**
- ✅ Asset uniqueness (timestamp-based names)
- ✅ HBAR-based pricing
- ✅ Royalty system
- ✅ Trading capabilities
- ✅ Collection support

## 🚨 Critical Points

1. **Wallet Connection**: Must be connected before starting
2. **HBAR Balance**: Sufficient balance required for transaction fees
3. **File Upload**: Primary image required, others optional
4. **HashPack Approval**: User must approve transaction in popup
5. **Network Status**: Hedera testnet must be accessible

## 🔧 Troubleshooting

### **Common Issues**
- **HashPack popup not appearing**: Check browser focus and wallet connection
- **Transaction timeout**: Increase timeout values or check network
- **File upload fails**: Verify IPFS API keys and file size limits
- **Form validation errors**: Check required fields and data formats

### **Debug Commands**
```javascript
// Check form data
console.log('Form data:', formData);

// Check uploaded files
console.log('Uploaded files:', uploadedFiles);

// Check wallet status
console.log('Wallet connected:', isConnected);

// Check stored assets
console.log('Stored assets:', JSON.parse(localStorage.getItem('digitalAssets') || '[]'));
```

This flow ensures a smooth, user-friendly experience while maintaining technical robustness and security throughout the digital asset creation process.
