const { ethers } = require('hardhat');

async function testFixedContract() {
  try {
    console.log('🔍 Testing fixed CoreAssetFactory contract...');
    
    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log('👤 Deployer address:', deployer.address);
    
    // Contract addresses
    const TRUST_TOKEN_ADDRESS = '0x170B35e97C217dBf63a500EaB884392F7BF6Ec34';
    const CORE_ASSET_FACTORY_ADDRESS = '0x930131a22b9D2e060d8E4EF1aE21185d4F59F52F'; // New fixed contract
    const FEE_RECIPIENT = '0xA6e8bf8E89Bd2c2BD37e308F275C4f52284a911F';
    
    console.log('📍 TRUST Token:', TRUST_TOKEN_ADDRESS);
    console.log('📍 CoreAssetFactory (fixed):', CORE_ASSET_FACTORY_ADDRESS);
    console.log('🏦 Fee Recipient:', FEE_RECIPIENT);
    
    // Get contract instances
    const TrustToken = await ethers.getContractFactory('TrustToken');
    const trustToken = TrustToken.attach(TRUST_TOKEN_ADDRESS);
    
    const CoreAssetFactory = await ethers.getContractFactory('CoreAssetFactory');
    const coreAssetFactory = CoreAssetFactory.attach(CORE_ASSET_FACTORY_ADDRESS);
    
    // Check TRUST token balance
    const trustBalance = await trustToken.balanceOf(deployer.address);
    console.log('💰 Deployer TRUST balance:', ethers.formatEther(trustBalance), 'TRUST');
    
    // Check contract balance
    const contractBalance = await trustToken.balanceOf(CORE_ASSET_FACTORY_ADDRESS);
    console.log('💰 Contract TRUST balance:', ethers.formatEther(contractBalance), 'TRUST');
    
    // Step 1: Send TRUST tokens to the contract for fee payment
    console.log('\n🧪 Step 1: Sending TRUST tokens to contract...');
    
    const feeAmount = ethers.parseEther("10");
    console.log('📊 Sending', ethers.formatEther(feeAmount), 'TRUST to contract...');
    
    const sendTx = await trustToken.transfer(CORE_ASSET_FACTORY_ADDRESS, feeAmount);
    console.log('📝 Send transaction:', sendTx.hash);
    
    const sendReceipt = await sendTx.wait();
    console.log('✅ Send confirmed in block:', sendReceipt.blockNumber);
    
    // Check contract balance after sending
    const newContractBalance = await trustToken.balanceOf(CORE_ASSET_FACTORY_ADDRESS);
    console.log('💰 Contract TRUST balance after sending:', ethers.formatEther(newContractBalance), 'TRUST');
    
    // Step 2: Test digital asset creation
    console.log('\n🧪 Step 2: Testing digital asset creation...');
    
    try {
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
      
      // Check contract balance after creation
      const finalContractBalance = await trustToken.balanceOf(CORE_ASSET_FACTORY_ADDRESS);
      console.log('💰 Contract TRUST balance after creation:', ethers.formatEther(finalContractBalance), 'TRUST');
      
      // Check fee recipient balance
      const feeRecipientBalance = await trustToken.balanceOf(FEE_RECIPIENT);
      console.log('🏦 Fee recipient TRUST balance:', ethers.formatEther(feeRecipientBalance), 'TRUST');
      
    } catch (error) {
      console.log('❌ Digital asset creation failed:', error.message);
      console.log('❌ Error data:', error.data);
    }
    
  } catch (error) {
    console.error('❌ Error in test:', error);
  }
}

// Run the test
testFixedContract()
  .then(() => {
    console.log('🏁 Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
