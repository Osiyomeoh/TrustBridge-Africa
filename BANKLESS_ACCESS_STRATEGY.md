# Bankless Access Strategy for TrustBridge Africa

## Challenge

Many Africans don't have access to traditional banks but need to:
- Pay for tokenization fees
- Transfer money
- Receive investment returns
- Exchange crypto for fiat

## Solution: Multi-Channel Payment Infrastructure

### 1. USSD (Already Implemented) ✅

**How it works:**
- Users dial bank USSD code (*737# for GTB)
- Transfer money via bank account
- No smartphone required
- Works on basic feature phones

**Supported Banks:**
- Guaranty Trust Bank (*737#)
- Access Bank (*901#)
- UBA (*919#)
- Zenith (*966#)
- First Bank (*894#)

**Limitation:** Requires bank account

### 2. Mobile Money Integration (TODO)

**For users WITHOUT bank accounts**

#### Nigeria Providers:
- **Paga**: Direct bank transfers via agent network
- **Opay**: Mobile wallet with merchant network
- **Palmpay**: Digital wallet with USSD codes
- **MTN Mobile Money**: If launched in Nigeria

#### Integration Flow:
```typescript
// User without bank account
User selects "Mobile Money"
→ Choose provider (Paga/Opay/Palmpay)
→ Enter phone number
→ Receive SMS with payment link
→ Pay at agent/store
→ Asset created on blockchain
```

### 3. Cash Deposits at Agent Networks (TODO)

**How it works:**
1. User submits asset via USSD
2. System generates payment reference
3. User visits agent (Paga/Opay/Palmpay agent)
4. Agent takes cash
5. Agent processes payment
6. System receives confirmation
7. Asset created on blockchain

**Agent Networks:**
- **Paga**: 87,000+ agents nationwide
- **Opay**: 300,000+ agents
- **Palmpay**: Large agent network

### 4. HBAR to Fiat Gateway (TODO)

**For crypto holders:**

```typescript
User has HBAR in wallet
↓
Select "Pay with HBAR"
↓
System calculates HBAR amount (₦500 / HBAR rate)
↓
User approves transaction
↓
HBAR transferred to platform treasury
↓
Asset created on blockchain
```

### 5. Stored Value (TrustToken Wallet) (TODO)

**Prepay for services:**

```typescript
User buys TrustToken credits
↓
Uses credits for tokenization
↓
No cash payment needed
```

## Recommended Implementation

### Phase 1: USSD + Mobile Money (Current)

**Current Status:**
- ✅ USSD payment instructions implemented
- ⏳ Mobile Money integration needed

**Next Steps:**
1. Integrate Paga/Opay/Palmpay APIs
2. Add payment options to USSD menu
3. Generate payment codes
4. Receive confirmations via webhook

### Phase 2: Agent Cash Deposits

**How it works:**
```
USSD → Select "Cash Payment"
↓
System generates code: TB-123456
↓
User visits agent
↓
Agent enters code, collects cash
↓
Payment confirmed
↓
Asset created
```

### Phase 3: Crypto Payments

**HBAR + TrustToken:**
- Pay with HBAR (convert to NGN)
- Pay with TrustToken credits
- Buy TrustToken with cash at agents

## Implementation Roadmap

### Week 1: Mobile Money Integration
- [ ] Choose primary provider (Paga recommended)
- [ ] Create PagaService
- [ ] Add payment endpoint
- [ ] Update USSD menu

### Week 2: Agent Network
- [ ] Generate payment codes
- [ ] Create agent verification system
- [ ] Implement webhook handling

### Week 3: Crypto Payments
- [ ] HBAR to NGN conversion
- [ ] TrustToken credit system
- [ ] Wallet integration

## Key Providers for Nigeria

### 1. Paga (Recommended)
- **Coverage**: 87,000+ agents
- **API**: Bank transfers, USSD, cards
- **Market**: All states in Nigeria
- **Website**: https://developers.mypaga.com

### 2. Opay
- **Coverage**: 300,000+ agents
- **API**: Wallet, transfers, bill payments
- **Market**: Nigeria
- **Website**: https://opay-developers.readme.io

### 3. Palmpay
- **Coverage**: Large agent network
- **API**: Wallet, transfers
- **Market**: Nigeria
- **Website**: https://developer.palmpay.com

### 4. Africa's Talking (SMS Only)
- **Coverage**: Pan-African
- **Services**: SMS, USSD, Voice
- **Market**: Nigeria + Africa
- **Website**: https://africastalking.com

## Current Implementation

### What We Have:
- ✅ USSD flow for tokenization
- ✅ Bank USSD payment instructions
- ✅ Portfolio viewing
- ✅ Registration

### What We Need:
- ⏳ Mobile Money payment processing
- ⏳ Agent network integration
- ⏳ Payment verification
- ⏳ Webhook handling

## Test Flow

### Scenario: Farmer without bank account

```
1. Farmer dials *384#
2. Registers (name, state, town)
3. Submits asset (type, size, location, value)
4. Reaches payment step
↓
Current: Instructed to dial *737#
Problem: Requires bank account

New Flow:
5. Sees options:
   - Have bank account? Dial *737#
   - No bank account? Use Paga
6. Selects "2. Paga Mobile Money"
7. Receives SMS: "Pay ₦500 to Agent with code: TB-123456"
8. Visits Paga agent
9. Agent collects cash, enters code
10. Payment confirmed
11. Asset created on Hedera
12. SMS: "Asset submitted! ID: 0.0.123"
```

## Cost Structure

### Platform Fees:
- **Tokenization Fee**: ₦500
- **Split**: ₦400 for blockchain + ₦100 for support

### Payment Processing:
- **Bank Transfer**: 0% (user pays bank fees)
- **Mobile Money**: 1.5% - 3% per transaction
- **Agent Cash**: Agent fee (₦100-₦200)

## Recommended: Start with Paga

**Why Paga?**
1. Largest agent network (87k+)
2. Covers all states
3. Simple API
4. Bank transfers + agent network
5. Widely used in Nigeria

**Integration:**
```typescript
// Payment with Paga
PagaService.initializePayment({
  phoneNumber,
  amount: 500,
  paymentCode: 'TB-123456',
  method: 'bank_transfer' // or 'agent_deposit'
})
```

## Summary

**Current:** USSD + Bank transfers (requires bank account)  
**Next:** Add Paga/Opay/Palmpay for bankless users  
**Future:** HBAR payments + TrustToken credits

