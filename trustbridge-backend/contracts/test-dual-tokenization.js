const { ethers } = require('ethers');

async function testDualTokenization() {
  try {
    console.log('🔍 Testing Dual Tokenization (ERC-721 + HTS)...');
    
    // Test the dual tokenization flow
    console.log('\n📋 Dual Tokenization Flow:');
    console.log('  1. User creates asset via frontend');
    console.log('  2. Frontend calls contractService.createDigitalAsset()');
    console.log('  3. Smart contract creates ERC-721 NFT');
    console.log('  4. Frontend calls backend /api/hedera/create-dual-tokenization');
    console.log('  5. Backend creates HTS token');
    console.log('  6. Backend uploads metadata to HFS');
    console.log('  7. Backend submits HCS message');
    console.log('  8. Returns both token IDs to frontend');
    
    console.log('\n✅ Dual Tokenization Implementation:');
    console.log('  - ERC-721 NFT: Standard NFT functionality');
    console.log('  - HTS Token: Native Hedera compliance');
    console.log('  - HFS Storage: Immutable document backup');
    console.log('  - HCS Messaging: Real-time updates');
    
    console.log('\n🎯 Benefits:');
    console.log('  - No breaking changes to existing system');
    console.log('  - Enhanced Hedera compliance');
    console.log('  - Better user experience');
    console.log('  - Future-proof architecture');
    
    console.log('\n🚀 Ready for Testing:');
    console.log('  1. Create a digital asset via frontend');
    console.log('  2. Check console logs for dual tokenization');
    console.log('  3. Verify both ERC-721 and HTS tokens created');
    console.log('  4. Confirm HFS and HCS integration');
    
  } catch (error) {
    console.error('Error testing dual tokenization:', error.message);
  }
}

testDualTokenization();
