const axios = require('axios');

const BASE_URL = 'http://localhost:4001/api';

async function testAllEndpoints() {
  console.log('🔍 TESTING ALL TRUSTBRIDGE ENDPOINTS');
  console.log('=' .repeat(60));

  const results = {
    working: [],
    failing: [],
    errors: []
  };

  // Test 1: Basic Health Check
  console.log('\n1. 🏥 Testing Basic Health...');
  try {
    const response = await axios.get(`${BASE_URL}/assets`, { timeout: 5000 });
    if (response.status === 200) {
      console.log('✅ Assets endpoint working');
      results.working.push('Assets GET');
    }
  } catch (error) {
    console.log('❌ Assets endpoint failed:', error.message);
    results.failing.push('Assets GET');
    results.errors.push({ endpoint: 'Assets GET', error: error.message });
  }

  // Test 2: Chainlink Feeds
  console.log('\n2. 🔗 Testing Chainlink Feeds...');
  try {
    const response = await axios.get(`${BASE_URL}/chainlink/feeds/BTC_USD`, { timeout: 5000 });
    if (response.status === 200) {
      console.log('✅ Chainlink BTC/USD feed working');
      console.log(`   Price: $${response.data.data?.price || 'N/A'}`);
      results.working.push('Chainlink BTC/USD');
    }
  } catch (error) {
    console.log('❌ Chainlink feed failed:', error.message);
    results.failing.push('Chainlink BTC/USD');
    results.errors.push({ endpoint: 'Chainlink BTC/USD', error: error.message });
  }

  // Test 3: Hedera Services
  console.log('\n3. 🌐 Testing Hedera Services...');
  try {
    const response = await axios.get(`${BASE_URL}/hedera`, { timeout: 5000 });
    if (response.status === 200) {
      console.log('✅ Hedera services working');
      results.working.push('Hedera Services');
    }
  } catch (error) {
    console.log('❌ Hedera services failed:', error.message);
    results.failing.push('Hedera Services');
    results.errors.push({ endpoint: 'Hedera Services', error: error.message });
  }

  // Test 4: Verification
  console.log('\n4. 🔍 Testing Verification...');
  try {
    const response = await axios.get(`${BASE_URL}/verification`, { timeout: 5000 });
    if (response.status === 200) {
      console.log('✅ Verification endpoint working');
      results.working.push('Verification GET');
    }
  } catch (error) {
    console.log('❌ Verification failed:', error.message);
    results.failing.push('Verification GET');
    results.errors.push({ endpoint: 'Verification GET', error: error.message });
  }

  // Test 5: Attestors
  console.log('\n5. 👥 Testing Attestors...');
  try {
    const response = await axios.get(`${BASE_URL}/attestors`, { timeout: 5000 });
    if (response.status === 200) {
      console.log('✅ Attestors endpoint working');
      results.working.push('Attestors GET');
    }
  } catch (error) {
    console.log('❌ Attestors failed:', error.message);
    results.failing.push('Attestors GET');
    results.errors.push({ endpoint: 'Attestors GET', error: error.message });
  }

  // Test 6: Investments
  console.log('\n6. 💰 Testing Investments...');
  try {
    const response = await axios.get(`${BASE_URL}/investments`, { timeout: 5000 });
    if (response.status === 200) {
      console.log('✅ Investments endpoint working');
      results.working.push('Investments GET');
    }
  } catch (error) {
    console.log('❌ Investments failed:', error.message);
    results.failing.push('Investments GET');
    results.errors.push({ endpoint: 'Investments GET', error: error.message });
  }

  // Test 7: Portfolio
  console.log('\n7. 📊 Testing Portfolio...');
  try {
    const response = await axios.get(`${BASE_URL}/portfolio?userId=test-user`, { timeout: 5000 });
    if (response.status === 200) {
      console.log('✅ Portfolio endpoint working');
      results.working.push('Portfolio GET');
    }
  } catch (error) {
    console.log('❌ Portfolio failed:', error.message);
    results.failing.push('Portfolio GET');
    results.errors.push({ endpoint: 'Portfolio GET', error: error.message });
  }

  // Test 8: Analytics
  console.log('\n8. 📈 Testing Analytics...');
  try {
    const response = await axios.get(`${BASE_URL}/analytics/market`, { timeout: 5000 });
    if (response.status === 200) {
      console.log('✅ Analytics endpoint working');
      results.working.push('Analytics Market');
    }
  } catch (error) {
    console.log('❌ Analytics failed:', error.message);
    results.failing.push('Analytics Market');
    results.errors.push({ endpoint: 'Analytics Market', error: error.message });
  }

  // Test 9: External APIs
  console.log('\n9. 🌍 Testing External APIs...');
  try {
    const ocrData = {
      imageBuffer: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
      mimeType: "image/png"
    };
    const response = await axios.post(`${BASE_URL}/external-apis/ocr/extract`, ocrData, { timeout: 10000 });
    if (response.status === 200) {
      console.log('✅ OCR endpoint working');
      results.working.push('OCR Extract');
    }
  } catch (error) {
    console.log('❌ OCR failed:', error.message);
    results.failing.push('OCR Extract');
    results.errors.push({ endpoint: 'OCR Extract', error: error.message });
  }

  // Test 10: Auth
  console.log('\n10. 🔐 Testing Auth...');
  try {
    const response = await axios.get(`${BASE_URL}/auth`, { timeout: 5000 });
    if (response.status === 200) {
      console.log('✅ Auth endpoint working');
      results.working.push('Auth GET');
    }
  } catch (error) {
    console.log('❌ Auth failed:', error.message);
    results.failing.push('Auth GET');
    results.errors.push({ endpoint: 'Auth GET', error: error.message });
  }

  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('📋 ENDPOINT TEST SUMMARY');
  console.log('=' .repeat(60));
  console.log(`✅ Working: ${results.working.length}`);
  console.log(`❌ Failing: ${results.failing.length}`);
  console.log(`📊 Success Rate: ${Math.round((results.working.length / (results.working.length + results.failing.length)) * 100)}%`);

  console.log('\n✅ WORKING ENDPOINTS:');
  results.working.forEach(endpoint => console.log(`   - ${endpoint}`));

  console.log('\n❌ FAILING ENDPOINTS:');
  results.failing.forEach(endpoint => console.log(`   - ${endpoint}`));

  console.log('\n🔧 ERROR DETAILS:');
  results.errors.forEach(({ endpoint, error }) => {
    console.log(`   - ${endpoint}: ${error}`);
  });

  return results;
}

// Run the test
testAllEndpoints().catch(console.error);
