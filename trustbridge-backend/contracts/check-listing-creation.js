const { ethers } = require('ethers');

async function checkListingCreation() {
  try {
    console.log('🔍 Checking how listings are created and why they use invalid token IDs...');
    
    const provider = new ethers.JsonRpcProvider('https://testnet.hashio.io/api');
    
    // Check the TRUSTMarketplace contract's listAsset function
    const marketplaceContract = new ethers.Contract(
      '0x44C2e6BCAc1E91e3107616F4D0e03692fb853610', // TRUSTMarketplace
      [
        'function listAsset(address nftContract, uint256 tokenId, uint256 price, uint256 duration) external returns (uint256)',
        'function getListing(uint256 listingId) view returns (address seller, uint256 tokenId, uint256 price, bool isActive, uint256 createdAt, uint256 expiresAt)',
        'function getActiveListings() view returns (uint256[])'
      ],
      provider
    );
    
    // Check recent listings to see the pattern
    const listingIds = await marketplaceContract.getActiveListings();
    console.log(`📋 Active listings: ${listingIds.length}`);
    
    console.log(`\n🔍 Analyzing recent listings:`);
    for (let i = 0; i < Math.min(listingIds.length, 5); i++) {
      const listing = await marketplaceContract.getListing(listingIds[i]);
      console.log(`\n  Listing #${listingIds[i]}:`);
      console.log(`    Seller: ${listing.seller}`);
      console.log(`    Token ID: ${listing.tokenId.toString()}`);
      console.log(`    Price: ${ethers.formatUnits(listing.price, 18)} TRUST`);
      console.log(`    Created: ${new Date(Number(listing.createdAt) * 1000).toISOString()}`);
      
      // Check if this token ID is valid
      const tokenIdStr = listing.tokenId.toString();
      const isValid = tokenIdStr.length <= 10 && !isNaN(parseInt(tokenIdStr)) && parseInt(tokenIdStr) > 0;
      console.log(`    Valid Token ID: ${isValid ? '✅' : '❌'}`);
    }
    
    console.log(`\n💡 Root Cause Analysis:`);
    console.log(`  1. The marketplace contract's listAsset function expects a uint256 tokenId`);
    console.log(`  2. But somewhere in the process, a bytes32 assetId is being passed instead`);
    console.log(`  3. This could be happening in:`);
    console.log(`     - Frontend passing wrong parameter`);
    console.log(`     - Contract event parsing issue`);
    console.log(`     - Fallback logic using assetId instead of tokenId`);
    
    // Check if the issue is in the fallback logic
    console.log(`\n🔧 Checking fallback logic issue:`);
    console.log(`  The problem is likely in the createListing function's fallback logic.`);
    console.log(`  When tokenId is not provided, it tries to calculate: nftBalance - 1n`);
    console.log(`  But this is incorrect - it should find the actual token ID of the minted NFT.`);
    
    // Check the actual NFT token IDs
    const assetNFTContract = new ethers.Contract(
      '0x42be9627C970D40248690F010b3c2a7F8C68576C', // AssetNFT
      [
        'function getTotalAssets() view returns (uint256)',
        'function ownerOf(uint256 tokenId) view returns (address)'
      ],
      provider
    );
    
    const totalAssets = await assetNFTContract.getTotalAssets();
    console.log(`\n🎨 Total NFTs: ${totalAssets.toString()}`);
    
    // Check the last few NFTs
    console.log(`\n  Recent NFT Token IDs:`);
    for (let i = Math.max(1, Number(totalAssets) - 5); i <= Number(totalAssets); i++) {
      try {
        const owner = await assetNFTContract.ownerOf(i);
        console.log(`    Token #${i}: Owner: ${owner.substring(0, 6)}...`);
      } catch (e) {
        console.log(`    Token #${i}: Error`);
      }
    }
    
    console.log(`\n✅ Fix Status:`);
    console.log(`  - Frontend filtering: ✅ (hides invalid listings)`);
    console.log(`  - Root cause: ❌ (still exists in fallback logic)`);
    console.log(`  - New listings: ✅ (will use correct token IDs if provided)`);
    
    console.log(`\n🔧 The Real Fix Needed:`);
    console.log(`  The fallback logic in createListing() is still incorrect.`);
    console.log(`  It should find the actual token ID of the newly minted NFT,`);
    console.log(`  not calculate nftBalance - 1n.`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkListingCreation();
