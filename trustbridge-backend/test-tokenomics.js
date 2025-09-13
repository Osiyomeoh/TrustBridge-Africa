const axios = require('axios');

const BASE_URL = 'http://localhost:4001/api/tokenomics';

class TokenomicsTester {
  constructor() {
    this.results = {
      working: [],
      failing: [],
      errors: {}
    };
  }

  async testEndpoint(name, url, method = 'GET', data = null) {
    try {
      console.log(`\n🧪 Testing ${name}...`);
      
      const config = {
        method,
        url,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      
      if (response.status >= 200 && response.status < 300) {
        console.log(`✅ ${name} - Status: ${response.status}`);
        this.results.working.push(name);
        return { success: true, data: response.data };
      } else {
        console.log(`❌ ${name} - Status: ${response.status}`);
        this.results.failing.push(name);
        this.results.errors[name] = `HTTP ${response.status}`;
        return { success: false, error: `HTTP ${response.status}` };
      }
    } catch (error) {
      console.log(`❌ ${name} - Error: ${error.message}`);
      this.results.failing.push(name);
      this.results.errors[name] = error.message;
      return { success: false, error: error.message };
    }
  }

  async runAllTests() {
    console.log('🚀 Starting TrustBridge Tokenomics Tests...\n');

    // Test 1: Tokenomics Overview
    await this.testEndpoint(
      'Tokenomics Overview',
      `${BASE_URL}/overview`
    );

    // Test 2: Tokenomics Metrics
    await this.testEndpoint(
      'Tokenomics Metrics',
      `${BASE_URL}/metrics`
    );

    // Test 3: Token Distribution
    await this.testEndpoint(
      'Token Distribution',
      `${BASE_URL}/distribution`
    );

    // Test 4: Governance Proposals
    await this.testEndpoint(
      'Governance Proposals',
      `${BASE_URL}/governance/proposals`
    );

    // Test 5: Governance Stats
    await this.testEndpoint(
      'Governance Stats',
      `${BASE_URL}/governance/stats`
    );

    // Test 6: Staking Stats
    await this.testEndpoint(
      'Staking Stats',
      `${BASE_URL}/staking/stats`
    );

    // Test 7: Staking Leaderboard
    await this.testEndpoint(
      'Staking Leaderboard',
      `${BASE_URL}/staking/leaderboard`
    );

    // Test 8: Revenue Metrics
    await this.testEndpoint(
      'Revenue Metrics',
      `${BASE_URL}/revenue/metrics`
    );

    // Test 9: Revenue Streams
    await this.testEndpoint(
      'Revenue Streams',
      `${BASE_URL}/revenue/streams`
    );

    // Test 10: Revenue Analytics
    await this.testEndpoint(
      'Revenue Analytics',
      `${BASE_URL}/revenue/analytics`
    );

    // Test 11: Treasury Balance
    await this.testEndpoint(
      'Treasury Balance',
      `${BASE_URL}/revenue/treasury`
    );

    // Test 12: Fee Configuration
    await this.testEndpoint(
      'Fee Configuration',
      `${BASE_URL}/revenue/fee-config`
    );

    // Test 13: Revenue by Timeframe
    await this.testEndpoint(
      'Revenue Daily',
      `${BASE_URL}/revenue/daily`
    );

    await this.testEndpoint(
      'Revenue Weekly',
      `${BASE_URL}/revenue/weekly`
    );

    await this.testEndpoint(
      'Revenue Monthly',
      `${BASE_URL}/revenue/monthly`
    );

    // Test 14: Staking Configuration
    await this.testEndpoint(
      'Staking Configuration',
      `${BASE_URL}/staking/config`
    );

    // Test 15: General Leaderboard
    await this.testEndpoint(
      'General Leaderboard',
      `${BASE_URL}/leaderboard`
    );

    this.printResults();
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TOKENOMICS TEST RESULTS');
    console.log('='.repeat(60));

    console.log(`\n✅ Working Endpoints (${this.results.working.length}):`);
    this.results.working.forEach(endpoint => {
      console.log(`   • ${endpoint}`);
    });

    console.log(`\n❌ Failing Endpoints (${this.results.failing.length}):`);
    this.results.failing.forEach(endpoint => {
      console.log(`   • ${endpoint}: ${this.results.errors[endpoint]}`);
    });

    const successRate = (this.results.working.length / (this.results.working.length + this.results.failing.length)) * 100;
    
    console.log('\n' + '='.repeat(60));
    console.log(`🎯 SUCCESS RATE: ${successRate.toFixed(1)}%`);
    console.log(`📈 Working: ${this.results.working.length}`);
    console.log(`📉 Failing: ${this.results.failing.length}`);
    console.log('='.repeat(60));

    if (successRate >= 80) {
      console.log('\n🎉 EXCELLENT! Tokenomics system is working well!');
    } else if (successRate >= 60) {
      console.log('\n👍 GOOD! Most tokenomics features are working!');
    } else if (successRate >= 40) {
      console.log('\n⚠️  FAIR! Some tokenomics features need attention!');
    } else {
      console.log('\n🚨 POOR! Tokenomics system needs significant work!');
    }
  }
}

// Run the tests
const tester = new TokenomicsTester();
tester.runAllTests().catch(console.error);
