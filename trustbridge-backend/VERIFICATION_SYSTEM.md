# TrustBridge Verification System

## Overview

The TrustBridge Verification System is a comprehensive, multi-source evidence gathering and attestation platform that ensures the authenticity and accuracy of real-world assets before tokenization. The system combines automated evidence collection with human attestor verification to create a robust, trustworthy verification process.

## Architecture

### Core Components

1. **Evidence Gathering Service** - Plugin-based system for collecting evidence from multiple sources
2. **Verification Orchestrator** - Manages the complete verification workflow
3. **Attestor Management** - Handles attestor registration, reputation, and assignment
4. **Blockchain Integration** - Records verification results on Hedera Hashgraph
5. **Monitoring System** - Real-time monitoring and automated maintenance

### Evidence Sources

The system gathers evidence from five primary sources:

- **Document OCR** (AWS Textract) - Extracts and verifies ownership documents
- **Geolocation** (Google Maps API) - Validates asset location and GPS coordinates
- **Photo Verification** - Analyzes photos for authenticity and relevance
- **Registry Check** - Cross-references with government/cooperative databases
- **Market Price** - Validates declared values against market data

## API Endpoints

### Verification Requests

```http
POST /api/verification/submit
Content-Type: application/json

{
  "assetId": "unique-asset-identifier",
  "assetType": "AGRICULTURAL|REAL_ESTATE|EQUIPMENT",
  "declaredValue": 50000,
  "metadata": {
    "country": "Kenya",
    "gps": { "lat": -1.2921, "lng": 36.8219 },
    "hectares": 5
  },
  "documents": [
    { "name": "Land Title", "fileRef": "doc_123.pdf" }
  ],
  "photos": [
    { 
      "description": "Property overview", 
      "fileRef": "photo_456.jpg",
      "gpsData": { "lat": -1.2921, "lng": 36.8219 }
    }
  ]
}
```

```http
GET /api/verification/status/{assetId}
```

### Attestations

```http
POST /api/verification/attestation
Content-Type: application/json

{
  "assetId": "unique-asset-identifier",
  "confidence": 0.85,
  "evidence": "Field inspection completed",
  "signature": "cryptographic-signature"
}
```

### Attestor Management

```http
POST /api/attestors/register
Content-Type: application/json

{
  "organizationName": "Kenya Agricultural Cooperative",
  "type": "COOPERATIVE",
  "country": "Kenya",
  "region": "Central",
  "specialties": ["AGRICULTURAL"],
  "credentials": {
    "licenseNumber": "KAC-2024-001",
    "certifications": ["Agricultural Surveyor"],
    "yearsExperience": 10,
    "registrationProof": "registration_doc.pdf"
  },
  "contactInfo": {
    "email": "contact@kac.co.ke",
    "phone": "+254700123456",
    "address": "Nairobi, Kenya"
  }
}
```

```http
GET /api/attestors?country=Kenya&assetType=AGRICULTURAL&status=ACTIVE
```

```http
GET /api/attestors/{walletAddress}/assignments
```

## GraphQL Schema

### Queries

```graphql
query GetVerificationRequest($assetId: String!) {
  verificationRequest(assetId: $assetId) {
    id
    assetId
    assetType
    status
    evidence {
      type
      provider
      confidence
      result
    }
    attestations {
      attestorAddress
      confidence
      evidence
      timestamp
    }
    scoring {
      automatedScore
      attestorScore
      finalScore
    }
  }
}

query GetAttestors($country: String, $status: AttestorStatus) {
  attestors(country: $country, status: $status) {
    id
    walletAddress
    organizationName
    type
    reputation {
      score
      totalAttestations
      correctAttestations
    }
  }
}
```

### Mutations

```graphql
mutation SubmitVerificationRequest($input: VerificationRequestInput!) {
  submitVerificationRequest(input: $input) {
    id
    assetId
    status
  }
}

mutation SubmitAttestation($input: AttestationInput!) {
  submitAttestation(input: $input)
}
```

### Subscriptions

```graphql
subscription VerificationStatusChanged($assetId: String) {
  verificationStatusChanged(assetId: $assetId) {
    id
    assetId
    status
    scoring {
      finalScore
    }
  }
}
```

## Verification Workflow

### 1. Submission
- Asset owner submits verification request with documents and photos
- System validates required fields and creates verification record

### 2. Evidence Gathering
- Automated plugins collect evidence from multiple sources
- Document OCR extracts ownership information
- Geolocation validates asset coordinates
- Photo analysis checks authenticity and relevance
- Registry lookup confirms ownership records
- Market price validation ensures reasonable valuations

### 3. Scoring
- Automated score calculated from evidence confidence levels
- Weighted scoring: Document OCR (30%), Geolocation (25%), Photos (20%), Registry (15%), Market Price (10%)

### 4. Attestor Assignment
- If automated score ≥ 60%, system assigns qualified attestors
- Attestors selected based on location, specialties, and reputation
- Manual review required if automated score < 60%

### 5. Attestation
- Assigned attestors review evidence and submit attestations
- Each attestor provides confidence score and evidence summary
- System calculates final score combining automated and attestor scores

### 6. Finalization
- If final score ≥ 75%, verification is approved
- Verification record submitted to blockchain
- Asset becomes eligible for tokenization

## Attestor Types

- **COOPERATIVE** - Agricultural cooperatives and farmer organizations
- **EXTENSION_OFFICER** - Government agricultural extension officers
- **GOVERNMENT_OFFICIAL** - Official government representatives
- **SURVEYOR** - Licensed land surveyors
- **APPRAISER** - Certified property appraisers
- **AUDITOR** - Financial and compliance auditors

## Reputation System

Attestors maintain reputation scores based on:
- **Accuracy** - Correctness of their attestations
- **Volume** - Number of attestations completed
- **Consistency** - Reliability over time
- **Disputes** - Number of disputed attestations

Reputation scores range from 0-100 and affect:
- Assignment priority
- Stake requirements
- Slashing penalties

## Monitoring and Maintenance

### Automated Monitoring

- **Hourly**: Check for expired verifications
- **Daily**: Flag suspicious activity
- **Weekly**: Update attestor reputations
- **Monthly**: Clean up old data
- **Every 6 hours**: Generate health reports

### Suspicious Activity Detection

- Attestors with low accuracy scores
- Rapid verification requests from same owner
- Unusually high verification scores
- Perfect attestor scores (potential gaming)

### Performance Metrics

- Average processing time
- Verification success rate
- Attestor utilization
- System capacity metrics

## Security Features

- **Evidence Signing** - Cryptographic signatures for all evidence
- **Reputation Slashing** - Penalties for fraudulent attestations
- **Stake Requirements** - Attestors must stake tokens
- **Multi-party Verification** - Multiple attestors required for high-value assets
- **Audit Trails** - Complete history of all verification activities

## Database Schema

### VerificationRequest
```typescript
{
  assetId: string;
  assetType: string;
  ownerAddress: string;
  declaredValue: number;
  status: VerificationStatus;
  evidence: Evidence[];
  attestations: Attestation[];
  scoring: VerificationScoring;
  assignedAttestors: string[];
  metadata: any;
  documents: Document[];
  photos: Photo[];
  createdAt: Date;
  expiresAt?: Date;
}
```

### Attestor
```typescript
{
  walletAddress: string;
  organizationName: string;
  type: AttestorType;
  country: string;
  region: string;
  specialties: string[];
  status: AttestorStatus;
  stakeAmount: string;
  reputation: AttestorReputation;
  contactInfo: ContactInfo;
  credentials: Credentials;
  createdAt: Date;
}
```

## Performance Indexes

The system includes optimized database indexes for:
- Status and creation time queries
- Asset type and country filtering
- Attestor assignments and status
- Expiration date monitoring
- Owner address lookups
- Reputation-based sorting

## Deployment

### Prerequisites
- MongoDB database
- Hedera Hashgraph network access
- AWS Textract API access
- Google Maps API access

### Environment Variables
```bash
MONGODB_URI=mongodb://localhost:27017/trustbridge
HEDERA_ACCOUNT_ID=0.0.123456
HEDERA_PRIVATE_KEY=302e020100300506032b657004220420...
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
GOOGLE_MAPS_API_KEY=your-google-maps-key
```

### Installation
```bash
npm install
npm run build
npm run migrate  # Run database migrations
npm start
```

## Testing

### Manual Triggers
```typescript
import { triggerVerificationChecks } from './src/cron/verification-cron';

// Test expired verification check
await triggerVerificationChecks.checkExpired();

// Test suspicious activity detection
await triggerVerificationChecks.checkSuspicious();

// Generate health report
await triggerVerificationChecks.generateReport();
```

### API Testing
```bash
# Submit verification request
curl -X POST http://localhost:4000/api/verification/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{"assetId":"test-123","assetType":"AGRICULTURAL","declaredValue":50000}'

# Check verification status
curl http://localhost:4000/api/verification/status/test-123
```

## Future Enhancements

- **Machine Learning** - AI-powered evidence analysis
- **Satellite Integration** - Real-time satellite imagery analysis
- **IoT Integration** - Sensor data from connected devices
- **Cross-chain Support** - Multi-blockchain verification records
- **Mobile App** - Attestor mobile application
- **Advanced Analytics** - Predictive fraud detection

## Support

For technical support or questions about the verification system, please contact the TrustBridge development team.
