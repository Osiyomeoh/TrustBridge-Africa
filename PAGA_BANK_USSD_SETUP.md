# Paga Bank USSD API Integration Guide

## Overview

This integration uses **Paga's Bank USSD API** to enable users to pay for tokenization fees directly from any Nigerian bank via USSD, without needing a Paga account or visiting an agent.

**Based on Official Documentation:** https://developer-docs.paga.com/docs/bank-ussd-payment

---

## 🔑 How to Get API Keys

### **Step 1: Register with Paga**

1. Visit **https://www.mypaga.com/business**
2. Click "Sign Up" or "Register Your Business"
3. Complete registration form with:
   - Company name
   - Business type
   - Contact details
   - Tax ID

### **Step 2: Submit Business Documents**

Required documents:
- Business registration certificate
- Certificate of incorporation
- Bank account statement
- Director's ID card
- Tax clearance certificate

**Approval time:** 2-5 business days

### **Step 3: Get Your API Keys**

1. **Login to Dashboard**
   - URL: https://dashboard.mypaga.com
   - Use your business login credentials

2. **Navigate to API Settings**
   - Click **"Manage Account"**
   - Click **"Manage API keys"**

3. **Copy Your Credentials**
   You'll see:
   - **Public Key / Principal**: Your public key (username)
   - **Live Primary Secret Key**: Your secret key (password)
   - **Hash Key / HMAC**: For parameter hashing

---

## 🔧 Configuration

### **Update .env File**

Edit `trustbridge-backend/.env`:

```bash
# Paga Bank USSD API Credentials
# Get from: https://dashboard.mypaga.com → Manage Account → Manage API keys
PAGA_PUBLIC_KEY=your_public_key_from_dashboard
PAGA_SECRET_KEY=your_secret_key_from_dashboard  
PAGA_HASH_KEY=your_hash_key_from_dashboard
PAGA_CALLBACK_URL=https://tbafrica.xyz/api/paga/webhook
```

### **Enable ConfigModule in PagaModule**

The `PagaModule` now uses `ConfigService` to read these environment variables automatically.

---

## 📋 API Endpoints Used

### **1. Generate Bank USSD**

**Endpoint:** `POST /paymentRequest`

**Headers:**
```
Authorization: Basic {base64(publicKey:secretKey)}
Content-Type: application/json
hash: {hmac_sha512_hash}
```

**Request Body:**
```json
{
  "referenceNumber": "unique-reference",
  "amount": 500,
  "currency": "NGN",
  "payer": {
    "name": "User Name",
    "phoneNumber": "08012345678",
    "bankId": "43F4DED6-78EC-4047-AD34-BAB75E679EB7"
  },
  "payee": {
    "name": "TrustBridge Africa"
  },
  "expiryDateTimeUTC": "2025-10-28T23:00:00",
  "isSuppressMessages": false,
  "payerCollectionFeeShare": 0.0,
  "payeeCollectionFeeShare": 1.0,
  "callBackUrl": "https://tbafrica.xyz/api/paga/webhook",
  "paymentMethods": ["FUNDING_USSD"]
}
```

**Response:**
```json
{
  "referenceNumber": "unique-reference",
  "statusCode": "0",
  "statusMessage": "success",
  "requestAmount": 500.0,
  "totalPaymentAmount": 500.0,
  "currency": "NGN",
  "paymentMethods": [
    {
      "name": "FUNDING_USSD",
      "properties": {
        "USSDShortCode": "*894*000*724+40554208#",
        "PaymentReference": "40554208"
      }
    }
  ],
  "expiryDateTimeUTC": "2025-10-28T23:00:00"
}
```

### **2. Check Payment Status**

**Endpoint:** `POST /status`

**Request:**
```json
{
  "referenceNumber": "unique-reference"
}
```

### **3. Webhook Callback**

**URL:** Your `PAGA_CALLBACK_URL`

**Payload:**
```json
{
  "event": "PAYMENT_COMPLETE",
  "notificationId": "uuid",
  "statusCode": "0",
  "statusMessage": "Payment Request has been authorized",
  "externalReferenceNumber": "unique-reference",
  "state": "CONSUMED",
  "outstandingBalance": 0,
  "paymentAmount": 500.00,
  "cumulativePaymentAmount": 500.00,
  "collectionFee": 1.5,
  "fundingDetails": {
    "payerAccountNumber": "0980763085",
    "payerName": "User Name",
    "payerBankAccountNumber": "0980763085"
  },
  "hash": "webhook_signature_hash"
}
```

---

## 💡 How It Works

### **For Users:**

1. **User selects Paga payment** in USSD menu
2. **System generates Bank USSD code** via Paga API
3. **User receives USSD code** like `*894*000*724+40554208#`
4. **User dials USSD code** on their phone
5. **User enters bank PIN** and confirms
6. **Payment processed** in real-time
7. **User receives SMS confirmation**
8. **Webhook notified** to backend
9. **Asset created** on Hedera blockchain

### **Benefits:**

✅ **No Paga account needed** - works with any bank  
✅ **No agent visit required** - use USSD on phone  
✅ **Instant payment** - real-time processing  
✅ **All banks supported** - GTB (*737#), Access (*901#), etc.  
✅ **Secure** - uses bank's USSD infrastructure  

---

## 🧪 Testing

### **Without API Credentials (Simulated Mode):**

The service automatically falls back to simulated responses when credentials are not configured:

- Generates simulated USSD codes
- Shows payment instructions
- Allows full USSD flow testing
- Perfect for development

### **With API Credentials (Production Mode):**

1. Update `.env` with real credentials
2. Restart backend
3. Test with real payment requests
4. Monitor webhook callbacks

---

## 📊 Integration Status

### **✅ Implemented:**

- Bank USSD payment request generation
- HMAC hash generation for security
- Simulated mode for testing
- Webhook callback handling (structure)
- Error handling and fallbacks
- USSD code formatting for display

### **🔧 To Complete:**

- [ ] Add webhook endpoint in PagaController
- [ ] Implement payment verification
- [ ] Test with sandbox credentials
- [ ] Deploy webhook URL
- [ ] Test end-to-end with real bank

---

## 🚀 Production Checklist

- [ ] Get Paga API credentials from dashboard
- [ ] Update `.env` file with real credentials
- [ ] Configure webhook URL in Paga dashboard
- [ ] Test in sandbox environment
- [ ] Implement webhook signature verification
- [ ] Deploy to production
- [ ] Test with real bank USSD
- [ ] Monitor payment success rate

---

## 📞 Support

**Paga Documentation:**
- Bank USSD: https://developer-docs.paga.com/docs/bank-ussd-payment
- Authentication: https://developer-docs.paga.com/docs/authentication
- Test Data: https://developer-docs.paga.com/docs/test-data

**Paga Support:**
- Email: apisupport@paga.com
- Phone: +234-9-290-4010
- Dashboard: https://dashboard.mypaga.com

---

## 📝 Summary

**Integration Type:** Bank USSD (not Agent Payment)  
**API Base URL:** `https://beta-collect.paga.com`  
**Credentials Needed:** Public Key, Secret Key, Hash Key  
**Testing Mode:** Works without credentials (simulated)  
**Production Mode:** Requires valid API credentials  
**User Experience:** Dial USSD code from any bank to pay  

✅ **Ready for testing now with simulated mode**  
⏳ **Production requires API credentials from Paga dashboard**

