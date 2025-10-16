# 🎯 Complete TrustBridge Marketplace Flow - WITH ROYALTIES

## 🆕 What's New?

### Before (Old Flow):
- ✅ Create NFT → List → Buy → Transfer ownership
- ❌ No creator royalties
- ❌ No collections
- ❌ No activity tracking
- ❌ No offers

### Now (Enhanced Flow):
- ✅ Create NFT → List → Buy → **Automatic Royalty Distribution**
- ✅ **Collections auto-created and tracked**
- ✅ **Activity feed shows all marketplace events**
- ✅ **Make/Accept/Reject offers**
- ✅ **Creator earns on every resale**
- ✅ **Enhanced marketplace with TRUSTMarketplaceV2**

---

## 📋 THE COMPLETE NEW FLOW

### 🎨 PHASE 1: CREATE DIGITAL ASSET (NFT)

**User Action:**
1. Connect HashPack wallet
2. Go to Profile → "Create New Asset"
3. Fill in details:
   ```
   Name: "My Amazing Art"
   Description: "Digital artwork"
   Price: 100 TRUST
   Royalty: 5%  ← NEW! Creator royalty
   Category: Art
   Image: Upload file
   ```
4. Approve transaction in HashPack

**What Happens Behind the Scenes:**

```
Frontend (CreateDigitalAsset.tsx)
  ↓
  1. Upload image to IPFS via Pinata
     → Get IPFS CID: QmXYZ...
  ↓
  2. Create metadata JSON:
     {
       name: "My Amazing Art",
       description: "Digital artwork",
       image: "ipfs://QmXYZ...",
       price: "100",
       royaltyPercentage: 5  ← NEW!
     }
  ↓
  3. Upload metadata to IPFS
     → Get metadata CID: QmABC...
  ↓
  4. Mint NFT on Hedera (via backend)
     → NFT Token ID: 0.0.XXXXXX
     → Serial Number: 1
  ↓
Backend (AssetsService)
  ↓
  5. Store in MongoDB:
     {
       tokenId: "0.0.XXXXXX",
       serialNumber: 1,
       owner: "0.0.6916959",
       price: "100",
       royaltyPercentage: 5,
       creator: "0.0.6916959",  ← Track original creator
       metadata: "ipfs://QmABC...",
       status: "owned"
     }
  ↓
  6. Auto-create/update Collection:
     {
       collectionId: "art-collection-0.0.6916959",
       name: "Digital Art Collection",
       creatorAddress: "0.0.6916959",
       itemCount: 1,
       floorPrice: 100
     }
  ↓
  7. Log Activity:
     {
       type: "MINTED",
       nftTokenId: "0.0.XXXXXX",
       user: "0.0.6916959",
       timestamp: "2025-10-13..."
     }
```

**Result:**
- ✅ NFT minted on Hedera blockchain
- ✅ Metadata stored on IPFS (permanent)
- ✅ Asset in user's portfolio
- ✅ Collection created/updated
- ✅ Activity logged

---

### 💰 PHASE 2: LIST ASSET FOR SALE

**User Action:**
1. Go to Profile
2. Click asset → "List for Sale"
3. Confirm price (editable)
4. Approve transaction in HashPack

**What Happens Behind the Scenes:**

```
Frontend (Profile.tsx → AssetCard)
  ↓
  1. Call contractService.listDigitalAssetForSale()
     → NFT Token ID: 0.0.XXXXXX
     → Serial: 1
     → Price: 100 TRUST
     → Royalty: 5%  ← Passed to smart contract
  ↓
Smart Contract (TRUSTMarketplaceV2)
  ↓
  2. Verify NFT ownership
  3. Approve NFT transfer to marketplace
  4. Create listing:
     {
       listingId: hash(nftAddress + tokenId + seller),
       nftContract: "0.0.XXXXXX",
       tokenId: 1,
       seller: "0.0.6916959",
       price: 100 TRUST,
       royaltyRecipient: "0.0.6916959",  ← Creator
       royaltyPercentage: 500  ← 5% in basis points
     }
  5. Emit event: NFTListed(...)
  ↓
Backend (via Mirror Node indexing)
  ↓
  6. Update MongoDB:
     {
       status: "listed",
       listedAt: timestamp,
       listingId: "0x..."
     }
  ↓
  7. Update Collection stats:
     {
       floorPrice: min(all listed prices)
     }
  ↓
  8. Log Activity:
     {
       type: "LISTED",
       nftTokenId: "0.0.XXXXXX",
       price: 100,
       seller: "0.0.6916959"
     }
```

**Result:**
- ✅ Asset listed on marketplace
- ✅ Shows in marketplace browse
- ✅ Royalty info stored on-chain
- ✅ Activity logged

---

### 🛒 PHASE 3: BUY ASSET (THE MAGIC HAPPENS HERE!)

**Buyer Action:**
1. Switch to different HashPack account
2. Go to Marketplace
3. Find asset → "Buy Now"
4. Review:
   ```
   Price: 100 TRUST
   Platform Fee (2.5%): 2.5 TRUST
   Creator Royalty (5%): 5 TRUST
   Total: 100 TRUST (buyer pays full price)
   ```
5. Approve TRUST token payment in HashPack

**What Happens Behind the Scenes (THE NEW FLOW!):**

```
Frontend (AssetMarketplace.tsx)
  ↓
  1. Call contractService.buyDigitalAsset()
     → Listing ID: "0x..."
     → Buyer: "0.0.7777777"
  ↓
Smart Contract (TRUSTMarketplaceV2.buyNFT)
  ↓
  2. Verify listing exists and is active
  3. Calculate distribution:
     ```
     Sale Price:     100 TRUST
     
     Royalty (5%):   5 TRUST   → to Creator (0.0.6916959)
     Platform (2.5%): 2.5 TRUST → to Treasury (0.0.6916959)
     Seller Gets:    92.5 TRUST → to Seller (could be different from creator!)
     
     Total: 100 TRUST ✓
     ```
  ↓
  4. Transfer TRUST tokens:
     a) Buyer → Creator:  5 TRUST     ← ROYALTY!
     b) Buyer → Platform: 2.5 TRUST   ← PLATFORM FEE
     c) Buyer → Seller:   92.5 TRUST  ← SELLER PAYMENT
  ↓
  5. Transfer NFT ownership:
     Seller → Buyer
  ↓
  6. Emit events:
     - NFTSold(nftContract, tokenId, seller, buyer, price)
     - RoyaltyPaid(nftContract, tokenId, creator, 5 TRUST)  ← NEW!
  ↓
  7. Delete listing from contract
  ↓
Backend (listening to events via Mirror Node)
  ↓
  8. Update Asset in MongoDB:
     {
       owner: "0.0.7777777",  ← New owner
       status: "owned",
       previousOwner: "0.0.6916959",
       lastSalePrice: 100
     }
  ↓
  9. Record Royalty Payment (NEW!):
     {
       nftTokenId: "0.0.XXXXXX",
       serialNumber: 1,
       creator: "0.0.6916959",
       amount: 5,
       percentage: 5,
       salePrice: 100,
       transactionId: "0.0.6916959@...",
       timestamp: now
     }
  ↓
  10. Update Collection stats:
      {
        volumeTraded: previousVolume + 100,
        floorPrice: recalculate(),
        ownerCount: countUniqueOwners()
      }
  ↓
  11. Log Activity (multiple entries):
      a) {
           type: "SOLD",
           from: "0.0.6916959",
           to: "0.0.7777777",
           price: 100,
           nftTokenId: "0.0.XXXXXX"
         }
      b) {
           type: "ROYALTY_PAID",  ← NEW!
           creator: "0.0.6916959",
           amount: 5,
           percentage: 5
         }
      c) {
           type: "TRANSFER",
           from: "0.0.6916959",
           to: "0.0.7777777",
           nftTokenId: "0.0.XXXXXX"
         }
```

**Result:**
- ✅ NFT ownership transferred to buyer
- ✅ Buyer paid 100 TRUST total
- ✅ **Creator received 5 TRUST royalty** ← NEW!
- ✅ **Platform received 2.5 TRUST fee**
- ✅ **Seller received 92.5 TRUST**
- ✅ All payments automatic (no manual distribution needed!)
- ✅ Collection stats updated
- ✅ Activity logged for transparency

---

### 🔄 PHASE 4: RESALE (CREATOR EARNS AGAIN!)

**Scenario:** New owner (0.0.7777777) wants to resell

**User Action:**
1. Owner lists NFT for 150 TRUST
2. Another buyer purchases

**What Happens:**

```
Sale Price: 150 TRUST

Distribution:
→ Creator Royalty (5%): 7.5 TRUST  → 0.0.6916959 (original creator)
→ Platform Fee (2.5%): 3.75 TRUST  → Treasury
→ Seller Payment: 138.75 TRUST     → 0.0.7777777 (current owner)

Total: 150 TRUST ✓
```

**Key Points:**
- ✅ **Creator ALWAYS gets 5%** on every resale
- ✅ **Original creator tracked on-chain**
- ✅ **Automatic distribution** via smart contract
- ✅ **No manual payments needed**
- ✅ **Royalty can't be bypassed**

---

### 💬 PHASE 5: MAKE OFFER (OPTIONAL)

**Buyer Action:**
1. Go to Marketplace
2. Click asset → "Make Offer"
3. Enter amount: 80 TRUST (below asking price)
4. Approve transaction

**What Happens:**

```
Frontend
  ↓
Smart Contract (TRUSTMarketplaceV2.makeOffer)
  ↓
  1. Create offer:
     {
       listingId: "0x...",
       buyer: "0.0.8888888",
       amount: 80 TRUST,
       expiresAt: timestamp + 7 days
     }
  2. Emit: OfferMade(listingId, buyer, amount)
  ↓
Backend
  ↓
  3. Store offer in MongoDB:
     {
       listingId: "0x...",
       nftTokenId: "0.0.XXXXXX",
       buyer: "0.0.8888888",
       seller: "0.0.6916959",
       amount: 80,
       status: "pending"
     }
  ↓
  4. Log Activity:
     {
       type: "OFFER_MADE",
       buyer: "0.0.8888888",
       amount: 80
     }
```

**Seller Can:**
- ✅ Accept offer → Same flow as buy, but at 80 TRUST
- ✅ Reject offer → Offer deleted
- ❌ Ignore offer → Expires after 7 days

---

### 📊 PHASE 6: BROWSE COLLECTIONS

**User Action:**
1. Go to `/collections`
2. Browse all NFT collections

**What Shows:**

```
Collection Card:
┌─────────────────────────────────┐
│ [Collection Banner Image]       │
├─────────────────────────────────┤
│ Digital Art Collection          │
│ by 0.0.6916959                  │
│                                 │
│ Floor: 100 TRUST                │
│ Volume: 250 TRUST               │
│ Items: 5                        │
│ Owners: 3                       │
└─────────────────────────────────┘
```

**Data Source:**
- MongoDB Collections collection
- Auto-updated when NFTs are minted/sold
- Real-time stats from Hedera Mirror Node

---

### 📰 PHASE 7: VIEW ACTIVITY FEED

**User Action:**
1. Go to `/activity`
2. See all marketplace events

**What Shows:**

```
Activity Feed:
┌─────────────────────────────────────────┐
│ 🎨 SALE                           2m ago │
│ "My Amazing Art" sold for 100 TRUST     │
│ 0.0.6916959 → 0.0.7777777               │
│ [View on HashScan]                      │
├─────────────────────────────────────────┤
│ 👑 ROYALTY PAID                   2m ago │
│ Creator earned 5 TRUST (5%)             │
│ [View on HashScan]                      │
├─────────────────────────────────────────┤
│ 📋 LISTED                         5m ago │
│ "My Amazing Art" listed for 100 TRUST   │
│ by 0.0.6916959                          │
└─────────────────────────────────────────┘
```

**Data Source:**
- MongoDB Activity collection
- Hedera Mirror Node transaction history
- Real-time updates via WebSocket (optional)

---

## 🎯 KEY IMPROVEMENTS SUMMARY

### Old Flow → New Flow

| Feature | Before | After |
|---------|--------|-------|
| **Creator Royalties** | ❌ None | ✅ 0-10% automatic |
| **Royalty Enforcement** | ❌ N/A | ✅ Smart contract enforced |
| **Collections** | ❌ None | ✅ Auto-created & tracked |
| **Activity Tracking** | ❌ Basic | ✅ Comprehensive feed |
| **Offers** | ❌ None | ✅ Make/Accept/Reject |
| **Fee Distribution** | ✅ Manual | ✅ Automatic |
| **Transparency** | ⚠️ Limited | ✅ Full on-chain |

---

## 💰 MONEY FLOW DIAGRAM

```
SALE: 100 TRUST

Buyer (0.0.7777777)
    |
    | Pays 100 TRUST
    ↓
Smart Contract (TRUSTMarketplaceV2)
    |
    ├─→ Creator (0.0.6916959): 5 TRUST (5% royalty)
    |
    ├─→ Platform (0.0.6916959): 2.5 TRUST (2.5% fee)
    |
    └─→ Seller (could be anyone): 92.5 TRUST
    
Total distributed: 100 TRUST ✓
```

**Every Resale:**
```
Creator ALWAYS gets 5%
Platform ALWAYS gets 2.5%
Current seller gets the rest
```

---

## 🔒 SECURITY & GUARANTEES

### Smart Contract Guarantees:
- ✅ **Reentrancy Protection** - Can't exploit payment logic
- ✅ **Pausable** - Can pause in emergency
- ✅ **Access Control** - Only admin can change fees
- ✅ **Royalty Enforcement** - Creator ALWAYS paid
- ✅ **Atomic Transactions** - All or nothing

### Data Guarantees:
- ✅ **IPFS** - Metadata immutable
- ✅ **Hedera** - Ownership immutable
- ✅ **MongoDB** - Fast queries, backups
- ✅ **Mirror Node** - Hedera's official indexer

---

## 🚀 TECHNICAL STACK

### Smart Contract Layer:
```
TRUSTMarketplaceV2.sol (Deployed: 0.0.7053859)
  ↓
  - Listing management
  - Automatic royalty calculation
  - Payment distribution
  - Access control
```

### Backend Layer:
```
NestJS Backend
  ↓
  - Collections API (/api/collections)
  - Royalties API (/api/royalties)
  - Activity API (/api/activity)
  - Assets API (/api/assets)
```

### Frontend Layer:
```
React + TypeScript
  ↓
  - Marketplace (/marketplace)
  - Collections (/collections)
  - Activity (/activity)
  - Profile (/profile)
```

### Blockchain Layer:
```
Hedera Hashgraph Testnet
  ↓
  - NFT minting (HTS)
  - Smart contracts (HSCS)
  - Token transfers (TRUST)
  - Immutable ledger
```

---

## 📊 EXAMPLE: FULL LIFECYCLE

### Day 1: Artist Creates NFT
```
Artist: 0.0.6916959
Action: Create "Sunset" NFT
Price: 100 TRUST
Royalty: 5%

Result:
- NFT minted: 0.0.XXXXXX #1
- Collection created
- Status: Owned by artist
```

### Day 2: Artist Lists for Sale
```
Action: List "Sunset" for 100 TRUST

Result:
- Listed on marketplace
- Activity logged
- Visible to all users
```

### Day 3: Collector 1 Buys
```
Collector 1: 0.0.7777777
Action: Buy "Sunset" for 100 TRUST

Money Flow:
- Artist gets: 5 TRUST (royalty) + 92.5 TRUST (sale) = 97.5 TRUST
- Platform gets: 2.5 TRUST

Result:
- NFT owner: Collector 1
- Artist earned: 97.5 TRUST
- Volume: 100 TRUST
```

### Day 7: Collector 1 Resells
```
Action: List for 150 TRUST

Result:
- Relisted
- Floor price updated
```

### Day 8: Collector 2 Buys
```
Collector 2: 0.0.8888888
Action: Buy for 150 TRUST

Money Flow:
- Artist gets: 7.5 TRUST (royalty)  ← Earns again!
- Platform gets: 3.75 TRUST
- Collector 1 gets: 138.75 TRUST

Result:
- NFT owner: Collector 2
- Artist total earnings: 97.5 + 7.5 = 105 TRUST
- Volume: 250 TRUST
```

### Day 30: Collector 2 Resells Again
```
Action: Sell for 200 TRUST

Money Flow:
- Artist gets: 10 TRUST (royalty)  ← Earns AGAIN!
- Platform gets: 5 TRUST
- Collector 2 gets: 185 TRUST

Result:
- Artist total earnings: 115 TRUST from 3 sales
- Artist keeps earning FOREVER on resales! 🎉
```

---

## 🎊 YOU'RE READY TO LAUNCH!

Your marketplace now has:
- ✅ **OpenSea-level features**
- ✅ **Automatic creator royalties**
- ✅ **Complete transparency**
- ✅ **Enterprise security**
- ✅ **Hedera speed & cost**

**Start testing:** http://localhost:5173

**View contract:** https://hashscan.io/testnet/contract/0.0.7053859

---

**Built with ❤️ on Hedera**

*Last Updated: October 13, 2025*

