const { ethers } = require('hardhat');

async function main() {
  console.log('🚀 Redeploying CoreAssetFactory with transferFrom fix...');
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log('👤 Deployer address:', deployer.address);
  console.log('💰 Deployer balance:', ethers.formatEther(await deployer.provider.getBalance(deployer.address)), 'HBAR');
  
  // Contract addresses
  const TRUST_TOKEN_ADDRESS = '0x170B35e97C217dBf63a500EaB884392F7BF6Ec34';
  const ASSET_NFT_ADDRESS = '0x42be9627C970D40248690F010b3c2a7F8C68576C';
  const FEE_RECIPIENT = '0xA6e8bf8E89Bd2c2BD37e308F275C4f52284a911F';
  
  console.log('📍 TRUST Token:', TRUST_TOKEN_ADDRESS);
  console.log('📍 AssetNFT:', ASSET_NFT_ADDRESS);
  console.log('🏦 Fee Recipient:', FEE_RECIPIENT);
  
  // Deploy CoreAssetFactory (fixed version)
  const CoreAssetFactory = await ethers.getContractFactory('CoreAssetFactory');
  const coreAssetFactory = await CoreAssetFactory.deploy(
    TRUST_TOKEN_ADDRESS,
    ASSET_NFT_ADDRESS,
    FEE_RECIPIENT
  );
  
  await coreAssetFactory.waitForDeployment();
  const coreAssetFactoryAddress = await coreAssetFactory.getAddress();
  
  console.log('✅ CoreAssetFactory (fixed) deployed to:', coreAssetFactoryAddress);
  
  // Test the contract
  console.log('\n🧪 Testing the fixed contract...');
  
  try {
    // Check if contract is paused
    const isPaused = await coreAssetFactory.paused();
    console.log('⏸️ Contract paused:', isPaused);
    
    // Check fees
    const digitalFee = await coreAssetFactory.DIGITAL_CREATION_FEE();
    const minFee = await coreAssetFactory.MIN_CREATION_FEE();
    console.log('💰 Digital creation fee:', ethers.formatEther(digitalFee), 'TRUST');
    console.log('💰 Min creation fee:', ethers.formatEther(minFee), 'TRUST');
    
    // Check fee recipient
    const feeRecipient = await coreAssetFactory.feeRecipient();
    console.log('🏦 Fee recipient:', feeRecipient);
    
  } catch (error) {
    console.log('⚠️ Error testing contract:', error.message);
  }
  
  console.log('\n📋 Deployment Summary:');
  console.log('Contract Address:', coreAssetFactoryAddress);
  console.log('Network: Hedera Testnet');
  console.log('Deployer:', deployer.address);
  
  // Save deployment info
  const deploymentInfo = {
    network: 'hedera_testnet',
    contractName: 'CoreAssetFactory',
    address: coreAssetFactoryAddress,
    deployer: deployer.address,
    trustToken: TRUST_TOKEN_ADDRESS,
    assetNFT: ASSET_NFT_ADDRESS,
    feeRecipient: FEE_RECIPIENT,
    fix: 'Fixed transferFrom issue by using transfer instead',
    timestamp: new Date().toISOString()
  };
  
  console.log('\n💾 Deployment info:');
  console.log(JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => {
    console.log('🏁 Deployment completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });
