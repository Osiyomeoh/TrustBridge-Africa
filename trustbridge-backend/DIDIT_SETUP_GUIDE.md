# Didit KYC Integration Setup Guide

## Overview
This guide explains how to configure Didit KYC integration for TrustBridge. Didit provides a simple, no-contract identity verification service that's much easier to set up than Persona.

## Why Didit?
- ✅ **No contracts or lock-ins**
- ✅ **Free basic KYC services**
- ✅ **Go live in minutes**
- ✅ **Pay-per-use pricing**
- ✅ **Simple API integration**

## Prerequisites
1. Didit account (https://didit.me)
2. Backend and frontend environment files

## Step 1: Create Didit Account

### 1.1 Sign up for Didit
- Go to https://didit.me
- Click "Sign Up" and enter your business email
- Complete the account creation process
- No credit card required for basic KYC

### 1.2 Set up Your Application
- After account creation, set up your team information
- Create your first application
- Go to Developers section and get your API Key
- Note your Workflow ID from the Identity Verification settings

## Step 2: Configure Webhook

### 2.1 Set up Webhook URL
- In Didit dashboard, go to Settings > Webhooks
- Add webhook URL: `https://your-domain.com/api/auth/didit/webhook`
- For development: `http://localhost:4001/api/auth/didit/webhook`
- Select events: `verification.completed`, `verification.failed`

### 2.2 Test Webhook
- Use ngrok or similar tool to expose localhost:4001
- Update webhook URL in Didit dashboard
- Test the webhook by creating a test verification

## Step 3: Environment Configuration

### 3.1 Backend Environment (.env)
Add these variables to your backend `.env` file:

```env
# Didit KYC Configuration (v2 API)
DIDIT_API_KEY=your_api_key_here
DIDIT_WORKFLOW_ID=your_workflow_id_here
DIDIT_WEBHOOK_SECRET=your_webhook_secret_here
```

### 3.2 Frontend Environment (.env)
Add these variables to your frontend `.env` file:

```env
# Didit KYC Configuration (v2 API)
VITE_DIDIT_API_KEY=your_api_key_here
VITE_DIDIT_WORKFLOW_ID=your_workflow_id_here
```

## Step 4: Test Configuration

### 4.1 Test Webhook
1. Start your backend server
2. Use ngrok to expose localhost:4001
3. Update webhook URL in Didit dashboard
4. Test the webhook by creating a test verification

### 4.2 Test Frontend Integration
1. Start your frontend server
2. Navigate to dashboard
3. Click "Start KYC" button
4. Verify Didit modal opens correctly

## Step 5: Production Setup

### 5.1 Update Webhook URL
- Change webhook URL to your production domain
- Ensure HTTPS is enabled

### 5.2 Security Considerations
- Keep client secret secure
- Use environment-specific client IDs
- Monitor webhook endpoints

## API Endpoints

### Webhook Endpoint
- **URL**: `POST /api/auth/didit/webhook`
- **Purpose**: Receives Didit webhook notifications
- **Authentication**: Webhook signature verification (optional)

### KYC Status Endpoints
- **GET** `/api/auth/kyc/status` - Get current KYC status
- **POST** `/api/auth/kyc/update-status` - Manually update KYC status

## Integration Flow

1. **User clicks "Start KYC"** in dashboard
2. **DiditKYC modal opens** with verification options
3. **User completes verification** via Didit popup
4. **Didit sends webhook** to backend
5. **Backend updates** user KYC status
6. **Frontend receives** completion callback
7. **Dashboard updates** to show new KYC status

## Code Examples

### Frontend Integration
```typescript
import diditService from '../services/didit';

// Create verification session
const session = await diditService.createSession(vendorData);

// Open verification popup
const result = await diditService.openVerificationPopup(vendorData);
```

### Backend Webhook Processing
```typescript
// Process Didit webhook
await this.authService.processDiditWebhook(webhookData);
```

## Troubleshooting

### Common Issues

1. **Didit modal not opening**
   - Check if Client ID is set correctly
   - Verify environment variables are loaded
   - Check browser console for errors

2. **Webhook not receiving data**
   - Verify webhook URL is correct
   - Check if server is accessible from internet
   - Verify webhook events are configured

3. **KYC status not updating**
   - Check webhook processing logs
   - Verify user lookup by wallet address
   - Check database connection

### Debug Steps

1. Check backend logs for webhook processing
2. Verify environment variables are loaded
3. Test webhook with curl or Postman
4. Check frontend console for Didit errors

## Pricing

- **Free Tier**: Basic KYC verification
- **Pay-per-use**: Only pay when you use it
- **No monthly fees**: No minimum commitments
- **No contracts**: Cancel anytime

## Support

For Didit-specific issues:
- Didit Documentation: https://docs.didit.me
- Didit Support: support@didit.me

For TrustBridge integration issues:
- Check backend logs
- Verify database connectivity
- Test API endpoints manually

## Migration from Persona

If you're migrating from Persona:

1. **Remove Persona SDK** from HTML
2. **Replace PersonaKYC component** with DiditKYC
3. **Update webhook endpoints** from Persona to Didit
4. **Update environment variables**
5. **Test the new integration**

The Didit integration is much simpler and requires less configuration than Persona!
