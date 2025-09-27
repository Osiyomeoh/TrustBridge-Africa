const { ethers } = require('ethers');

async function debugMarketplaceContract() {
  try {
    console.log('🔍 Debugging marketplace contract...');
    
    const provider = new ethers.JsonRpcProvider('https://testnet.hashio.io/api');
    
    // Check the TRUSTMarketplace contract
    const marketplaceContract = new ethers.Contract(
      '0x44C2e6BCAc1E91e3107616F4D0e03692fb853610', // TRUSTMarketplace
      [
        'function getActiveListings() view returns (uint256[])',
        'function getListing(uint256 listingId) view returns (address seller, uint256 tokenId, uint256 price, bool isActive, uint256 createdAt, uint256 expiresAt)'
      ],
      provider
    );
    
    console.log('\n📋 Testing marketplace contract...');
    
    // Test getActiveListings
    try {
      const listingIds = await marketplaceContract.getActiveListings();
      console.log('✅ getActiveListings() works:', listingIds.length, 'listings');
      console.log('  Listing IDs:', listingIds.map(id => id.toString()));
    } catch (e) {
      console.log('❌ getActiveListings() failed:', e.message);
    }
    
    // Test getListing for each ID
    const testListingIds = [1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12];
    
    for (const listingId of testListingIds) {
      try {
        console.log(`\n🔍 Testing getListing(${listingId})...`);
        const listing = await marketplaceContract.getListing(listingId);
        console.log(`✅ Listing #${listingId}:`, {
          seller: listing.seller,
          tokenId: listing.tokenId.toString(),
          price: ethers.formatUnits(listing.price, 18),
          isActive: listing.isActive,
          createdAt: new Date(Number(listing.createdAt) * 1000).toISOString(),
          expiresAt: new Date(Number(listing.expiresAt) * 1000).toISOString()
        });
        
        // Test tokenId.toString()
        try {
          const tokenIdStr = listing.tokenId.toString();
          console.log(`  Token ID string: "${tokenIdStr}"`);
        } catch (e) {
          console.log(`  ❌ tokenId.toString() failed:`, e.message);
        }
        
      } catch (e) {
        console.log(`❌ getListing(${listingId}) failed:`, e.message);
        console.log('  Error details:', {
          code: e.code,
          data: e.data,
          reason: e.reason
        });
      }
    }
    
    console.log('\n🔧 Analysis:');
    console.log('  - If getActiveListings() fails: Contract issue');
    console.log('  - If getListing() fails: Individual listing issue');
    console.log('  - If tokenId.toString() fails: Data format issue');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugMarketplaceContract();
