# Persona KYC Integration Setup Guide

## Overview
This guide explains how to configure Persona KYC integration for TrustBridge. Persona provides identity verification services that integrate seamlessly with our platform.

## Prerequisites
1. Persona account (https://withpersona.com)
2. Access to Persona dashboard
3. Backend and frontend environment files

## Step 1: Create Persona Account and Template

### 1.1 Sign up for Persona
- Go to https://withpersona.com
- Create an account
- Complete the onboarding process

### 1.2 Create a KYC Template
- In Persona dashboard, go to Templates
- Create a new template for KYC verification
- Configure the template with required fields:
  - Name (First/Last)
  - Email
  - Phone Number
  - Address
  - Government ID
  - Selfie verification
- Save the template and note the Template ID

### 1.3 Get Environment ID
- In Persona dashboard, go to Settings > API Keys
- Note your Environment ID (starts with `env_`)

## Step 2: Configure Webhook

### 2.1 Set up Webhook URL
- In Persona dashboard, go to Settings > Webhooks
- Add webhook URL: `https://your-domain.com/api/auth/persona/webhook`
- For development: `http://localhost:4001/api/auth/persona/webhook`
- Select events: `inquiry.completed`, `inquiry.failed`, `inquiry.pending`

### 2.2 Get Webhook Secret
- Copy the webhook secret from Persona dashboard
- This will be used to verify webhook authenticity

## Step 3: Environment Configuration

### 3.1 Backend Environment (.env)
Add these variables to your backend `.env` file:

```env
# Persona KYC Configuration
PERSONA_TEMPLATE_ID=itmpl_your_template_id_here
PERSONA_ENVIRONMENT_ID=env_your_environment_id_here
PERSONA_WEBHOOK_SECRET=your_webhook_secret_here
```

### 3.2 Frontend Environment (.env)
Add these variables to your frontend `.env` file:

```env
# Persona KYC Configuration
VITE_PERSONA_TEMPLATE_ID=itmpl_your_template_id_here
VITE_PERSONA_ENVIRONMENT_ID=env_your_environment_id_here
```

## Step 4: Test Configuration

### 4.1 Test Webhook
1. Start your backend server
2. Use ngrok or similar tool to expose localhost:4001
3. Update webhook URL in Persona dashboard
4. Test the webhook by creating a test inquiry

### 4.2 Test Frontend Integration
1. Start your frontend server
2. Navigate to dashboard
3. Click "Start KYC" button
4. Verify Persona modal opens correctly

## Step 5: Production Setup

### 5.1 Update Webhook URL
- Change webhook URL to your production domain
- Ensure HTTPS is enabled

### 5.2 Security Considerations
- Keep webhook secret secure
- Implement webhook signature verification
- Use environment-specific template IDs

## API Endpoints

### Webhook Endpoint
- **URL**: `POST /api/auth/persona/webhook`
- **Purpose**: Receives Persona webhook notifications
- **Authentication**: Webhook signature verification (optional)

### KYC Status Endpoints
- **GET** `/api/auth/kyc/status` - Get current KYC status
- **POST** `/api/auth/kyc/update-status` - Manually update KYC status

## Troubleshooting

### Common Issues

1. **Persona modal not opening**
   - Check if Persona script is loaded
   - Verify template ID and environment ID
   - Check browser console for errors

2. **Webhook not receiving data**
   - Verify webhook URL is correct
   - Check if server is accessible from internet
   - Verify webhook events are configured

3. **KYC status not updating**
   - Check webhook processing logs
   - Verify user lookup by reference_id
   - Check database connection

### Debug Steps

1. Check backend logs for webhook processing
2. Verify environment variables are loaded
3. Test webhook with curl or Postman
4. Check frontend console for Persona errors

## Security Notes

- Never commit webhook secrets to version control
- Use different template IDs for development and production
- Implement proper webhook signature verification
- Monitor webhook endpoints for suspicious activity

## Support

For Persona-specific issues:
- Persona Documentation: https://docs.withpersona.com
- Persona Support: support@withpersona.com

For TrustBridge integration issues:
- Check backend logs
- Verify database connectivity
- Test API endpoints manually
