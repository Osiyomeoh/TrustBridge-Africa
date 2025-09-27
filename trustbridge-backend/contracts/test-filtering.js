const { ethers } = require('ethers');

async function testFiltering() {
  try {
    console.log('🧪 Testing invalid token ID filtering...');
    
    const provider = new ethers.JsonRpcProvider('https://testnet.hashio.io/api');
    const contract = new ethers.Contract(
      '0x44C2e6BCAc1E91e3107616F4D0e03692fb853610', // TRUSTMarketplace
      [
        'function getActiveListings() view returns (uint256[])',
        'function getListing(uint256 listingId) view returns (address seller, uint256 tokenId, uint256 price, bool isActive, uint256 createdAt, uint256 expiresAt)'
      ],
      provider
    );
    
    // Get all listings
    const listingIds = await contract.getActiveListings();
    console.log(`📊 Total listings: ${listingIds.length}`);
    
    const validListings = [];
    const invalidListings = [];
    
    for (const listingId of listingIds) {
      const listing = await contract.getListing(listingId);
      const tokenIdStr = listing.tokenId.toString();
      
      // Apply the same filtering logic as the frontend
      const isValidTokenId = tokenIdStr.length <= 10 && !isNaN(parseInt(tokenIdStr)) && parseInt(tokenIdStr) > 0;
      
      if (isValidTokenId) {
        validListings.push({
          listingId: listingId.toString(),
          tokenId: tokenIdStr,
          price: ethers.formatUnits(listing.price, 18),
          seller: listing.seller
        });
      } else {
        invalidListings.push({
          listingId: listingId.toString(),
          tokenId: tokenIdStr,
          price: ethers.formatUnits(listing.price, 18),
          seller: listing.seller
        });
      }
    }
    
    console.log(`\n✅ Valid listings (${validListings.length}):`);
    validListings.forEach(listing => {
      console.log(`  Listing #${listing.listingId}: Token #${listing.tokenId} (${listing.price} TRUST)`);
    });
    
    console.log(`\n🚫 Invalid listings (${invalidListings.length}):`);
    invalidListings.forEach(listing => {
      console.log(`  Listing #${listing.listingId}: Invalid token ID ${listing.tokenId.substring(0, 20)}... (${listing.price} TRUST)`);
    });
    
    console.log(`\n📈 Summary:`);
    console.log(`  Total listings: ${listingIds.length}`);
    console.log(`  Valid listings: ${validListings.length}`);
    console.log(`  Invalid listings: ${invalidListings.length}`);
    console.log(`  Filtered out: ${invalidListings.length} (${((invalidListings.length / listingIds.length) * 100).toFixed(1)}%)`);
    
    if (validListings.length === 0) {
      console.log(`\n💡 No valid listings found. Users need to create new listings with valid NFT token IDs.`);
    } else {
      console.log(`\n✅ Frontend will now show only ${validListings.length} valid listings instead of ${listingIds.length} total.`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testFiltering();
