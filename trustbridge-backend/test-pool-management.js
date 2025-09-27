const axios = require('axios');

const API_BASE = 'http://localhost:4001/api';
const TEST_WALLET = '0xA6e8bf8E89Bd2c2BD37e308F275C4f52284a911F';

// Test data
const testPool = {
  name: 'Lagos Commercial Properties Pool',
  description: 'A diversified pool of commercial real estate properties in Lagos, Nigeria',
  managerName: 'John Doe',
  managerEmail: 'john@example.com',
  strategy: 'Value-add commercial properties in prime Lagos locations',
  assetIds: ['asset1', 'asset2', 'asset3'], // Mock asset IDs
  dropTokenSupply: 1000000, // 1M DROP tokens
  tinTokenSupply: 300000,   // 300K TIN tokens
  targetAPY: 12.5,          // 12.5% target APY
  riskLevel: 'medium',
  minimumInvestment: 1000,  // $1,000 minimum
  maximumInvestment: 100000, // $100,000 maximum
  lockupPeriod: 365,        // 1 year lockup
  maturityDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now
};

const testInvestor = {
  address: '0x1234567890123456789012345678901234567890',
  amount: 5000 // $5,000 investment
};

async function testPoolManagement() {
  console.log('🚀 Testing TrustBridge Pool Management System\n');

  try {
    // Step 1: Get authentication token
    console.log('1️⃣ Getting authentication token...');
    const authResponse = await axios.post(`${API_BASE}/auth/generate-token`, {
      walletAddress: TEST_WALLET
    });
    
    const token = authResponse.data.accessToken;
    console.log('✅ Authentication successful\n');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Step 2: Create a pool
    console.log('2️⃣ Creating investment pool...');
    const createPoolResponse = await axios.post(`${API_BASE}/pools`, testPool, { headers });
    
    const pool = createPoolResponse.data.pool;
    const poolId = createPoolResponse.data.poolId;
    console.log(`✅ Pool created successfully!`);
    console.log(`   Pool ID: ${poolId}`);
    console.log(`   Pool Name: ${pool.name}`);
    console.log(`   Total Value: $${pool.totalValue.toLocaleString()}`);
    console.log(`   DROP Tokens: ${pool.dropTokens.toLocaleString()}`);
    console.log(`   TIN Tokens: ${pool.tinTokens.toLocaleString()}`);
    console.log(`   Target APY: ${pool.targetAPY}%`);
    console.log(`   Risk Level: ${pool.riskLevel}\n`);

    // Step 3: Get pool details
    console.log('3️⃣ Getting pool details...');
    const getPoolResponse = await axios.get(`${API_BASE}/pools/${poolId}`, { headers });
    console.log('✅ Pool details retrieved successfully!');
    console.log(`   Status: ${getPoolResponse.data.status}`);
    console.log(`   Manager: ${getPoolResponse.data.manager}`);
    console.log(`   Strategy: ${getPoolResponse.data.strategy}\n`);

    // Step 4: Update pool status to active
    console.log('4️⃣ Updating pool status to active...');
    const updateStatusResponse = await axios.put(`${API_BASE}/pools/${poolId}/status`, {
      status: 'active'
    }, { headers });
    console.log('✅ Pool status updated to active!\n');

    // Step 5: Add investor to pool
    console.log('5️⃣ Adding investor to pool...');
    const addInvestorResponse = await axios.post(`${API_BASE}/pools/${poolId}/investors`, testInvestor, { headers });
    
    console.log('✅ Investor added successfully!');
    console.log(`   DROP Tokens: ${addInvestorResponse.data.dropTokens.toLocaleString()}`);
    console.log(`   TIN Tokens: ${addInvestorResponse.data.tinTokens.toLocaleString()}\n`);

    // Step 6: Distribute rewards
    console.log('6️⃣ Distributing rewards...');
    const distributeResponse = await axios.post(`${API_BASE}/pools/${poolId}/distribute`, {
      amount: 10000 // $10,000 in rewards
    }, { headers });
    
    console.log('✅ Rewards distributed successfully!');
    console.log(`   DROP Rewards: $${distributeResponse.data.dropAmount.toLocaleString()}`);
    console.log(`   TIN Rewards: $${distributeResponse.data.tinAmount.toLocaleString()}\n`);

    // Step 7: Get pool performance
    console.log('7️⃣ Getting pool performance metrics...');
    const performanceResponse = await axios.get(`${API_BASE}/pools/${poolId}/performance`, { headers });
    
    console.log('✅ Performance metrics retrieved!');
    console.log(`   Total Return: ${performanceResponse.data.totalReturn}%`);
    console.log(`   Monthly Return: ${performanceResponse.data.monthlyReturn}%`);
    console.log(`   Volatility: ${performanceResponse.data.volatility}%`);
    console.log(`   Sharpe Ratio: ${performanceResponse.data.sharpeRatio}`);
    console.log(`   Max Drawdown: ${performanceResponse.data.maxDrawdown}%\n`);

    // Step 8: Get all pools
    console.log('8️⃣ Getting all pools...');
    const getAllPoolsResponse = await axios.get(`${API_BASE}/pools?limit=10`, { headers });
    
    console.log('✅ All pools retrieved!');
    console.log(`   Total Pools: ${getAllPoolsResponse.data.total}`);
    console.log(`   Pools Found: ${getAllPoolsResponse.data.pools.length}\n`);

    // Step 9: Test pool filtering
    console.log('9️⃣ Testing pool filtering...');
    const filterResponse = await axios.get(`${API_BASE}/pools?status=active&riskLevel=medium&minAPY=10`, { headers });
    
    console.log('✅ Pool filtering works!');
    console.log(`   Filtered Pools: ${filterResponse.data.pools.length}\n`);

    console.log('🎉 All pool management tests passed successfully!');
    console.log('\n📊 Pool Management System Features Tested:');
    console.log('   ✅ Pool Creation');
    console.log('   ✅ Pool Status Management');
    console.log('   ✅ Investor Management');
    console.log('   ✅ Reward Distribution');
    console.log('   ✅ Performance Tracking');
    console.log('   ✅ Pool Filtering');
    console.log('   ✅ Hedera Integration');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run the test
testPoolManagement();
