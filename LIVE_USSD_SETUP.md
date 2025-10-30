# Live USSD Setup - Africa's Talking Integration

## 🎯 Goal
Get your USSD short code (*384#) working on Africa's Talking so anyone in Nigeria can dial it and tokenize their assets!

## 🚀 Quick Setup (30 minutes)

### Step 1: Get Your Backend URL

Your backend needs to be publicly accessible. Options:

**Option A: Use Render (Recommended)**
```bash
# Your backend is already on Render at:
https://trustbridge-backend.onrender.com
```

**Option B: Use ngrok (For Testing)**
```bash
# Install ngrok
npm install -g ngrok

# Expose local backend
ngrok http 4001

# Copy the URL (e.g., https://abc123.ngrok.io)
```

**Option C: Use Railway**
- Similar to Render
- Free tier available

### Step 2: Africa's Talking Account Setup

1. **Sign Up** (5 minutes)
   - Go to: https://www.africastalking.com/
   - Click "Get Started for Free"
   - Sign up with your email
   - Verify your email

2. **Get Credentials** (2 minutes)
   - Login to dashboard: https://account.africastalking.com/
   - Go to "Settings" → "API Keys"
   - Copy your:
     - **API Key**: `your_api_key_here`
     - **Username**: `sandbox` (for sandbox) or your username

3. **Request USSD Short Code** (5 minutes)
   - Go to "Services" → "USSD"
   - Click "Create Service"
   - Enter:
     - **Service Code**: `*384#`
     - **Callback URL**: `https://trustbridge-backend.onrender.com/api/mobile/ussd`
     - **Service Description**: "TrustBridge Africa - Asset Tokenization"
   - Submit request
   - **Wait for approval** (can take 1-3 days)

### Step 3: Backend Configuration

Your backend is already configured! ✅

**Key Endpoint**: `POST /api/mobile/ussd`

**Expected Request Format** (from Africa's Talking):
```
Content-Type: application/x-www-form-urlencoded

sessionId=abc123
phoneNumber=+2348012345678
text=1*option1*option2
```

**Response Format** (your backend returns):
```
Content-Type: text/plain

CON Welcome to TrustBridge Africa
Tokenize Your Real-World Assets

1. Register (Free)
2. Learn More
0. Exit
```

### Step 4: Test Your Setup

#### A. Test Backend Directly (Curl)

```bash
curl -X POST https://trustbridge-backend.onrender.com/api/mobile/ussd \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test123",
    "phoneNumber": "08012345678",
    "text": ""
  }'
```

**Expected Response**:
```
CON Welcome to TrustBridge Africa
Tokenize Your Real-World Assets

1. Register (Free)
2. Learn More
0. Exit
```

#### B. Test via Africa's Talking Simulator

1. Go to dashboard
2. Navigate to USSD service
3. Use "Test Service" tool
4. Enter test parameters
5. See live response

#### C. Test on Real Phone (After Approval)

Once your USSD code is approved:

1. Dial `*384#` from your phone
2. Follow the prompts
3. Complete asset tokenization
4. Check backend logs

## 📋 Request & Response Format

### Request from Africa's Talking

```
POST /api/mobile/ussd HTTP/1.1
Host: trustbridge-backend.onrender.com
Content-Type: application/x-www-form-urlencoded

sessionId=sess_123456
phoneNumber=+2348012345678
text=1*Ibrahim*Lagos*Ikeja
```

### Response to Africa's Talking

```
HTTP/1.1 200 OK
Content-Type: text/plain; charset=utf-8

CON Registration - Step 3
Enter your town/village:
Example: Ikeja
```

## 🔑 Key USSD Response Prefixes

| Prefix | Meaning | Example |
|--------|---------|---------|
| `CON` | Continue - Show menu, wait for input | `CON Choose option:\n1. Option 1\n2. Option 2` |
| `END` | End - Terminate session | `END Thank you for using TrustBridge!` |

## 🎬 Testing the Complete Flow

### Test Script

```bash
# Test initialization
curl -X POST https://trustbridge-backend.onrender.com/api/mobile/ussd \
  -d "sessionId=test1&phoneNumber=08012345678&text="

# Test registration (step 1)
curl -X POST https://trustbridge-backend.onrender.com/api/mobile/ussd \
  -d "sessionId=test1&phoneNumber=08012345678&text=1"

# Test name entry
curl -X POST https://trustbridge-backend.onrender.com/api/mobile/ussd \
  -d "sessionId=test1&phoneNumber=08012345678&text=1*Ibrahim%20Musa"

# Continue through all steps...
```

## 🚨 Common Issues & Solutions

### Issue 1: Backend not accessible
**Solution**: Make sure your backend URL is publicly accessible (use Render, Railway, or ngrok)

### Issue 2: Wrong response format
**Solution**: Your backend returns `text/plain`, not `application/json` ✅

### Issue 3: USSD not approved yet
**Solution**: Use Africa's Talking simulator to test until approved

### Issue 4: Phone number format
**Solution**: Africa's Talking sends phone numbers in international format (`+2348012345678`)

## 📱 Expected User Experience

```
User dials *384#

┌─────────────────────────────────┐
│ Welcome to TrustBridge Africa   │
│ Tokenize Your Real-World Assets │
│                                 │
│ 1. Register (Free)              │
│ 2. Learn More                   │
│ 0. Exit                         │
└─────────────────────────────────┘

User selects 1

┌─────────────────────────────────┐
│ Registration - Step 1           │
│                                 │
│ Enter your full name:           │
│ Example: Ibrahim Musa           │
└─────────────────────────────────┘

... (continues through flow)
```

## 🎯 Next Steps

1. ✅ **Backend is ready** - All code implemented
2. 🔄 **Create Africa's Talking account** - Sign up now
3. 🔄 **Request USSD code** - Submit request
4. 🔄 **Configure callback URL** - Point to your backend
5. 🔄 **Wait for approval** - 1-3 business days
6. 🔄 **Test on real phone** - Dial *384# and go live!

## 📞 Support

- **Africa's Talking Docs**: https://developers.africastalking.com/docs/ussd
- **Backend Logs**: Check Render logs or `trustbridge-backend/` logs
- **Test Endpoint**: Use curl or Postman to test

## 🎉 Success Criteria

- ✅ Backend is publicly accessible
- ✅ USSD endpoint returns proper format (`CON` or `END`)
- ✅ Endpoint accepts form-urlencoded data
- ✅ USSD code approved by Africa's Talking
- ✅ Can dial *384# from real phone
- ✅ Complete flow works end-to-end

---

**Status**: Backend is ready! Just need Africa's Talking setup.

**Time to go live**: 30 minutes (plus approval wait time)

