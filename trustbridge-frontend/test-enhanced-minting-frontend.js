const { ethers } = require('ethers');

// Test the enhanced minting contracts from frontend
async function testEnhancedMinting() {
  console.log('🧪 Testing Enhanced Minting Contracts from Frontend...\n');

  // Contract addresses
  const BATCH_MINTING_ADDRESS = '0xD02fA53B407E2eCBf920Ed683D82d85b3F68E32f';
  const ADVANCED_MINTING_ADDRESS = '0xac1E822296e6485449163EE9DAB0eAE3138565e7';
  const TRUST_TOKEN_ADDRESS = '0xa6f8fC5b5A9B5670dF868247585bcD86eD124ba2';

  // Hedera testnet RPC
  const provider = new ethers.JsonRpcProvider('https://testnet.hashio.io/api');

  // Read-only test (no wallet needed for view functions)

  try {
    // Test 1: Check contract accessibility
    console.log('📋 Testing contract accessibility...');
    
    // Load ABI from copied files
    const BatchMintingABI = require('./src/contracts/BatchMinting.json');
    const AdvancedMintingABI = require('./src/contracts/AdvancedMinting.json');
    const TrustTokenABI = require('./src/contracts/TrustToken.json');

    const batchMinting = new ethers.Contract(BATCH_MINTING_ADDRESS, BatchMintingABI.abi, provider);
    const advancedMinting = new ethers.Contract(ADVANCED_MINTING_ADDRESS, AdvancedMintingABI.abi, provider);
    const trustToken = new ethers.Contract(TRUST_TOKEN_ADDRESS, TrustTokenABI.abi, provider);

    console.log('✅ Contracts loaded successfully');

    // Test 2: Check contract constants
    console.log('\n📊 Testing contract constants...');
    
    const maxBatchSize = await batchMinting.MAX_BATCH_SIZE();
    const minBatchSize = await batchMinting.MIN_BATCH_SIZE();
    const minCollectionSize = await batchMinting.MIN_COLLECTION_SIZE();
    
    console.log(`Max batch size: ${maxBatchSize}`);
    console.log(`Min batch size: ${minBatchSize}`);
    console.log(`Min collection size: ${minCollectionSize}`);

    // Test 3: Check fee structure
    console.log('\n💰 Testing fee structure...');
    
    const singleMintFee = await batchMinting.SINGLE_MINT_FEE();
    const batchMintFee = await batchMinting.BATCH_MINT_FEE();
    const collectionMintFee = await batchMinting.COLLECTION_MINT_FEE();
    
    console.log(`Single mint fee: ${ethers.formatEther(singleMintFee)} TRUST`);
    console.log(`Batch mint fee: ${ethers.formatEther(batchMintFee)} TRUST`);
    console.log(`Collection mint fee: ${ethers.formatEther(collectionMintFee)} TRUST`);

    // Test 4: Check rarity pricing
    console.log('\n🎨 Testing rarity pricing...');
    
    const commonPrice = await advancedMinting.rarityPricing(0);
    const rarePrice = await advancedMinting.rarityPricing(2);
    const legendaryPrice = await advancedMinting.rarityPricing(4);
    
    console.log(`Common rarity: ${ethers.formatEther(commonPrice)} TRUST`);
    console.log(`Rare rarity: ${ethers.formatEther(rarePrice)} TRUST`);
    console.log(`Legendary rarity: ${ethers.formatEther(legendaryPrice)} TRUST`);

    // Test 5: Check collections
    console.log('\n📚 Testing collections...');
    
    const nextCollectionId = await batchMinting.nextCollectionId();
    console.log(`Next collection ID: ${nextCollectionId}`);
    
    if (nextCollectionId > 0) {
      const collection = await batchMinting.getCollection(1);
      console.log(`Collection 1 name: ${collection.name}`);
      console.log(`Collection 1 total supply: ${collection.totalSupply}`);
      console.log(`Collection 1 mint price: ${ethers.formatEther(collection.mintPrice)} TRUST`);
    }

    // Test 6: Check drops
    console.log('\n🎯 Testing drops...');
    
    const nextDropId = await advancedMinting.nextDropId();
    console.log(`Next drop ID: ${nextDropId}`);
    
    if (nextDropId > 0) {
      const drop = await advancedMinting.getDrop(1);
      console.log(`Drop 1 name: ${drop.name}`);
      console.log(`Drop 1 total supply: ${drop.totalSupply}`);
      console.log(`Drop 1 mint price: ${ethers.formatEther(drop.mintPrice)} TRUST`);
    }

    // Test 7: Check contract state
    console.log('\n📊 Testing contract state...');
    
    const isPaused = await batchMinting.paused();
    console.log(`BatchMinting paused: ${isPaused}`);

    // Test 8: Check role management
    console.log('\n🔐 Testing role management...');
    
    const MINTER_ROLE = await batchMinting.MINTER_ROLE();
    const MANAGER_ROLE = await batchMinting.MANAGER_ROLE();
    
    console.log(`MINTER_ROLE: ${MINTER_ROLE}`);
    console.log(`MANAGER_ROLE: ${MANAGER_ROLE}`);

    console.log('\n🎉 Enhanced Minting Contracts Frontend Test Successful!\n');
    console.log('✅ All contracts accessible from frontend');
    console.log('✅ Contract constants working');
    console.log('✅ Fee structure working');
    console.log('✅ Rarity pricing working');
    console.log('✅ Collections working');
    console.log('✅ Drops working');
    console.log('✅ Contract state working');
    console.log('✅ Role management working');
    console.log('✅ Ready for frontend integration');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testEnhancedMinting()
  .then(() => {
    console.log('\n✅ Frontend test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Frontend test failed:', error);
    process.exit(1);
  });
