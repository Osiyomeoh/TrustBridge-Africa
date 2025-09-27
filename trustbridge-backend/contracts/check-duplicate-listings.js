const { ethers } = require('ethers');

async function checkDuplicateListings() {
  try {
    const provider = new ethers.JsonRpcProvider('https://testnet.hashio.io/api');
    const contract = new ethers.Contract(
      '0x44C2e6BCAc1E91e3107616F4D0e03692fb853610', // TRUSTMarketplace
      [
        'function getActiveListings() view returns (uint256[])',
        'function getListing(uint256 listingId) view returns (address seller, uint256 tokenId, uint256 price, bool isActive, uint256 createdAt, uint256 expiresAt)'
      ],
      provider
    );
    
    console.log('🔍 Checking marketplace listings for duplicates...');
    const listingIds = await contract.getActiveListings();
    console.log('📊 Total active listings:', listingIds.length);
    console.log('📋 Listing IDs:', listingIds.map(id => id.toString()));
    
    const listings = [];
    const tokenIdMap = new Map();
    const duplicates = [];
    
    for (let i = 0; i < listingIds.length; i++) {
      const listing = await contract.getListing(listingIds[i]);
      const listingData = {
        listingId: listingIds[i].toString(),
        seller: listing.seller,
        tokenId: listing.tokenId.toString(),
        price: ethers.formatUnits(listing.price, 18),
        isActive: listing.isActive
      };
      
      listings.push(listingData);
      
      // Check for duplicate token IDs
      if (tokenIdMap.has(listingData.tokenId)) {
        duplicates.push({
          tokenId: listingData.tokenId,
          listings: [tokenIdMap.get(listingData.tokenId), listingData]
        });
      } else {
        tokenIdMap.set(listingData.tokenId, listingData);
      }
      
      console.log(`\nListing #${listingData.listingId}:`);
      console.log('  Seller:', listingData.seller);
      console.log('  Token ID:', listingData.tokenId);
      console.log('  Price:', listingData.price, 'TRUST');
      console.log('  Active:', listingData.isActive);
    }
    
    console.log('\n🔍 Duplicate Analysis:');
    if (duplicates.length > 0) {
      console.log('❌ Found duplicates:');
      duplicates.forEach(dup => {
        console.log(`  Token ID ${dup.tokenId} appears in:`);
        dup.listings.forEach(listing => {
          console.log(`    - Listing #${listing.listingId} (${listing.price} TRUST)`);
        });
      });
    } else {
      console.log('✅ No duplicate token IDs found');
    }
    
    // Check for multiple listings of the same token by same seller
    const sellerTokenMap = new Map();
    const sellerDuplicates = [];
    
    listings.forEach(listing => {
      const key = `${listing.seller}-${listing.tokenId}`;
      if (sellerTokenMap.has(key)) {
        sellerDuplicates.push({
          seller: listing.seller,
          tokenId: listing.tokenId,
          listings: [sellerTokenMap.get(key), listing]
        });
      } else {
        sellerTokenMap.set(key, listing);
      }
    });
    
    if (sellerDuplicates.length > 0) {
      console.log('\n❌ Found seller-token duplicates:');
      sellerDuplicates.forEach(dup => {
        console.log(`  Seller ${dup.seller} has multiple listings for Token ID ${dup.tokenId}:`);
        dup.listings.forEach(listing => {
          console.log(`    - Listing #${listing.listingId} (${listing.price} TRUST)`);
        });
      });
    } else {
      console.log('✅ No seller-token duplicates found');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkDuplicateListings();
