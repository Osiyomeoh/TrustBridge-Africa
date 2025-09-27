# Onfido Attestor Verification Setup Guide

## 🎯 Overview
This guide explains how to set up Onfido for professional attestor verification. Onfido is much easier to configure than Persona and provides excellent professional verification capabilities.

## ✅ Why Onfido for Attestors?
- **Simple Setup** - Just API key and you're ready
- **Professional Focus** - Built for business verification
- **Document Verification** - Excellent for professional licenses
- **Global Coverage** - Works worldwide
- **Easy Integration** - Great API and documentation
- **Reasonable Pricing** - Good value for money

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Onfido Account
1. Go to https://onfido.com
2. Sign up for a free account
3. Complete the onboarding process
4. Get your API key from the dashboard

### Step 2: Configure Environment Variables

#### Backend (.env)
```env
# Onfido KYC Configuration (Attestors)
ONFIDO_API_KEY=your_onfido_api_key_here
ONFIDO_WORKFLOW_ID=attestor_verification
ONFIDO_WEBHOOK_SECRET=your_webhook_secret_here
```

#### Frontend (.env)
```env
# Onfido KYC Configuration (Attestors)
VITE_ONFIDO_API_KEY=your_onfido_api_key_here
VITE_ONFIDO_WORKFLOW_ID=attestor_verification
```

### Step 3: Test the Integration
1. Start your backend server
2. Start your frontend server
3. Navigate to dashboard
4. Click "Become an Attestor"
5. Complete the application form
6. Test the Onfido verification flow

## 🔧 How It Works

### Basic User KYC (Didit)
- Uses `DIDIT_WORKFLOW_ID`
- Simple identity verification
- For regular users

### Attestor Verification (Onfido)
- Uses `ONFIDO_WORKFLOW_ID`
- Professional license verification
- Document validation
- Enhanced KYC for professionals

## 📋 API Endpoints

### Backend Endpoints
- `POST /api/auth/onfido/session` - Create Onfido session
- `GET /api/auth/onfido/session/:sessionId` - Get session status

### Frontend Service
- `onfidoAttestorService.createAttestorSession()` - Create session
- `onfidoAttestorService.openVerificationPopup()` - Open verification
- `onfidoAttestorService.getVerificationStatus()` - Check status

## 🎨 User Flow

1. **User clicks "Become an Attestor"**
2. **Fills out application form** (4 steps)
3. **Onfido verification opens** in popup
4. **User completes verification** (ID + documents)
5. **Application submitted** to backend
6. **Admin review** and approval
7. **Attestor portal access** granted

## 💰 Pricing

- **Free Tier**: 100 verifications/month
- **Pay-per-use**: $1-3 per verification
- **No setup fees**: Start immediately
- **No contracts**: Cancel anytime

## 🔒 Security Features

- **Document Verification**: Validates professional licenses
- **Biometric Checks**: Liveness detection
- **Fraud Prevention**: Advanced AI detection
- **Compliance**: GDPR, CCPA compliant
- **Data Protection**: Encrypted data transmission

## 🆚 Comparison with Other Platforms

| Feature | Onfido | Persona | Didit |
|---------|--------|---------|-------|
| Setup Time | 5 minutes | 2+ hours | 10 minutes |
| Professional Focus | ✅ Excellent | ✅ Excellent | ❌ Basic |
| Document Verification | ✅ Advanced | ✅ Advanced | ❌ Limited |
| Custom Workflows | ✅ Easy | ❌ Complex | ✅ Easy |
| Pricing | 💰 Good | 💰 Expensive | 💰 Cheap |
| Integration | ✅ Simple | ❌ Complex | ✅ Simple |

## 🚨 Troubleshooting

### Common Issues

1. **API Key not working**
   - Check if key is correct
   - Verify account is active
   - Check API key permissions

2. **Verification not opening**
   - Check popup blockers
   - Verify CORS settings
   - Check console for errors

3. **Webhook not receiving data**
   - Verify webhook URL
   - Check server accessibility
   - Verify webhook configuration

### Debug Steps

1. Check backend logs for Onfido API calls
2. Verify environment variables are loaded
3. Test API endpoints with Postman
4. Check frontend console for errors

## 📞 Support

- **Onfido Documentation**: https://developers.onfido.com
- **Onfido Support**: support@onfido.com
- **TrustBridge Issues**: Check backend logs

## 🎉 Benefits

- **Faster Setup**: 5 minutes vs 2+ hours
- **Better UX**: Professional verification flow
- **Cost Effective**: Reasonable pricing
- **Easy Maintenance**: Simple API integration
- **Scalable**: Handles high volume

The Onfido integration is much simpler than Persona and provides excellent professional verification capabilities for attestors! 🚀
