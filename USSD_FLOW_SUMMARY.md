# USSD Flow Summary - TrustBridge Africa

## Current USSD Flow (No Payment)

### Complete User Journey

```
1. User dials *384#
   ↓
2. NEW USER: Selects "1. Register"
   - Enters Full Name
   - Enters State
   - Enters Town/Village
   ✅ Wallet created automatically
   ↓
3. Returns to Main Menu
   ↓
4. REGISTERED USER: Selects "1. Tokenize My Asset"
   - Chooses Asset Type (Farmland/Real Estate/Business/Commodities)
   - Enters Land Size (acres)
   - Enters Location (State)
   - Enters Current Value (NGN)
   - Confirms details
   - Selects "1. Submit for Review"
   ↓
5. Asset created on Hedera blockchain ✅
   ↓
6. User receives confirmation with Asset ID
   ↓
7. AMC reviews within 48 hours
   ↓
8. User receives SMS: "Asset approved!"
```

## Detailed Menu Flow

### Main Menu (New User)
```
CON Welcome to TrustBridge Africa
Tokenize Your Real-World Assets

Farmers: Get investors for your land!

1. Register (Free)
2. Learn More
0. Exit
```

### Main Menu (Registered User)
```
CON Welcome Back!
Tokenize Your Assets

1. Tokenize My Asset
2. My Portfolio
3. Why Tokenize?
0. Exit
```

### Tokenization Flow
```
1. Choose Asset Type
   CON Choose Asset Type:
   
   1. Farmland
   2. Real Estate
   3. Business
   4. Commodities
   99. Back

2. Enter Land Size
   CON Enter Land Size (acres):
   
   Reply with number only
   Example: 5

3. Enter Location
   CON Enter Location (State):
   
   Example: Lagos

4. Enter Current Value
   CON Enter Current Value (NGN):
   
   Example: 1000000

5. Confirm & Submit
   CON Confirm Asset Details:
   
   Type: Farmland
   Size: 10 acres
   Location: Lagos
   Value: ₦5000000
   
   1. Submit for Review
   2. Cancel
   
   Reply 1 to submit

6. Asset Created
   END ✅ Asset Submitted!
   
   Asset ID: 0.0.7104310
   Status: Pending AMC Review
   
   AMC will review within 48h
   You'll receive SMS: "Asset approved!"
   
   Visit tbafrica.xyz for updates
```

## Technical Implementation

### No Payment Required
- **Free to submit**: No ₦500 fee in USSD
- **Direct blockchain**: Asset created immediately
- **AMC review**: Automatic workflow
- **SMS notifications**: Status updates

### Data Flow
```
USSD Input → Session Storage → Asset Creation on Hedera → HCS Topic → Database → User Confirmation
```

### Key Features
✅ **Session-based**: Multi-step guided flow  
✅ **No payment**: Free asset submission  
✅ **Hedera integration**: Direct blockchain creation  
✅ **AMC review**: Automatic approval workflow  
✅ **SMS notifications**: Status updates  
✅ **Portfolio view**: Instant asset overview  

## Asset Creation Process

### When User Submits Asset (via USSD)

1. **Data Collection**
   - Asset type, size, location, value
   - Stored in session

2. **Hedera Token Creation**
   - Creates HTS NFT token
   - Returns Asset ID (e.g., 0.0.7104310)

3. **HCS Message Submission**
   - Logs to Hedera Consensus Topic
   - Status: PENDING_APPROVAL

4. **Database Storage**
   - Saves asset in MongoDB
   - Links to user's wallet

5. **Confirmation**
   - Returns Asset ID to user
   - Updates session

## USSD Endpoint

### Test the Flow

```bash
curl -X POST http://localhost:4001/api/mobile/ussd \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test_session_123",
    "phoneNumber": "+2348123456789",
    "text": ""
  }'
```

### Expected Response (First Call)
```
CON Welcome to TrustBridge Africa
Tokenize Your Real-World Assets

Farmers: Get investors for your land!

1. Register (Free)
2. Learn More
0. Exit
```

## Status

✅ **USSD Flow**: Fully implemented  
✅ **Asset Creation**: Working (Hedera HTS)  
✅ **Registration**: Working (3-step)  
✅ **Portfolio**: Working (view assets)  
⏳ **SMS Notifications**: To be implemented  
⏳ **AMC Review**: To be implemented  

## What Happens Next

1. **User completes USSD flow**: Asset ID received
2. **AMC reviews asset** (within 48 hours)
3. **Asset approved**: SMS sent to user
4. **Asset listed**: Available for trading
5. **Investors discover**: On tbafrica.xyz
6. **Farmer earns**: Returns from investments

