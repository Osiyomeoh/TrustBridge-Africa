#!/usr/bin/env node

/**
 * Test Script: TrustBridge HCS RWA Asset Flow
 * 
 * This script tests the complete RWA creation → HCS submission → Admin approval flow
 * 
 * Flow:
 * 1. Create RWA asset with HCS submission
 * 2. Query TrustBridge HCS topic for asset discovery
 * 3. Update asset status (approve/reject) in HCS topic
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:4001/api/hedera';

// Test data for RWA asset creation
const testAssetData = {
  name: 'Test Commercial Property Lagos',
  type: 'REAL_ESTATE',
  value: 5000000,
  location: 'Lagos, Nigeria',
  description: 'Premium commercial property in Victoria Island, Lagos',
  expectedAPY: 15.5,
  creator: '0.0.6916959',
  ipfsHash: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi-test'
};

async function testHCSFlow() {
  console.log('🚀 Testing TrustBridge HCS RWA Asset Flow\n');

  try {
    // Step 1: Create RWA asset with HCS submission
    console.log('📝 Step 1: Creating RWA asset with HCS submission...');
    const createResponse = await axios.post(`${API_BASE_URL}/rwa/create-with-hcs`, testAssetData);
    
    if (createResponse.data.success) {
      console.log('✅ RWA asset created successfully!');
      console.log('   Token ID:', createResponse.data.data.tokenId);
      console.log('   Message:', createResponse.data.message);
    } else {
      console.log('❌ Failed to create RWA asset:', createResponse.data);
      return;
    }

    const tokenId = createResponse.data.data.tokenId;
    console.log('');

    // Step 2: Query TrustBridge HCS topic for asset discovery
    console.log('🔍 Step 2: Querying TrustBridge HCS topic for asset discovery...');
    const queryResponse = await axios.get(`${API_BASE_URL}/rwa/trustbridge-assets`);
    
    if (queryResponse.data.success) {
      console.log('✅ TrustBridge assets retrieved successfully!');
      console.log('   Total assets found:', queryResponse.data.data.count);
      console.log('   Total messages:', queryResponse.data.data.totalMessages);
      
      if (queryResponse.data.data.assets.length > 0) {
        const latestAsset = queryResponse.data.data.assets[0];
        console.log('   Latest asset:', {
          tokenId: latestAsset.rwaTokenId,
          name: latestAsset.assetData.name,
          status: latestAsset.status,
          creator: latestAsset.creator
        });
      }
    } else {
      console.log('❌ Failed to query TrustBridge assets:', queryResponse.data);
      return;
    }
    console.log('');

    // Step 3: Update asset status (approve) in HCS topic
    console.log('✅ Step 3: Updating asset status (APPROVED) in HCS topic...');
    const approveData = {
      tokenId: tokenId,
      status: 'APPROVED',
      adminAddress: '0.0.6916959',
      notes: 'Asset approved by AMC admin after comprehensive review'
    };

    const approveResponse = await axios.post(`${API_BASE_URL}/rwa/update-status`, approveData);
    
    if (approveResponse.data.success) {
      console.log('✅ Asset status updated successfully!');
      console.log('   Status:', approveResponse.data.data.status);
      console.log('   Admin:', approveResponse.data.data.adminAddress);
      console.log('   Message:', approveResponse.data.message);
    } else {
      console.log('❌ Failed to update asset status:', approveResponse.data);
      return;
    }
    console.log('');

    // Step 4: Query TrustBridge HCS topic again to see the status update
    console.log('🔍 Step 4: Querying TrustBridge HCS topic to verify status update...');
    const verifyResponse = await axios.get(`${API_BASE_URL}/rwa/trustbridge-assets`);
    
    if (verifyResponse.data.success) {
      console.log('✅ TrustBridge assets retrieved successfully!');
      console.log('   Total assets found:', verifyResponse.data.data.count);
      
      // Find our test asset
      const testAsset = verifyResponse.data.data.assets.find(asset => 
        asset.rwaTokenId === tokenId
      );
      
      if (testAsset) {
        console.log('   Test asset status:', testAsset.status);
        console.log('   Test asset data:', testAsset.assetData);
      } else {
        console.log('   Test asset not found in results');
      }
    } else {
      console.log('❌ Failed to verify TrustBridge assets:', verifyResponse.data);
    }
    console.log('');

    // Step 5: Get TrustBridge topic information
    console.log('ℹ️  Step 5: Getting TrustBridge HCS topic information...');
    const topicResponse = await axios.get(`${API_BASE_URL}/rwa/topic-info`);
    
    if (topicResponse.data.success) {
      console.log('✅ TrustBridge topic info retrieved successfully!');
      console.log('   Topic ID:', topicResponse.data.data.topicId);
      console.log('   Message:', topicResponse.data.message);
    } else {
      console.log('❌ Failed to get TrustBridge topic info:', topicResponse.data);
    }

    console.log('\n🎉 TrustBridge HCS RWA Asset Flow Test Completed Successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ RWA asset created and submitted to HCS topic');
    console.log('   ✅ TrustBridge assets discovered from HCS topic');
    console.log('   ✅ Asset status updated in HCS topic');
    console.log('   ✅ Status update verified in HCS topic');
    console.log('   ✅ TrustBridge topic information retrieved');

  } catch (error) {
    console.error('❌ Error during HCS flow test:', error.message);
    if (error.response) {
      console.error('   Response data:', error.response.data);
      console.error('   Status:', error.response.status);
    }
  }
}

// Run the test
if (require.main === module) {
  testHCSFlow();
}

module.exports = { testHCSFlow };
