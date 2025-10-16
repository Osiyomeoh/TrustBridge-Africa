# 🔍 Royalty & Gas Economics Analysis

## ✅ ROYALTY SYSTEM - HOW IT WORKS

### Smart Contract Flow (TRUSTMarketplaceV2)

**When NFT is Bought:**

```solidity
// Line 180-212 in TRUSTMarketplaceV2.sol

1. Calculate platform fee (2.5%)
   platformFee = (price * 250) / 10000

2. Calculate royalty (if exists and creator != seller)
   royaltyAmount = (price * royaltyPercentage) / 10000
   
3. Calculate seller amount
   sellerAmount = price - platformFee - royaltyAmount

4. Transfer TRUST from buyer to contract
   trustToken.transferFrom(buyer, contract, price)

5. Distribute payments:
   ✅ contract → seller:   sellerAmount
   ✅ contract → platform: platformFee
   ✅ contract → creator:  royaltyAmount (if > 0)

6. Transfer NFT from seller to buyer
   NFT.safeTransferFrom(seller, buyer, tokenId)
```

### Example: 100 TRUST Sale

**First Sale (Creator = Seller):**
```
Sale Price: 100 TRUST
Royalty: 5% (500 basis points)

Distribution:
- Platform Fee (2.5%): 2.5 TRUST → Treasury (0.0.6916959)
- Royalty (5%): 0 TRUST (creator == seller, so no royalty paid)
- Seller Gets: 97.5 TRUST → Creator (0.0.6916959)

Total: 97.5 + 2.5 = 100 TRUST ✓
```

**Second Sale (Creator ≠ Seller):**
```
Sale Price: 100 TRUST
Royalty: 5%

Distribution:
- Platform Fee (2.5%): 2.5 TRUST → Treasury
- Royalty (5%): 5 TRUST → Original Creator  ← CREATOR EARNS!
- Seller Gets: 92.5 TRUST → Current Owner

Total: 2.5 + 5 + 92.5 = 100 TRUST ✓
```

**Third Sale and Beyond:**
```
Same as second sale - creator ALWAYS gets 5%!
```

---

## 💰 GAS & TRUST TOKEN ECONOMICS

### Current Setup:

**Marketplace Account:** `0.0.6916959`
- **HBAR Balance:** ~933 HBAR ✅ (sufficient for gas)
- **TRUST Balance:** Unknown (needs checking)

### Gas Requirements:

**Transaction Type → Gas Cost (HBAR):**
```
NFT Transfer:        ~0.01 HBAR
Token Transfer:      ~0.001 HBAR
Contract Call:       ~0.05-0.20 HBAR
Smart Contract Buy:  ~0.50 HBAR (multiple operations)

Daily Estimate (100 transactions):
- 100 sales × 0.5 HBAR = 50 HBAR/day
- Current balance: 933 HBAR
- Runway: ~18 days ✅
```

### TRUST Token Flow:

**Problem:** Marketplace contract needs TRUST tokens to facilitate transfers!

**Current Issue:**
```
When buyer purchases NFT:
1. Buyer sends 100 TRUST to contract ✅
2. Contract distributes:
   - 2.5 TRUST to platform ✅
   - 5 TRUST to creator ✅
   - 92.5 TRUST to seller ✅
3. Contract balance: 0 TRUST (all distributed) ✅

This is CORRECT! Contract doesn't need to hold TRUST.
```

**Gas for Hedera Operations:**
- HBAR is used for gas (not TRUST) ✅
- Marketplace account has 933 HBAR ✅
- This is sufficient for thousands of transactions ✅

---

## ✅ VERIFICATION: Is Royalty Working?

### Contract Analysis:

**YES! ✅** The royalty system is fully functional:

1. **Royalty Storage:**
   ```solidity
   mapping(address => mapping(uint256 => Royalty)) public royalties;
   ```
   - Stores creator address
   - Stores royalty percentage
   - Permanent on-chain record

2. **Royalty Calculation:**
   ```solidity
   if (royalty.creator != address(0) && royalty.creator != listing.seller) {
       royaltyAmount = (listing.price * royalty.percentage) / 10000;
   }
   ```
   - Only pays if creator exists
   - Only pays if creator ≠ current seller (no self-payment)
   - Calculated in basis points (accurate)

3. **Royalty Distribution:**
   ```solidity
   if (royaltyAmount > 0 && royalty.creator != address(0)) {
       require(trustToken.transfer(royalty.creator, royaltyAmount), "Royalty payment failed");
   }
   ```
   - Automatic transfer to creator
   - Transaction fails if royalty payment fails (safe!)

4. **Event Logging:**
   ```solidity
   emit AssetSold(listingId, seller, buyer, price, platformFee, royaltyAmount);
   ```
   - All royalty payments logged on-chain
   - Transparent and auditable

---

## ⚠️ POTENTIAL ISSUE: Setting Royalty Info

### Question: How does royalty info get INTO the contract?

**Current Flow:**
```
1. User creates NFT with 5% royalty (frontend)
   ↓
2. Metadata stored on IPFS with royaltyPercentage: 5
   ↓
3. NFT minted on Hedera
   ↓
4. User lists NFT ???
   ↓
??? When is setRoyalty() called on contract? ???
```

**The Missing Link:**
We need to call `setRoyalty()` on the contract when listing!

Let me check if this is happening...

<function_calls>
<invoke name="grep">
<parameter name="pattern">setRoyalty
