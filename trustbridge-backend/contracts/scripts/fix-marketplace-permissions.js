const { ethers } = require('hardhat');

async function fixMarketplacePermissions() {
  console.log('🔧 Fixing TRUSTMarketplace permissions...');
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log('👤 Deployer address:', deployer.address);
  
  // Contract addresses
  const TRUST_MARKETPLACE_ADDRESS = '0x44C2e6BCAc1E91e3107616F4D0e03692fb853610';
  const ASSET_NFT_ADDRESS = '0x42be9627C970D40248690F010b3c2a7F8C68576C';
  const USER_ADDRESS = '0xa620f55Ec17bf98d9898E43878c22c10b5324069';
  
  console.log('📍 TRUSTMarketplace:', TRUST_MARKETPLACE_ADDRESS);
  console.log('📍 AssetNFT:', ASSET_NFT_ADDRESS);
  console.log('👤 User address:', USER_ADDRESS);
  
  // Get contract instances
  const TrustMarketplace = await ethers.getContractFactory('TRUSTMarketplace');
  const trustMarketplace = TrustMarketplace.attach(TRUST_MARKETPLACE_ADDRESS);
  
  const AssetNFT = await ethers.getContractFactory('AssetNFT');
  const assetNFT = AssetNFT.attach(ASSET_NFT_ADDRESS);
  
  try {
    // Step 1: Grant LISTER_ROLE to user
    console.log('\n🔧 Step 1: Granting LISTER_ROLE to user...');
    try {
      const LISTER_ROLE = await trustMarketplace.LISTER_ROLE();
      console.log('🔐 LISTER_ROLE:', LISTER_ROLE);
      
      const userHasListerRole = await trustMarketplace.hasRole(LISTER_ROLE, USER_ADDRESS);
      console.log('👤 User has lister role:', userHasListerRole);
      
      if (!userHasListerRole) {
        console.log('🔧 Granting LISTER_ROLE to user...');
        const grantTx = await trustMarketplace.grantRole(LISTER_ROLE, USER_ADDRESS);
        console.log('📝 Grant role transaction:', grantTx.hash);
        
        const grantReceipt = await grantTx.wait();
        console.log('✅ Role granted in block:', grantReceipt.blockNumber);
        
        // Verify the role was granted
        const userHasListerRoleAfter = await trustMarketplace.hasRole(LISTER_ROLE, USER_ADDRESS);
        console.log('👤 User has lister role after grant:', userHasListerRoleAfter);
      } else {
        console.log('✅ User already has LISTER_ROLE');
      }
    } catch (error) {
      console.log('⚠️ Error granting LISTER_ROLE:', error.message);
    }
    
    // Step 2: Grant BIDDER_ROLE to user
    console.log('\n🔧 Step 2: Granting BIDDER_ROLE to user...');
    try {
      const BIDDER_ROLE = await trustMarketplace.BIDDER_ROLE();
      console.log('🔐 BIDDER_ROLE:', BIDDER_ROLE);
      
      const userHasBidderRole = await trustMarketplace.hasRole(BIDDER_ROLE, USER_ADDRESS);
      console.log('👤 User has bidder role:', userHasBidderRole);
      
      if (!userHasBidderRole) {
        console.log('🔧 Granting BIDDER_ROLE to user...');
        const grantTx = await trustMarketplace.grantRole(BIDDER_ROLE, USER_ADDRESS);
        console.log('📝 Grant role transaction:', grantTx.hash);
        
        const grantReceipt = await grantTx.wait();
        console.log('✅ Role granted in block:', grantReceipt.blockNumber);
        
        // Verify the role was granted
        const userHasBidderRoleAfter = await trustMarketplace.hasRole(BIDDER_ROLE, USER_ADDRESS);
        console.log('👤 User has bidder role after grant:', userHasBidderRoleAfter);
      } else {
        console.log('✅ User already has BIDDER_ROLE');
      }
    } catch (error) {
      console.log('⚠️ Error granting BIDDER_ROLE:', error.message);
    }
    
    // Step 3: Check NFT approval
    console.log('\n🔧 Step 3: Checking NFT approval...');
    const isApproved = await assetNFT.isApprovedForAll(USER_ADDRESS, TRUST_MARKETPLACE_ADDRESS);
    console.log('🔐 User approved marketplace:', isApproved);
    
    if (!isApproved) {
      console.log('⚠️ User needs to approve the marketplace for their NFTs');
      console.log('💡 This needs to be done from the frontend by calling setApprovalForAll');
    } else {
      console.log('✅ User has already approved the marketplace');
    }
    
    // Step 4: Test listing
    console.log('\n🧪 Step 4: Testing listing...');
    try {
      const testTokenId = 0; // First token
      const testPrice = ethers.parseEther("1000");
      const testDuration = 86400; // 1 day
      
      console.log('📊 Testing with token ID:', testTokenId);
      console.log('📊 Testing with price:', ethers.formatEther(testPrice), 'HBAR');
      console.log('📊 Testing with duration:', testDuration, 'seconds');
      
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
    console.error('❌ Error in fix:', error);
  }
}

fixMarketplacePermissions()
  .then(() => {
    console.log('🏁 Fix completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  });
