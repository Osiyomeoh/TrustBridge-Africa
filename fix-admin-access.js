const axios = require('axios');

const BASE_URL = 'http://localhost:4001';

// Replace with your actual wallet address
const YOUR_WALLET_ADDRESS = '0x1234567890123456789012345678901234567890'; // Update this!

async function fixAdminAccess() {
  try {
    console.log('🔧 Fixing admin access...');
    console.log(`Wallet: ${YOUR_WALLET_ADDRESS}`);
    
    // Step 1: Check if backend is running
    try {
      const healthResponse = await axios.get(`${BASE_URL}/api/health`);
      console.log('✅ Backend is running');
    } catch (error) {
      console.log('❌ Backend is not running on port 4001');
      console.log('Please start the backend first: cd trustbridge-backend && npm run start:dev');
      return;
    }
    
    // Step 2: Try to get your user info (this might fail if not authenticated)
    console.log('\n📋 Step 1: Checking user authentication...');
    
    // First, let's try to create a super admin directly via the database
    console.log('\n📋 Step 2: Creating super admin user...');
    
    const userData = {
      walletAddress: YOUR_WALLET_ADDRESS,
      email: 'admin@trustbridge.com',
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      isActive: true,
      kycStatus: 'approved',
      emailVerificationStatus: 'verified'
    };
    
    try {
      // Try to create/update user directly via a simple endpoint
      const response = await axios.post(`${BASE_URL}/api/auth/register`, userData);
      console.log('✅ User created/updated successfully');
    } catch (error) {
      console.log('⚠️  Could not create user via API:', error.response?.data?.message || error.message);
    }
    
    // Step 3: Test admin status endpoint
    console.log('\n📋 Step 3: Testing admin status...');
    
    try {
      const response = await axios.get(`${BASE_URL}/api/admin/status`, {
        headers: {
          'Authorization': 'Bearer test-token' // This will fail, but we can see the response
        }
      });
      console.log('Admin status response:', response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Admin endpoint exists (authentication required)');
      } else {
        console.log('❌ Admin endpoint error:', error.response?.data || error.message);
      }
    }
    
    console.log('\n🎯 SOLUTION STEPS:');
    console.log('1. Make sure you are logged in to the frontend');
    console.log('2. Check that your wallet address is correct');
    console.log('3. Update the YOUR_WALLET_ADDRESS variable in this script');
    console.log('4. Run: node fix-admin-access.js');
    console.log('5. Or manually update your user role in the database');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Check if wallet address is updated
if (YOUR_WALLET_ADDRESS === '0x1234567890123456789012345678901234567890') {
  console.log('⚠️  WARNING: Please update YOUR_WALLET_ADDRESS in this script with your actual wallet address!');
  console.log('Current wallet:', YOUR_WALLET_ADDRESS);
  console.log('');
}

fixAdminAccess();
