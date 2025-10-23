#!/usr/bin/env node

/**
 * Test Hedera Connection Script
 * This script tests your Hedera connection and account setup
 */

const { Client, AccountId, PrivateKey, AccountBalanceQuery } = require('@hashgraph/sdk');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function testHederaConnection() {
  try {
    console.log('🔍 Testing Hedera Connection...\n');

    // Check environment variables
    const accountId = process.env.HEDERA_ACCOUNT_ID;
    const privateKey = process.env.HEDERA_PRIVATE_KEY;
    const network = process.env.HEDERA_NETWORK || 'testnet';

    console.log('📋 Configuration:');
    console.log(`   Network: ${network}`);
    console.log(`   Account ID: ${accountId || 'NOT SET'}`);
    console.log(`   Private Key: ${privateKey ? 'SET' : 'NOT SET'}\n`);

    if (!accountId || accountId === '0.0.YOUR_REAL_ACCOUNT_ID') {
      console.error('❌ Error: HEDERA_ACCOUNT_ID not configured');
      console.log('Please set your Hedera account ID in the .env file');
      return false;
    }

    if (!privateKey || privateKey === 'YOUR_REAL_PRIVATE_KEY') {
      console.error('❌ Error: HEDERA_PRIVATE_KEY not configured');
      console.log('Please set your Hedera private key in the .env file');
      return false;
    }

    // Create Hedera client
    console.log('🔌 Creating Hedera client...');
    const client = network === 'mainnet' ? Client.forMainnet() : Client.forTestnet();
    
    const operatorId = AccountId.fromString(accountId);
    const operatorKey = PrivateKey.fromString(privateKey);
    
    client.setOperator(operatorId, operatorKey);

    console.log('✅ Client created successfully\n');

    // Test account balance query
    console.log('💰 Checking account balance...');
    const balanceQuery = new AccountBalanceQuery().setAccountId(operatorId);
    const balance = await balanceQuery.execute(client);
    
    console.log(`✅ Balance: ${balance.hbars.toString()}\n`);

    // Test account info query
    console.log('📊 Getting account information...');
    const accountInfo = await new (require('@hashgraph/sdk').AccountInfoQuery)()
      .setAccountId(operatorId)
      .execute(client);

    console.log('✅ Account Information:');
    console.log(`   Account ID: ${accountInfo.accountId.toString()}`);
    console.log(`   Balance: ${accountInfo.balance.toString()}`);
    console.log(`   Key: ${accountInfo.key.toString()}`);
    console.log(`   Memo: ${accountInfo.accountMemo || 'None'}`);
    console.log(`   Auto Renew Period: ${accountInfo.autoRenewPeriod?.toString() || 'None'}\n`);

    // Check if account has enough balance for creating new accounts
    const balanceHbars = parseFloat(balance.hbars.toString());
    const minBalance = 20; // Minimum balance needed to create accounts

    if (balanceHbars >= minBalance) {
      console.log(`✅ Account has sufficient balance (${balanceHbars} HBAR) for creating new accounts`);
    } else {
      console.log(`⚠️  Warning: Account balance (${balanceHbars} HBAR) might be low for creating new accounts`);
      console.log(`   Recommended minimum: ${minBalance} HBAR`);
      console.log(`   Get more HBAR from: https://portal.hedera.com/\n`);
    }

    console.log('🎉 Hedera connection test completed successfully!');
    console.log('✅ Your Hedera setup is ready for creating admin accounts\n');

    return true;

  } catch (error) {
    console.error('❌ Error testing Hedera connection:', error.message);
    
    if (error.message.includes('INVALID_ACCOUNT_ID')) {
      console.log('\n💡 Tip: Check your HEDERA_ACCOUNT_ID format (should be 0.0.XXXXXX)');
    }
    
    if (error.message.includes('INVALID_PRIVATE_KEY')) {
      console.log('\n💡 Tip: Check your HEDERA_PRIVATE_KEY format');
    }
    
    if (error.message.includes('INSUFFICIENT_ACCOUNT_BALANCE')) {
      console.log('\n💡 Tip: Add more HBAR to your account');
    }
    
    if (error.message.includes('NETWORK_ERROR')) {
      console.log('\n💡 Tip: Check your internet connection and Hedera network status');
    }

    console.log('\n🔧 Troubleshooting:');
    console.log('1. Verify your .env file has correct Hedera credentials');
    console.log('2. Check your internet connection');
    console.log('3. Visit https://portal.hedera.com/ to get testnet credentials');
    console.log('4. Make sure you have enough HBAR in your account');

    return false;
  }
}

// Run the test
if (require.main === module) {
  testHederaConnection()
    .then((success) => {
      if (success) {
        console.log('\n🚀 Ready to create Hedera super admin account!');
        console.log('Run: node create-hedera-super-admin.js');
      } else {
        console.log('\n❌ Fix the issues above before creating admin accounts');
      }
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('\n💥 Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testHederaConnection };
