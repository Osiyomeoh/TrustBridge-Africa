# TrustBridge Nigeria/Lagos Setup Guide

## 🇳🇬 Nigeria-Focused Configuration

This guide helps you set up TrustBridge for the Nigerian market, specifically optimized for Lagos operations.

## 🚀 Quick Start

### 1. Copy Nigeria Configuration
```bash
cp config.nigeria.env .env
```

### 2. Update Your Credentials
Edit `.env` file with your actual values:
- MongoDB Atlas connection string (already provided)
- Hedera testnet credentials
- API keys (optional for enhanced features)

### 3. Start the Server
```bash
npm run start:dev
```

## 🏢 Nigeria-Specific Features

### External Parties Integration
The system is pre-configured with Nigerian organizations:

#### Government Entities
- **Lagos State Ministry of Agriculture**
- **Kano State Agricultural Development Programme**
- **Federal Ministry of Agriculture and Rural Development**

#### Professional Bodies
- **Nigerian Institution of Surveyors (NIS)**
- **Nigerian Institution of Estate Surveyors and Valuers (NIESV)**
- **Institute of Chartered Accountants of Nigeria (ICAN)**

#### Cooperatives
- **Ondo State Cocoa Farmers Cooperative**
- **Kano State Rice Farmers Association**
- **Lagos State Agricultural Cooperative**

### License Validation Patterns
The system recognizes Nigerian license formats:

#### Surveyors
- `SURV-NG-123456` (Nigeria specific)
- `NIS123456` (Nigerian Institution of Surveyors)
- `NGS1234` (Nigeria format)

#### Appraisers
- `APP-NG-123456` (Nigeria specific)
- `NIESV123456` (Nigerian Institution of Estate Surveyors and Valuers)
- `NGA1234` (Nigeria format)

#### Auditors
- `AUD-NG-123456` (Nigeria specific)
- `ICAN123456` (Institute of Chartered Accountants of Nigeria)
- `NGU1234` (Nigeria format)

## 📍 Lagos-Specific Data

### Real Estate Prices
- **Victoria Island**: $250,000 (premium commercial)
- **Ikoyi**: $200,000 (residential)
- **Lekki Phase 1**: $180,000 (residential)
- **Abuja**: $200,000 (federal capital)

### Agricultural Assets
- **Cocoa (Ondo State)**: $3.20/kg
- **Rice (Kano State)**: $350/ton
- **Wheat (Northern States)**: $420/ton

### Equipment & Inventory
- **Agricultural Equipment**: $35,000/unit
- **Commercial Equipment**: $40,000/unit
- **Inventory**: $8,000/unit

## 🧪 Testing with Sample Data

### Load Nigeria Test Data
```bash
# The system includes sample data for:
# - 6 Nigerian attestors (government, professional bodies, cooperatives)
# - 3 sample assets (Lagos real estate, Ondo cocoa, Kano rice)
# - 4 sample users (asset owners and investors)
```

### Test External Party Registration
```bash
# Register a Nigerian cooperative
curl -X POST http://localhost:4000/api/attestors/register \
  -H "Content-Type: application/json" \
  -d '{
    "organizationName": "Lagos State Farmers Cooperative",
    "organizationType": "COOPERATIVE",
    "country": "Nigeria",
    "region": "Lagos",
    "contactEmail": "info@lagosfarmers.coop.ng",
    "contactPhone": "+234-803-123-4567",
    "specialties": ["AGRICULTURAL"],
    "credentials": {
      "licenseNumber": "COOP-LAG-2023-001",
      "registrationNumber": "RC-123456",
      "website": "https://www.lagosfarmers.coop.ng"
    },
    "stakeAmount": 10000
  }'
```

### Test Asset Verification
```bash
# Submit a Lagos real estate asset for verification
curl -X POST http://localhost:4000/api/verification/submit \
  -H "Content-Type: application/json" \
  -d '{
    "assetId": "LAGOS-RE-001",
    "evidence": {
      "documents": [
        {
          "name": "Land Certificate",
          "fileRef": "lagos-land-cert-001.pdf"
        }
      ],
      "location": {
        "coordinates": {
          "lat": 6.4281,
          "lng": 3.4219
        }
      },
      "photos": [
        {
          "description": "Building exterior",
          "fileRef": "victoria-island-building.jpg"
        }
      ]
    }
  }'
```

## 🌍 Geographic Coverage

### Primary Markets
- **Lagos State** (commercial real estate, tech assets)
- **Ondo State** (cocoa plantations)
- **Kano State** (rice farms, agricultural equipment)
- **Abuja** (government assets, real estate)

### Secondary Markets
- **Rivers State** (oil & gas equipment)
- **Kaduna State** (agricultural assets)
- **Ogun State** (industrial equipment)
- **Enugu State** (mining assets)

## 🔧 API Endpoints

### Attestors (Nigeria-focused)
- `GET /api/attestors/location/Nigeria` - Get Nigerian attestors
- `GET /api/attestors/specialty/AGRICULTURAL` - Get agricultural specialists
- `POST /api/attestors/register` - Register Nigerian organization

### Verification
- `POST /api/verification/submit` - Submit asset for verification
- `GET /api/verification/status/{assetId}` - Check verification status

### Assets
- `GET /api/assets?country=Nigeria` - Get Nigerian assets
- `GET /api/assets?region=Lagos` - Get Lagos assets

## 📊 Market Data Sources

### Free APIs (No API key required)
- **OpenStreetMap** - GPS verification
- **Console logging** - Notifications
- **Local file storage** - Document storage

### Enhanced APIs (API key required)
- **Google Vision API** - Document OCR
- **OpenWeatherMap** - Weather data
- **Alpha Vantage** - Market prices

## 🎯 Real-World Applications

### For Lagos Businesses
1. **Real Estate Tokenization** - Victoria Island, Ikoyi properties
2. **Equipment Financing** - Industrial machinery tokenization
3. **Inventory Management** - Supply chain asset tokenization

### For Nigerian Farmers
1. **Cocoa Farm Tokenization** - Ondo State plantations
2. **Rice Farm Investment** - Kano State farms
3. **Equipment Sharing** - Agricultural machinery pools

### For Investors
1. **Diversified Portfolio** - Real estate + agricultural assets
2. **Geographic Spread** - Lagos + other Nigerian states
3. **Asset Types** - Commercial + agricultural + equipment

## 🚀 Production Deployment

### Environment Variables
```bash
# Required for production
HEDERA_NETWORK=mainnet
HEDERA_ACCOUNT_ID=your-mainnet-account
HEDERA_PRIVATE_KEY=your-mainnet-private-key

# Optional for enhanced features
GOOGLE_API_KEY=your-google-api-key
OPENWEATHER_API_KEY=your-openweather-key
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-key
```

### Security Considerations
- Use environment variables for all sensitive data
- Enable HTTPS in production
- Set up proper CORS policies
- Implement rate limiting
- Use secure JWT secrets

## 📞 Support

For Nigeria-specific support:
- **Email**: support@trustbridge.africa
- **Phone**: +234-803-123-4567
- **Location**: Victoria Island, Lagos, Nigeria

## 🎉 Ready to Launch!

Your TrustBridge platform is now configured for the Nigerian market with:
- ✅ Nigerian attestor networks
- ✅ Lagos-specific pricing
- ✅ Local license validation
- ✅ Real-world test data
- ✅ Production-ready APIs

**Welcome to the future of RWA tokenization in Nigeria!** 🇳🇬
