const { ethers } = require('hardhat');

async function testDigitalAssetCreation() {
  try {
    console.log('🔍 Testing digital asset creation from backend...');
    
    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log('👤 Deployer address:', deployer.address);
    console.log('💰 Deployer balance:', ethers.formatEther(await deployer.provider.getBalance(deployer.address)), 'HBAR');
    
    // Contract addresses
    const TRUST_TOKEN_ADDRESS = '0x170B35e97C217dBf63a500EaB884392F7BF6Ec34';
    const CORE_ASSET_FACTORY_ADDRESS = '0xF743D30062Bc04c69fC2F07F216C0357F0bDdb76';
    const FEE_RECIPIENT = '0xA6e8bf8E89Bd2c2BD37e308F275C4f52284a911F';
    
    console.log('📍 TRUST Token:', TRUST_TOKEN_ADDRESS);
    console.log('📍 CoreAssetFactory:', CORE_ASSET_FACTORY_ADDRESS);
    console.log('🏦 Fee Recipient:', FEE_RECIPIENT);
    
    // Get contract instances
    const TrustToken = await ethers.getContractFactory('TrustToken');
    const trustToken = TrustToken.attach(TRUST_TOKEN_ADDRESS);
    
    const CoreAssetFactory = await ethers.getContractFactory('CoreAssetFactory');
    const coreAssetFactory = CoreAssetFactory.attach(CORE_ASSET_FACTORY_ADDRESS);
    
    // Check TRUST token balance
    const trustBalance = await trustToken.balanceOf(deployer.address);
    console.log('💰 Deployer TRUST balance:', ethers.formatEther(trustBalance), 'TRUST');
    
    // Check fee recipient balance
    const feeRecipientBalance = await trustToken.balanceOf(FEE_RECIPIENT);
    console.log('🏦 Fee recipient TRUST balance:', ethers.formatEther(feeRecipientBalance), 'TRUST');
    
    // Check allowance
    const allowance = await trustToken.allowance(deployer.address, CORE_ASSET_FACTORY_ADDRESS);
    console.log('🔐 Allowance (Deployer -> CoreAssetFactory):', ethers.formatEther(allowance), 'TRUST');
    
    // Test TRUST token transfer first
    console.log('\n🧪 Testing TRUST token transfer...');
    
    try {
      // Test simple transfer
      const transferAmount = ethers.parseEther("1");
      console.log('📊 Testing transfer of', ethers.formatEther(transferAmount), 'TRUST to fee recipient...');
      
      const transferTx = await trustToken.transfer(FEE_RECIPIENT, transferAmount);
      console.log('📝 Transfer transaction:', transferTx.hash);
      
      const transferReceipt = await transferTx.wait();
      console.log('✅ Transfer confirmed in block:', transferReceipt.blockNumber);
      console.log('⛽ Gas used:', transferReceipt.gasUsed.toString());
      
    } catch (error) {
      console.log('❌ TRUST token transfer failed:', error.message);
      console.log('❌ Error data:', error.data);
      return;
    }
    
    // Test transferFrom
    console.log('\n🧪 Testing transferFrom...');
    
    try {
      // First approve the CoreAssetFactory
      const approveAmount = ethers.parseEther("10");
      console.log('📊 Approving', ethers.formatEther(approveAmount), 'TRUST for CoreAssetFactory...');
      
      const approveTx = await trustToken.approve(CORE_ASSET_FACTORY_ADDRESS, approveAmount);
      console.log('📝 Approve transaction:', approveTx.hash);
      
      const approveReceipt = await approveTx.wait();
      console.log('✅ Approve confirmed in block:', approveReceipt.blockNumber);
      
      // Now test transferFrom
      const transferFromAmount = ethers.parseEther("5");
      console.log('📊 Testing transferFrom of', ethers.formatEther(transferFromAmount), 'TRUST...');
      
      const transferFromTx = await trustToken.transferFrom(
        deployer.address,
        FEE_RECIPIENT,
        transferFromAmount
      );
      console.log('📝 TransferFrom transaction:', transferFromTx.hash);
      
      const transferFromReceipt = await transferFromTx.wait();
      console.log('✅ TransferFrom confirmed in block:', transferFromReceipt.blockNumber);
      console.log('⛽ Gas used:', transferFromReceipt.gasUsed.toString());
      
    } catch (error) {
      console.log('❌ transferFrom failed:', error.message);
      console.log('❌ Error data:', error.data);
      return;
    }
    
    // Test digital asset creation
    console.log('\n🧪 Testing digital asset creation...');
    
    try {
      // Check if CoreAssetFactory is paused
      const isPaused = await coreAssetFactory.paused();
      console.log('⏸️ CoreAssetFactory paused:', isPaused);
      
      if (isPaused) {
        console.log('❌ CoreAssetFactory is paused, cannot create assets');
        return;
      }
      
      // Test gas estimation first
      console.log('🧪 Testing gas estimation for createDigitalAsset...');
      
      const gasEstimate = await coreAssetFactory.createDigitalAsset.estimateGas(
        6, // category (DIGITAL_ART)
        "test-asset", // assetTypeString
        "Test Digital Asset", // name
        "Blockchain", // location
        ethers.parseEther("1000"), // totalValue
        "https://test.com/image.jpg", // imageURI
        "Test description" // description
      );
      console.log('✅ Gas estimate:', gasEstimate.toString());
      
      // Now try to create the digital asset
      console.log('📊 Creating digital asset...');
      
      const createTx = await coreAssetFactory.createDigitalAsset(
        6, // category (DIGITAL_ART)
        "test-asset", // assetTypeString
        "Test Digital Asset", // name
        "Blockchain", // location
        ethers.parseEther("1000"), // totalValue
        "https://test.com/image.jpg", // imageURI
        "Test description" // description
      );
      
      console.log('📝 Create transaction:', createTx.hash);
      
      const createReceipt = await createTx.wait();
      console.log('✅ Digital asset created in block:', createReceipt.blockNumber);
      console.log('⛽ Gas used:', createReceipt.gasUsed.toString());
      
      // Check if we can get the asset ID from events
      const events = createReceipt.logs;
      console.log('📋 Events emitted:', events.length);
      
      for (let i = 0; i < events.length; i++) {
        console.log(`Event ${i}:`, events[i].topics[0]);
      }
      
    } catch (error) {
      console.log('❌ Digital asset creation failed:', error.message);
      console.log('❌ Error data:', error.data);
      console.log('❌ Error code:', error.code);
    }
    
  } catch (error) {
    console.error('❌ Error in test:', error);
  }
}

// Run the test
testDigitalAssetCreation()
  .then(() => {
    console.log('🏁 Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
