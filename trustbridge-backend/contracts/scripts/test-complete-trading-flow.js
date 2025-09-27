const { ethers } = require('hardhat');

async function testCompleteTradingFlow() {
  console.log('🧪 Testing complete trading flow...');
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log('👤 Deployer address:', deployer.address);
  
  // Contract addresses
  const TRUST_TOKEN_ADDRESS = '0x170B35e97C217dBf63a500EaB884392F7BF6Ec34';
  const CORE_ASSET_FACTORY_ADDRESS = '0x930131a22b9D2e060d8E4EF1aE21185d4F59F52F';
  const ASSET_NFT_ADDRESS = '0x42be9627C970D40248690F010b3c2a7F8C68576C';
  const TRUST_MARKETPLACE_ADDRESS = '0x44C2e6BCAc1E91e3107616F4D0e03692fb853610';
  const FEE_RECIPIENT = '0xA6e8bf8E89Bd2c2BD37e308F275C4f52284a911F';
  
  console.log('📍 TRUST Token:', TRUST_TOKEN_ADDRESS);
  console.log('📍 CoreAssetFactory:', CORE_ASSET_FACTORY_ADDRESS);
  console.log('📍 AssetNFT:', ASSET_NFT_ADDRESS);
  console.log('📍 TRUSTMarketplace:', TRUST_MARKETPLACE_ADDRESS);
  console.log('🏦 Fee Recipient:', FEE_RECIPIENT);
  
  // Get contract instances
  const TrustToken = await ethers.getContractFactory('TrustToken');
  const trustToken = TrustToken.attach(TRUST_TOKEN_ADDRESS);
  
  const CoreAssetFactory = await ethers.getContractFactory('CoreAssetFactory');
  const coreAssetFactory = CoreAssetFactory.attach(CORE_ASSET_FACTORY_ADDRESS);
  
  const AssetNFT = await ethers.getContractFactory('AssetNFT');
  const assetNFT = AssetNFT.attach(ASSET_NFT_ADDRESS);
  
  const TrustMarketplace = await ethers.getContractFactory('TRUSTMarketplace');
  const trustMarketplace = TrustMarketplace.attach(TRUST_MARKETPLACE_ADDRESS);
  
  try {
    // Step 1: Check initial balances
    console.log('\n📊 Step 1: Checking initial balances...');
    const deployerBalance = await trustToken.balanceOf(deployer.address);
    const contractBalance = await trustToken.balanceOf(CORE_ASSET_FACTORY_ADDRESS);
    const nftBalance = await assetNFT.balanceOf(deployer.address);
    
    console.log('💰 Deployer TRUST balance:', ethers.formatEther(deployerBalance), 'TRUST');
    console.log('💰 Contract TRUST balance:', ethers.formatEther(contractBalance), 'TRUST');
    console.log('🎨 Deployer NFT balance:', nftBalance.toString());
    
    // Step 2: Send TRUST tokens to contract for asset creation
    console.log('\n📊 Step 2: Sending TRUST tokens to contract...');
    const feeAmount = ethers.parseEther("10");
    const sendTx = await trustToken.transfer(CORE_ASSET_FACTORY_ADDRESS, feeAmount);
    console.log('📝 Send transaction:', sendTx.hash);
    await sendTx.wait();
    console.log('✅ Tokens sent to contract');
    
    // Step 3: Create digital asset
    console.log('\n📊 Step 3: Creating digital asset...');
    const assetData = {
      category: 6, // DIGITAL_ART
      assetType: "test-trading-asset",
      name: `TradingTestAsset-${Date.now()}`,
      location: "Hedera Testnet",
      totalValue: ethers.parseEther("1000"),
      imageURI: "https://test.com/trading-image.jpg",
      description: "Test digital asset for trading flow verification"
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
    
    // Step 4: Check NFT balance after creation
    console.log('\n📊 Step 4: Checking NFT balance after creation...');
    const newNftBalance = await assetNFT.balanceOf(deployer.address);
    console.log('🎨 New NFT balance:', newNftBalance.toString());
    
    if (newNftBalance === 0n) {
      throw new Error('No NFTs found after asset creation');
    }
    
    // Get the latest token ID
    const tokenId = newNftBalance - 1n;
    console.log('🎨 Latest token ID:', tokenId.toString());
    
    // Step 5: Check marketplace approval
    console.log('\n📊 Step 5: Checking marketplace approval...');
    const isApproved = await assetNFT.isApprovedForAll(deployer.address, TRUST_MARKETPLACE_ADDRESS);
    console.log('🔐 Marketplace approved for NFTs:', isApproved);
    
    if (!isApproved) {
      console.log('🔧 Approving marketplace for NFTs...');
      const approveTx = await assetNFT.setApprovalForAll(TRUST_MARKETPLACE_ADDRESS, true);
      console.log('📝 Approval transaction:', approveTx.hash);
      await approveTx.wait();
      console.log('✅ Marketplace approved for NFTs');
    } else {
      console.log('✅ Marketplace already approved for NFTs');
    }
    
    // Step 6: Create listing
    console.log('\n📊 Step 6: Creating marketplace listing...');
    const listingPrice = ethers.parseEther("1000");
    const listingDuration = 7 * 24 * 3600; // 7 days
    
    console.log('💰 Listing price:', ethers.formatEther(listingPrice), 'TRUST');
    console.log('⏰ Listing duration:', listingDuration, 'seconds');
    
    const listTx = await trustMarketplace.listAsset(
      ASSET_NFT_ADDRESS,
      tokenId,
      listingPrice,
      listingDuration
    );
    
    console.log('📝 List transaction:', listTx.hash);
    const listReceipt = await listTx.wait();
    console.log('✅ Listing created in block:', listReceipt.blockNumber);
    console.log('⛽ Gas used:', listReceipt.gasUsed.toString());
    
    // Step 7: Extract listing ID from events
    console.log('\n📊 Step 7: Extracting listing ID...');
    let listingId = '';
    if (listReceipt.logs && listReceipt.logs.length > 0) {
      for (const log of listReceipt.logs) {
        try {
          const parsedLog = trustMarketplace.interface.parseLog(log);
          if (parsedLog && parsedLog.name === 'AssetListed') {
            listingId = parsedLog.args[0].toString();
            break;
          }
        } catch (e) {
          // Continue to next log
        }
      }
    }
    
    if (!listingId) {
      listingId = listTx.hash;
      console.log('⚠️ Could not extract listing ID from events, using transaction hash');
    }
    
    console.log('✅ Listing ID:', listingId);
    
    // Step 8: Check final balances
    console.log('\n📊 Step 8: Checking final balances...');
    const finalContractBalance = await trustToken.balanceOf(CORE_ASSET_FACTORY_ADDRESS);
    const finalFeeRecipientBalance = await trustToken.balanceOf(FEE_RECIPIENT);
    
    console.log('💰 Final contract TRUST balance:', ethers.formatEther(finalContractBalance), 'TRUST');
    console.log('🏦 Final fee recipient TRUST balance:', ethers.formatEther(finalFeeRecipientBalance), 'TRUST');
    
    console.log('\n🎉 Complete trading flow test PASSED!');
    console.log('✅ Digital asset creation works');
    console.log('✅ NFT minting works');
    console.log('✅ Marketplace approval works');
    console.log('✅ Listing creation works');
    console.log('✅ All transactions completed successfully');
    
  } catch (error) {
    console.error('❌ Trading flow test failed:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      data: error.data
    });
    throw error;
  }
}

testCompleteTradingFlow()
  .then(() => {
    console.log('🏁 Complete trading flow test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Complete trading flow test failed:', error);
    process.exit(1);
  });
