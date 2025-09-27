const { ethers } = require('hardhat');

async function debugContractRoles() {
  try {
    console.log('🔍 Debugging contract roles...');
    
    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log('👤 Deployer address:', deployer.address);
    
    // Contract addresses
    const CORE_ASSET_FACTORY_ADDRESS = '0x930131a22b9D2e060d8E4EF1aE21185d4F59F52F';
    
    // Get contract instance
    const CoreAssetFactory = await ethers.getContractFactory('CoreAssetFactory');
    const coreAssetFactory = CoreAssetFactory.attach(CORE_ASSET_FACTORY_ADDRESS);
    
    // Check roles
    try {
      const DEFAULT_ADMIN_ROLE = await coreAssetFactory.DEFAULT_ADMIN_ROLE();
      const VERIFIER_ROLE = await coreAssetFactory.VERIFIER_ROLE();
      const MINTER_ROLE = await coreAssetFactory.MINTER_ROLE();
      const AMC_ROLE = await coreAssetFactory.AMC_ROLE();
      
      console.log('🔐 DEFAULT_ADMIN_ROLE:', DEFAULT_ADMIN_ROLE);
      console.log('🔐 VERIFIER_ROLE:', VERIFIER_ROLE);
      console.log('🔐 MINTER_ROLE:', MINTER_ROLE);
      console.log('🔐 AMC_ROLE:', AMC_ROLE);
      
      // Check if deployer has roles
      const hasAdminRole = await coreAssetFactory.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
      const hasVerifierRole = await coreAssetFactory.hasRole(VERIFIER_ROLE, deployer.address);
      const hasMinterRole = await coreAssetFactory.hasRole(MINTER_ROLE, deployer.address);
      const hasAMCRole = await coreAssetFactory.hasRole(AMC_ROLE, deployer.address);
      
      console.log('👑 Deployer has admin role:', hasAdminRole);
      console.log('👑 Deployer has verifier role:', hasVerifierRole);
      console.log('👑 Deployer has minter role:', hasMinterRole);
      console.log('👑 Deployer has AMC role:', hasAMCRole);
      
    } catch (error) {
      console.log('⚠️ Error checking roles:', error.message);
    }
    
    // Check if contract is paused
    try {
      const isPaused = await coreAssetFactory.paused();
      console.log('⏸️ Contract paused:', isPaused);
    } catch (error) {
      console.log('⚠️ Error checking pause status:', error.message);
    }
    
    // Check contract balance
    try {
      const TRUST_TOKEN_ADDRESS = '0x170B35e97C217dBf63a500EaB884392F7BF6Ec34';
      const TrustToken = await ethers.getContractFactory('TrustToken');
      const trustToken = TrustToken.attach(TRUST_TOKEN_ADDRESS);
      
      const contractBalance = await trustToken.balanceOf(CORE_ASSET_FACTORY_ADDRESS);
      console.log('💰 Contract TRUST balance:', ethers.formatEther(contractBalance), 'TRUST');
    } catch (error) {
      console.log('⚠️ Error checking contract balance:', error.message);
    }
    
    // Try to decode the error
    console.log('\n🔍 Analyzing error code...');
    const errorCode = '0xe2517d3f';
    console.log('❌ Error code:', errorCode);
    
    // This looks like a role-related error
    console.log('🔍 This appears to be a role-related error');
    
  } catch (error) {
    console.error('❌ Error in debug:', error);
  }
}

// Run the debug
debugContractRoles()
  .then(() => {
    console.log('🏁 Debug completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Debug failed:', error);
    process.exit(1);
  });
