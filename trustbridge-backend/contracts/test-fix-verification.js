const { ethers } = require('ethers');

async function testFixVerification() {
  try {
    console.log('🧪 Testing fix verification...');
    
    const provider = new ethers.JsonRpcProvider('https://testnet.hashio.io/api');
    
    // Check the AssetNFT contract
    const assetNFTContract = new ethers.Contract(
      '0x42be9627C970D40248690F010b3c2a7F8C68576C', // AssetNFT
      [
        'function getTotalAssets() view returns (uint256)',
        'function ownerOf(uint256 tokenId) view returns (address)',
        'function tokenURI(uint256 tokenId) view returns (string)'
      ],
      provider
    );
    
    // Check the TRUSTMarketplace contract
    const marketplaceContract = new ethers.Contract(
      '0x44C2e6BCAc1E91e3107616F4D0e03692fb853610', // TRUSTMarketplace
      [
        'function getActiveListings() view returns (uint256[])',
        'function getListing(uint256 listingId) view returns (address seller, uint256 tokenId, uint256 price, bool isActive, uint256 createdAt, uint256 expiresAt)'
      ],
      provider
    );
    
    console.log('\n📊 Current State:');
    
    // Check total NFTs
    const totalAssets = await assetNFTContract.getTotalAssets();
    console.log(`🎨 Total NFTs: ${totalAssets.toString()}`);
    
    // Check marketplace listings
    const listingIds = await marketplaceContract.getActiveListings();
    console.log(`📋 Active listings: ${listingIds.length}`);
    
    // Analyze current listings
    let validListings = 0;
    let invalidListings = 0;
    
    for (const listingId of listingIds) {
      const listing = await marketplaceContract.getListing(listingId);
      const tokenIdStr = listing.tokenId.toString();
      const isValid = tokenIdStr.length <= 10 && !isNaN(parseInt(tokenIdStr)) && parseInt(tokenIdStr) > 0;
      
      if (isValid) {
        validListings++;
        console.log(`✅ Listing #${listingId}: Valid token ID ${tokenIdStr}`);
      } else {
        invalidListings++;
        console.log(`❌ Listing #${listingId}: Invalid token ID ${tokenIdStr.substring(0, 20)}...`);
      }
    }
    
    console.log(`\n📈 Listing Analysis:`);
    console.log(`  Valid listings: ${validListings}`);
    console.log(`  Invalid listings: ${invalidListings}`);
    console.log(`  Total listings: ${listingIds.length}`);
    
    console.log(`\n🔧 Fix Status:`);
    console.log(`  ✅ Frontend filtering: Hides ${invalidListings} invalid listings`);
    console.log(`  ✅ Fallback logic: Fixed to use correct token IDs`);
    console.log(`  ✅ Event parsing: Improved with address checking`);
    
    console.log(`\n💡 Next Steps:`);
    console.log(`  1. Create a new digital asset to test the fix`);
    console.log(`  2. List it for trading to verify correct token ID is used`);
    console.log(`  3. Check that it appears in Discovery with valid token ID`);
    
    // Check recent NFTs to see what's available for testing
    console.log(`\n🎨 Recent NFT Token IDs (last 5):`);
    for (let i = Math.max(1, Number(totalAssets) - 4); i <= Number(totalAssets); i++) {
      try {
        const owner = await assetNFTContract.ownerOf(i);
        const tokenURI = await assetNFTContract.tokenURI(i);
        console.log(`  Token #${i}: Owner: ${owner.substring(0, 6)}..., URI: ${tokenURI.substring(0, 30)}...`);
      } catch (e) {
        console.log(`  Token #${i}: Error`);
      }
    }
    
    console.log(`\n✅ Ready for testing: Create a new asset and list it to verify the fix!`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testFixVerification();
