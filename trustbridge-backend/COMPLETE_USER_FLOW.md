# 🇳🇬 TrustBridge Complete User Flow - Nigeria/Lagos Focused

## 🎯 **COMPLETE USER JOURNEY OVERVIEW**

The TrustBridge platform now supports **4 complete user journeys** with **Nigeria/Lagos-specific** data and **real external party integration**:

---

## **1. 🏢 ASSET OWNER JOURNEY (Nigerian Farmer/Business Owner)**

### **Step 1: Registration & KYC (5 minutes)**
```bash
# User visits TrustBridge.africa
POST /api/auth/register
{
  "email": "adebayo@example.com",
  "password": "securePassword123",
  "firstName": "Adebayo",
  "lastName": "Ogunlesi",
  "phone": "+234-803-123-4567",
  "country": "Nigeria"
}

# Connect wallet (HashPack/MetaMask)
POST /api/auth/wallet
{
  "address": "0x1234567890123456789012345678901234567890",
  "signature": "0x...",
  "message": "TrustBridge Authentication",
  "timestamp": 1703123456
}
```

### **Step 2: Asset Submission (15 minutes)**
```bash
# Create asset
POST /api/assets
{
  "name": "Victoria Island Commercial Complex",
  "type": "REAL_ESTATE",
  "description": "Premium commercial building in Victoria Island, Lagos",
  "location": {
    "country": "Nigeria",
    "region": "Lagos",
    "coordinates": { "lat": 6.4281, "lng": 3.4219 },
    "address": "Victoria Island, Lagos State, Nigeria"
  },
  "totalValue": 250000,
  "tokenSupply": 1000000,
  "owner": "0x1234567890123456789012345678901234567890"
}

# Submit for verification
POST /api/verification/submit
{
  "assetId": "LAGOS-RE-001",
  "evidence": {
    "documents": [
      {
        "name": "Land Certificate",
        "fileRef": "lagos-land-cert-001.pdf"
      }
    ],
    "location": {
      "coordinates": { "lat": 6.4281, "lng": 3.4219 }
    },
    "photos": [
      {
        "description": "Building exterior",
        "fileRef": "victoria-island-building.jpg"
      }
    ]
  }
}
```

### **Step 3: Evidence Gathering (Automated - 30 minutes)**
**System automatically runs evidence plugins:**
- ✅ **Document OCR**: Extracts "Adebayo Ogunlesi" from Lagos land certificate
- ✅ **GPS Verification**: Confirms Victoria Island coordinates via OpenStreetMap
- ✅ **Photo Analysis**: Checks GPS consistency and recent timestamps
- ✅ **Market Price Check**: Compares $250k value against Lagos real estate prices
- ✅ **Automated Score**: 75% (needs human attestation)

### **Step 4: Attestor Assignment (24 hours)**
**System finds qualified Nigerian attestors:**
- ✅ **Nigerian Institution of Surveyors** (95% reputation, real estate specialty)
- ✅ **Lagos State Ministry of Agriculture** (88% reputation, Lagos region)
- ✅ **Nigerian Institution of Estate Surveyors and Valuers** (92% reputation)

**Farmer receives SMS**: "Your verification has been assigned to Nigerian Institution of Surveyors"

### **Step 5: Human Attestation (48 hours)**
**Nigerian Institution of Surveyors receives notification:**
- ✅ Reviews asset submission in attestor dashboard
- ✅ Confirms: "Adebayo Ogunlesi owns Victoria Island property, valid title"
- ✅ Submits attestation: 90% confidence + signature

**Combined Score**: (75% automated × 0.4) + (90% attestor × 0.6) = **84%**
**Status**: VERIFIED (exceeds 75% threshold)

### **Step 6: On-Chain Verification & Tokenization (5 minutes)**
```bash
# System submits verification to Hedera
POST /api/hedera/verify-asset
{
  "assetId": "LAGOS-RE-001",
  "verificationData": {
    "score": 84,
    "evidenceRoot": "0x...",
    "attestorSignatures": ["0x...", "0x..."]
  }
}

# Asset owner pays tokenization fee
POST /api/payments/tokenization-fee
{
  "assetId": "LAGOS-RE-001",
  "amount": 5000, // 2% of $250,000 = $5,000
  "currency": "HBAR"
}
```

### **Step 7: Operations Tracking (Ongoing)**
```bash
# Asset owner logs operations via mobile app
POST /api/mobile/log-operation
{
  "assetId": "LAGOS-RE-001",
  "type": "MAINTENANCE",
  "description": "Building maintenance completed",
  "location": { "lat": 6.4281, "lng": 3.4219 },
  "photos": ["maintenance-photo.jpg"],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### **Step 8: Settlement & Payment (At Maturity)**
```bash
# Buyer confirms delivery
POST /api/settlement/confirm-delivery
{
  "settlementId": "settlement-001",
  "proofHash": "delivery-proof-hash",
  "confirmer": "buyer-address"
}

# Smart contract triggers automatic settlement
# Asset owner receives $250,000 + returns to investors instantly
# Attestor receives verification fee (1% = $2,500)
```

---

## **2. 💰 GLOBAL INVESTOR JOURNEY**

### **Step 1: Discovery (3 minutes)**
```bash
# Browse Nigerian assets
GET /api/assets?country=Nigeria&type=REAL_ESTATE&minValue=200000&maxValue=300000

# Response: Victoria Island Commercial Complex - 84% verified, 20% APY
```

### **Step 2: Due Diligence (8 minutes)**
```bash
# Get detailed asset information
GET /api/assets/LAGOS-RE-001

# Response includes:
# - Verification breakdown: 75% automated + 90% NIS attestation
# - Evidence: Lagos land certificate verified, GPS confirmed
# - Attestor: Nigerian Institution of Surveyors (95% reputation, 47 successful verifications)
# - Real-time operations: "Building maintenance 100% complete"
# - Market analysis: Price reasonable vs Lagos comparable assets
```

### **Step 3: Investment (2 minutes)**
```bash
# Create investment
POST /api/investments
{
  "assetId": "LAGOS-RE-001",
  "amount": 10000, // $10,000 investment
  "investor": "0x4567890123456789012345678901234567890123",
  "expectedTokens": 40000 // 40,000 tokens (4% of 1M supply)
}

# Connect wallet and confirm transaction
POST /api/payments/invest
{
  "investmentId": "inv-001",
  "amount": 10000,
  "currency": "HBAR",
  "walletSignature": "0x..."
}
```

### **Step 4: Monitoring (Ongoing)**
```bash
# Get investment portfolio
GET /api/portfolio/investor/0x4567890123456789012345678901234567890123

# Response includes:
# - Real-time operation updates from asset owner
# - GPS tracking of asset maintenance
# - Quality assessments from Nigerian attestors
# - Market price updates via Chainlink oracles
# - Countdown to maturity date
```

### **Step 5: Returns (Automatic)**
```bash
# Asset matures and buyer confirms delivery
# Smart contract distributes returns automatically
# Investor receives $12,000 in HBAR (20% APY)
# Tax documents generated
# Option to reinvest in new Nigerian assets
```

---

## **3. 🏛️ ATTESTOR JOURNEY (Nigerian Professional/Cooperative)**

### **Step 1: Registration (30 minutes)**
```bash
# Nigerian cooperative applies
POST /api/attestors/register
{
  "organizationName": "Ondo State Cocoa Farmers Cooperative",
  "organizationType": "COOPERATIVE",
  "country": "Nigeria",
  "region": "Ondo",
  "contactEmail": "info@ondococoa.coop.ng",
  "contactPhone": "+234-803-123-4567",
  "specialties": ["AGRICULTURAL"],
  "credentials": {
    "licenseNumber": "COOP-ONDO-2023-001",
    "registrationNumber": "RC-345678",
    "website": "https://www.ondococoa.coop.ng"
  },
  "stakeAmount": 8000
}
```

### **Step 2: Approval & Activation (Admin Review - 48 hours)**
**TrustBridge admin reviews:**
- ✅ Verifies cooperative registration documents
- ✅ Checks reputation with Ondo State Agricultural Ministry
- ✅ Approves application

```bash
# Admin approves attestor
PUT /api/attestors/{attestorId}/approve
{
  "adminNotes": "Verified with Ondo State Agricultural Ministry"
}
```

### **Step 3: Verification Assignment**
```bash
# Receives notification for new verification
GET /api/attestors/{attestorId}/assignments

# Response: "New verification request: Cocoa farm in your area"
# Reviews asset details in attestor dashboard
# Accepts assignment (24-hour response window)
```

### **Step 4: Verification Process**
```bash
# Cooperative verifies farmer
POST /api/attestors/{attestorId}/attestation
{
  "verificationId": "ver-001",
  "attestation": {
    "confidence": 90,
    "comments": "Verified - Adebayo Ogunlesi is registered member, owns 4.2 hectares, good standing",
    "evidence": {
      "membershipVerified": true,
      "farmVisitCompleted": true,
      "landOwnershipConfirmed": true
    }
  }
}
```

### **Step 5: Reputation Building**
```bash
# After successful harvest verification
PUT /api/attestors/{attestorId}/reputation
{
  "performanceData": {
    "accuracy": 95,
    "responseTime": 24, // hours
    "successRate": 98
  }
}

# Cooperative reputation increases: 50% → 55%
# Earns verification fee: $2,500 (1% of asset value)
# Builds track record for future assignments
```

---

## **4. 🛒 BUYER JOURNEY (International/Nigerian Buyer)**

### **Step 1: Pre-Purchase Sourcing**
```bash
# Browse verified Nigerian assets
GET /api/assets?country=Nigeria&status=VERIFIED&type=AGRICULTURAL

# Pre-commit to purchase
POST /api/settlement/create
{
  "assetId": "ONDO-AG-001",
  "buyer": "0x7890123456789012345678901234567890123456",
  "seller": "0x2345678901234567890123456789012345678901",
  "amount": 180000, // $180,000 for cocoa farm
  "deliveryDeadline": "2024-06-30T23:59:59Z",
  "trackingHash": "cocoa-delivery-001"
}
```

### **Step 2: Quality Monitoring**
```bash
# During growing season
GET /api/assets/ONDO-AG-001/operations

# Response includes:
# - Updates on crop progress from farmer
# - Weather data and growth photos
# - Quality assessments from Ondo State Cocoa Farmers Cooperative
# - Market pricing via Chainlink oracles
```

### **Step 3: Harvest & Delivery**
```bash
# Cocoa ready for harvest
POST /api/settlement/confirm-delivery
{
  "settlementId": "settlement-002",
  "proofHash": "cocoa-delivery-proof-hash",
  "confirmer": "0x7890123456789012345678901234567890123456",
  "deliveryConfirmation": {
    "quantity": "2.5 tons",
    "quality": "Grade A",
    "location": { "lat": 7.1667, "lng": 5.1167 }
  }
}

# Smart contract releases payment to farmer
# Receives full supply chain provenance record
```

---

## **🔄 COMPLETE SYSTEM INTEGRATION**

### **Smart Contract Integration**
```bash
# All user actions trigger smart contract interactions:

# 1. Attestor Registration
POST /api/hedera/register-attestor
{
  "attestorAddress": "0x...",
  "stakeAmount": 8000,
  "organizationType": "COOPERATIVE"
}

# 2. Asset Verification
POST /api/hedera/submit-verification
{
  "assetId": "LAGOS-RE-001",
  "score": 84,
  "evidenceRoot": "0x...",
  "attestorSignatures": ["0x...", "0x..."]
}

# 3. Asset Tokenization
POST /api/hedera/tokenize-asset
{
  "assetId": "LAGOS-RE-001",
  "totalValue": 250000,
  "tokenSupply": 1000000,
  "owner": "0x1234567890123456789012345678901234567890"
}

# 4. Investment
POST /api/hedera/invest
{
  "assetId": "LAGOS-RE-001",
  "investor": "0x4567890123456789012345678901234567890123",
  "amount": 10000,
  "tokens": 40000
}

# 5. Settlement
POST /api/hedera/create-settlement
{
  "assetId": "LAGOS-RE-001",
  "buyer": "0x7890123456789012345678901234567890123456",
  "seller": "0x1234567890123456789012345678901234567890",
  "amount": 250000
}
```

### **External API Integration**
```bash
# Free APIs used throughout the flow:

# 1. Document OCR (Tesseract.js)
POST /api/external-apis/ocr
{
  "imageBuffer": "base64-encoded-image",
  "mimeType": "image/jpeg"
}

# 2. GPS Verification (OpenStreetMap)
POST /api/external-apis/verify-gps
{
  "lat": 6.4281,
  "lng": 3.4219
}

# 3. Weather Data (OpenWeatherMap)
GET /api/external-apis/weather?lat=6.4281&lng=3.4219

# 4. Market Prices (Alpha Vantage/CoinGecko)
GET /api/external-apis/market-price?asset=coffee&country=nigeria
```

---

## **📊 REAL-TIME MONITORING & ANALYTICS**

### **Dashboard Endpoints**
```bash
# Asset Owner Dashboard
GET /api/analytics/asset-owner/0x1234567890123456789012345678901234567890
# Response: Asset performance, verification status, investor activity

# Investor Dashboard
GET /api/analytics/investor/0x4567890123456789012345678901234567890123
# Response: Portfolio performance, returns, risk analysis

# Attestor Dashboard
GET /api/analytics/attestor/0x...
# Response: Verification assignments, reputation, earnings

# Admin Dashboard
GET /api/admin/system-overview
# Response: Platform metrics, user activity, financial reports
```

### **WebSocket Real-time Updates**
```bash
# Subscribe to asset updates
WebSocket: ws://localhost:4000/ws
{
  "type": "subscribe",
  "channel": "asset-updates",
  "assetId": "LAGOS-RE-001"
}

# Receive real-time notifications:
# - Verification status changes
# - New investments
# - Operation updates
# - Settlement confirmations
```

---

## **🎯 NIGERIA-SPECIFIC FEATURES**

### **Geographic Coverage**
- ✅ **Lagos State**: Victoria Island, Ikoyi, Lekki Phase 1
- ✅ **Ondo State**: Cocoa plantations
- ✅ **Kano State**: Rice farms
- ✅ **Abuja**: Federal capital real estate

### **Professional Networks**
- ✅ **Government**: Lagos State Ministry of Agriculture
- ✅ **Surveyors**: Nigerian Institution of Surveyors (NIS)
- ✅ **Appraisers**: Nigerian Institution of Estate Surveyors and Valuers (NIESV)
- ✅ **Auditors**: Institute of Chartered Accountants of Nigeria (ICAN)
- ✅ **Cooperatives**: Ondo State Cocoa Farmers Cooperative

### **Market Data**
- ✅ **Real Estate**: Lagos prices ($250k Victoria Island, $200k Ikoyi)
- ✅ **Agriculture**: Nigerian commodity prices (Coffee $3.20/kg, Rice $350/ton)
- ✅ **Equipment**: Local market rates ($35k/unit)
- ✅ **Currency**: NGN pricing with USD conversion

---

## **🚀 PRODUCTION READY FEATURES**

### **Security & Compliance**
- ✅ **JWT Authentication** with wallet signature verification
- ✅ **Role-Based Access Control** (RBAC)
- ✅ **KYC/AML Integration** with Nigerian requirements
- ✅ **Hedera HTS KYC/Freeze** controls
- ✅ **Rate Limiting** and **Helmet** security

### **Scalability & Performance**
- ✅ **MongoDB Atlas** cloud database
- ✅ **Google Drive** file storage
- ✅ **WebSocket** real-time updates
- ✅ **Cron Jobs** for automated tasks
- ✅ **Event-Driven Architecture** with EventEmitter2

### **Monitoring & Analytics**
- ✅ **Swagger/OpenAPI** documentation
- ✅ **Comprehensive Logging** with Winston
- ✅ **Error Handling** and **Health Checks**
- ✅ **Performance Metrics** and **System Monitoring**

---

## **🎉 COMPLETE USER FLOW SUMMARY**

**The TrustBridge platform now provides a complete, production-ready RWA tokenization system with:**

1. ✅ **4 Complete User Journeys** (Asset Owner, Investor, Attestor, Buyer)
2. ✅ **Nigeria/Lagos Market Focus** with local data and professionals
3. ✅ **Real External Party Integration** using free APIs and realistic simulations
4. ✅ **Smart Contract Integration** with Hedera Hashgraph
5. ✅ **Comprehensive Verification System** with automated + human attestation
6. ✅ **Real-time Monitoring** and **Analytics**
7. ✅ **Production-ready Security** and **Scalability**

**Ready for the Hedera Africa Hackathon 2025!** 🏆🇳🇬
