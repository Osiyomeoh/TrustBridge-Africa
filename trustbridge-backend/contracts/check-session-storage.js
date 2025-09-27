const { ethers } = require('ethers');

async function checkSessionStorage() {
  try {
    console.log('🔍 Checking sessionStorage data for asset mapping...');
    
    // Simulate the frontend logic for mapping listings to assets
    const listings = [
      { listingId: '1', seller: '0xA6e8bf8E89Bd2c2BD37e308F275C4f52284a911F', price: '0.000000000000000027' },
      { listingId: '2', seller: '0xA6e8bf8E89Bd2c2BD37e308F275C4f52284a911F', price: '0.000000000000000031' },
      { listingId: '3', seller: '0xa620f55Ec17bf98d9898E43878c22c10b5324069', price: '0.000000000000000032' },
      { listingId: '4', seller: '0xa620f55Ec17bf98d9898E43878c22c10b5324069', price: '0.000000000000000033' },
      { listingId: '6', seller: '0xA6e8bf8E89Bd2c2BD37e308F275C4f52284a911F', price: '0.000000000000000035' },
      { listingId: '7', seller: '0xA6e8bf8E89Bd2c2BD37e308F275C4f52284a911F', price: '0.000000000000000036' },
      { listingId: '8', seller: '0xA6e8bf8E89Bd2c2BD37e308F275C4f52284a911F', price: '0.000000000000000037' },
      { listingId: '9', seller: '0xA6e8bf8E89Bd2c2BD37e308F275C4f52284a911F', price: '0.000000000000000038' }
    ];
    
    console.log('\n📊 Listing to Asset Mapping:');
    
    for (const listing of listings) {
      let assetName = `Asset #${listing.listingId}`;
      let assetPrice = '1000'; // Default
      
      // Simulate the fallback logic from contractService.ts
      const price = parseFloat(listing.price);
      const seller = listing.seller.toLowerCase();
      
      // Check for known asset mappings based on listing ID and price
      if (seller === '0xa620f55ec17bf98d9898e43878c22c10b5324069') {
        if (listing.listingId === '3' && price === 0.000000000000000032) {
          assetName = 'Rigid';
          assetPrice = '10';
        } else if (listing.listingId === '4' && price === 0.000000000000000033) {
          assetName = 'eerr';
          assetPrice = '1000000';
        }
      } else if (seller === '0xa6e8bf8e89bd2c2bd37e308f275c4f52284a911f') {
        // This seller has multiple listings with the same invalid token ID
        // The frontend is probably using sessionStorage or hardcoded mappings
        if (listing.listingId === '1') {
          assetName = 'Asset #1';
          assetPrice = '1000';
        } else if (listing.listingId === '2') {
          assetName = 'Asset #2';
          assetPrice = '1000';
        } else if (listing.listingId === '6') {
          assetName = 'osi';
          assetPrice = '10';
        } else if (listing.listingId === '7') {
          assetName = 'osi';
          assetPrice = '10';
        } else if (listing.listingId === '8') {
          assetName = 'sammy';
          assetPrice = '20';
        } else if (listing.listingId === '9') {
          assetName = 'osi';
          assetPrice = '10';
        }
      }
      
      console.log(`  Listing #${listing.listingId}: ${assetName} (${assetPrice} TRUST) - Seller: ${listing.seller.substring(0, 6)}...`);
    }
    
    console.log('\n💡 Issue Analysis:');
    console.log('  - All listings use the same invalid token ID (bytes32 hash)');
    console.log('  - Frontend is mapping them to different names based on listing ID');
    console.log('  - This creates the appearance of different assets when they\'re actually the same invalid listing');
    console.log('  - "osi" appears 3 times because listings #6, #7, and #9 are all mapped to "osi"');
    console.log('  - "sammy" shows price mismatch (20 TRUST vs 10 TRUST total value) due to hardcoded mapping');
    
    console.log('\n🔧 Solution:');
    console.log('  1. Filter out listings with invalid token IDs from the frontend');
    console.log('  2. Only show listings with valid NFT token IDs (1-37)');
    console.log('  3. Let old invalid listings expire naturally');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkSessionStorage();
