#!/usr/bin/env node

/**
 * Script to test Hedera admin account checking
 */

const mongoose = require('mongoose');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trustbridge';

async function testHederaAdmin() {
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

    // Test the exact logic from the backend
    const accountId = '0.0.6916959';
    console.log(`🔍 Testing Hedera admin check for account: ${accountId}`);

    // Step 1: Check if account exists in database with admin role
    const user = await User.findOne({
      walletAddress: accountId.toLowerCase(),
      role: { $in: ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'AMC_ADMIN', 'ADMIN'] }
    });

    console.log('📋 Step 1 - Database check:');
    console.log('   - User found:', !!user);
    if (user) {
      console.log('   - Role:', user.role);
      console.log('   - Wallet Address:', user.walletAddress);
    }

    // Step 2: Test the role mapping
    if (user) {
      console.log('\n📋 Step 2 - Role mapping test:');
      switch (user.role) {
        case 'SUPER_ADMIN':
          console.log('   - Mapped to: SUPER_ADMIN');
          break;
        case 'PLATFORM_ADMIN':
          console.log('   - Mapped to: PLATFORM_ADMIN');
          break;
        case 'AMC_ADMIN':
          console.log('   - Mapped to: AMC_ADMIN');
          break;
        case 'ADMIN':
          console.log('   - Mapped to: ADMIN');
          break;
        default:
          console.log('   - No mapping found for role:', user.role);
      }
    }

    // Step 3: Test the final admin role object creation
    if (user) {
      console.log('\n📋 Step 3 - Admin role object test:');
      switch (user.role) {
        case 'SUPER_ADMIN':
          console.log('   - Would return: { isAdmin: true, isSuperAdmin: true, isPlatformAdmin: true, isAmcAdmin: true, role: "HEDERA_SUPER_ADMIN" }');
          break;
        case 'PLATFORM_ADMIN':
          console.log('   - Would return: { isAdmin: true, isSuperAdmin: false, isPlatformAdmin: true, isAmcAdmin: false, role: "HEDERA_PLATFORM_ADMIN" }');
          break;
        case 'AMC_ADMIN':
          console.log('   - Would return: { isAdmin: true, isSuperAdmin: false, isPlatformAdmin: false, isAmcAdmin: true, role: "HEDERA_AMC_ADMIN" }');
          break;
        default:
          console.log('   - Would return default role');
      }
    }

  } catch (error) {
    console.error('❌ Error testing Hedera admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

// Run the script
testHederaAdmin();
