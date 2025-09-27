const { ethers } = require('ethers');

async function debugBuyAsset() {
  try {
    console.log('🔍 Debugging buy asset transaction...');
    
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
        'function getListing(uint256 listingId) view returns (address seller, uint256 tokenId, uint256 price, bool isActive, uint256 createdAt, uint256 expiresAt)',
        'function buyAsset(uint256 listingId) view returns (bool)'
      ],
      provider
    );
    
    const assetNFTContract = new ethers.Contract(
      '0x42be9627C970D40248690F010b3c2a7F8C68576C', // AssetNFT
      [
        'function ownerOf(uint256 tokenId) view returns (address)',
        'function getApproved(uint256 tokenId) view returns (address)',
        'function isApprovedForAll(address owner, address operator) view returns (bool)'
      ],
      provider
    );
    
    const buyerAddress = '0xa620f55Ec17bf98d9898E43878c22c10b5324069';
    const listingId = 2;
    
    console.log(`\n👤 Buyer: ${buyerAddress}`);
    console.log(`📋 Listing ID: ${listingId}`);
    
    // Get listing details
    const listing = await marketplaceContract.getListing(listingId);
    const priceFormatted = ethers.formatUnits(listing.price, 18);
    
    console.log(`\n📊 Listing Details:`);
    console.log(`  Seller: ${listing.seller}`);
    console.log(`  Token ID: ${listing.tokenId.toString()}`);
    console.log(`  Price: ${priceFormatted} TRUST`);
    console.log(`  Active: ${listing.isActive}`);
    console.log(`  Expires: ${new Date(Number(listing.expiresAt) * 1000).toISOString()}`);
    
    // Check buyer balance
    const balance = await trustTokenContract.balanceOf(buyerAddress);
    const balanceFormatted = ethers.formatUnits(balance, 18);
    console.log(`\n💰 Buyer Balance: ${balanceFormatted} TRUST`);
    
    // Check allowance
    const allowance = await trustTokenContract.allowance(buyerAddress, '0x44C2e6BCAc1E91e3107616F4D0e03692fb853610');
    const allowanceFormatted = ethers.formatUnits(allowance, 18);
    console.log(`🔐 Allowance: ${allowanceFormatted} TRUST`);
    
    // Check if token exists and who owns it
    console.log(`\n🎨 NFT Details:`);
    try {
      const owner = await assetNFTContract.ownerOf(listing.tokenId);
      console.log(`  Owner: ${owner}`);
      console.log(`  ✅ Token exists`);
      
      // Check if seller is approved
      const approved = await assetNFTContract.getApproved(listing.tokenId);
      const isApprovedForAll = await assetNFTContract.isApprovedForAll(listing.seller, '0x44C2e6BCAc1E91e3107616F4D0e03692fb853610');
      
      console.log(`  Approved address: ${approved}`);
      console.log(`  Marketplace approved for all: ${isApprovedForAll}`);
      
      if (approved.toLowerCase() === '0x44C2e6BCAc1E91e3107616F4D0e03692fb853610'.toLowerCase() || isApprovedForAll) {
        console.log(`  ✅ NFT transfer approved`);
      } else {
        console.log(`  ❌ NFT transfer not approved`);
      }
      
    } catch (error) {
      console.log(`  ❌ Token does not exist: ${error.message}`);
    }
    
    // Check if this is a precision issue
    const balanceBN = BigInt(balance);
    const priceBN = BigInt(listing.price);
    
    console.log(`\n🔍 Detailed Analysis:`);
    console.log(`  Balance (wei): ${balanceBN.toString()}`);
    console.log(`  Price (wei): ${priceBN.toString()}`);
    console.log(`  Difference: ${(balanceBN - priceBN).toString()} wei`);
    
    if (balanceBN < priceBN) {
      console.log(`  ❌ Insufficient balance`);
      const missing = priceBN - balanceBN;
      console.log(`  Missing: ${ethers.formatUnits(missing, 18)} TRUST`);
    } else {
      console.log(`  ✅ Balance sufficient`);
    }
    
    // Check if the issue is with the token ID format
    const tokenIdStr = listing.tokenId.toString();
    if (tokenIdStr.length > 20) {
      console.log(`\n⚠️  WARNING: Token ID is very long (${tokenIdStr.length} digits)`);
      console.log(`  This suggests it might be a bytes32 hash instead of a uint256 token ID`);
      console.log(`  Token ID: ${tokenIdStr}`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugBuyAsset();
