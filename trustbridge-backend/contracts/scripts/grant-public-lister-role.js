const { ethers } = require('hardhat');

async function grantPublicListerRole() {
  console.log('🔧 Granting public LISTER_ROLE access...');
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log('👤 Deployer address:', deployer.address);
  
  // Contract addresses
  const TRUST_MARKETPLACE_ADDRESS = '0x44C2e6BCAc1E91e3107616F4D0e03692fb853610';
  
  console.log('📍 TRUSTMarketplace:', TRUST_MARKETPLACE_ADDRESS);
  
  // Get contract instance
  const TrustMarketplace = await ethers.getContractFactory('TRUSTMarketplace');
  const trustMarketplace = TrustMarketplace.attach(TRUST_MARKETPLACE_ADDRESS);
  
  try {
    // Get roles
    const DEFAULT_ADMIN_ROLE = await trustMarketplace.DEFAULT_ADMIN_ROLE();
    const LISTER_ROLE = await trustMarketplace.LISTER_ROLE();
    
    console.log('🔐 DEFAULT_ADMIN_ROLE:', DEFAULT_ADMIN_ROLE);
    console.log('🔐 LISTER_ROLE:', LISTER_ROLE);
    
    // Check if deployer has admin role
    const deployerHasAdminRole = await trustMarketplace.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
    console.log('👑 Deployer has admin role:', deployerHasAdminRole);
    
    if (!deployerHasAdminRole) {
      console.log('❌ Deployer does not have admin role. Cannot grant roles.');
      return;
    }
    
    // Grant LISTER_ROLE to the zero address (public access)
    // This allows anyone to list assets without needing individual role grants
    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
    
    console.log('🔧 Granting LISTER_ROLE to zero address (public access)...');
    const grantTx = await trustMarketplace.grantRole(LISTER_ROLE, ZERO_ADDRESS);
    console.log('📝 Grant role transaction:', grantTx.hash);
    
    const grantReceipt = await grantTx.wait();
    console.log('✅ Role granted in block:', grantReceipt.blockNumber);
    console.log('⛽ Gas used:', grantReceipt.gasUsed.toString());
    
    // Verify the role was granted
    const zeroAddressHasListerRole = await trustMarketplace.hasRole(LISTER_ROLE, ZERO_ADDRESS);
    console.log('🌐 Zero address has lister role:', zeroAddressHasListerRole);
    
    if (zeroAddressHasListerRole) {
      console.log('✅ Public LISTER_ROLE access granted successfully!');
      console.log('🎉 Now anyone can list assets without needing individual role grants');
    } else {
      console.log('❌ Failed to grant public LISTER_ROLE access');
    }
    
  } catch (error) {
    console.error('❌ Error granting public LISTER_ROLE:', error);
    throw error;
  }
}

grantPublicListerRole()
  .then(() => {
    console.log('🏁 Public LISTER_ROLE grant completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Public LISTER_ROLE grant failed:', error);
    process.exit(1);
  });
