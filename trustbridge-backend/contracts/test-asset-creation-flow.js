const { ethers } = require('ethers');

async function testAssetCreationFlow() {
  try {
    console.log('🔍 Testing asset creation flow...');
    
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
    
    // Check the CoreAssetFactory contract
    const coreAssetFactoryContract = new ethers.Contract(
      '0x044e4e033978af17102C69E1B79B6Ddc6078A0D9', // CoreAssetFactory
      [
        'function getTotalAssets() view returns (uint256)',
        'function getAsset(bytes32 assetId) view returns (address owner, uint8 category, string memory assetType, string memory name, uint256 totalValue, uint256 tokenId, uint8 status)'
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
    
    // Check recent NFTs
    console.log('\n🎨 Recent NFTs (last 5):');
    for (let i = Math.max(1, Number(totalAssets) - 4); i <= Number(totalAssets); i++) {
      try {
        const owner = await assetNFTContract.ownerOf(i);
        const tokenURI = await assetNFTContract.tokenURI(i);
        console.log(`  Token #${i}: Owner: ${owner.substring(0, 6)}..., URI: ${tokenURI.substring(0, 30)}...`);
      } catch (e) {
        console.log(`  Token #${i}: Error - ${e.message}`);
      }
    }
    
    // Check marketplace listings
    const listingIds = await marketplaceContract.getActiveListings();
    console.log(`\n📋 Active listings: ${listingIds.length}`);
    
    // Analyze listings
    console.log('\n📋 Listing Analysis:');
    for (const listingId of listingIds) {
      const listing = await marketplaceContract.getListing(listingId);
      const tokenIdStr = listing.tokenId.toString();
      const isValidTokenId = tokenIdStr.length <= 10 && !isNaN(parseInt(tokenIdStr)) && parseInt(tokenIdStr) > 0;
      
      console.log(`  Listing #${listingId}:`);
      console.log(`    Token ID: ${tokenIdStr} (${isValidTokenId ? 'VALID' : 'INVALID'})`);
      console.log(`    Price: ${ethers.formatUnits(listing.price, 18)} TRUST`);
      console.log(`    Seller: ${listing.seller.substring(0, 6)}...`);
      console.log(`    Active: ${listing.isActive}`);
      
      // Check if the token exists
      if (isValidTokenId) {
        try {
          const owner = await assetNFTContract.ownerOf(parseInt(tokenIdStr));
          console.log(`    NFT Owner: ${owner.substring(0, 6)}... (${owner === listing.seller ? 'MATCH' : 'MISMATCH'})`);
        } catch (e) {
          console.log(`    NFT Owner: ERROR - ${e.message}`);
        }
      }
      console.log('');
    }
    
    console.log('\n🔧 Analysis:');
    const invalidListings = listingIds.filter(async (id) => {
      const listing = await marketplaceContract.getListing(id);
      const tokenIdStr = listing.tokenId.toString();
      return !(tokenIdStr.length <= 10 && !isNaN(parseInt(tokenIdStr)) && parseInt(tokenIdStr) > 0);
    });
    
    console.log(`  Valid listings: ${listingIds.length - invalidListings.length}`);
    console.log(`  Invalid listings: ${invalidListings.length}`);
    
    if (invalidListings.length > 0) {
      console.log('\n❌ Root Cause: Invalid token IDs in marketplace listings');
      console.log('  - AssetNFT uses sequential token IDs (1, 2, 3...)');
      console.log('  - Marketplace listings have bytes32 hashes as token IDs');
      console.log('  - This suggests the frontend is passing assetId instead of tokenId');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAssetCreationFlow();
