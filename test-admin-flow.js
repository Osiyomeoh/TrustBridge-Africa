#!/usr/bin/env node

/**
 * Admin Flow Test Script
 * Tests all admin functionality including:
 * - Hedera Admin Management
 * - AMC Pool Management  
 * - Dividend Distribution
 * - Trading System
 * - Admin Permissions
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:4001';
const API_BASE = `${BASE_URL}/api`;

// Test data
const testAdmin = {
  walletAddress: '0x1234567890123456789012345678901234567890',
  role: 'SUPER_ADMIN'
};

const testPool = {
  name: 'Test Investment Pool',
  description: 'A test pool for admin flow testing',
  assets: ['asset1', 'asset2'],
  totalValue: 1000000,
  tokenSupply: 1000000,
  tokenPrice: 1.0,
  apy: 8.5,
  maturityDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
  status: 'ACTIVE'
};

class AdminFlowTester {
  constructor() {
    this.authToken = null;
    this.testResults = [];
  }

  log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'ERROR' ? '❌' : type === 'SUCCESS' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async testEndpoint(method, endpoint, data = null, description = '') {
    try {
      this.log(`Testing ${method} ${endpoint} - ${description}`);
      
      const config = {
        method,
        url: `${API_BASE}${endpoint}`,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (this.authToken) {
        config.headers.Authorization = `Bearer ${this.authToken}`;
      }

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      
      this.log(`✅ SUCCESS: ${method} ${endpoint} - Status: ${response.status}`, 'SUCCESS');
      this.testResults.push({
        endpoint,
        method,
        status: 'PASS',
        statusCode: response.status,
        description
      });
      
      return response.data;
    } catch (error) {
      this.log(`❌ FAILED: ${method} ${endpoint} - ${error.response?.status || error.message}`, 'ERROR');
      this.testResults.push({
        endpoint,
        method,
        status: 'FAIL',
        statusCode: error.response?.status || 0,
        description,
        error: error.response?.data || error.message
      });
      return null;
    }
  }

  async testHealthCheck() {
    this.log('🏥 Testing Health Check...');
    return await this.testEndpoint('GET', '/health', null, 'Health check endpoint');
  }

  async testAdminEndpoints() {
    this.log('👑 Testing Admin Endpoints...');
    
    // Test admin status check
    await this.testEndpoint('GET', `/admin/status/${testAdmin.walletAddress}`, null, 'Check admin status');
    
    // Test Hedera admin management
    await this.testEndpoint('GET', '/admin/hedera/admin-accounts', null, 'Get Hedera admin accounts');
    
    // Test create Hedera admin
    await this.testEndpoint('POST', '/admin/hedera/create-admin', {
      walletAddress: testAdmin.walletAddress,
      role: testAdmin.role
    }, 'Create Hedera admin account');
    
    // Test setup admin accounts
    await this.testEndpoint('POST', '/admin/hedera/setup-admin-accounts', null, 'Setup admin accounts');
  }

  async testAMCPoolEndpoints() {
    this.log('🏊 Testing AMC Pool Endpoints...');
    
    // Test create pool
    const poolResponse = await this.testEndpoint('POST', '/amc-pools', testPool, 'Create AMC pool');
    
    if (poolResponse && poolResponse.id) {
      const poolId = poolResponse.id;
      
      // Test get pool
      await this.testEndpoint('GET', `/amc-pools/${poolId}`, null, 'Get AMC pool by ID');
      
      // Test update pool
      await this.testEndpoint('PUT', `/amc-pools/${poolId}`, {
        ...testPool,
        name: 'Updated Test Pool'
      }, 'Update AMC pool');
      
      // Test get all pools
      await this.testEndpoint('GET', '/amc-pools', null, 'Get all AMC pools');
      
      // Test delete pool
      await this.testEndpoint('DELETE', `/amc-pools/${poolId}`, null, 'Delete AMC pool');
    }
  }

  async testTradingEndpoints() {
    this.log('📈 Testing Trading Endpoints...');
    
    // Test create trading order
    await this.testEndpoint('POST', '/trading/order', {
      poolTokenId: 'test-pool-token-1',
      orderType: 'BUY',
      amount: 100,
      price: 1.0,
      userId: 'test-user-1'
    }, 'Create trading order');
    
    // Test get orderbook
    await this.testEndpoint('GET', '/trading/orderbook/test-pool-token-1', null, 'Get orderbook');
    
    // Test get trades
    await this.testEndpoint('GET', '/trading/trades/test-pool-token-1', null, 'Get trades');
  }

  async testPoolTokenEndpoints() {
    this.log('🪙 Testing Pool Token Endpoints...');
    
    // Test get holdings
    await this.testEndpoint('GET', '/pool-tokens/holdings/test-user-1', null, 'Get pool token holdings');
    
    // Test transfer
    await this.testEndpoint('POST', '/pool-tokens/transfer', {
      fromUserId: 'test-user-1',
      toUserId: 'test-user-2',
      poolTokenId: 'test-pool-token-1',
      amount: 50
    }, 'Transfer pool tokens');
    
    // Test claim dividends
    await this.testEndpoint('POST', '/pool-tokens/claim-dividends', {
      userId: 'test-user-1',
      poolTokenId: 'test-pool-token-1'
    }, 'Claim dividends');
  }

  async testDividendEndpoints() {
    this.log('💰 Testing Dividend Endpoints...');
    
    // Test create dividend distribution
    await this.testEndpoint('POST', '/dividends/distribute', {
      poolId: 'test-pool-1',
      amount: 10000,
      description: 'Test dividend distribution'
    }, 'Create dividend distribution');
    
    // Test get dividend distributions
    await this.testEndpoint('GET', '/dividends/distributions', null, 'Get dividend distributions');
  }

  async testRWAEndpoints() {
    this.log('🏠 Testing RWA Endpoints...');
    
    // Test create RWA asset
    await this.testEndpoint('POST', '/rwa/assets', {
      name: 'Test RWA Asset',
      description: 'A test real-world asset',
      value: 500000,
      location: 'Test Location',
      category: 'REAL_ESTATE'
    }, 'Create RWA asset');
    
    // Test get RWA assets
    await this.testEndpoint('GET', '/rwa/assets', null, 'Get RWA assets');
  }

  async runAllTests() {
    this.log('🚀 Starting Admin Flow Tests...');
    this.log('=' * 50);
    
    // Test health check first
    await this.testHealthCheck();
    
    // Test admin endpoints
    await this.testAdminEndpoints();
    
    // Test AMC pool endpoints
    await this.testAMCPoolEndpoints();
    
    // Test trading endpoints
    await this.testTradingEndpoints();
    
    // Test pool token endpoints
    await this.testPoolTokenEndpoints();
    
    // Test dividend endpoints
    await this.testDividendEndpoints();
    
    // Test RWA endpoints
    await this.testRWAEndpoints();
    
    // Print summary
    this.printSummary();
  }

  printSummary() {
    this.log('📊 Test Summary:');
    this.log('=' * 50);
    
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.status === 'PASS').length;
    const failedTests = this.testResults.filter(r => r.status === 'FAIL').length;
    
    this.log(`Total Tests: ${totalTests}`);
    this.log(`Passed: ${passedTests} ✅`);
    this.log(`Failed: ${failedTests} ❌`);
    this.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(2)}%`);
    
    if (failedTests > 0) {
      this.log('\n❌ Failed Tests:');
      this.testResults
        .filter(r => r.status === 'FAIL')
        .forEach(r => {
          this.log(`  - ${r.method} ${r.endpoint}: ${r.error}`, 'ERROR');
        });
    }
    
    this.log('\n🎉 Admin Flow Testing Complete!');
  }
}

// Run the tests
async function main() {
  const tester = new AdminFlowTester();
  await tester.runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = AdminFlowTester;
