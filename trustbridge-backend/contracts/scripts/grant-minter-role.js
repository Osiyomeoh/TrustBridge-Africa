const { ethers } = require('hardhat');

async function grantMinterRole() {
  console.log('🔧 Granting MINTER_ROLE to CoreAssetFactory on AssetNFT...');
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log('👤 Deployer address:', deployer.address);
  
  // Contract addresses
  const ASSET_NFT_ADDRESS = '0x42be9627C970D40248690F010b3c2a7F8C68576C';
  const CORE_ASSET_FACTORY_ADDRESS = '0x930131a22b9D2e060d8E4EF1aE21185d4F59F52F';
  
  console.log('📍 AssetNFT:', ASSET_NFT_ADDRESS);
  console.log('📍 CoreAssetFactory:', CORE_ASSET_FACTORY_ADDRESS);
  
  // Get contract instance
  const AssetNFT = await ethers.getContractFactory('AssetNFT');
  const assetNFT = AssetNFT.attach(ASSET_NFT_ADDRESS);
  
  try {
    // Check current roles
    const MINTER_ROLE = await assetNFT.MINTER_ROLE();
    console.log('🔐 MINTER_ROLE:', MINTER_ROLE);
    
    const hasMinterRole = await assetNFT.hasRole(MINTER_ROLE, CORE_ASSET_FACTORY_ADDRESS);
    console.log('👑 CoreAssetFactory has MINTER_ROLE:', hasMinterRole);
    
    if (hasMinterRole) {
      console.log('✅ CoreAssetFactory already has MINTER_ROLE');
      return;
    }
    
    // Grant MINTER_ROLE
    console.log('🔧 Granting MINTER_ROLE to CoreAssetFactory...');
    const grantTx = await assetNFT.grantRole(MINTER_ROLE, CORE_ASSET_FACTORY_ADDRESS);
    console.log('📝 Grant role transaction:', grantTx.hash);
    
    const grantReceipt = await grantTx.wait();
    console.log('✅ Role granted in block:', grantReceipt.blockNumber);
    console.log('⛽ Gas used:', grantReceipt.gasUsed.toString());
    
    // Verify the role was granted
    const hasMinterRoleAfter = await assetNFT.hasRole(MINTER_ROLE, CORE_ASSET_FACTORY_ADDRESS);
    console.log('👑 CoreAssetFactory has MINTER_ROLE after grant:', hasMinterRoleAfter);
    
    if (hasMinterRoleAfter) {
      console.log('✅ MINTER_ROLE successfully granted!');
    } else {
      console.log('❌ Failed to grant MINTER_ROLE');
    }
    
  } catch (error) {
    console.error('❌ Error granting MINTER_ROLE:', error);
    throw error;
  }
}

grantMinterRole()
  .then(() => {
    console.log('🏁 MINTER_ROLE grant completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ MINTER_ROLE grant failed:', error);
    process.exit(1);
  });
