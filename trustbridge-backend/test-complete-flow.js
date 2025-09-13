const axios = require('axios');

const BASE_URL = 'http://localhost:4003/api';

async function testCompleteFlow() {
  console.log('🚀 TRUSTBRIDGE COMPLETE FLOW TEST');
  console.log('=' .repeat(60));
  console.log('Testing: Asset Creation → Verification → Tokenization → Investment');
  console.log('=' .repeat(60));

  let testResults = {
    server: false,
    health: false,
    assetCreation: false,
    verification: false,
    tokenization: false,
    investment: false,
    portfolio: false,
    analytics: false,
    chainlink: false,
    hedera: false
  };

  try {
    // 1. Test Server Health
    console.log('\n1. 🏥 Testing Server Health...');
    try {
      const healthResponse = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
      console.log('✅ Server is running');
      testResults.server = true;
      testResults.health = true;
    } catch (error) {
      console.log('❌ Server not responding');
      throw new Error('Server not running');
    }

    // 2. Test Asset Creation
    console.log('\n2. 🏗️ Testing Asset Creation...');
    try {
      const assetData = {
        name: "Lagos Coffee Farm - Test Asset",
        description: "Premium coffee plantation in Lagos, Nigeria",
        assetType: "AGRICULTURE",
        location: {
          address: "Ikeja, Lagos, Nigeria",
          coordinates: { lat: 6.5244, lng: 3.3792 }
        },
        value: 50000,
        ownerId: "test-owner-123",
        metadata: {
          farmSize: "10 hectares",
          cropType: "Coffee",
          harvestSeason: "October-March"
        }
      };

      const assetResponse = await axios.post(`${BASE_URL}/assets`, assetData, { timeout: 10000 });
      console.log('✅ Asset created successfully');
      console.log(`   Asset ID: ${assetResponse.data.data.assetId}`);
      testResults.assetCreation = true;
      const assetId = assetResponse.data.data.assetId;
    } catch (error) {
      console.log('❌ Asset creation failed:', error.response?.data?.message || error.message);
    }

    // 3. Test Verification Submission
    console.log('\n3. 🔍 Testing Verification Submission...');
    try {
      const verificationData = {
        assetId: "test-asset-123",
        ownerId: "test-owner-123",
        documents: [{
          type: "OWNERSHIP_CERTIFICATE",
          data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
          mimeType: "image/png",
          fileName: "ownership_cert.png"
        }],
        photos: [{
          type: "PROPERTY_PHOTO",
          data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
          mimeType: "image/jpeg",
          fileName: "property_photo.jpg",
          coordinates: { lat: 6.5244, lng: 3.3792 }
        }],
        location: {
          address: "Ikeja, Lagos, Nigeria",
          coordinates: { lat: 6.5244, lng: 3.3792 }
        }
      };

      const verificationResponse = await axios.post(`${BASE_URL}/verification/submit`, verificationData, { timeout: 15000 });
      console.log('✅ Verification submitted successfully');
      console.log(`   Verification ID: ${verificationResponse.data.data.verificationId}`);
      testResults.verification = true;
    } catch (error) {
      console.log('❌ Verification submission failed:', error.response?.data?.message || error.message);
    }

    // 4. Test Tokenization
    console.log('\n4. 🪙 Testing Asset Tokenization...');
    try {
      const tokenizationData = {
        assetId: "test-asset-123",
        totalSupply: 1000000,
        tokenName: "Lagos Coffee Token",
        tokenSymbol: "LCT",
        enableKYC: true,
        enableFreeze: true,
        metadata: {
          assetType: "AGRICULTURE",
          location: "Lagos, Nigeria"
        }
      };

      const tokenizationResponse = await axios.post(`${BASE_URL}/hedera/tokenize`, tokenizationData, { timeout: 15000 });
      console.log('✅ Asset tokenized successfully');
      console.log(`   Token ID: ${tokenizationResponse.data.data.tokenId}`);
      testResults.tokenization = true;
    } catch (error) {
      console.log('❌ Tokenization failed:', error.response?.data?.message || error.message);
    }

    // 5. Test Investment Creation
    console.log('\n5. 💰 Testing Investment Creation...');
    try {
      const investmentData = {
        userId: "test-investor-123",
        assetId: "test-asset-123",
        amount: 5000,
        tokens: 100000
      };

      const investmentResponse = await axios.post(`${BASE_URL}/investments`, investmentData, { timeout: 10000 });
      console.log('✅ Investment created successfully');
      console.log(`   Investment ID: ${investmentResponse.data.data.investmentId}`);
      testResults.investment = true;
    } catch (error) {
      console.log('❌ Investment creation failed:', error.response?.data?.message || error.message);
    }

    // 6. Test Portfolio
    console.log('\n6. 📊 Testing Portfolio...');
    try {
      const portfolioResponse = await axios.get(`${BASE_URL}/portfolio?userId=test-investor-123`, { timeout: 10000 });
      console.log('✅ Portfolio retrieved successfully');
      console.log(`   Total Value: $${portfolioResponse.data.data.totalValue}`);
      testResults.portfolio = true;
    } catch (error) {
      console.log('❌ Portfolio retrieval failed:', error.response?.data?.message || error.message);
    }

    // 7. Test Analytics
    console.log('\n7. 📈 Testing Analytics...');
    try {
      const analyticsResponse = await axios.get(`${BASE_URL}/analytics/market`, { timeout: 10000 });
      console.log('✅ Analytics retrieved successfully');
      console.log(`   TVL: $${analyticsResponse.data.data.totalValueLocked}`);
      testResults.analytics = true;
    } catch (error) {
      console.log('❌ Analytics retrieval failed:', error.response?.data?.message || error.message);
    }

    // 8. Test Chainlink Feeds
    console.log('\n8. 🔗 Testing Chainlink Feeds...');
    try {
      const chainlinkResponse = await axios.get(`${BASE_URL}/chainlink/feeds/BTC_USD`, { timeout: 10000 });
      console.log('✅ Chainlink feed retrieved successfully');
      console.log(`   BTC Price: $${chainlinkResponse.data.data.price}`);
      console.log(`   Source: ${chainlinkResponse.data.data.source}`);
      testResults.chainlink = true;
    } catch (error) {
      console.log('❌ Chainlink feed failed:', error.response?.data?.message || error.message);
    }

    // 9. Test Hedera Services
    console.log('\n9. 🌐 Testing Hedera Services...');
    try {
      const hederaResponse = await axios.get(`${BASE_URL}/hedera`, { timeout: 10000 });
      console.log('✅ Hedera services available');
      console.log(`   Services: ${hederaResponse.data.data.services.join(', ')}`);
      testResults.hedera = true;
    } catch (error) {
      console.log('❌ Hedera services failed:', error.response?.data?.message || error.message);
    }

    // 10. Test External APIs
    console.log('\n10. 🌍 Testing External APIs...');
    try {
      const ocrData = {
        imageBuffer: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
        mimeType: "image/png"
      };

      const ocrResponse = await axios.post(`${BASE_URL}/external-apis/ocr/extract`, ocrData, { timeout: 15000 });
      console.log('✅ OCR service working');
      console.log(`   Extracted text: ${ocrResponse.data.data.text.substring(0, 50)}...`);
    } catch (error) {
      console.log('❌ OCR service failed:', error.response?.data?.message || error.message);
    }

    // Summary
    console.log('\n' + '=' .repeat(60));
    console.log('📋 COMPLETE FLOW TEST SUMMARY');
    console.log('=' .repeat(60));

    const workingComponents = Object.values(testResults).filter(Boolean).length;
    const totalComponents = Object.keys(testResults).length;

    console.log(`✅ Working Components: ${workingComponents}/${totalComponents}`);
    console.log(`📊 Success Rate: ${Math.round((workingComponents / totalComponents) * 100)}%`);

    Object.entries(testResults).forEach(([component, status]) => {
      console.log(`${status ? '✅' : '❌'} ${component.toUpperCase()}`);
    });

    if (workingComponents >= 8) {
      console.log('\n🎉 EXCELLENT! Backend is production-ready!');
      console.log('🚀 Ready for frontend development!');
      console.log('🏆 Ready for Hedera Africa Hackathon 2025!');
    } else if (workingComponents >= 6) {
      console.log('\n✅ GOOD! Most components working!');
      console.log('🔧 Minor fixes needed for full production readiness');
    } else {
      console.log('\n⚠️ NEEDS WORK! Several components need attention');
      console.log('🔧 Focus on fixing failed components');
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

// Run the complete flow test
testCompleteFlow();
