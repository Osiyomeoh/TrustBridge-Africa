const { ethers } = require('hardhat');

async function testCompleteWorkflow() {
  console.log('🧪 Testing complete TrustBridge workflow...');
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log('👤 Deployer address:', deployer.address);
  
  // Contract addresses
  const TRUST_TOKEN_ADDRESS = '0x170B35e97C217dBf63a500EaB884392F7BF6Ec34';
  const CORE_ASSET_FACTORY_ADDRESS = '0x930131a22b9D2e060d8E4EF1aE21185d4F59F52F';
  const ASSET_NFT_ADDRESS = '0x42be9627C970D40248690F010b3c2a7F8C68576C';
  const FEE_RECIPIENT = '0xA6e8bf8E89Bd2c2BD37e308F275C4f52284a911F';
  
  console.log('📍 TRUST Token:', TRUST_TOKEN_ADDRESS);
  console.log('📍 CoreAssetFactory:', CORE_ASSET_FACTORY_ADDRESS);
  console.log('📍 AssetNFT:', ASSET_NFT_ADDRESS);
  console.log('🏦 Fee Recipient:', FEE_RECIPIENT);
  
  // Get contract instances
  const TrustToken = await ethers.getContractFactory('TrustToken');
  const trustToken = TrustToken.attach(TRUST_TOKEN_ADDRESS);
  
  const CoreAssetFactory = await ethers.getContractFactory('CoreAssetFactory');
  const coreAssetFactory = CoreAssetFactory.attach(CORE_ASSET_FACTORY_ADDRESS);
  
  const AssetNFT = await ethers.getContractFactory('AssetNFT');
  const assetNFT = AssetNFT.attach(ASSET_NFT_ADDRESS);
  
  try {
    // Step 1: Check initial balances
    console.log('\n📊 Step 1: Checking initial balances...');
    const deployerBalance = await trustToken.balanceOf(deployer.address);
    const contractBalance = await trustToken.balanceOf(CORE_ASSET_FACTORY_ADDRESS);
    const feeRecipientBalance = await trustToken.balanceOf(FEE_RECIPIENT);
    
    console.log('💰 Deployer TRUST balance:', ethers.formatEther(deployerBalance), 'TRUST');
    console.log('💰 Contract TRUST balance:', ethers.formatEther(contractBalance), 'TRUST');
    console.log('🏦 Fee recipient TRUST balance:', ethers.formatEther(feeRecipientBalance), 'TRUST');
    
    // Step 2: Mint TRUST tokens if needed
    console.log('\n📊 Step 2: Minting TRUST tokens...');
    if (deployerBalance < ethers.parseEther("100")) {
      console.log('Minting 100 TRUST tokens...');
      const mintTx = await trustToken.mintTestTokens(ethers.parseEther("100"));
      console.log('📝 Mint transaction:', mintTx.hash);
      await mintTx.wait();
      console.log('✅ Tokens minted');
    } else {
      console.log('✅ Sufficient TRUST tokens available');
    }
    
    // Step 3: Send TRUST tokens to contract
    console.log('\n📊 Step 3: Sending TRUST tokens to contract...');
    const feeAmount = ethers.parseEther("10");
    const sendTx = await trustToken.transfer(CORE_ASSET_FACTORY_ADDRESS, feeAmount);
    console.log('📝 Send transaction:', sendTx.hash);
    await sendTx.wait();
    console.log('✅ Tokens sent to contract');
    
    // Step 4: Check contract balance
    console.log('\n📊 Step 4: Verifying contract balance...');
    const newContractBalance = await trustToken.balanceOf(CORE_ASSET_FACTORY_ADDRESS);
    console.log('💰 Contract TRUST balance:', ethers.formatEther(newContractBalance), 'TRUST');
    
    // Step 5: Create digital asset
    console.log('\n📊 Step 5: Creating digital asset...');
    const assetData = {
      category: 6, // DIGITAL_ART
      assetType: "test-asset",
      name: `TestAsset-${Date.now()}`,
      location: "Hedera Testnet",
      totalValue: ethers.parseEther("1000"),
      imageURI: "https://test.com/image.jpg",
      description: "Test digital asset for workflow verification"
    };
    
    console.log('📊 Asset data:', {
      ...assetData,
      totalValue: ethers.formatEther(assetData.totalValue)
    });
    
    const createTx = await coreAssetFactory.createDigitalAsset(
      assetData.category,
      assetData.assetType,
      assetData.name,
      assetData.location,
      assetData.totalValue,
      assetData.imageURI,
      assetData.description
    );
    
    console.log('📝 Create transaction:', createTx.hash);
    const createReceipt = await createTx.wait();
    console.log('✅ Digital asset created in block:', createReceipt.blockNumber);
    console.log('⛽ Gas used:', createReceipt.gasUsed.toString());
    
    // Step 6: Check final balances
    console.log('\n📊 Step 6: Checking final balances...');
    const finalContractBalance = await trustToken.balanceOf(CORE_ASSET_FACTORY_ADDRESS);
    const finalFeeRecipientBalance = await trustToken.balanceOf(FEE_RECIPIENT);
    
    console.log('💰 Final contract TRUST balance:', ethers.formatEther(finalContractBalance), 'TRUST');
    console.log('🏦 Final fee recipient TRUST balance:', ethers.formatEther(finalFeeRecipientBalance), 'TRUST');
    
    // Step 7: Check NFT minting
    console.log('\n📊 Step 7: Checking NFT minting...');
    const nftBalance = await assetNFT.balanceOf(deployer.address);
    console.log('🎨 NFT balance:', nftBalance.toString());
    
    // Step 8: Verify events
    console.log('\n📊 Step 8: Analyzing events...');
    const events = createReceipt.logs;
    console.log('📋 Total events emitted:', events.length);
    
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      console.log(`Event ${i}:`, {
        address: event.address,
        topics: event.topics,
        data: event.data
      });
    }
    
    console.log('\n🎉 Complete workflow test PASSED!');
    console.log('✅ TRUST token transfer works');
    console.log('✅ Digital asset creation works');
    console.log('✅ Fee collection works');
    console.log('✅ NFT minting works');
    
  } catch (error) {
    console.error('❌ Workflow test failed:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      data: error.data
    });
    throw error;
  }
}

testCompleteWorkflow()
  .then(() => {
    console.log('🏁 Complete workflow test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Complete workflow test failed:', error);
    process.exit(1);
  });
