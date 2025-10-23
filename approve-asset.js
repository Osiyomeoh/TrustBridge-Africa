const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:4001';
const ASSET_ID = 'your-asset-id-here'; // Replace with actual asset ID
const ADMIN_TOKEN = 'your-jwt-token-here'; // Replace with your admin JWT token

async function approveAsset() {
  try {
    console.log('🚀 Starting asset approval process...');
    
    // Step 1: Get asset details
    console.log('\n📋 Step 1: Fetching asset details...');
    const assetResponse = await axios.get(`${BASE_URL}/api/assets/${ASSET_ID}`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    const asset = assetResponse.data;
    console.log('Asset found:', {
      id: asset.assetId,
      name: asset.name,
      status: asset.status,
      type: asset.type,
      value: asset.totalValue
    });
    
    // Step 2: Check if asset is ready for approval
    if (asset.status !== 'PENDING' && asset.status !== 'PENDING_INSPECTION') {
      console.log('❌ Asset is not in a state that can be approved. Current status:', asset.status);
      return;
    }
    
    // Step 3: Approve the asset
    console.log('\n✅ Step 2: Approving asset...');
    const approvalData = {
      assetId: ASSET_ID,
      approved: true,
      comments: 'Asset approved by AMC admin after physical inspection',
      verificationScore: 85, // Set appropriate score
      amcApprovalDate: new Date().toISOString()
    };
    
    const approvalResponse = await axios.post(`${BASE_URL}/api/admin/approve-asset`, approvalData, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Asset approved successfully!');
    console.log('Approval details:', approvalResponse.data);
    
    // Step 4: Verify the approval
    console.log('\n🔍 Step 3: Verifying approval...');
    const updatedAssetResponse = await axios.get(`${BASE_URL}/api/assets/${ASSET_ID}`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    const updatedAsset = updatedAssetResponse.data;
    console.log('Updated asset status:', updatedAsset.status);
    
  } catch (error) {
    console.error('❌ Error approving asset:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Authentication Error:');
      console.log('1. Make sure you have a valid JWT token');
      console.log('2. Ensure your account has AMC admin privileges');
      console.log('3. Check if the token has expired');
    } else if (error.response?.status === 404) {
      console.log('\n💡 Asset Not Found:');
      console.log('1. Verify the asset ID is correct');
      console.log('2. Check if the asset exists in the database');
    }
  }
}

// Alternative: List all pending assets first
async function listPendingAssets() {
  try {
    console.log('📋 Fetching all pending assets...');
    
    const response = await axios.get(`${BASE_URL}/api/assets?status=PENDING`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    const assets = response.data;
    console.log(`Found ${assets.length} pending assets:`);
    
    assets.forEach((asset, index) => {
      console.log(`${index + 1}. ${asset.name} (${asset.assetId})`);
      console.log(`   Type: ${asset.type}`);
      console.log(`   Value: $${asset.totalValue}`);
      console.log(`   Status: ${asset.status}`);
      console.log('   ---');
    });
    
  } catch (error) {
    console.error('❌ Error fetching assets:', error.response?.data || error.message);
  }
}

// Run the functions
console.log('🔧 Asset Approval Tool');
console.log('====================');
console.log('Before running, make sure to:');
console.log('1. Replace ASSET_ID with the actual asset ID');
console.log('2. Replace ADMIN_TOKEN with your JWT token');
console.log('3. Ensure the backend is running on port 4001');
console.log('');

// Uncomment the function you want to run:
// listPendingAssets(); // List all pending assets
// approveAsset(); // Approve a specific asset
