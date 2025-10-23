#!/usr/bin/env node

/**
 * Script to force update the user role to SUPER_ADMIN
 */

const mongoose = require('mongoose');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trustbridge';

async function forceUpdateUserRole() {
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
    console.log(`🔍 Force updating user role for wallet: ${walletAddress}`);

    // Find the user
    const user = await User.findOne({ walletAddress });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('📋 Current user data:');
    console.log('   - Role:', user.role);
    console.log('   - isAdmin:', user.isAdmin);
    console.log('   - isSuperAdmin:', user.isSuperAdmin);

    // Force update to SUPER_ADMIN
    const updateResult = await User.updateOne(
      { walletAddress },
      {
        $set: {
          role: 'SUPER_ADMIN',
          isAdmin: true,
          isSuperAdmin: true,
          isPlatformAdmin: true,
          isAmcAdmin: true,
          permissions: [
            'manage_users',
            'manage_assets',
            'manage_pools',
            'manage_kyc',
            'view_analytics',
            'manage_hedera_tokens',
            'manage_hedera_assets',
            'manage_admin_accounts'
          ],
          updatedAt: new Date()
        }
      }
    );

    console.log('📝 Update result:', updateResult);

    // Verify the update
    const updatedUser = await User.findOne({ walletAddress });
    console.log('✅ Updated user data:');
    console.log('   - Role:', updatedUser.role);
    console.log('   - isAdmin:', updatedUser.isAdmin);
    console.log('   - isSuperAdmin:', updatedUser.isSuperAdmin);
    console.log('   - isPlatformAdmin:', updatedUser.isPlatformAdmin);
    console.log('   - isAmcAdmin:', updatedUser.isAmcAdmin);

  } catch (error) {
    console.error('❌ Error updating user role:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

// Run the script
forceUpdateUserRole();
