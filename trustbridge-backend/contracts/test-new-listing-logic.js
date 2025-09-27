const { ethers } = require('ethers');

async function testNewListingLogic() {
  try {
    console.log('🧪 Testing new listing logic...');
    
    // Setup provider and contract
    const provider = new ethers.JsonRpcProvider('https://testnet.hashio.io/api');
    const marketplaceContract = new ethers.Contract(
      '0x44C2e6BCAc1E91e3107616F4D0e03692fb853610', // TRUSTMarketplace
      [
        'function getActiveListings() view returns (uint256[])',
        'function getListing(uint256 listingId) view returns (address seller, uint256 tokenId, uint256 price, bool isActive, uint256 createdAt, uint256 expiresAt)'
      ],
      provider
    );
    
    const assetNFTContract = new ethers.Contract(
      '0x42be9627C970D40248690F010b3c2a7F8C68576C', // AssetNFT
      [
        'function getTotalAssets() view returns (uint256)',
        'function ownerOf(uint256 tokenId) view returns (address)',
        'function tokenURI(uint256 tokenId) view returns (string)',
        'function balanceOf(address owner) view returns (uint256)'
      ],
      provider
    );
    
    console.log('\n📊 Current marketplace state:');
    const listingIds = await marketplaceContract.getActiveListings();
    console.log('Total active listings:', listingIds.length);
    
    for (let i = 0; i < listingIds.length; i++) {
      const listing = await marketplaceContract.getListing(listingIds[i]);
      console.log(`\nListing #${listingIds[i]}:`);
      console.log('  Seller:', listing.seller);
      console.log('  Token ID:', listing.tokenId.toString());
      console.log('  Price:', ethers.formatUnits(listing.price, 18), 'TRUST');
      
      // Check if this token ID exists and who owns it
      try {
        const owner = await assetNFTContract.ownerOf(listing.tokenId);
        const tokenURI = await assetNFTContract.tokenURI(listing.tokenId);
        console.log('  NFT Owner:', owner);
        console.log('  Token URI:', tokenURI.substring(0, 50) + '...');
        console.log('  ✅ Valid NFT listing');
      } catch (error) {
        console.log('  ❌ Invalid token ID - NFT does not exist');
      }
    }
    
    console.log('\n🔍 Analyzing user balances:');
    const users = [
      '0xA6e8bf8E89Bd2c2BD37e308F275C4f52284a911F',
      '0xa620f55Ec17bf98d9898E43878c22c10b5324069'
    ];
    
    for (const user of users) {
      const balance = await assetNFTContract.balanceOf(user);
      console.log(`\n👤 User ${user}:`);
      console.log('  NFT Balance:', balance.toString());
      
      // Find their tokens
      const totalSupply = await assetNFTContract.getTotalAssets();
      const ownedTokens = [];
      
      for (let i = 1; i <= Math.min(Number(totalSupply), 50); i++) {
        try {
          const owner = await assetNFTContract.ownerOf(i);
          if (owner.toLowerCase() === user.toLowerCase()) {
            ownedTokens.push(i);
          }
        } catch (e) {
          // Token doesn't exist
        }
      }
      
      console.log('  Owned Token IDs:', ownedTokens.slice(0, 10)); // Show first 10
      if (ownedTokens.length > 10) {
        console.log(`  ... and ${ownedTokens.length - 10} more`);
      }
    }
    
    console.log('\n✅ Analysis complete');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testNewListingLogic();
