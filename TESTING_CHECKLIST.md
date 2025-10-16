# ✅ TrustBridge Marketplace V2 - Testing Checklist

## 🎯 PRE-TEST SETUP

### Backend:
```bash
cd trustbridge-backend
npm run start:dev
```
**Expected:** Server running on `http://localhost:3001`

### Frontend:
```bash
cd trustbridge-frontend
npm run dev
```
**Expected:** App running on `http://localhost:5173`

### Wallet:
- [ ] HashPack installed and unlocked
- [ ] Account connected: `0.0.7028303` (or your account)
- [ ] HBAR balance > 5 ℏ (for gas fees)
- [ ] TRUST balance > 200 (for testing purchases)

**Get TRUST:** http://localhost:5173/get-test-tokens

---

## 🧪 TEST 1: CREATE NFT WITH ROYALTY

### Steps:
1. [ ] Navigate to: http://localhost:5173/profile
2. [ ] Click: "Digital Asset" button
3. [ ] Fill in form:
   - [ ] Name: "Test Royalty NFT"
   - [ ] Description: "Testing automatic royalties"
   - [ ] Price: **100** TRUST
   - [ ] **Royalty: 5%** ← IMPORTANT!
   - [ ] Category: Art
   - [ ] Upload image (any JPG/PNG)
4. [ ] Click: "Create Asset"
5. [ ] Approve in HashPack
6. [ ] Wait for confirmation (~5 seconds)

### Expected Results:
- [ ] ✅ NFT appears in your profile
- [ ] ✅ Shows "100 TRUST" price
- [ ] ✅ Status: "Owned"
- [ ] ✅ Can click to view details

### Debugging:
- Check console for errors
- Verify transaction on HashScan
- Ensure image loaded from IPFS

---

## 🧪 TEST 2: LIST NFT (3 APPROVALS)

### Steps:
1. [ ] In Profile, find your newly created NFT
2. [ ] Click on the NFT card
3. [ ] Click: "List for Sale"
4. [ ] **Approval 1/3:** "Setting Royalty..."
   - [ ] HashPack popup appears
   - [ ] Shows: setRoyalty transaction
   - [ ] Approve
   - [ ] Wait for confirmation
5. [ ] **Approval 2/3:** "Approving NFT..."
   - [ ] HashPack popup appears
   - [ ] Shows: NFT allowance
   - [ ] Approve
   - [ ] Wait for confirmation
6. [ ] **Approval 3/3:** "Creating Listing..."
   - [ ] HashPack popup appears
   - [ ] Shows: listAsset transaction
   - [ ] Approve
   - [ ] Wait for confirmation

### Expected Results:
- [ ] ✅ Toast: "Asset Listed Successfully!"
- [ ] ✅ Toast mentions: "with 5% royalty"
- [ ] ✅ Modal closes
- [ ] ✅ Profile refreshes
- [ ] ✅ Asset status changes to "Listed"

### Debugging:
- Check console logs for each step
- If any approval fails, check wallet has HBAR
- Verify contract address is correct
- Check HashScan for transaction details

---

## 🧪 TEST 3: VERIFY ROYALTY BADGE

### Steps:
1. [ ] Navigate to: http://localhost:5173/marketplace
2. [ ] Find your listed NFT
3. [ ] Look at the image

### Expected Results:
- [ ] ✅ Purple badge at bottom-left
- [ ] ✅ Shows: "👑 5% Royalty"
- [ ] ✅ Badge is clearly visible
- [ ] ✅ Doesn't overlap with image

### Debugging:
- If badge not showing, check asset.royaltyPercentage in console
- Verify metadata has royaltyPercentage field
- Check CSS styling

---

## 🧪 TEST 4: VERIFY ROYALTY INFO IN MODAL

### Steps:
1. [ ] In Marketplace, click on your NFT
2. [ ] Scroll down in modal
3. [ ] Look for "Creator Royalty" section

### Expected Results:
- [ ] ✅ Purple card with crown emoji (👑)
- [ ] ✅ Shows: "5%"
- [ ] ✅ Text: "paid on every resale"
- [ ] ✅ Explanation paragraph visible

### Debugging:
- Check AssetDetailModal.tsx line ~1002
- Verify asset.royaltyPercentage is defined
- Check purple styling

---

## 🧪 TEST 5: BUY NFT (2 APPROVALS)

### Steps:
1. [ ] **Switch to different HashPack account**
   - Open HashPack
   - Click account dropdown
   - Switch to different account OR create new one
2. [ ] Go to: http://localhost:5173/marketplace
3. [ ] Find the listed NFT
4. [ ] Click "Buy Now"
5. [ ] **Approval 1/2:** "Approving Payment..."
   - [ ] HashPack popup
   - [ ] Shows: TRUST token allowance for 100 TRUST
   - [ ] Approve
6. [ ] **Approval 2/2:** "Purchasing..."
   - [ ] HashPack popup
   - [ ] Shows: buyNFT contract call
   - [ ] Approve
   - [ ] Wait for confirmation (~5 seconds)

### Expected Results:
- [ ] ✅ Toast: "Purchase Successful!"
- [ ] ✅ Toast mentions: "Royalties were automatically distributed"
- [ ] ✅ Modal closes
- [ ] ✅ NFT disappears from marketplace
- [ ] ✅ NFT appears in buyer's profile

### Debugging:
- If insufficient balance, get more TRUST tokens
- Check buyer has HBAR for gas
- Verify listing is still active
- Check HashScan for transaction

---

## 🧪 TEST 6: VERIFY ROYALTY DISTRIBUTION

### Steps:
1. [ ] **Switch back to original creator account**
2. [ ] Check TRUST balance
3. [ ] Do the math:
   ```
   Starting balance: X TRUST
   Sale price: 100 TRUST
   
   Expected earnings:
   - Royalty (5%): 5 TRUST
   - Sale amount (92.5%): 92.5 TRUST
   - Total: 97.5 TRUST
   
   New balance should be: X + 97.5 TRUST
   ```

### Expected Results:
- [ ] ✅ Creator balance increased by **97.5 TRUST**
- [ ] ✅ Platform (0.0.6916959) has **+2.5 TRUST**
- [ ] ✅ Buyer has **-100 TRUST**
- [ ] ✅ Total adds up correctly

### Debugging:
- Check HashScan transaction details
- Look for multiple TRUST token transfers
- Verify amounts match expected distribution
- Check contract events

---

## 🧪 TEST 7: COLLECTIONS PAGE

### Steps:
1. [ ] Navigate to: http://localhost:5173/collections
2. [ ] Browse collections

### Expected Results:
- [ ] ✅ Collection(s) appear
- [ ] ✅ Shows floor price
- [ ] ✅ Shows volume
- [ ] ✅ Shows item count
- [ ] ✅ Can search collections
- [ ] ✅ Can sort by volume/floor

### Debugging:
- If empty, create more NFTs
- Check backend API: `curl http://localhost:3001/api/collections`
- Verify MongoDB has collections

---

## 🧪 TEST 8: ACTIVITY FEED

### Steps:
1. [ ] Navigate to: http://localhost:5173/activity
2. [ ] View marketplace activity

### Expected Results:
- [ ] ✅ Recent transactions appear
- [ ] ✅ Shows sales, listings, transfers
- [ ] ✅ Timestamps are accurate
- [ ] ✅ Amounts display correctly
- [ ] ✅ HashScan links work

### Debugging:
- If empty, complete some transactions first
- Check backend API: `curl http://localhost:3001/api/activity/marketplace`
- Verify Mirror Node is indexing

---

## 🧪 TEST 9: RESELL (CONTINUOUS ROYALTY)

### Steps:
1. [ ] **New owner (buyer from Test 5):**
2. [ ] Go to Profile
3. [ ] Find purchased NFT
4. [ ] List for **150 TRUST** (higher price)
5. [ ] Approve 3 transactions (same as Test 2)
6. [ ] **Switch to third account**
7. [ ] Buy the NFT for 150 TRUST
8. [ ] **Switch back to original creator**
9. [ ] Check TRUST balance

### Expected Results:
- [ ] ✅ Original creator received **7.5 TRUST** (5% of 150)
- [ ] ✅ Platform received **3.75 TRUST** (2.5% of 150)
- [ ] ✅ Second seller received **138.75 TRUST**
- [ ] ✅ Creator earned royalty on RESALE! 👑
- [ ] ✅ Profile widget shows royalties earned

### Debugging:
- Check all account balances
- Verify on HashScan
- Look for RoyaltyPaid event in contract
- Check backend royalty records

---

## 🧪 TEST 10: PROFILE ROYALTY WIDGET

### Steps:
1. [ ] As creator who earned royalties
2. [ ] Go to Profile
3. [ ] Look at stats

### Expected Results:
- [ ] ✅ "👑 Royalties" widget visible
- [ ] ✅ Shows earned amount (currently 0, will update after implementing API call)
- [ ] ✅ Purple themed
- [ ] ✅ Properly aligned with other stats

### Future Enhancement:
Connect to backend API to show real earnings:
```typescript
const { data } = await fetch(`/api/royalties/creator/${address}`);
// Display: data.totalEarned TRUST
```

---

## 🎊 SUCCESS CRITERIA

### All Tests Pass If:
- [ ] ✅ NFT creates with royalty info
- [ ] ✅ Listing requires 3 approvals
- [ ] ✅ Royalty badge shows on cards
- [ ] ✅ Royalty info displays in modal
- [ ] ✅ Buying requires 2 approvals
- [ ] ✅ Royalty auto-distributed on sale
- [ ] ✅ Creator earns on every resale
- [ ] ✅ Collections page works
- [ ] ✅ Activity feed shows events
- [ ] ✅ Profile layout professional

---

## 🐛 TROUBLESHOOTING

### Issue: "Failed to set royalty"
**Solution:**
- Check wallet is connected
- Verify asset ownership
- Ensure royalty 0-10%
- Check contract address is correct

### Issue: "Insufficient gas"
**Solution:**
- Get more HBAR from faucet
- Check transaction fee settings
- Try lowering gas limit

### Issue: "NFT approval failed"
**Solution:**
- Verify NFT token ID is correct
- Check you own the NFT
- Ensure marketplace account is valid

### Issue: "Purchase failed"
**Solution:**
- Check TRUST balance
- Verify listing is active
- Ensure approvals went through
- Check buyer has HBAR for gas

---

## 📊 VERIFICATION

### Check On-Chain Data:

1. **Contract Status:**
   ```bash
   cd trustbridge-backend
   node test-marketplace-v2.js
   ```

2. **Creator Royalties:**
   ```bash
   curl http://localhost:3001/api/royalties/creator/0.0.7028303
   ```

3. **Collections:**
   ```bash
   curl http://localhost:3001/api/collections
   ```

4. **Activity:**
   ```bash
   curl http://localhost:3001/api/activity/marketplace
   ```

### Check HashScan:
- Contract: https://hashscan.io/testnet/contract/0.0.7053859
- Your NFT: https://hashscan.io/testnet/token/[YOUR_NFT_ID]
- Transactions: https://hashscan.io/testnet/account/0.0.7028303

---

## 🎉 COMPLETION

When all tests pass, you have:

✅ **Fully functional NFT marketplace**
✅ **Automatic creator royalties**
✅ **Self-sustaining economics**
✅ **Professional UI/UX**
✅ **Enterprise-grade security**
✅ **OpenSea-level features**

**Ready to launch and win the hackathon!** 🏆

---

*Last Updated: October 13, 2025*

