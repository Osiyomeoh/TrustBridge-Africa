const { ethers } = require('ethers');

async function debugFrontendFiltering() {
  try {
    console.log('🔍 Debugging frontend filtering logic...');
    
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
    
    // Get all listings
    const listingIds = await marketplaceContract.getActiveListings();
    console.log(`📊 Total listings: ${listingIds.length}`);
    
    // Simulate the frontend filtering logic
    const transformedListings = [];
    
    for (const listingId of listingIds) {
      const listing = await marketplaceContract.getListing(listingId);
      
      // Create a mock asset data object like the frontend does
      const assetData = {
        id: listingId.toString(),
        name: `Asset #${listingId}`,
        description: 'Digital asset available for trading',
        imageURI: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=400&fit=crop&crop=center',
        category: 'Digital Art',
        assetType: 'NFT',
        location: 'blockchain',
        totalValue: ethers.formatUnits(listing.price, 18),
        owner: listing.seller,
        createdAt: new Date().toISOString(),
        isTradeable: true,
        status: 'listed',
        listingId: listingId.toString(),
        price: ethers.formatUnits(listing.price, 18),
        tokenId: listing.tokenId?.toString() || '0'
      };
      
      transformedListings.push(assetData);
    }
    
    console.log(`\n🔍 Simulating frontend filtering logic:`);
    
    // Apply the same filtering logic as the frontend
    const validListings = transformedListings.filter(Boolean);
    console.log(`✅ Processed listings: ${validListings.length}`);
    
    // Filter out listings with invalid token IDs
    const validTokenListings = validListings.filter(listing => {
      const tokenIdStr = listing.tokenId?.toString() || '0';
      // Valid token IDs should be reasonable numbers (1-1000), not 48-digit hashes
      const isValidTokenId = tokenIdStr.length <= 10 && !isNaN(parseInt(tokenIdStr)) && parseInt(tokenIdStr) > 0;
      
      if (!isValidTokenId) {
        console.log(`🚫 Filtering out listing #${listing.listingId} with invalid token ID: ${tokenIdStr}`);
      }
      
      return isValidTokenId;
    });
    
    console.log(`✅ Valid token listings: ${validTokenListings.length}`);
    
    // Check if no valid listings found
    if (validTokenListings.length === 0) {
      console.log(`⚠️ No valid listings found - all current listings have invalid token IDs`);
      console.log(`📋 Frontend should show: "No valid assets are currently available for trading"`);
    } else {
      console.log(`📋 Frontend should show: ${validTokenListings.length} valid listings`);
    }
    
    console.log(`\n💡 Issue Analysis:`);
    console.log(`  - All ${listingIds.length} listings have invalid token IDs`);
    console.log(`  - Frontend filtering should hide all of them`);
    console.log(`  - But user is seeing 9 assets, which means filtering is not working`);
    
    console.log(`\n🔧 Possible causes:`);
    console.log(`  1. Frontend is using cached data`);
    console.log(`  2. Filtering logic is not being applied`);
    console.log(`  3. Fallback data is being shown instead`);
    console.log(`  4. Browser cache needs to be cleared`);
    
    console.log(`\n✅ Solution:`);
    console.log(`  1. Clear browser cache and refresh`);
    console.log(`  2. Check browser console for filtering logs`);
    console.log(`  3. Verify the filtering code is deployed`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugFrontendFiltering();
