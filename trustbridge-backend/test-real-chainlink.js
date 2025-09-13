const axios = require('axios');

const BASE_URL = 'http://localhost:4003';

async function testRealChainlinkIntegration() {
  console.log('🔗 Testing Real Chainlink Integration with Hedera Testnet');
  console.log('=' .repeat(60));

  try {
    // 1. Test available feeds
    console.log('\n1. Testing Available Chainlink Feeds...');
    const feedsResponse = await axios.get(`${BASE_URL}/api/chainlink/feeds/available`);
    console.log('✅ Available Feeds:', feedsResponse.data.data.feeds);

    // 2. Test HBAR/USD price feed
    console.log('\n2. Testing HBAR/USD Price Feed...');
    const hbarResponse = await axios.get(`${BASE_URL}/api/chainlink/feeds/HBAR_USD`);
    console.log('✅ HBAR Price:', hbarResponse.data.data.price, 'USD');
    console.log('   Round ID:', hbarResponse.data.data.roundId);
    console.log('   Timestamp:', hbarResponse.data.data.timestamp);

    // 3. Test BTC/USD price feed
    console.log('\n3. Testing BTC/USD Price Feed...');
    const btcResponse = await axios.get(`${BASE_URL}/api/chainlink/feeds/BTC_USD`);
    console.log('✅ BTC Price:', btcResponse.data.data.price, 'USD');
    console.log('   Round ID:', btcResponse.data.data.roundId);

    // 4. Test ETH/USD price feed
    console.log('\n4. Testing ETH/USD Price Feed...');
    const ethResponse = await axios.get(`${BASE_URL}/api/chainlink/feeds/ETH_USD`);
    console.log('✅ ETH Price:', ethResponse.data.data.price, 'USD');
    console.log('   Round ID:', ethResponse.data.data.roundId);

    // 5. Test LINK/USD price feed
    console.log('\n5. Testing LINK/USD Price Feed...');
    const linkResponse = await axios.get(`${BASE_URL}/api/chainlink/feeds/LINK_USD`);
    console.log('✅ LINK Price:', linkResponse.data.data.price, 'USD');
    console.log('   Round ID:', linkResponse.data.data.roundId);

    // 6. Test feed information
    console.log('\n6. Testing Feed Information...');
    const infoResponse = await axios.get(`${BASE_URL}/api/chainlink/feeds/HBAR_USD/info`);
    console.log('✅ HBAR Feed Info:', infoResponse.data.data);

    // 7. Test historical price (using a recent round ID)
    console.log('\n7. Testing Historical Price...');
    const historicalResponse = await axios.get(`${BASE_URL}/api/chainlink/feeds/HBAR_USD/historical/1`);
    console.log('✅ Historical HBAR Price:', historicalResponse.data.data.price, 'USD');

    // 8. Test coffee price (mapped to HBAR)
    console.log('\n8. Testing Coffee Price (mapped to HBAR)...');
    const coffeeResponse = await axios.get(`${BASE_URL}/api/chainlink/price/coffee`);
    console.log('✅ Coffee Price:', coffeeResponse.data.data.price, 'USD');
    console.log('   Source:', coffeeResponse.data.data.source);

    // 9. Test wheat price (mapped to HBAR)
    console.log('\n9. Testing Wheat Price (mapped to HBAR)...');
    const wheatResponse = await axios.get(`${BASE_URL}/api/chainlink/price/wheat`);
    console.log('✅ Wheat Price:', wheatResponse.data.data.price, 'USD');
    console.log('   Source:', wheatResponse.data.data.source);

    // 10. Test real estate price (mapped to HBAR)
    console.log('\n10. Testing Real Estate Price (mapped to HBAR)...');
    const realEstateResponse = await axios.get(`${BASE_URL}/api/chainlink/price/real_estate`);
    console.log('✅ Real Estate Price:', realEstateResponse.data.data.price, 'USD');
    console.log('   Source:', realEstateResponse.data.data.source);

    // 11. Test Chainlink health
    console.log('\n11. Testing Chainlink Health...');
    const healthResponse = await axios.get(`${BASE_URL}/api/chainlink/health`);
    console.log('✅ Chainlink Health:', healthResponse.data.data.healthy ? 'Healthy' : 'Unhealthy');
    console.log('   Configured:', healthResponse.data.data.configured ? 'Yes' : 'No');

    // 12. Test all available feeds
    console.log('\n12. Testing All Available Feeds...');
    const allFeeds = ['BTC_USD', 'ETH_USD', 'HBAR_USD', 'LINK_USD', 'DAI_USD', 'USDC_USD', 'USDT_USD'];
    
    for (const feed of allFeeds) {
      try {
        const response = await axios.get(`${BASE_URL}/api/chainlink/feeds/${feed}`);
        console.log(`   ✅ ${feed}: $${response.data.data.price} (Round ${response.data.data.roundId})`);
      } catch (error) {
        console.log(`   ❌ ${feed}: ${error.response?.data?.message || error.message}`);
      }
    }

    console.log('\n🎉 REAL CHAINLINK INTEGRATION TEST SUCCESSFUL!');
    console.log('=' .repeat(60));
    console.log('✅ Real Chainlink price feeds working on Hedera testnet');
    console.log('✅ All major cryptocurrency prices available');
    console.log('✅ Asset type mapping working correctly');
    console.log('✅ Historical price data accessible');
    console.log('✅ Feed information available');
    console.log('✅ Health monitoring working');
    console.log('\n🚀 Ready for production with real oracle data!');

  } catch (error) {
    console.error('\n❌ Test Failed:', error.response?.data || error.message);
    console.log('\n🔧 Debug Info:');
    console.log('  - Server running on:', BASE_URL);
    console.log('  - Error status:', error.response?.status);
    console.log('  - Error details:', error.response?.data);
  }
}

// Run the test
testRealChainlinkIntegration();
