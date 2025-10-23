#!/usr/bin/env node

/**
 * Script to verify the admin account in the database
 */

const mongoose = require('mongoose');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trustbridge';

async function verifyAdminDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create the User schema (simplified version)
    const userSchema = new mongoose.Schema({
      walletAddress: { type: String, required: true, unique: true },
      role: { type: String, default: 'USER' },
      isAdmin: { type: Boolean, default: false },
      isSuperAdmin: { type: Boolean, default: false },
      isPlatformAdmin: { type: Boolean, default: false },
      isAmcAdmin: { type: Boolean, default: false },
      hederaAccountId: { type: String },
      hederaPrivateKey: { type: String },
      permissions: [String],
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });

    const User = mongoose.model('User', userSchema);

    // Check the user with wallet address 0.0.6916959
    const user = await User.findOne({ 
      walletAddress: '0.0.6916959' 
    });

    if (!user) {
      console.log('❌ User not found with wallet address 0.0.6916959');
      return;
    }

    console.log('📋 User found:');
    console.log('   - Wallet Address:', user.walletAddress);
    console.log('   - Role:', user.role);
    console.log('   - isAdmin:', user.isAdmin);
    console.log('   - isSuperAdmin:', user.isSuperAdmin);
    console.log('   - isPlatformAdmin:', user.isPlatformAdmin);
    console.log('   - isAmcAdmin:', user.isAmcAdmin);
    console.log('   - Hedera Account ID:', user.hederaAccountId);
    console.log('   - Permissions:', user.permissions);

    // Test the query that the backend uses
    const adminUser = await User.findOne({
      walletAddress: '0.0.6916959'.toLowerCase(),
      role: { $in: ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'AMC_ADMIN', 'ADMIN'] }
    });

    console.log('\n🔍 Backend query test:');
    console.log('   - Admin user found:', !!adminUser);
    if (adminUser) {
      console.log('   - Role:', adminUser.role);
    }

    // Test different case variations
    const variations = [
      '0.0.6916959',
      '0.0.6916959'.toLowerCase(),
      '0.0.6916959'.toUpperCase()
    ];

    console.log('\n🔍 Testing different case variations:');
    for (const variation of variations) {
      const testUser = await User.findOne({
        walletAddress: variation,
        role: { $in: ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'AMC_ADMIN', 'ADMIN'] }
      });
      console.log(`   - "${variation}": ${!!testUser}`);
    }

  } catch (error) {
    console.error('❌ Error verifying admin DB:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

// Run the script
verifyAdminDB();
