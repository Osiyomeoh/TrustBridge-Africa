const { ethers } = require('ethers');

async function findCorrectToken() {
  try {
    console.log('🔍 Finding correct token ID for listing...');
    
    const provider = new ethers.JsonRpcProvider('https://testnet.hashio.io/api');
    
    const assetNFTContract = new ethers.Contract(
      '0x42be9627C970D40248690F010b3c2a7F8C68576C', // AssetNFT
      [
        'function getTotalAssets() view returns (uint256)',
        'function ownerOf(uint256 tokenId) view returns (address)',
        'function tokenURI(uint256 tokenId) view returns (string)'
      ],
      provider
    );
    
    const sellerAddress = '0xA6e8bf8E89Bd2c2BD37e308F275C4f52284a911F';
    const listingPrice = '0.000000000000000031'; // 31 wei
    
    console.log(`\n👤 Seller: ${sellerAddress}`);
    console.log(`💰 Listing Price: ${listingPrice} TRUST`);
    
    // Get total supply
    const totalSupply = await assetNFTContract.getTotalAssets();
    console.log(`📊 Total NFTs: ${totalSupply.toString()}`);
    
    // Find seller's tokens
    const ownedTokens = [];
    for (let i = 1; i <= Math.min(Number(totalSupply), 50); i++) {
      try {
        const owner = await assetNFTContract.ownerOf(i);
        if (owner.toLowerCase() === sellerAddress.toLowerCase()) {
          const tokenURI = await assetNFTContract.tokenURI(i);
          ownedTokens.push({
            tokenId: i,
            owner: owner,
            tokenURI: tokenURI
          });
        }
      } catch (e) {
        // Token doesn't exist
      }
    }
    
    console.log(`\n🎨 Seller's NFTs (${ownedTokens.length} found):`);
    ownedTokens.forEach(token => {
      console.log(`  Token #${token.tokenId}: ${token.tokenURI.substring(0, 50)}...`);
    });
    
    // Look for tokens that might match the listing
    console.log(`\n🔍 Looking for tokens that might match listing price ${listingPrice} TRUST...`);
    
    // Check if any of the seller's tokens have metadata that might indicate they're for sale
    for (const token of ownedTokens) {
      try {
        // Try to fetch metadata
        let metadata = null;
        if (token.tokenURI.startsWith('ipfs://') || token.tokenURI.startsWith('https://')) {
          try {
            const url = token.tokenURI.startsWith('ipfs://') 
              ? token.tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/')
              : token.tokenURI;
            
            const response = await fetch(url);
            if (response.ok) {
              metadata = await response.json();
            }
          } catch (e) {
            // Ignore fetch errors
          }
        }
        
        console.log(`\n  Token #${token.tokenId}:`);
        console.log(`    URI: ${token.tokenURI}`);
        if (metadata) {
          console.log(`    Name: ${metadata.name || 'N/A'}`);
          console.log(`    Description: ${metadata.description || 'N/A'}`);
        }
        
        // Check if this might be the "Rigid" asset or similar
        if (token.tokenURI.includes('bafybeif44f46oymdbsu2fuhf5efaiyxke3ku7s6qcdex7wpxvy62kfprw4')) {
          console.log(`    🎯 This might be the "Rigid" asset!`);
        }
        
      } catch (e) {
        console.log(`    Error checking token #${token.tokenId}: ${e.message}`);
      }
    }
    
    console.log(`\n💡 Recommendation:`);
    console.log(`  The listing uses an invalid token ID (bytes32 hash).`);
    console.log(`  The seller should create a new listing with a valid token ID from the list above.`);
    console.log(`  Most likely candidates: Token #34 (Rigid) or Token #31 (eerr)`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

findCorrectToken();
