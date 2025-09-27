const { ethers } = require('hardhat');

async function testTokenIdTracking() {
  console.log('🧪 Testing token ID tracking in asset creation...');
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log('👤 Deployer address:', deployer.address);
  
  // Contract addresses
  const TRUST_TOKEN_ADDRESS = '0x170B35e97C217dBf63a500EaB884392F7BF6Ec34';
  const CORE_ASSET_FACTORY_ADDRESS = '0x930131a22b9D2e060d8E4EF1aE21185d4F59F52F';
  const ASSET_NFT_ADDRESS = '0x42be9627C970D40248690F010b3c2a7F8C68576C';
  const TRUST_MARKETPLACE_ADDRESS = '0x44C2e6BCAc1E91e3107616F4D0e03692fb853610';
  
  console.log('📍 TRUST Token:', TRUST_TOKEN_ADDRESS);
  console.log('📍 CoreAssetFactory:', CORE_ASSET_FACTORY_ADDRESS);
  console.log('📍 AssetNFT:', ASSET_NFT_ADDRESS);
  console.log('📍 TRUSTMarketplace:', TRUST_MARKETPLACE_ADDRESS);
  
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
    // Step 1: Check initial NFT balance
    console.log('\n📊 Step 1: Checking initial NFT balance...');
    const initialBalance = await assetNFT.balanceOf(deployer.address);
    console.log('🎨 Initial NFT balance:', initialBalance.toString());
    
    // Step 2: Send TRUST tokens to contract
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
      assetType: "test-token-tracking",
      name: `TokenTrackingTest-${Date.now()}`,
      location: "Hedera Testnet",
      totalValue: ethers.parseEther("1000"),
      imageURI: "https://test.com/token-tracking.jpg",
      description: "Test digital asset for token ID tracking"
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
    
    // Step 4: Parse events to get token ID
    console.log('\n📊 Step 4: Parsing events for token ID...');
    let assetId = null;
    let tokenId = null;
    
    console.log('📋 Total events emitted:', createReceipt.logs.length);
    
    for (let i = 0; i < createReceipt.logs.length; i++) {
      const log = createReceipt.logs[i];
      console.log(`Event ${i}:`, {
        address: log.address,
        topics: log.topics,
        data: log.data
      });
      
      try {
        // Try to parse AssetCreated event
        const parsedLog = coreAssetFactory.interface.parseLog(log);
        if (parsedLog && parsedLog.name === 'AssetCreated') {
          assetId = parsedLog.args.assetId;
          console.log('✅ Found AssetCreated event, assetId:', assetId);
        }
      } catch (e) {
        // Continue parsing other logs
      }
      
      try {
        // Try to parse AssetMinted event
        const parsedLog = assetNFT.interface.parseLog(log);
        if (parsedLog && parsedLog.name === 'AssetMinted') {
          tokenId = parsedLog.args.tokenId.toString();
          console.log('✅ Found AssetMinted event, tokenId:', tokenId);
        }
      } catch (e) {
        // Continue parsing other logs
      }
    }
    
    // Step 5: Check NFT balance after creation
    console.log('\n📊 Step 5: Checking NFT balance after creation...');
    const newBalance = await assetNFT.balanceOf(deployer.address);
    console.log('🎨 New NFT balance:', newBalance.toString());
    
    if (newBalance > initialBalance) {
      console.log('✅ NFT balance increased by:', (newBalance - initialBalance).toString());
    }
    
    // Step 6: Verify ownership of the token
    if (tokenId) {
      console.log('\n📊 Step 6: Verifying ownership of token', tokenId);
      const tokenOwner = await assetNFT.ownerOf(tokenId);
      console.log('👤 Token owner:', tokenOwner);
      console.log('👤 Deployer address:', deployer.address);
      
      if (tokenOwner.toLowerCase() === deployer.address.toLowerCase()) {
        console.log('✅ Ownership verified!');
      } else {
        console.log('❌ Ownership verification failed!');
      }
    } else {
      console.log('⚠️ No token ID found in events');
    }
    
    // Step 7: Test listing with the token ID
    if (tokenId) {
      console.log('\n📊 Step 7: Testing listing with token ID', tokenId);
      
      // Approve marketplace
      const isApproved = await assetNFT.isApprovedForAll(deployer.address, TRUST_MARKETPLACE_ADDRESS);
      if (!isApproved) {
        console.log('🔧 Approving marketplace...');
        const approveTx = await assetNFT.setApprovalForAll(TRUST_MARKETPLACE_ADDRESS, true);
        await approveTx.wait();
        console.log('✅ Marketplace approved');
      }
      
      // Create listing
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
      
      // Extract listing ID
      let listingId = '';
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
      
      console.log('✅ Listing ID:', listingId || 'Not found in events');
    }
    
    console.log('\n🎉 Token ID tracking test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      data: error.data
    });
    throw error;
  }
}

testTokenIdTracking()
  .then(() => {
    console.log('🏁 Token ID tracking test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Token ID tracking test failed:', error);
    process.exit(1);
  });
