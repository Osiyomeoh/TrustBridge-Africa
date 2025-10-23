#!/usr/bin/env node

/**
 * Create Hedera Super Admin Script
 * This script creates a native Hedera super admin account
 */

const { Client, AccountId, PrivateKey, AccountCreateTransaction, Hbar } = require('@hashgraph/sdk');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function createHederaSuperAdmin() {
  try {
    console.log('🚀 Creating Hedera Super Admin Account...\n');

    // Check if Hedera credentials are configured
    const accountId = process.env.HEDERA_ACCOUNT_ID;
    const privateKey = process.env.HEDERA_PRIVATE_KEY;
    const network = process.env.HEDERA_NETWORK || 'testnet';

    if (!accountId || accountId === '0.0.YOUR_REAL_ACCOUNT_ID') {
      console.error('❌ Error: HEDERA_ACCOUNT_ID not configured in .env file');
      console.log('Please set your Hedera account ID in the .env file');
      return;
    }

    if (!privateKey || privateKey === 'YOUR_REAL_PRIVATE_KEY') {
      console.error('❌ Error: HEDERA_PRIVATE_KEY not configured in .env file');
      console.log('Please set your Hedera private key in the .env file');
      return;
    }

    console.log(`📡 Connecting to Hedera ${network}...`);
    console.log(`🔑 Using account: ${accountId}\n`);

    // Create Hedera client
    const client = Client.forTestnet(); // or Client.forMainnet() for mainnet
    
    const operatorId = AccountId.fromString(accountId);
    const operatorKey = PrivateKey.fromString(privateKey);
    
    client.setOperator(operatorId, operatorKey);

    // Generate new key pair for super admin
    console.log('🔐 Generating new key pair for super admin...');
    const newKey = PrivateKey.generate();
    const publicKey = newKey.publicKey;
    
    console.log(`📋 Super Admin Public Key: ${publicKey.toString()}`);
    console.log(`🔑 Super Admin Private Key: ${newKey.toString()}\n`);

    // Create account with initial HBAR
    console.log('💰 Creating super admin account with 10 HBAR initial balance...');
    const accountCreateTx = new AccountCreateTransaction()
      .setKey(publicKey)
      .setInitialBalance(new Hbar(10)) // 10 HBAR initial balance
      .setAccountMemo('TrustBridge Super Admin Account')
      .setMaxTransactionFee(new Hbar(5));
    
    const response = await accountCreateTx.execute(client);
    const receipt = await response.getReceipt(client);
    
    const superAdminAccountId = receipt.accountId.toString();
    
    console.log('✅ Super Admin Account Created Successfully!\n');
    console.log('🎯 SUPER ADMIN DETAILS:');
    console.log(`   Account ID: ${superAdminAccountId}`);
    console.log(`   Private Key: ${newKey.toString()}`);
    console.log(`   Public Key: ${publicKey.toString()}`);
    console.log(`   Initial Balance: 10 HBAR\n`);

    // Get account info
    console.log('📊 Getting account information...');
    const accountInfo = await new (require('@hashgraph/sdk').AccountInfoQuery)()
      .setAccountId(AccountId.fromString(superAdminAccountId))
      .execute(client);

    console.log('📋 ACCOUNT INFO:');
    console.log(`   Balance: ${accountInfo.balance.toString()}`);
    console.log(`   Key: ${accountInfo.key.toString()}`);
    console.log(`   Memo: ${accountInfo.accountMemo}`);
    console.log(`   Auto Renew Period: ${accountInfo.autoRenewPeriod?.toString()}\n`);

    // Instructions for next steps
    console.log('🎉 NEXT STEPS:');
    console.log('1. Save the private key securely (it will not be shown again)');
    console.log('2. Update your .env file with the new super admin account ID');
    console.log('3. Use the admin dashboard to manage this super admin account');
    console.log('4. Create additional admin accounts as needed\n');

    console.log('🔧 ENVIRONMENT VARIABLE TO ADD:');
    console.log(`HEDERA_SUPER_ADMIN_ACCOUNT=${superAdminAccountId}\n`);

    console.log('✅ Hedera Super Admin creation completed successfully!');

  } catch (error) {
    console.error('❌ Error creating Hedera super admin:', error.message);
    console.error('Stack trace:', error.stack);
    
    if (error.message.includes('INSUFFICIENT_ACCOUNT_BALANCE')) {
      console.log('\n💡 Tip: Make sure your Hedera account has enough HBAR to create new accounts');
    }
    
    if (error.message.includes('INVALID_ACCOUNT_ID')) {
      console.log('\n💡 Tip: Check your HEDERA_ACCOUNT_ID in the .env file');
    }
    
    if (error.message.includes('INVALID_PRIVATE_KEY')) {
      console.log('\n💡 Tip: Check your HEDERA_PRIVATE_KEY in the .env file');
    }
  }
}

// Run the script
if (require.main === module) {
  createHederaSuperAdmin()
    .then(() => {
      console.log('\n🎯 Script completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { createHederaSuperAdmin };
