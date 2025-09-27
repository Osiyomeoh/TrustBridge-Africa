const { ethers } = require('hardhat');

async function testAssetNFT() {
  try {
    console.log('🔍 Testing AssetNFT contract...');
    
    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log('👤 Deployer address:', deployer.address);
    
    // Contract addresses
    const ASSET_NFT_ADDRESS = '0x42be9627C970D40248690F010b3c2a7F8C68576C';
    const CORE_ASSET_FACTORY_ADDRESS = '0x930131a22b9D2e060d8E4EF1aE21185d4F59F52F';
    
    // Get contract instance
    const AssetNFT = await ethers.getContractFactory('AssetNFT');
    const assetNFT = AssetNFT.attach(ASSET_NFT_ADDRESS);
    
    // Check if AssetNFT is paused
    try {
      const isPaused = await assetNFT.paused();
      console.log('⏸️ AssetNFT paused:', isPaused);
    } catch (error) {
      console.log('⚠️ Error checking AssetNFT pause status:', error.message);
    }
    
    // Check if CoreAssetFactory has MINTER_ROLE on AssetNFT
    try {
      const MINTER_ROLE = await assetNFT.MINTER_ROLE();
      console.log('🔐 AssetNFT MINTER_ROLE:', MINTER_ROLE);
      
      const hasMinterRole = await assetNFT.hasRole(MINTER_ROLE, CORE_ASSET_FACTORY_ADDRESS);
      console.log('👑 CoreAssetFactory has MINTER_ROLE on AssetNFT:', hasMinterRole);
      
      if (!hasMinterRole) {
        console.log('❌ CoreAssetFactory does not have MINTER_ROLE on AssetNFT!');
        console.log('🔧 Granting MINTER_ROLE to CoreAssetFactory...');
        
        const grantTx = await assetNFT.grantRole(MINTER_ROLE, CORE_ASSET_FACTORY_ADDRESS);
        console.log('📝 Grant role transaction:', grantTx.hash);
        
        const grantReceipt = await grantTx.wait();
        console.log('✅ Role granted in block:', grantReceipt.blockNumber);
        
        // Check again
        const hasMinterRoleAfter = await assetNFT.hasRole(MINTER_ROLE, CORE_ASSET_FACTORY_ADDRESS);
        console.log('👑 CoreAssetFactory has MINTER_ROLE after grant:', hasMinterRoleAfter);
      }
      
    } catch (error) {
      console.log('⚠️ Error checking AssetNFT roles:', error.message);
    }
    
    // Test direct minting from deployer
    try {
      console.log('\n🧪 Testing direct minting from deployer...');
      
      const testTokenId = 12345;
      const testMetadataURI = "https://test.com/metadata.json";
      
      const mintTx = await assetNFT.mint(deployer.address, testTokenId, testMetadataURI);
      console.log('📝 Mint transaction:', mintTx.hash);
      
      const mintReceipt = await mintTx.wait();
      console.log('✅ Mint confirmed in block:', mintReceipt.blockNumber);
      
    } catch (error) {
      console.log('❌ Direct minting failed:', error.message);
      console.log('❌ Error data:', error.data);
    }
    
  } catch (error) {
    console.error('❌ Error in test:', error);
  }
}

// Run the test
testAssetNFT()
  .then(() => {
    console.log('🏁 Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
