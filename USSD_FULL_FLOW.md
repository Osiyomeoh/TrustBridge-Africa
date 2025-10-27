# USSD Full Flow - TrustBridge Africa

## Overview

Complete USSD-based RWA tokenization flow for Nigerian farmers without bank accounts.

## User Journey

### Step 1: Registration (First-time Users)

```
User dials *384#
→ CON Welcome to TrustBridge Africa
  Tokenize Your Real-World Assets

  Farmers: Get investors for your land!

  1. Register (Free)
  2. Learn More
  0. Exit

User selects 1
→ CON Enter Full Name:

User enters: John Doe
→ CON Enter State:

User enters: Lagos
→ CON Enter Town/Village:

User enters: Ikeja
→ END ✅ Registration Complete!

  Welcome John Doe!
  Your wallet: 0.0.123456
  Ready to tokenize assets.
```

### Step 2: Tokenize Asset

```
User dials *384# again
→ CON Welcome Back!
  Tokenize Your Assets

  1. Tokenize My Asset
  2. My Portfolio
  3. Why Tokenize?
  0. Exit

User selects 1
→ CON Choose Asset Type:

  1. Farmland
  2. Real Estate
  3. Business
  4. Commodities
  99. Back

User selects 1
→ CON Enter Land Size (acres):

User enters: 10
→ CON Enter Location (State):

User enters: Lagos
→ CON Enter Current Value (NGN):

User enters: 5000000
→ CON Confirm Asset Details:

  Type: Farmland
  Size: 10 acres
  Location: Lagos
  Value: ₦5000000

  1. Submit for Review
  2. Cancel

  Reply 1 to submit

User selects 1
→ END ✅ Asset Submitted!

  Asset ID: 0.0.7104310
  Status: Pending AMC Review

  AMC will review within 48h
  You'll receive SMS: "Asset approved!"

  Visit tbafrica.xyz for updates
```

### Step 3: Portfolio View

```
User selects 2 (My Portfolio)
→ END My RWA Portfolio

  Owned Assets: 3
  Total Value: 15000000 NGN
  Earned Returns: 50000 NGN
```

### Step 4: Why Tokenize?

```
User selects 3 (Why Tokenize?)
→ END WHY TOKENIZE?

  💰 Unlock the value of your land
  👥 Find investors worldwide
  🏦 No bank loans needed
  📈 Earn from asset returns
  🔒 Keep your land ownership

  COST: ₦500 fee
  AMC APPROVAL: 48 hours

  Visit tbafrica.xyz
```

## Technical Implementation

### USSD Menu Structure

```
Main Menu
├── New User
│   ├── 1. Register
│   │   ├── Full Name
│   │   ├── State
│   │   └── Town/Village
│   ├── 2. Learn More
│   └── 0. Exit
│
└── Registered User
    ├── 1. Tokenize My Asset
    │   ├── Choose Asset Type
    │   ├── Enter Land Size
    │   ├── Enter Location
    │   ├── Enter Current Value
    │   └── Confirm & Submit
    ├── 2. My Portfolio
    ├── 3. Why Tokenize?
    └── 0. Exit
```

### Session Management

```typescript
interface USSD Session {
  sessionId: string;
  phoneNumber: string;
  step: 'main' | 'register' | 'tokenize';
  data: {
    assetType?: string;
    size?: string;
    location?: string;
    value?: string;
  };
}
```

### Asset Creation Flow

```typescript
1. User submits asset details via USSD
2. System creates asset on Hedera blockchain
3. Asset ID returned to user
4. Status: PENDING_APPROVAL
5. AMC reviews within 48 hours
6. SMS sent: "Asset approved!"
7. Asset listed for trading
```

## Key Features

✅ **No Payment in USSD** - Free to submit assets  
✅ **Session-based** - Multi-step guided flow  
✅ **User Registration** - Simple 3-step process  
✅ **Asset Creation** - Direct Hedera blockchain integration  
✅ **AMC Review** - Automatic approval workflow  
✅ **SMS Notifications** - Status updates via SMS  
✅ **Portfolio View** - Instant asset overview  

## Status Messages

**Registration:**
```
✅ Registration Complete!
Welcome [Name]!
Your wallet: [Address]
Ready to tokenize assets.
```

**Asset Submission:**
```
✅ Asset Submitted!

Asset ID: 0.0.7104310
Status: Pending AMC Review

AMC will review within 48h
You'll receive SMS: "Asset approved!"

Visit tbafrica.xyz for updates
```

**Portfolio:**
```
My RWA Portfolio

Owned Assets: 3
Total Value: 15000000 NGN
Earned Returns: 50000 NGN
```

## Testing

### Test USSD Flow

```bash
curl -X POST http://localhost:4001/api/mobile/ussd \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test_session",
    "phoneNumber": "+2348123456789",
    "text": ""
  }'
```

### Expected Response

```
CON Welcome to TrustBridge Africa
Tokenize Your Real-World Assets

Farmers: Get investors for your land!

1. Register (Free)
2. Learn More
0. Exit
```

## Integration Points

1. **User Registration** → Database + Hedera Wallet Creation
2. **Asset Submission** → Hedera HTS Token Creation
3. **AMC Review** → Admin Dashboard
4. **Notifications** → SMS via Africa's Talking
5. **Portfolio** → Database + Hedera Mirror Node

## Next Steps

1. Add SMS notification on asset approval
2. Add USSD payment option for premium features
3. Add asset status check via USSD
4. Add investor browsing via USSD
5. Add Hedera USSD support for direct blockchain queries

