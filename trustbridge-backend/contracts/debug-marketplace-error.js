const { ethers } = require('hardhat');

async function debugMarketplaceError() {
  console.log('🔍 Debugging TRUSTMarketplace error 0x7e273289...');
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log('👤 Deployer address:', deployer.address);
  
  // Contract addresses
  const TRUST_MARKETPLACE_ADDRESS = '0x44C2e6BCAc1E91e3107616F4D0e03692fb853610';
  const ASSET_NFT_ADDRESS = '0x42be9627C970D40248690F010b3c2a7F8C68576C';
  const USER_ADDRESS = '0xa620f55Ec17bf98d9898E43878c22c10b5324069'; // From the error
  
  console.log('📍 TRUSTMarketplace:', TRUST_MARKETPLACE_ADDRESS);
  console.log('📍 AssetNFT:', ASSET_NFT_ADDRESS);
  console.log('👤 User address:', USER_ADDRESS);
  
  // Get contract instances
  const TrustMarketplace = await ethers.getContractFactory('TRUSTMarketplace');
  const trustMarketplace = TrustMarketplace.attach(TRUST_MARKETPLACE_ADDRESS);
  
  const AssetNFT = await ethers.getContractFactory('AssetNFT');
  const assetNFT = AssetNFT.attach(ASSET_NFT_ADDRESS);
  
  try {
    // Check if contract is paused
    const isPaused = await trustMarketplace.paused();
    console.log('⏸️ TRUSTMarketplace paused:', isPaused);
    
    // Check roles
    try {
      const DEFAULT_ADMIN_ROLE = await trustMarketplace.DEFAULT_ADMIN_ROLE();
      const LISTER_ROLE = await trustMarketplace.LISTER_ROLE();
      const BIDDER_ROLE = await trustMarketplace.BIDDER_ROLE();
      
      console.log('🔐 DEFAULT_ADMIN_ROLE:', DEFAULT_ADMIN_ROLE);
      console.log('🔐 LISTER_ROLE:', LISTER_ROLE);
      console.log('🔐 BIDDER_ROLE:', BIDDER_ROLE);
      
      // Check if user has roles
      const userHasAdminRole = await trustMarketplace.hasRole(DEFAULT_ADMIN_ROLE, USER_ADDRESS);
      const userHasListerRole = await trustMarketplace.hasRole(LISTER_ROLE, USER_ADDRESS);
      const userHasBidderRole = await trustMarketplace.hasRole(BIDDER_ROLE, USER_ADDRESS);
      
      console.log('👤 User has admin role:', userHasAdminRole);
      console.log('👤 User has lister role:', userHasListerRole);
      console.log('👤 User has bidder role:', userHasBidderRole);
      
      // Check if deployer has admin role
      const deployerHasAdminRole = await trustMarketplace.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
      console.log('👑 Deployer has admin role:', deployerHasAdminRole);
      
    } catch (error) {
      console.log('⚠️ Error checking roles:', error.message);
    }
    
    // Check if user owns the NFT
    const nftBalance = await assetNFT.balanceOf(USER_ADDRESS);
    console.log('🎨 User NFT balance:', nftBalance.toString());
    
    // Check if user has approved the marketplace
    const isApproved = await assetNFT.isApprovedForAll(USER_ADDRESS, TRUST_MARKETPLACE_ADDRESS);
    console.log('🔐 User approved marketplace:', isApproved);
    
    // Try to decode the error
    console.log('\n🔍 Analyzing error code...');
    const errorCode = '0x7e273289';
    console.log('❌ Error code:', errorCode);
    
    // This looks like a role-related error
    console.log('🔍 This appears to be a role-related error');
    console.log('🔍 Likely cause: User does not have LISTER_ROLE');
    
    // Test gas estimation for listAsset
    console.log('\n🧪 Testing gas estimation for listAsset...');
    try {
      const testTokenId = 0; // First token
      const testPrice = ethers.parseEther("1000");
      const testDuration = 86400; // 1 day
      
      const gasEstimate = await trustMarketplace.listAsset.estimateGas(
        ASSET_NFT_ADDRESS,
        testTokenId,
        testPrice,
        testDuration
      );
      console.log('✅ Gas estimate for listAsset:', gasEstimate.toString());
    } catch (error) {
      console.log('❌ Gas estimate failed:', error.message);
      console.log('❌ Error data:', error.data);
    }
    
  } catch (error) {
    console.error('❌ Error in debug:', error);
  }
}

debugMarketplaceError()
  .then(() => {
    console.log('🏁 Debug completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Debug failed:', error);
    process.exit(1);
  });
