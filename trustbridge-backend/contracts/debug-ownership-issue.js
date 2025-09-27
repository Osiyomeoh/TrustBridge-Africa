const { ethers } = require('ethers');

async function debugOwnershipIssue() {
  try {
    console.log('🔍 Debugging ownership issue...');
    
    const provider = new ethers.JsonRpcProvider('https://testnet.hashio.io/api');
    
    // Check the buyer's address
    const buyerAddress = '0xA6e8bf8E89Bd2c2BD37e308F275C4f52284a911F';
    console.log('👤 Buyer address:', buyerAddress);
    
    // Check marketplace contract
    const marketplaceContract = new ethers.Contract(
      '0x44C2e6BCAc1E91e3107616F4D0e03692fb853610', // TRUSTMarketplace
      [
        'function getListing(uint256 listingId) view returns (address seller, uint256 tokenId, uint256 price, bool isActive, uint256 createdAt, uint256 expiresAt)'
      ],
      provider
    );
    
    // Check AssetNFT contract
    const assetNFTContract = new ethers.Contract(
      '0x42be9627C970D40248690F010b3c2a7F8C68576C', // AssetNFT
      [
        'function ownerOf(uint256 tokenId) view returns (address)',
        'function getTotalAssets() view returns (uint256)'
      ],
      provider
    );
    
    // Check listing #2 details
    console.log('\n📋 Listing #2 details:');
    const listing2 = await marketplaceContract.getListing(2);
    console.log('  Seller:', listing2.seller);
    console.log('  Token ID:', listing2.tokenId.toString());
    console.log('  Price:', ethers.formatUnits(listing2.price, 18), 'TRUST');
    console.log('  Active:', listing2.isActive);
    
    // Check if buyer is the seller
    const isSeller = listing2.seller.toLowerCase() === buyerAddress.toLowerCase();
    console.log('\n👤 Ownership check:');
    console.log('  Buyer:', buyerAddress);
    console.log('  Seller:', listing2.seller);
    console.log('  Is buyer the seller?', isSeller);
    
    // Check the actual NFT owner
    const tokenIdStr = listing2.tokenId.toString();
    const isValidTokenId = tokenIdStr.length <= 10 && !isNaN(parseInt(tokenIdStr)) && parseInt(tokenIdStr) > 0;
    
    if (isValidTokenId) {
      try {
        const nftOwner = await assetNFTContract.ownerOf(parseInt(tokenIdStr));
        console.log('\n🎨 NFT ownership:');
        console.log('  Token ID:', tokenIdStr);
        console.log('  NFT Owner:', nftOwner);
        console.log('  Is buyer the NFT owner?', nftOwner.toLowerCase() === buyerAddress.toLowerCase());
        console.log('  Does seller match NFT owner?', nftOwner.toLowerCase() === listing2.seller.toLowerCase());
      } catch (e) {
        console.log('\n🎨 NFT ownership: ERROR -', e.message);
      }
    } else {
      console.log('\n🎨 NFT ownership: INVALID TOKEN ID -', tokenIdStr);
    }
    
    // Check all listings for this buyer
    console.log('\n📋 All listings for this buyer:');
    const listingIds = [1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12];
    
    for (const listingId of listingIds) {
      try {
        const listing = await marketplaceContract.getListing(listingId);
        const isBuyerSeller = listing.seller.toLowerCase() === buyerAddress.toLowerCase();
        console.log(`  Listing #${listingId}: Seller: ${listing.seller.substring(0, 6)}... (${isBuyerSeller ? 'OWN' : 'OTHER'})`);
      } catch (e) {
        console.log(`  Listing #${listingId}: ERROR - ${e.message}`);
      }
    }
    
    console.log('\n🔧 Analysis:');
    if (isSeller) {
      console.log('❌ Buyer is trying to buy their own asset - this should be blocked');
    } else {
      console.log('✅ Buyer is not the seller - purchase should be allowed');
    }
    
    if (!isValidTokenId) {
      console.log('❌ Invalid token ID in listing - this is the root cause');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugOwnershipIssue();
