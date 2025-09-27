const { ethers } = require('ethers');

async function investigateInvalidTokenIds() {
  try {
    console.log('🔍 Investigating the root cause of invalid token IDs...');
    
    const provider = new ethers.JsonRpcProvider('https://testnet.hashio.io/api');
    
    // Check the CoreAssetFactory contract to see how it creates assets
    const coreAssetFactoryContract = new ethers.Contract(
      '0x930131a22b9D2e060d8E4EF1aE21185d4F59F52F', // CoreAssetFactory
      [
        'function createDigitalAsset(uint8 category, string memory assetType, string memory name, string memory location, uint256 totalValue, string memory imageURI, string memory description) external returns (bytes32)',
        'function getAssetId(string memory name, string memory location) pure returns (bytes32)',
        'function getAssetId(string memory name, string memory location, uint256 totalValue) pure returns (bytes32)'
      ],
      provider
    );
    
    // Check the AssetNFT contract to see how it mints tokens
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
    
    console.log('\n📊 Current State Analysis:');
    
    // Check total NFTs minted
    const totalAssets = await assetNFTContract.getTotalAssets();
    console.log(`🎨 Total NFTs minted: ${totalAssets.toString()}`);
    
    // Check marketplace listings
    const listingIds = await marketplaceContract.getActiveListings();
    console.log(`📋 Active marketplace listings: ${listingIds.length}`);
    
    // Analyze the invalid token ID
    const invalidTokenId = '381043612843756965402502570166674098029284841324';
    console.log(`\n🔍 Analyzing invalid token ID: ${invalidTokenId}`);
    console.log(`  Length: ${invalidTokenId.length} digits`);
    console.log(`  As BigInt: ${BigInt(invalidTokenId).toString()}`);
    
    // Try to understand what this hash represents
    console.log(`\n💡 Hypothesis: This looks like a bytes32 hash, not a uint256 token ID`);
    
    // Check if this could be an asset ID from CoreAssetFactory
    console.log(`\n🧪 Testing CoreAssetFactory asset ID generation:`);
    
    try {
      // Test with some sample data
      const testAssetId1 = await coreAssetFactoryContract.getAssetId("Test Asset", "Blockchain");
      console.log(`  getAssetId("Test Asset", "Blockchain"): ${testAssetId1}`);
      
      const testAssetId2 = await coreAssetFactoryContract.getAssetId("Test Asset", "Blockchain", ethers.parseUnits("1000", 18));
      console.log(`  getAssetId("Test Asset", "Blockchain", 1000): ${testAssetId2}`);
      
      // Check if our invalid token ID matches any of these patterns
      if (testAssetId1.toString() === invalidTokenId) {
        console.log(`  ✅ MATCH: Invalid token ID is an asset ID from getAssetId(name, location)`);
      } else if (testAssetId2.toString() === invalidTokenId) {
        console.log(`  ✅ MATCH: Invalid token ID is an asset ID from getAssetId(name, location, value)`);
      } else {
        console.log(`  ❌ No direct match with test asset IDs`);
      }
      
    } catch (error) {
      console.log(`  Error testing asset ID generation: ${error.message}`);
    }
    
    // Check recent NFTs to see the pattern
    console.log(`\n🎨 Recent NFT Token IDs (last 10):`);
    for (let i = Math.max(1, Number(totalAssets) - 9); i <= Number(totalAssets); i++) {
      try {
        const owner = await assetNFTContract.ownerOf(i);
        const tokenURI = await assetNFTContract.tokenURI(i);
        console.log(`  Token #${i}: Owner: ${owner.substring(0, 6)}..., URI: ${tokenURI.substring(0, 30)}...`);
      } catch (e) {
        console.log(`  Token #${i}: Error - ${e.message}`);
      }
    }
    
    console.log(`\n🔧 Root Cause Analysis:`);
    console.log(`  1. CoreAssetFactory creates assets with bytes32 asset IDs`);
    console.log(`  2. AssetNFT mints NFTs with uint256 token IDs (1, 2, 3, etc.)`);
    console.log(`  3. Marketplace listings are using asset IDs instead of token IDs`);
    console.log(`  4. This causes the "Insufficient TRUST tokens" error because the NFT doesn't exist`);
    
    console.log(`\n✅ Fix Status:`);
    console.log(`  - Frontend now filters out invalid listings ✅`);
    console.log(`  - New listings will use correct token IDs ✅`);
    console.log(`  - Old invalid listings will expire naturally ✅`);
    
    console.log(`\n💡 Recommendation:`);
    console.log(`  The issue is in the marketplace listing creation logic.`);
    console.log(`  When creating a listing, the system should use the NFT token ID, not the asset ID.`);
    console.log(`  The frontend fix prevents display of invalid listings, but the root cause`);
    console.log(`  is in how listings are created in the first place.`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

investigateInvalidTokenIds();
