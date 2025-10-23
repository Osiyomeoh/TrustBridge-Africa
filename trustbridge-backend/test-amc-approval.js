// Test script for AMC approval and rejection functionality
const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = process.env.API_URL || 'http://localhost:4001';

const testAMCApproval = async () => {
  console.log('🔧 Testing AMC Approval and Rejection Flow...');
  
  try {
    // Test 1: Get current RWA assets
    console.log('\n📊 Step 1: Fetching current RWA assets...');
    const assetsResponse = await axios.get(`${API_BASE_URL}/api/hedera/rwa/trustbridge-assets`);
    
    if (assetsResponse.data.success && assetsResponse.data.data.length > 0) {
      const assets = assetsResponse.data.data;
      console.log(`✅ Found ${assets.length} RWA assets`);
      
      // Find a pending asset to test with
      const pendingAsset = assets.find(asset => asset.status === 'SUBMITTED_FOR_APPROVAL' || asset.status === 'PENDING');
      
      if (pendingAsset) {
        console.log(`🎯 Testing with asset: ${pendingAsset.assetId} (${pendingAsset.name})`);
        
        // Test 2: Approve the asset
        console.log('\n📊 Step 2: Testing asset approval...');
        const approveData = {
          tokenId: pendingAsset.assetId,
          status: 'APPROVED',
          adminAddress: '0.0.6916959', // Admin account
          notes: 'Asset approved by AMC after thorough review'
        };
        
        const approveResponse = await axios.post(`${API_BASE_URL}/api/hedera/rwa/update-status`, approveData);
        
        if (approveResponse.data.success) {
          console.log('✅ Asset approval successful!');
          console.log('📊 Approval Response:', approveResponse.data);
        } else {
          console.log('❌ Asset approval failed:', approveResponse.data);
        }
        
        // Wait a moment before testing rejection
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Test 3: Reject the asset (if we want to test both)
        console.log('\n📊 Step 3: Testing asset rejection...');
        const rejectData = {
          tokenId: pendingAsset.assetId,
          status: 'REJECTED',
          adminAddress: '0.0.6916959', // Admin account
          notes: 'Asset rejected due to insufficient documentation'
        };
        
        const rejectResponse = await axios.post(`${API_BASE_URL}/api/hedera/rwa/update-status`, rejectData);
        
        if (rejectResponse.data.success) {
          console.log('✅ Asset rejection successful!');
          console.log('📊 Rejection Response:', rejectResponse.data);
        } else {
          console.log('❌ Asset rejection failed:', rejectResponse.data);
        }
        
        // Test 4: Verify status update
        console.log('\n📊 Step 4: Verifying status update...');
        const updatedAssetsResponse = await axios.get(`${API_BASE_URL}/api/hedera/rwa/trustbridge-assets`);
        
        if (updatedAssetsResponse.data.success) {
          const updatedAssets = updatedAssetsResponse.data.data;
          const updatedAsset = updatedAssets.find(asset => asset.assetId === pendingAsset.assetId);
          
          if (updatedAsset) {
            console.log(`✅ Asset status updated: ${updatedAsset.status}`);
            console.log('📊 Updated Asset:', {
              assetId: updatedAsset.assetId,
              name: updatedAsset.name,
              status: updatedAsset.status,
              admin: updatedAsset.admin,
              notes: updatedAsset.notes
            });
          } else {
            console.log('❌ Could not find updated asset');
          }
        }
        
      } else {
        console.log('⚠️ No pending assets found to test with');
        console.log('📊 Available assets:', assets.map(asset => ({
          assetId: asset.assetId,
          name: asset.name,
          status: asset.status
        })));
      }
      
    } else {
      console.log('❌ No RWA assets found or API error');
      console.log('📊 Response:', assetsResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Error testing AMC approval:', error.response?.data || error.message);
  }
};

// Run the test
testAMCApproval()
  .then(() => {
    console.log('\n🎉 AMC Approval Test Complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
