# How to Get Paga API Credentials

## Overview
This guide explains how to obtain Paga API credentials for TrustBridge Africa's cash-based payment integration.

---

## 📋 Prerequisites

1. **Paga Business Account**: You need a registered Paga business account
2. **Business Documents**: Corporate registration documents
3. **Bank Account**: Nigerian business bank account
4. **Identity Verification**: Company director details

---

## 🚀 Step-by-Step Process

### **Step 1: Register with Paga**

1. **Visit Paga Business Portal**
   - URL: https://www.mypaga.com/business
   - Click "Sign Up" or "Register Your Business"

2. **Complete Registration Form**
   - Company name
   - Business type
   - Industry
   - Contact details
   - Tax ID (Tax Identification Number)

3. **Submit Required Documents**
   - Business registration certificate
   - Certificate of incorporation
   - Bank account statement
   - Director's ID card
   - Tax clearance certificate

4. **Wait for Approval**
   - Paga reviews documents (2-5 business days)
   - You'll receive approval email with account details

---

### **Step 2: Apply for API Access**

1. **Log into Paga Dashboard**
   - URL: https://dashboard.mypaga.com
   - Login with your business credentials

2. **Navigate to API Section**
   - Dashboard → Settings → API Access
   - Click "Request API Access"

3. **Fill API Application**
   - Business use case: "Payment Gateway Integration"
   - Integration type: "Agent Payments"
   - Describe your platform: "TrustBridge Africa - RWA Tokenization"

4. **Submit for Review**
   - Technical team reviews (3-7 business days)
   - You'll receive API credentials via email

---

### **Step 3: Receive API Credentials**

**You'll receive:**
- ✅ **Merchant ID**: Your unique business identifier
- ✅ **API Key**: Secret key for authentication
- ✅ **Base URL**: API endpoint URL
- ✅ **Webhook URL**: For payment notifications

**Example:**
```
Merchant ID: 234XXXXXXXXX
API Key: sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
Base URL: https://api.mypaga.com/v1
```

---

## 🔧 Configure TrustBridge Africa

### **1. Update .env File**

Edit `trustbridge-backend/.env`:

```bash
# Paga API Credentials
PAGA_API_BASE_URL=https://api.mypaga.com
PAGA_MERCHANT_ID=your_actual_merchant_id
PAGA_API_KEY=your_actual_api_key

# Paga Agent Payment Configuration
PAGA_AGENT_FEE=500
PAGA_PAYMENT_CODE_PREFIX=TB
```

### **2. Add Webhook Endpoint**

Add to `trustbridge-backend/.env`:

```bash
# Paga Webhook
PAGA_WEBHOOK_SECRET=your_webhook_secret
PAGA_WEBHOOK_URL=https://yourdomain.com/api/paga/webhook
```

### **3. Configure Paga Dashboard**

1. **Log into Paga Dashboard**
2. **Settings → API → Webhooks**
3. **Add Webhook URL**: `https://tbafrica.xyz/api/paga/webhook`
4. **Events to Subscribe**: 
   - `payment.succeeded`
   - `payment.failed`
   - `payment.cancelled`

---

## 📞 Alternative: Direct Contact

### **Option 1: Sandbox Testing**

For testing without official API access:

1. **Contact Paga Support**
   - Email: apisupport@paga.com
   - Phone: +234-9-290-4010
   - Subject: "Sandbox Access for TrustBridge Africa"

2. **Request Sandbox Credentials**
   - They provide test credentials
   - Test with simulated payments
   - Validate integration before production

### **Option 2: Demo Account**

1. **Email**: business@paga.com
2. **Subject**: "Demo Account - TrustBridge Africa RWA Platform"
3. **Include in Email**:
   - Platform description
   - Use case (RWA tokenization)
   - Expected transaction volume
   - Request for demo credentials

---

## 🎯 Current Status

### **For Now (Testing):**

**`.env` File Status:**
```bash
PAGA_API_BASE_URL=https://api.mypaga.com
PAGA_MERCHANT_ID=your_paga_merchant_id        # ← Replace with actual
PAGA_API_KEY=your_paga_api_key                # ← Replace with actual
```

**What Works:**
- ✅ Payment code generation
- ✅ Payment instruction display
- ✅ USSD flow integration
- ✅ User confirmation (testing)

**What Needs Production:**
- ⚠️ Real API credentials
- ⚠️ Actual payment processing
- ⚠️ Webhook verification
- ⚠️ SMS notifications

---

## 🔐 Security Best Practices

1. **Never Commit Credentials**
   - Add `.env` to `.gitignore`
   - Use environment variables
   - Rotate keys regularly

2. **Use Different Keys**
   - Sandbox for development
   - Production for live site

3. **Webhook Security**
   - Verify webhook signatures
   - Use HTTPS only
   - Validate request sources

4. **Limit API Permissions**
   - Request minimum required access
   - Use read-only where possible

---

## 📊 Integration Checklist

- [ ] Register Paga business account
- [ ] Submit required documents
- [ ] Receive API credentials
- [ ] Update `.env` file with real credentials
- [ ] Configure webhook endpoint
- [ ] Test in sandbox environment
- [ ] Implement webhook verification
- [ ] Test with real Paga agent
- [ ] Deploy to production

---

## 🆘 Support Contacts

**Paga Business Support:**
- Email: business@paga.com
- Phone: +234-9-290-4010
- Website: https://www.mypaga.com/business

**Paga Developer Support:**
- Email: apisupport@paga.com
- Docs: https://developer.mypaga.com
- Status: https://status.mypaga.com

---

## 🚀 Next Steps

**For Immediate Testing:**

1. **Keep Current Setup**
   - Uses placeholder credentials
   - User confirmation flow works
   - Perfect for USSD flow testing

2. **When Ready for Production:**
   - Follow steps above to get real credentials
   - Update `.env` file
   - Implement webhook verification
   - Test with live Paga network

**Estimated Timeline:**
- Registration & Approval: 5-10 business days
- API Access Review: 3-7 business days
- Total: ~2 weeks to production

---

## 📝 Summary

**To Get Paga API:**
1. Register at https://www.mypaga.com/business
2. Submit business documents
3. Apply for API access in dashboard
4. Receive credentials via email
5. Update `.env` file
6. Configure webhooks
7. Test in sandbox
8. Go live!

**For Testing Now:**
- Current implementation works with user confirmation
- No real API credentials needed for USSD flow testing
- Perfect for demonstrating the feature

**Current Status:**
- ✅ Variables added to `.env`
- ✅ Integration code complete
- ⏳ Waiting for production API credentials
- ✅ Ready for testing with current setup

