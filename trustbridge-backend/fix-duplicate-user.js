#!/usr/bin/env node

/**
 * Script to fix duplicate user records
 */

const mongoose = require('mongoose');

// Connect to MongoDB
const MONGODB_URI = 'mongodb+srv://devcasta:NQZ2mqBmiG1nXwQa@cluster0.ilmv3jy.mongodb.net/trustbridge?retryWrites=true&w=majority&appName=Cluster0';

async function fixDuplicateUser() {
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

    const walletAddress = '0.0.6916959';
    console.log(`🔍 Fixing duplicate users for wallet: ${walletAddress}`);

    // Find ALL users with this wallet address
    const users = await User.find({
      walletAddress: { $regex: new RegExp(`^${walletAddress}$`, 'i') }
    });

    console.log(`📊 Found ${users.length} user(s):`);

    users.forEach((user, index) => {
      console.log(`\n👤 User ${index + 1}:`);
      console.log('   - ID:', user._id);
      console.log('   - Role:', user.role);
      console.log('   - Created At:', user.createdAt);
      console.log('   - Updated At:', user.updatedAt);
    });

    if (users.length > 1) {
      // Keep the user with SUPER_ADMIN role (newest one)
      const superAdminUser = users.find(u => u.role === 'SUPER_ADMIN');
      const oldUsers = users.filter(u => u.role !== 'SUPER_ADMIN');

      if (superAdminUser && oldUsers.length > 0) {
        console.log(`\n🗑️  Deleting ${oldUsers.length} old user(s) and keeping SUPER_ADMIN user...`);

        for (const oldUser of oldUsers) {
          console.log(`   - Deleting user ${oldUser._id} with role ${oldUser.role}`);
          await User.deleteOne({ _id: oldUser._id });
        }

        console.log(`✅ Kept user ${superAdminUser._id} with role ${superAdminUser.role}`);
      }
    }

    // Verify final state
    const finalUsers = await User.find({
      walletAddress: { $regex: new RegExp(`^${walletAddress}$`, 'i') }
    });

    console.log(`\n📋 Final state - ${finalUsers.length} user(s) remaining:`);
    finalUsers.forEach((user, index) => {
      console.log(`   - User ${index + 1}: ID=${user._id}, Role=${user.role}`);
    });

  } catch (error) {
    console.error('❌ Error fixing duplicate user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

// Run the script
fixDuplicateUser();
