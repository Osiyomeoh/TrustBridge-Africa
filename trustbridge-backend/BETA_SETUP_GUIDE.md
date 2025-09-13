# 🚀 TrustBridge Beta Testing Setup Guide

## **🎯 PRODUCTION-READY BETA VERSION**

This guide helps you set up TrustBridge with **REAL APIs** and **NO MOCK DATA** for beta testing.

---

## **🔑 ESSENTIAL API KEYS TO GET**

### **1. 🔴 CRITICAL - Hedera Testnet (Required)**
```bash
# Get from: https://portal.hedera.com/
HEDERA_ACCOUNT_ID=0.0.YOUR_REAL_ACCOUNT_ID
HEDERA_PRIVATE_KEY=YOUR_REAL_PRIVATE_KEY
HEDERA_NETWORK=testnet
```

### **2. 🟡 HIGH PRIORITY - Core Functionality**

#### **Google APIs (OCR + GPS)**
```bash
# Get from: https://console.cloud.google.com/
# Enable: Vision API, Maps JavaScript API, Geocoding API
GOOGLE_API_KEY=YOUR_REAL_GOOGLE_API_KEY
```

#### **OpenWeatherMap (Real Weather Data)**
```bash
# Get from: https://openweathermap.org/api
# Free tier: 1,000 calls/day
OPENWEATHER_API_KEY=YOUR_REAL_OPENWEATHER_KEY
```

#### **Alpha Vantage (Real Market Data)**
```bash
# Get from: https://www.alphavantage.co/support/#api-key
# Free tier: 5 calls/minute, 500 calls/day
ALPHA_VANTAGE_API_KEY=YOUR_REAL_ALPHA_VANTAGE_KEY
```

### **3. 🟢 MEDIUM PRIORITY - Enhanced Features**

#### **SendGrid (Email Notifications)**
```bash
# Get from: https://sendgrid.com/
# Free tier: 100 emails/day
SENDGRID_API_KEY=YOUR_REAL_SENDGRID_KEY
SENDGRID_FROM_EMAIL=noreply@trustbridge.africa
```

#### **Africa's Talking (SMS for Nigeria)**
```bash
# Get from: https://africastalking.com/
# Free tier: 100 SMS/month
AT_USERNAME=YOUR_AT_USERNAME
AT_API_KEY=YOUR_AT_API_KEY
AT_SENDER_ID=TrustBridge
```

#### **Stripe (Payment Processing)**
```bash
# Get from: https://stripe.com/
# Test mode keys for beta
STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_STRIPE_PUBLISHABLE_KEY
```

### **4. 🔵 OPTIONAL - Advanced Features**

#### **Google Drive (Cloud File Storage)**
```bash
# Get from: https://console.cloud.google.com/
# Enable: Google Drive API
GOOGLE_DRIVE_CLIENT_ID=YOUR_GOOGLE_DRIVE_CLIENT_ID
GOOGLE_DRIVE_CLIENT_SECRET=YOUR_GOOGLE_DRIVE_CLIENT_SECRET
GOOGLE_DRIVE_REFRESH_TOKEN=YOUR_GOOGLE_DRIVE_REFRESH_TOKEN
GOOGLE_DRIVE_FOLDER_ID=YOUR_GOOGLE_DRIVE_FOLDER_ID
```

#### **AWS (Advanced OCR)**
```bash
# Get from: https://aws.amazon.com/
# Enable: Amazon Textract
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_KEY
AWS_REGION=us-east-1
```

---

## **⚡ QUICK SETUP STEPS**

### **Step 1: Get Hedera Testnet Credentials**
```bash
# 1. Visit: https://portal.hedera.com/
# 2. Create account
# 3. Go to "Create Account" → "Testnet"
# 4. Copy Account ID and Private Key
# 5. Update .env file
```

### **Step 2: Get Google API Key**
```bash
# 1. Visit: https://console.cloud.google.com/
# 2. Create new project or select existing
# 3. Enable APIs:
#    - Vision API
#    - Maps JavaScript API
#    - Geocoding API
# 4. Create credentials → API Key
# 5. Restrict key to your APIs
# 6. Update .env file
```

### **Step 3: Get OpenWeatherMap Key**
```bash
# 1. Visit: https://openweathermap.org/api
# 2. Sign up for free account
# 3. Go to API keys
# 4. Copy your API key
# 5. Update .env file
```

### **Step 4: Get Alpha Vantage Key**
```bash
# 1. Visit: https://www.alphavantage.co/support/#api-key
# 2. Enter email and get free API key
# 3. Update .env file
```

### **Step 5: Get SendGrid Key**
```bash
# 1. Visit: https://sendgrid.com/
# 2. Sign up for free account
# 3. Go to Settings → API Keys
# 4. Create API key with "Full Access"
# 5. Update .env file
```

### **Step 6: Get Africa's Talking Credentials**
```bash
# 1. Visit: https://africastalking.com/
# 2. Sign up for free account
# 3. Go to SMS → Settings
# 4. Copy Username and API Key
# 5. Update .env file
```

### **Step 7: Get Stripe Keys**
```bash
# 1. Visit: https://stripe.com/
# 2. Sign up for account
# 3. Go to Developers → API Keys
# 4. Copy Test mode keys
# 5. Update .env file
```

---

## **🔧 CONFIGURATION UPDATES**

### **Update .env File**
```bash
# Copy the beta configuration
cp config.nigeria.env .env

# Edit .env with your real API keys
nano .env
```

### **Enable Real APIs in Services**
```bash
# Update external-apis service to use real APIs
# Update chainlink service to use real market data
# Update notifications service to use real email/SMS
# Update payments service to use real Stripe
```

---

## **🧪 TESTING REAL APIs**

### **Test Google Vision API**
```bash
curl -X POST http://localhost:4000/api/external-apis/ocr \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/document.jpg",
    "mimeType": "image/jpeg"
  }'
```

### **Test OpenWeatherMap**
```bash
curl -X GET "http://localhost:4000/api/external-apis/weather?lat=6.5244&lng=3.3792"
```

### **Test Alpha Vantage**
```bash
curl -X GET "http://localhost:4000/api/chainlink/market-price?symbol=COFFEE&country=nigeria"
```

### **Test SendGrid**
```bash
curl -X POST http://localhost:4000/api/notifications/email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "text": "This is a test email from TrustBridge"
  }'
```

### **Test Africa's Talking**
```bash
curl -X POST http://localhost:4000/api/notifications/sms \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+2348031234567",
    "message": "Test SMS from TrustBridge"
  }'
```

### **Test Stripe**
```bash
curl -X POST http://localhost:4000/api/payments/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "currency": "usd",
    "description": "Test payment"
  }'
```

---

## **📊 BETA TESTING CHECKLIST**

### **✅ Core Functionality**
- [ ] Hedera testnet connection working
- [ ] Asset creation and verification
- [ ] Real OCR processing documents
- [ ] Real GPS verification
- [ ] Real weather data
- [ ] Real market prices
- [ ] Email notifications working
- [ ] SMS notifications working
- [ ] Payment processing working

### **✅ User Flows**
- [ ] Asset Owner registration and asset submission
- [ ] Investor discovery and investment
- [ ] Attestor registration and verification
- [ ] Buyer sourcing and settlement

### **✅ Integration Tests**
- [ ] Smart contract deployment
- [ ] Asset tokenization
- [ ] Investment processing
- [ ] Settlement execution
- [ ] Fee distribution

---

## **🚨 REMOVING MOCK DATA**

### **Files to Update**
```bash
# Remove mock implementations from:
src/external-apis/external-apis.service.ts
src/chainlink/chainlink.service.ts
src/notifications/notifications.service.ts
src/payments/payments.service.ts
src/attestors/attestors.service.ts
```

### **Mock Data to Remove**
- [ ] Mock OCR results
- [ ] Mock weather data
- [ ] Mock market prices
- [ ] Mock notification responses
- [ ] Mock payment responses
- [ ] Mock attestor verification

---

## **🎯 BETA TESTING GOALS**

### **Primary Objectives**
1. **Real Data Integration** - All APIs using real data
2. **End-to-End Testing** - Complete user flows
3. **Performance Testing** - API response times
4. **Error Handling** - API failure scenarios
5. **User Experience** - Real-world usability

### **Success Metrics**
- [ ] 100% real API usage (no mock data)
- [ ] < 2 second API response times
- [ ] 99% uptime for core services
- [ ] Successful end-to-end user flows
- [ ] Real transactions on Hedera testnet

---

## **🚀 DEPLOYMENT READY**

### **Production Configuration**
```bash
# Update for production
NODE_ENV=production
HEDERA_NETWORK=mainnet  # When ready for mainnet
STRIPE_SECRET_KEY=sk_live_...  # Live Stripe keys
SENDGRID_FROM_EMAIL=hello@trustbridge.africa
```

### **Security Checklist**
- [ ] API keys secured in environment variables
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] Error messages sanitized
- [ ] Logging configured
- [ ] Health checks implemented

---

## **🎉 BETA TESTING LAUNCH**

**Your TrustBridge platform will be production-ready with:**

1. ✅ **Real Hedera Integration** - Live blockchain transactions
2. ✅ **Real OCR Processing** - Google Vision API
3. ✅ **Real Weather Data** - OpenWeatherMap
4. ✅ **Real Market Prices** - Alpha Vantage
5. ✅ **Real Notifications** - SendGrid + Africa's Talking
6. ✅ **Real Payments** - Stripe integration
7. ✅ **Real File Storage** - Google Drive
8. ✅ **Complete User Flows** - End-to-end testing

**Ready for beta testing with real users!** 🚀🇳🇬
