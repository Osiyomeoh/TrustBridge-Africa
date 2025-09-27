const { ethers } = require('ethers');

async function checkAssetNFT() {
  try {
    const provider = new ethers.JsonRpcProvider('https://testnet.hashio.io/api');
    const contract = new ethers.Contract(
      '0x42be9627C970D40248690F010b3c2a7F8C68576C', // AssetNFT
      [
        'function getTotalAssets() view returns (uint256)',
        'function ownerOf(uint256 tokenId) view returns (address)',
        'function tokenURI(uint256 tokenId) view returns (string)'
      ],
      provider
    );
    
    console.log('🔍 Checking AssetNFT contract...');
    
    const totalAssets = await contract.getTotalAssets();
    console.log('📊 Total assets minted:', totalAssets.toString());
    
    // Check first 50 token IDs
    const maxCheck = Math.min(50, Number(totalAssets));
    console.log(`\n🔍 Checking first ${maxCheck} token IDs:`);
    
    for (let i = 1; i <= maxCheck; i++) {
      try {
        const owner = await contract.ownerOf(i);
        const tokenURI = await contract.tokenURI(i);
        console.log(`Token #${i}: Owner: ${owner}, URI: ${tokenURI.substring(0, 50)}...`);
      } catch (error) {
        console.log(`Token #${i}: Not found or error`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkAssetNFT();
