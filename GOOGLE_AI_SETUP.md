# 🤖 Google AI Studio Integration Setup Guide

## Overview
TrustBridge now integrates with Google AI Studio (Gemini) to provide AI-powered features including:
- Investment advice and analysis
- Asset valuation and risk assessment
- Image generation and analysis
- Video generation
- Audio transcription
- Google Search and Maps integration
- Credit-based system using TRUST tokens

## 🔑 Step 1: Get Your Google AI API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API Key" in the left sidebar
4. Create a new API key
5. Copy the API key (starts with `AIza...`)

## ⚙️ Step 2: Set Up Your API Key

### Option A: Environment Variable (Recommended)
```bash
export GEMINI_API_KEY='your_actual_api_key_here'
```

### Option B: Add to Shell Profile (Permanent)
```bash
echo 'export GEMINI_API_KEY="your_actual_api_key_here"' >> ~/.zshrc
source ~/.zshrc
```

### Option C: Create .env.local file
```bash
echo 'GEMINI_API_KEY=your_actual_api_key_here' > trustbridge-backend/.env.local
```

## 🧪 Step 3: Test the Integration

### Test Google AI Directly
```bash
cd /Users/MAC/Documents/TrustBridge
node test-google-ai.js
```

### Test TrustBridge AI Endpoints
```bash
# Start the backend
cd trustbridge-backend
npm run start:dev

# In another terminal, test the AI endpoints
curl -X POST "http://localhost:4001/api/ai/query" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"query": "What is the best investment strategy for real estate?"}'
```

## 🎯 Step 4: Available AI Features

### 1. **AI Chat & Investment Advice**
- **Endpoint**: `POST /api/ai/query`
- **Cost**: 2 TRUST tokens per query
- **Features**: Investment analysis, market insights, portfolio recommendations

### 2. **Image Generation**
- **Endpoint**: `POST /api/ai/generate-image`
- **Cost**: 5 TRUST tokens per image
- **Features**: Create images from text prompts for asset listings

### 3. **Image Analysis**
- **Endpoint**: `POST /api/ai/analyze-image`
- **Cost**: 3 TRUST tokens per analysis
- **Features**: Extract data from property photos, documents, charts

### 4. **Video Generation**
- **Endpoint**: `POST /api/ai/generate-video`
- **Cost**: 10 TRUST tokens per video
- **Features**: Create promotional videos for assets

### 5. **Audio Transcription**
- **Endpoint**: `POST /api/ai/transcribe-audio`
- **Cost**: 2 TRUST tokens per minute
- **Features**: Convert voice recordings to text

### 6. **Google Search Integration**
- **Endpoint**: `POST /api/ai/search`
- **Cost**: 1 TRUST token per search
- **Features**: Real-time market data, news, property information

### 7. **Google Maps Integration**
- **Endpoint**: `POST /api/ai/maps`
- **Cost**: 1 TRUST token per query
- **Features**: Location data, nearby amenities, property insights

## 💰 Credit System

### Pricing Structure
- **Basic AI Query**: 2 TRUST tokens
- **Image Generation**: 5 TRUST tokens
- **Image Analysis**: 3 TRUST tokens
- **Video Generation**: 10 TRUST tokens
- **Audio Transcription**: 2 TRUST tokens per minute
- **Google Search**: 1 TRUST token
- **Google Maps**: 1 TRUST token

### Usage Limits
- **Daily Limit**: 50 queries per user
- **Monthly Limit**: 1000 queries per user
- **Credit Check**: Automatic before each AI operation

### Getting TRUST Tokens
1. **Buy with HBAR**: Exchange HBAR for TRUST tokens
2. **Earn through Activity**: Complete KYC, create assets, trade
3. **Referral Rewards**: Invite friends to the platform

## 🚀 Step 5: Frontend Integration

The AI features are available in the frontend through:

### 1. **AI Chatbot** (Floating Button)
- Located in bottom-right corner
- Quick AI assistance
- Shows credit balance and usage

### 2. **AI Studio** (Dashboard)
- Full-featured AI interface
- All Google AI Studio features
- Credit management and usage tracking

### 3. **AI Assistant** (Dashboard Widget)
- Quick insights and recommendations
- Link to full AI Studio

## 🔧 Troubleshooting

### Common Issues

1. **"GEMINI_API_KEY not found"**
   - Make sure you've set the environment variable
   - Restart the backend after setting the key

2. **"Insufficient TRUST tokens"**
   - Check your TRUST token balance
   - Buy more tokens or wait for daily reset

3. **"Daily limit exceeded"**
   - Wait for the next day or upgrade your plan
   - Current limit: 50 queries per day

4. **API Errors**
   - Check your Google AI API key is valid
   - Ensure you have sufficient API quota

### Debug Commands
```bash
# Check if API key is set
echo $GEMINI_API_KEY

# Test Google AI directly
node test-google-ai.js

# Check backend logs
cd trustbridge-backend
npm run start:dev
```

## 📊 Monitoring Usage

### Check Your AI Usage
```bash
curl -X GET "http://localhost:4001/api/ai/usage" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### View Pricing Information
```bash
curl -X GET "http://localhost:4001/api/ai/pricing"
```

## 🎉 Success!

Once everything is set up, you'll have access to:
- ✅ AI-powered investment advice
- ✅ Automated asset analysis
- ✅ Creative content generation
- ✅ Real-time market data
- ✅ Credit-based usage system
- ✅ Full Google AI Studio integration

The AI system is now ready to enhance the TrustBridge platform with intelligent features!
