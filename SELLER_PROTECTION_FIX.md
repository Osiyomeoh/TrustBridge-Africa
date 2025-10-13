# Seller Protection Fix - Prevent Self-Purchase

## Problem
Sellers could buy their own listings from the marketplace, which is illogical and causes accounting issues.

## Root Cause
1. When an asset is listed (transferred to escrow), the `owner` becomes the marketplace account
2. UI was checking `isOwner` against the current owner (marketplace), not the original seller
3. No validation existed to prevent the seller from buying their own listing

## Solution

### Backend: Track Original Seller

**File: `trustbridge-backend/src/assets/assets.service.ts`**

The backend now:
1. ✅ Queries NFT transaction history from Hedera Mirror Node
2. ✅ Finds the most recent transfer TO marketplace (listing transaction)
3. ✅ Fetches detailed transaction data to get `nft_transfers`
4. ✅ Extracts `sender_account_id` as the seller
5. ✅ Returns `seller` field in blockchain state API

**API Response:**
```json
{
  "success": true,
  "data": {
    "owner": "0.0.6916959",        // Marketplace (in escrow)
    "isListed": true,
    "isInEscrow": true,
    "marketplaceAccount": "0.0.6916959",
    "seller": "0.0.7028303"        // Original seller
  }
}
```

### Frontend: Prevent Self-Purchase

**File: `trustbridge-frontend/src/components/Assets/MarketplaceAssetModal.tsx`**

#### 1. Track Seller in State
```typescript
const [marketplaceListingStatus, setMarketplaceListingStatus] = useState<{
  isListed: boolean;
  listingId: number;
  isLoading: boolean;
  seller?: string;  // NEW: Track who listed it
}>(...);
```

#### 2. Update Owner Check
```typescript
// Check against seller when listed, owner when not listed
const isOwner = accountId && (
  (marketplaceListingStatus.isListed && marketplaceListingStatus.seller && 
   marketplaceListingStatus.seller === accountId) ||
  (!marketplaceListingStatus.isListed && actualOwner === accountId)
);
```

#### 3. Validation in Buy Function
```typescript
// Prevent seller from buying their own listing
if (marketplaceListingStatus.seller && 
    marketplaceListingStatus.seller === accountId) {
  throw new Error('You cannot buy your own listing. Please unlist it first.');
}
```

#### 4. UI Protection
- ✅ If `isOwner` (seller), show "You own this asset" message
- ✅ Hide "Buy Now" button for the seller
- ✅ Only show "Buy Now" to other users

## How to Test

### Test 1: List as User A
1. Connect as `0.0.7028303`
2. List NFT `0.0.7028555` serial 1
3. NFT transfers to marketplace escrow
4. Backend tracks: `seller = 0.0.7028303`

### Test 2: View as User A (Seller)
1. Stay connected as `0.0.7028303`
2. Open asset in marketplace
3. ✅ Should see "You own this asset"
4. ✅ "Buy Now" button should be hidden
5. ✅ Clicking anything should not allow purchase

### Test 3: View as User B (Buyer)
1. Disconnect and connect as `0.0.6923405`
2. Open the same asset
3. ✅ Should see "Buy Now" button
4. ✅ Can purchase successfully
5. ✅ NFT transfers from marketplace to User B

### Test 4: Verify Seller Detection
```bash
# When NFT is listed, check API:
curl "http://localhost:4001/api/assets/blockchain-state/0.0.7028555/1"

# Should return:
# "seller": "0.0.7028303"  <- The account that listed it
```

## Transaction Flow

**Listing:**
```
User A (0.0.7028303) → Marketplace (0.0.6916959)
Backend records: seller = 0.0.7028303
```

**Attempted Self-Purchase:**
```
Frontend checks: currentUser (0.0.7028303) === seller (0.0.7028303) ✅
Error: "You cannot buy your own listing"
```

**Legitimate Purchase:**
```
Frontend checks: currentUser (0.0.6923405) !== seller (0.0.7028303) ✅
Transaction proceeds: Marketplace → User B
```

## Files Modified

1. ✅ `trustbridge-backend/src/assets/assets.service.ts` - Seller detection
2. ✅ `trustbridge-backend/src/assets/assets.controller.ts` - API type update
3. ✅ `trustbridge-frontend/src/components/Assets/MarketplaceAssetModal.tsx` - Seller validation

## Status

**Please test again:**
1. List an asset
2. Try to buy it with the same account
3. ✅ Should now show "You own this asset" and prevent purchase

The fix is deployed! 🛡️✨

