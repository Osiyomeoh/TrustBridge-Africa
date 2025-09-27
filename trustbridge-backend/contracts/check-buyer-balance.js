const { ethers } = require('ethers');

async function checkBuyerBalance() {
  try {
    console.log('🔍 Checking buyer balance and listing details...');
    
    const provider = new ethers.JsonRpcProvider('https://testnet.hashio.io/api');
    
    // Contracts
    const trustTokenContract = new ethers.Contract(
      '0x170B35e97C217dBf63a500EaB884392F7BF6Ec34', // TrustToken
      [
        'function balanceOf(address account) view returns (uint256)',
        'function allowance(address owner, address spender) view returns (uint256)'
      ],
      provider
    );
    
    const marketplaceContract = new ethers.Contract(
      '0x44C2e6BCAc1E91e3107616F4D0e03692fb853610', // TRUSTMarketplace
      [
        'function getListing(uint256 listingId) view returns (address seller, uint256 tokenId, uint256 price, bool isActive, uint256 createdAt, uint256 expiresAt)'
      ],
      provider
    );
    
    // Buyer address from the error
    const buyerAddress = '0xa620f55Ec17bf98d9898E43878c22c10b5324069';
    const listingId = 2; // From the transaction data
    
    console.log(`\n👤 Buyer: ${buyerAddress}`);
    console.log(`📋 Listing ID: ${listingId}`);
    
    // Check buyer's TRUST balance
    const balance = await trustTokenContract.balanceOf(buyerAddress);
    const balanceFormatted = ethers.formatUnits(balance, 18);
    console.log(`💰 TRUST Balance: ${balanceFormatted} TRUST`);
    
    // Check listing details
    const listing = await marketplaceContract.getListing(listingId);
    const priceFormatted = ethers.formatUnits(listing.price, 18);
    console.log(`\n📊 Listing #${listingId} Details:`);
    console.log(`  Seller: ${listing.seller}`);
    console.log(`  Token ID: ${listing.tokenId.toString()}`);
    console.log(`  Price: ${priceFormatted} TRUST`);
    console.log(`  Active: ${listing.isActive}`);
    
    // Check allowance
    const allowance = await trustTokenContract.allowance(buyerAddress, '0x44C2e6BCAc1E91e3107616F4D0e03692fb853610');
    const allowanceFormatted = ethers.formatUnits(allowance, 18);
    console.log(`\n🔐 Allowance for marketplace: ${allowanceFormatted} TRUST`);
    
    // Compare balance vs price
    const balanceBN = BigInt(balance);
    const priceBN = BigInt(listing.price);
    const allowanceBN = BigInt(allowance);
    
    console.log(`\n📈 Analysis:`);
    console.log(`  Balance: ${balanceBN.toString()} wei`);
    console.log(`  Price: ${priceBN.toString()} wei`);
    console.log(`  Allowance: ${allowanceBN.toString()} wei`);
    
    if (balanceBN >= priceBN) {
      console.log(`  ✅ Balance sufficient`);
    } else {
      console.log(`  ❌ Insufficient balance (need ${priceFormatted} TRUST, have ${balanceFormatted} TRUST)`);
    }
    
    if (allowanceBN >= priceBN) {
      console.log(`  ✅ Allowance sufficient`);
    } else {
      console.log(`  ❌ Insufficient allowance (need ${priceFormatted} TRUST, approved ${allowanceFormatted} TRUST)`);
    }
    
    // Check if this is a precision issue
    const difference = priceBN - balanceBN;
    if (difference > 0) {
      console.log(`\n💡 Missing: ${ethers.formatUnits(difference, 18)} TRUST`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkBuyerBalance();
