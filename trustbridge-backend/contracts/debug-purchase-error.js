const { ethers } = require('ethers');

async function debugPurchaseError() {
  try {
    console.log('🔍 Debugging purchase error...');
    
    const provider = new ethers.JsonRpcProvider('https://testnet.hashio.io/api');
    
    // Check the buyer's address
    const buyerAddress = '0xa620f55Ec17bf98d9898E43878c22c10b5324069';
    console.log('👤 Buyer address:', buyerAddress);
    
    // Check TRUST token contract
    const trustTokenContract = new ethers.Contract(
      '0x170B35e97C217dBf63a500EaB884392F7BF6Ec34', // TrustToken
      [
        'function balanceOf(address account) view returns (uint256)',
        'function allowance(address owner, address spender) view returns (uint256)'
      ],
      provider
    );
    
    // Check marketplace contract
    const marketplaceContract = new ethers.Contract(
      '0x44C2e6BCAc1E91e3107616F4D0e03692fb853610', // TRUSTMarketplace
      [
        'function getListing(uint256 listingId) view returns (address seller, uint256 tokenId, uint256 price, bool isActive, uint256 createdAt, uint256 expiresAt)'
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
    
    // Check buyer's TRUST balance
    console.log('\n💰 Buyer TRUST balance:');
    const balance = await trustTokenContract.balanceOf(buyerAddress);
    console.log('  Balance:', ethers.formatUnits(balance, 18), 'TRUST');
    
    // Check marketplace allowance
    console.log('\n🔐 Marketplace allowance:');
    const allowance = await trustTokenContract.allowance(buyerAddress, '0x44C2e6BCAc1E91e3107616F4D0e03692fb853610');
    console.log('  Allowance:', ethers.formatUnits(allowance, 18), 'TRUST');
    
    // Check if token ID is valid
    console.log('\n🎨 Token ID validation:');
    const tokenIdStr = listing2.tokenId.toString();
    const isValidTokenId = tokenIdStr.length <= 10 && !isNaN(parseInt(tokenIdStr)) && parseInt(tokenIdStr) > 0;
    console.log('  Token ID:', tokenIdStr);
    console.log('  Is valid:', isValidTokenId);
    console.log('  Length:', tokenIdStr.length);
    
    // Check if buyer has enough balance
    const hasEnoughBalance = balance >= listing2.price;
    console.log('\n💸 Purchase feasibility:');
    console.log('  Required:', ethers.formatUnits(listing2.price, 18), 'TRUST');
    console.log('  Available:', ethers.formatUnits(balance, 18), 'TRUST');
    console.log('  Has enough balance:', hasEnoughBalance);
    console.log('  Has enough allowance:', allowance >= listing2.price);
    
    console.log('\n🔧 Analysis:');
    if (!isValidTokenId) {
      console.log('❌ Invalid token ID - this listing should be filtered out');
    }
    if (!hasEnoughBalance) {
      console.log('❌ Insufficient TRUST balance');
    }
    if (allowance < listing2.price) {
      console.log('❌ Insufficient marketplace allowance');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugPurchaseError();
