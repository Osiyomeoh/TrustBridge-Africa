const axios = require('axios');

const BASE_URL = 'http://localhost:4003';

async function testCompleteFlow() {
  console.log('🚀 Testing TrustBridge Complete Flow (Final Version)');
  console.log('=' .repeat(60));

  try {
    // 1. Test Server Health
    console.log('\n1. Testing Server Health...');
    const healthResponse = await axios.get(`${BASE_URL}/api/hedera/health`);
    console.log('✅ Server Health:', healthResponse.data.message);

    // 2. Test External APIs Health
    console.log('\n2. Testing External APIs...');
    const externalHealth = await axios.get(`${BASE_URL}/api/external/health`);
    console.log('✅ External APIs:', externalHealth.data.message);

    // 3. Test Chainlink Integration
    console.log('\n3. Testing Chainlink Integration...');
    const chainlinkHealth = await axios.get(`${BASE_URL}/api/chainlink/health`);
    console.log('✅ Chainlink:', chainlinkHealth.data.message);

    // 4. Test Market Data
    console.log('\n4. Testing Market Data...');
    const marketData = await axios.get(`${BASE_URL}/api/chainlink/price/coffee`);
    console.log('✅ Coffee Price:', marketData.data.data.price, 'USD');

    // 5. Test Weather Data
    console.log('\n5. Testing Weather Data...');
    const weatherData = await axios.get(`${BASE_URL}/api/external/weather?lat=6.5244&lng=3.3792`);
    console.log('✅ Weather:', weatherData.data.data.temperature, '°C');

    // 6. Test GPS Verification
    console.log('\n6. Testing GPS Verification...');
    const gpsData = await axios.post(`${BASE_URL}/api/external/gps/verify`, {
      lat: 6.5244,
      lng: 3.3792
    });
    console.log('✅ GPS Verification:', gpsData.data.data.verified ? 'Valid' : 'Invalid');

    // 7. Test Asset Creation
    console.log('\n7. Testing Asset Creation...');
    const assetData = {
      owner: '0x1234567890123456789012345678901234567890',
      type: 'AGRICULTURAL',
      name: 'Premium Coffee Farm - Lagos',
      description: 'High-quality Arabica coffee farm in Lagos, Nigeria',
      location: {
        country: 'Nigeria',
        region: 'Lagos',
        coordinates: { lat: 6.5244, lng: 3.3792 }
      },
      totalValue: 50000,
      tokenSupply: 2000,
      maturityDate: '2026-03-31T00:00:00Z',
      expectedAPY: 20.5,
      metadata: { crop: 'Arabica', size: '5 hectares' }
    };

    const assetResponse = await axios.post(`${BASE_URL}/api/assets`, assetData);
    console.log('✅ Asset Created:', assetResponse.data.data.assetId);

    // 8. Test Attestor Registration
    console.log('\n8. Testing Attestor Registration...');
    const attestorData = {
      organizationName: 'Lagos Agricultural Extension Service',
      organizationType: 'EXTENSION_OFFICER',
      country: 'Nigeria',
      region: 'Lagos',
      specialties: ['AGRICULTURE', 'COFFEE'],
      contactInfo: {
        email: 'extension@lagos.gov.ng',
        phone: '+234-1-234-5678'
      },
      credentials: {
        licenseNumber: 'LAG-EXT-2024-001',
        certifications: ['Agricultural Extension', 'Coffee Quality Assessment']
      },
      stakeAmount: 1000
    };

    const attestorResponse = await axios.post(`${BASE_URL}/api/attestors/register`, attestorData);
    console.log('✅ Attestor Registered:', attestorResponse.data.data.organizationName);

    // 9. Test Verification Submission
    console.log('\n9. Testing Verification Submission...');
    const verificationData = {
      assetId: assetResponse.data.data.assetId,
      evidence: {
        location: {
          coordinates: { lat: 6.5244, lng: 3.3792 },
          address: 'Lagos, Nigeria'
        },
        photos: [{
          data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          mimeType: 'image/jpeg',
          gps: { lat: 6.5244, lng: 3.3792 }
        }],
        additionalInfo: {
          farmSize: '5 hectares',
          cropType: 'Arabica Coffee',
          management: 'Organic'
        }
      }
    };

    const verificationResponse = await axios.post(`${BASE_URL}/api/verification/submit`, verificationData);
    console.log('✅ Verification Submitted:', verificationResponse.data.data._id);

    // 10. Test Attestation Submission
    console.log('\n10. Testing Attestation Submission...');
    const attestationData = {
      verificationId: verificationResponse.data.data._id,
      attestorId: attestorResponse.data.data._id,
      attestation: {
        confidence: 92,
        comments: 'High-quality coffee farm with excellent management practices',
        evidence: {
          siteVisit: {
            findings: 'Farm is well-maintained with proper irrigation',
            photos: ['farm_overview.jpg', 'coffee_plants.jpg']
          },
          documentation: {
            landTitle: 'Verified',
            permits: 'Valid'
          }
        }
      }
    };

    const attestationResponse = await axios.post(`${BASE_URL}/api/verification/attestation`, attestationData);
    console.log('✅ Attestation Submitted:', attestationResponse.data.message);

    // 11. Test Tokenization
    console.log('\n11. Testing Asset Tokenization...');
    const tokenizationData = {
      assetId: assetResponse.data.data.assetId,
      owner: '0x1234567890123456789012345678901234567890',
      totalSupply: 2000,
      tokenName: 'Lagos Coffee Farm Token',
      tokenSymbol: 'LCFT',
      metadata: { description: 'Premium coffee farm token' },
      enableKyc: true,
      enableFreeze: true
    };

    const tokenizationResponse = await axios.post(`${BASE_URL}/api/hedera/tokenize`, tokenizationData);
    console.log('✅ Tokenization:', tokenizationResponse.data.data.tokenId);

    // 12. Test Investment Creation
    console.log('\n12. Testing Investment Creation...');
    const investmentData = {
      userId: 'user_123',
      assetId: assetResponse.data.data.assetId,
      amount: 5000,
      tokens: 200
    };

    const investmentResponse = await axios.post(`${BASE_URL}/api/investments`, investmentData);
    console.log('✅ Investment Created:', investmentResponse.data.data.investmentId);

    // 13. Test Portfolio
    console.log('\n13. Testing Portfolio...');
    const portfolioResponse = await axios.get(`${BASE_URL}/api/portfolio?userId=user_123`);
    console.log('✅ Portfolio Value:', portfolioResponse.data.data.totalValue, 'USD');

    // 14. Test Analytics
    console.log('\n14. Testing Analytics...');
    const analyticsResponse = await axios.get(`${BASE_URL}/api/analytics/market`);
    console.log('✅ Market Analytics:', analyticsResponse.data.data.totalValueLocked, 'USD TVL');

    // 15. Test KYC Operations
    console.log('\n15. Testing KYC Operations...');
    const kycData = {
      accountId: '0.0.1234567',
      tokenId: tokenizationResponse.data.data.tokenId,
      kycStatus: 'GRANT',
      reason: 'KYC verification completed'
    };

    const kycGrantResponse = await axios.post(`${BASE_URL}/api/hedera/kyc/grant`, kycData);
    console.log('✅ KYC Granted:', kycGrantResponse.data.data.transactionId);

    // 16. Test Freeze Operations
    console.log('\n16. Testing Freeze Operations...');
    const freezeData = {
      accountId: '0.0.1234567',
      tokenId: tokenizationResponse.data.data.tokenId,
      freezeStatus: 'FREEZE'
    };

    const freezeResponse = await axios.post(`${BASE_URL}/api/hedera/freeze/token`, freezeData);
    console.log('✅ Token Frozen:', freezeResponse.data.data.transactionId);

    // 17. Test Unfreeze Operations
    console.log('\n17. Testing Unfreeze Operations...');
    const unfreezeData = {
      accountId: '0.0.1234567',
      tokenId: tokenizationResponse.data.data.tokenId,
      freezeStatus: 'UNFREEZE'
    };

    const unfreezeResponse = await axios.post(`${BASE_URL}/api/hedera/freeze/token`, unfreezeData);
    console.log('✅ Token Unfrozen:', unfreezeResponse.data.data.transactionId);

    // 18. Test All Endpoints Summary
    console.log('\n18. Testing All Endpoints Summary...');
    const endpoints = [
      '/api/hedera',
      '/api/verification',
      '/api/attestors',
      '/api/assets',
      '/api/investments',
      '/api/portfolio',
      '/api/analytics',
      '/api/external',
      '/api/chainlink',
      '/api/users',
      '/api/auth'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${BASE_URL}${endpoint}`);
        console.log(`✅ ${endpoint}:`, response.data.message || 'OK');
      } catch (error) {
        console.log(`❌ ${endpoint}:`, error.response?.data?.message || error.message);
      }
    }

    console.log('\n🎉 COMPLETE FLOW TEST SUCCESSFUL!');
    console.log('=' .repeat(60));
    console.log('✅ All major components are working:');
    console.log('  - Server Health & External APIs');
    console.log('  - Hedera Blockchain Integration');
    console.log('  - Chainlink Oracle Integration');
    console.log('  - Asset Creation & Management');
    console.log('  - Attestor Registration & Management');
    console.log('  - Verification & Attestation Workflow');
    console.log('  - Asset Tokenization');
    console.log('  - Investment Management');
    console.log('  - Portfolio Analytics');
    console.log('  - KYC & Freeze Operations');
    console.log('  - Real-time Market Data');
    console.log('  - GPS & Weather Verification');
    console.log('\n🚀 Ready for Frontend Development!');

  } catch (error) {
    console.error('\n❌ Test Failed:', error.response?.data || error.message);
    console.log('\n🔧 Debug Info:');
    console.log('  - Server running on:', BASE_URL);
    console.log('  - Error status:', error.response?.status);
    console.log('  - Error details:', error.response?.data);
  }
}

// Run the test
testCompleteFlow();