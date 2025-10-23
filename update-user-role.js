#!/usr/bin/env node

/**
 * Script to update the user role for the Hedera account to SUPER_ADMIN
 */

const mongoose = require('mongoose');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trustbridge';

async function updateUserRole() {
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

    // Find the user with wallet address 0.0.6916959
    const user = await User.findOne({ 
      walletAddress: '0.0.6916959' 
    });

    if (!user) {
      console.log('❌ User not found with wallet address 0.0.6916959');
      return;
    }

    console.log('📋 Current user details:');
    console.log('   - Role:', user.role);
    console.log('   - isAdmin:', user.isAdmin);
    console.log('   - isSuperAdmin:', user.isSuperAdmin);
    console.log('   - isPlatformAdmin:', user.isPlatformAdmin);
    console.log('   - isAmcAdmin:', user.isAmcAdmin);

    // Update the user to super admin
    const updatedUser = await User.findOneAndUpdate(
      { walletAddress: '0.0.6916959' },
      {
        role: 'SUPER_ADMIN',
        isAdmin: true,
        isSuperAdmin: true,
        isPlatformAdmin: true,
        isAmcAdmin: true,
        hederaAccountId: '0.0.6916959',
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
      },
      { new: true }
    );

    console.log('✅ User role updated successfully!');
    console.log('📋 Updated user details:');
    console.log('   - Role:', updatedUser.role);
    console.log('   - isAdmin:', updatedUser.isAdmin);
    console.log('   - isSuperAdmin:', updatedUser.isSuperAdmin);
    console.log('   - isPlatformAdmin:', updatedUser.isPlatformAdmin);
    console.log('   - isAmcAdmin:', updatedUser.isAmcAdmin);
    console.log('   - Permissions:', updatedUser.permissions);

    console.log('🎉 Super admin setup complete!');
    console.log('You should now be able to access the admin dashboard.');

  } catch (error) {
    console.error('❌ Error updating user role:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

// Run the script
updateUserRole();
