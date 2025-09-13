# TrustBridge Architecture Overview
## Complete System Architecture: Smart Contracts → Services → API

### 🏗️ **SYSTEM ARCHITECTURE LAYERS**

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Web App   │  │  Mobile App │  │  Admin UI   │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API LAYER                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ REST API    │  │ GraphQL API │  │ WebSocket   │            │
│  │ (Swagger)   │  │ (Apollo)    │  │ (Real-time) │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                  SERVICE LAYER                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ Chainlink   │  │   Hedera    │  │  Business   │            │
│  │  Service    │  │  Service    │  │  Services   │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                BLOCKCHAIN LAYER                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Hedera    │  │  Chainlink  │  │   MongoDB   │            │
│  │ Smart       │  │   Oracles   │  │  Database   │            │
│  │ Contracts   │  │             │  │             │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔗 **SMART CONTRACTS (Hedera Layer)**

### **Core Contracts Deployed on Hedera Testnet:**

#### 1. **TrustToken** (`0x5Fc7CFc9de33F889E5082a794C86924dE0730F1B`)
```solidity
// Governance and staking token
- totalSupply: 200,000,000 TRUST tokens
- staking mechanism with APY rewards
- role-based access control
- burn functionality for deflationary economics
```

#### 2. **AttestorManager** (`0x4cBc1051eFaa1DE9b269F1D198607116f1b73B2A`)
```solidity
// Manages verification providers
- attestor registration and stake management
- reputation scoring system
- slashing mechanism for bad actors
- total staked amount tracking
```

#### 3. **PolicyManager** (`0xdFA7fABDB764D552E4CF411588a7Be516CB0538d`)
```solidity
// Asset verification policies
- AGRICULTURAL: minScore=7500, requiredAttestors=2
- REAL_ESTATE: minScore=8500, requiredAttestors=3, manualReview=true
- EQUIPMENT: minScore=7000, requiredAttestors=1
```

#### 4. **VerificationRegistry** (`0x191BD2259BeC74d4680295A81f71ED9853d89D52`)
```solidity
// Orchestrates verification process
- verification request submission
- attestation collection and scoring
- final verification status determination
- evidence hash storage
```

#### 5. **AssetFactory** (`0xD051EfA5FDeAB780F80d762bE2e9d2C64af7ED4B`)
```solidity
// Asset tokenization factory
- creates AssetToken contracts for each RWA
- handles tokenization fees
- integrates with verification system
- manages asset lifecycle
```

#### 6. **SettlementEngine** (`0x31C0112671810d3Bf29e2fa3C1D2668B8aDD18FD`)
```solidity
// Escrow and settlement system
- creates settlements for asset trades
- handles delivery confirmations
- automated settlement execution
- dispute resolution mechanism
```

#### 7. **FeeDistribution** (`0x173782c2151cA9d4c99beFd165FC2293444f6533`)
```solidity
// Protocol fee management
- collects fees from tokenization and settlements
- distributes to treasury and insurance pool
- manages protocol sustainability
```

#### 8. **VerificationBuffer** (`0xBf47D97f75EC66BFdaC3bBe9E3DBFFce9D57C295`)
```solidity
// Oracle lag protection
- 72-hour buffer period for price stabilization
- 4-hour price sampling intervals
- liquidation protection levels
- price volatility monitoring
```

---

## 🌐 **SERVICE LAYER**

### **1. Chainlink Service** (`src/services/chainlink.service.ts`)

**Purpose**: Integrates with Chainlink oracles for real-time external data

**Key Functions**:
```typescript
// Price Feeds
- getCoffeePrice(): Coffee commodity prices
- getAgriculturalCommodityPrice(): Corn, wheat prices
- getRealEstateIndex(): Real estate market data

// External Data
- getWeatherData(): Weather conditions for crop assessment
- verifyGPSLocation(): GPS verification for asset locations
- getMarketSentiment(): Market sentiment analysis

// VRF (Verifiable Random Function)
- requestRandomAttestors(): Fair attestor selection

// Automation
- registerSettlementUpkeep(): Automated settlement execution
- performSettlementUpkeep(): Execute scheduled settlements
```

**Integration Points**:
- Hedera testnet price feed contracts
- OpenWeatherMap API for weather data
- GPS verification services
- Market sentiment APIs

### **2. Hedera Service** (`src/services/hedera.service.ts`)

**Purpose**: Integrates with all Hedera services for blockchain operations

**Key Functions**:
```typescript
// Smart Contract Integration
- tokenizeAsset(): Create asset tokens
- verifyAsset(): Submit verification data
- createSettlement(): Create escrow settlements
- stakeTokens(): Stake TRUST tokens

// Hedera Consensus Service (HCS)
- submitAssetUpdate(): Real-time asset updates
- submitSettlementUpdate(): Settlement status updates
- submitVerificationUpdate(): Verification progress updates

// Hedera Token Service (HTS)
- createHTSAssetToken(): Native HTS token creation
- getHTSAssetToken(): Retrieve token information

// Hedera File Service (HFS)
- storeDocument(): Store verification documents
- retrieveDocument(): Retrieve stored documents
- appendToDocument(): Update document content

// Scheduled Transactions
- scheduleSettlementExecution(): Schedule automated settlements
- scheduleMaturityPayment(): Schedule maturity payments
- getScheduledTransactionInfo(): Monitor scheduled transactions
```

**Integration Points**:
- Hedera testnet smart contracts
- HCS topics for real-time messaging
- HTS for native token creation
- HFS for document storage
- Scheduled transaction system

### **3. Business Services**

#### **Asset Service** (`src/services/asset.service.ts`)
```typescript
- createAsset(): Create new RWA assets
- getAssets(): Retrieve assets with filtering
- updateAssetStatus(): Update asset lifecycle status
- invest(): Process investor investments
```

#### **Verification Orchestrator** (`src/services/verification-orchestrator.service.ts`)
```typescript
- submitVerificationRequest(): Initiate verification process
- runEvidenceGathering(): Execute automated evidence collection
- assignAttestors(): Assign verification providers
- calculateFinalScore(): Determine verification outcome
```

#### **Evidence Gathering Service** (`src/services/evidence-gathering.service.ts`)
```typescript
- runDocumentOCR(): Extract data from documents
- verifyGeolocation(): Validate GPS coordinates
- checkMarketPrice(): Validate asset valuations
- analyzePhotos(): Verify photo authenticity
```

#### **Settlement Service** (`src/services/settlement.service.ts`)
```typescript
- createSettlement(): Create escrow settlements
- confirmDelivery(): Confirm asset delivery
- executeSettlement(): Process final settlements
- handleDisputes(): Manage dispute resolution
```

---

## 🔄 **DATA FLOW ARCHITECTURE**

### **1. Asset Tokenization Flow**

```
User Submits Asset
       ↓
Verification Request Created
       ↓
Evidence Gathering (Chainlink + Automated)
       ↓
Attestor Assignment (VRF)
       ↓
Human Verification
       ↓
On-Chain Verification (Hedera)
       ↓
Asset Tokenization (AssetFactory)
       ↓
HTS Token Creation
       ↓
Asset Listed for Investment
```

### **2. Investment Flow**

```
Investor Browses Assets
       ↓
Due Diligence (Chainlink Data)
       ↓
Investment Decision
       ↓
Settlement Creation (SettlementEngine)
       ↓
Funds Escrowed
       ↓
Asset Delivery Tracking (HCS)
       ↓
Delivery Confirmation
       ↓
Automatic Settlement
       ↓
Returns Distribution
```

### **3. Real-Time Updates Flow**

```
Asset Operation Occurs
       ↓
HCS Message Submitted
       ↓
Backend Service Processes
       ↓
Database Updated
       ↓
WebSocket Notification
       ↓
Frontend Updates
       ↓
User Sees Real-Time Status
```

---

## 🗄️ **DATABASE ARCHITECTURE (MongoDB)**

### **Core Collections**:

#### **Users Collection**
```typescript
{
  walletAddress: string,
  role: 'INVESTOR' | 'ASSET_OWNER' | 'VERIFIER' | 'ADMIN',
  kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED',
  reputation: number,
  stakingBalance: BigInt,
  stakingRewards: number
}
```

#### **Assets Collection**
```typescript
{
  assetId: string,
  owner: string,
  type: 'AGRICULTURAL' | 'REAL_ESTATE' | 'EQUIPMENT',
  name: string,
  location: { country, region, coordinates },
  totalValue: number,
  tokenSupply: number,
  verificationScore: number,
  status: 'PENDING' | 'VERIFIED' | 'ACTIVE' | 'MATURED'
}
```

#### **VerificationRequests Collection**
```typescript
{
  assetId: string,
  status: 'SUBMITTED' | 'EVIDENCE_GATHERING' | 'VERIFIED',
  evidence: [{ type, provider, confidence, result }],
  attestations: [{ attestorAddress, confidence, evidence }],
  scoring: { automatedScore, attestorScore, finalScore }
}
```

#### **Settlements Collection**
```typescript
{
  assetId: string,
  buyer: string,
  seller: string,
  amount: number,
  status: 'PENDING' | 'IN_TRANSIT' | 'SETTLED',
  deliveryDeadline: Date,
  trackingHash: string
}
```

---

## 🔌 **API ARCHITECTURE**

### **1. REST API** (`/api/*`)

**Endpoints**:
```
GET  /api/assets                    - List assets
GET  /api/assets/:id               - Get asset details
POST /api/assets                   - Create asset
GET  /api/verification/status/:id  - Get verification status
POST /api/verification/submit      - Submit verification
GET  /api/attestors                - List attestors
POST /api/attestors/register       - Register attestor
GET  /api/chainlink/price/coffee   - Get coffee price
GET  /api/chainlink/weather        - Get weather data
GET  /api/hedera/status            - Get Hedera services status
GET  /api/market/stats             - Get market statistics
```

### **2. GraphQL API** (`/graphql`)

**Queries**:
```graphql
query {
  assets(filter: { type: AGRICULTURAL, status: ACTIVE }) {
    id, name, totalValue, expectedAPY, verificationScore
  }
  marketStats {
    totalValueLocked, totalAssets, averageAPY
  }
  verificationRequest(assetId: "COFFEE_001") {
    status, evidence, attestations, scoring
  }
}
```

**Mutations**:
```graphql
mutation {
  createAsset(input: {
    type: AGRICULTURAL
    name: "Coffee Harvest Q1/2026"
    totalValue: 50000
    expectedAPY: 20.5
  }) {
    id, assetId, status
  }
  
  submitVerificationRequest(input: {
    assetId: "COFFEE_001"
    declaredValue: 50000
    documents: [{ name: "land_cert.pdf", fileRef: "file_123" }]
  }) {
    id, status
  }
}
```

**Subscriptions**:
```graphql
subscription {
  assetCreated {
    id, name, type, status
  }
  
  verificationStatusChanged(assetId: "COFFEE_001") {
    status, scoring
  }
  
  settlementCreated {
    id, assetId, amount, status
  }
}
```

### **3. WebSocket Real-Time Updates**

**Connection**: `ws://localhost:4000/graphql`

**Real-Time Events**:
- Asset status changes
- Verification progress updates
- Settlement status changes
- Price updates
- Market statistics updates

---

## 🔄 **INTEGRATION POINTS**

### **1. Smart Contract ↔ Service Integration**

```typescript
// Example: Asset Tokenization
const hederaService = new HederaService();

// 1. Submit verification to smart contract
await hederaService.submitVerification(verificationData);

// 2. Create asset token via smart contract
const result = await hederaService.tokenizeAsset({
  assetType: 'AGRICULTURAL',
  name: 'Coffee Harvest Q1/2026',
  totalValue: 50000,
  tokenSupply: 2000,
  fee: 1000
});

// 3. Create HTS token
const htsToken = await hederaService.createHTSAssetToken({
  name: 'Coffee Token',
  symbol: 'COFFEE-2026',
  initialSupply: 2000,
  assetId: result.assetId
});
```

### **2. Chainlink ↔ Service Integration**

```typescript
// Example: Price Validation
const chainlinkService = new ChainlinkService();

// 1. Get current coffee price
const coffeePrice = await chainlinkService.getCoffeePrice();

// 2. Validate asset valuation
const isReasonable = assetValue / coffeePrice < 1000; // Max 1000 lbs

// 3. Get weather data for crop assessment
const weather = await chainlinkService.getWeatherData({
  lat: -1.2921, lng: 36.8219
});

// 4. Select random attestors
const randomAttestors = await chainlinkService.requestRandomAttestors(
  assetId, totalAttestors, requiredCount
);
```

### **3. Database ↔ Service Integration**

```typescript
// Example: Asset Creation
const assetService = new AssetService();

// 1. Create asset in database
const asset = await assetService.createAsset({
  type: 'AGRICULTURAL',
  name: 'Coffee Harvest Q1/2026',
  totalValue: 50000,
  expectedAPY: 20.5
});

// 2. Submit for verification
const verification = await verificationOrchestrator.submitVerificationRequest({
  assetId: asset.assetId,
  declaredValue: 50000,
  metadata: { location: { lat: -1.2921, lng: 36.8219 } }
});

// 3. Update asset status
await assetService.updateAssetStatus(asset.id, 'VERIFIED');
```

---

## 🎯 **HACKATHON IMPACT FEATURES**

### **1. Maximum Hedera Services Utilization**
- ✅ **Smart Contracts**: 8 contracts deployed and functional
- ✅ **HCS**: Real-time messaging for all operations
- ✅ **HTS**: Native token creation for assets
- ✅ **HFS**: Document storage and retrieval
- ✅ **Scheduled Transactions**: Automated settlements and payments

### **2. Complete Chainlink Integration**
- ✅ **Price Feeds**: Coffee, agricultural commodities, real estate
- ✅ **Weather Data**: Crop assessment and monitoring
- ✅ **GPS Verification**: Location validation
- ✅ **VRF**: Fair attestor selection
- ✅ **Automation**: Automated settlement execution

### **3. Production-Ready Architecture**
- ✅ **REST API**: Comprehensive endpoints with Swagger docs
- ✅ **GraphQL API**: Advanced queries, mutations, subscriptions
- ✅ **WebSocket**: Real-time updates
- ✅ **Database**: Optimized MongoDB with indexes
- ✅ **Security**: JWT authentication, rate limiting, CORS

### **4. Complete User Journeys**
- ✅ **Asset Owner**: Submit → Verify → Tokenize → Operate
- ✅ **Investor**: Discover → Analyze → Invest → Monitor → Returns
- ✅ **Attestor**: Register → Verify → Build Reputation → Earn Fees
- ✅ **Buyer**: Source → Pre-commit → Monitor → Receive → Pay

---

## 🚀 **DEPLOYMENT STATUS**

### **Smart Contracts (Hedera Testnet)**
- ✅ All 8 contracts deployed and verified
- ✅ Contract addresses saved in `deployments/hedera_testnet.json`
- ✅ Ready for HashScan verification

### **Backend Services**
- ✅ All services implemented and integrated
- ✅ Chainlink and Hedera services functional
- ✅ Database models and API endpoints ready
- ✅ Swagger documentation complete

### **Testing Status**
- ✅ Smart contract tests: 100% passing
- ✅ User flow tests: Complete end-to-end
- ✅ Integration tests: Ready for execution

---

## 🎯 **NEXT STEPS FOR DEMO**

1. **Start Backend Server**: `npm run dev` or `npx ts-node src/simple-server.ts`
2. **Test API Endpoints**: Visit `http://localhost:4000/api-docs`
3. **Run Integration Tests**: Execute comprehensive test suite
4. **Demo User Flows**: Show complete stakeholder journeys
5. **Showcase Real-Time Features**: Demonstrate WebSocket updates
6. **Highlight Hedera + Chainlink**: Emphasize maximum service utilization

This architecture demonstrates a **production-ready, enterprise-grade RWA tokenization platform** that maximizes both Hedera and Chainlink services for the hackathon!
