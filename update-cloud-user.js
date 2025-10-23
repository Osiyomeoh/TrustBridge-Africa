#!/usr/bin/env node

/**
 * Script to update the user role to SUPER_ADMIN in the cloud database
 */

const mongoose = require('mongoose');

// Connect to MongoDB Atlas
const MONGODB_URI = 'mongodb+srv://devcasta:NQZ2mqBmiG1nXwQa@cluster0.ilmv3jy.mongodb.net/trustbridge?retryWrites=true&w=majority&appName=Cluster0';

async function updateCloudUser() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

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
    console.log(`🔍 Updating user role for wallet: ${walletAddress}`);

    // Find the user
    const user = await User.findOne({ walletAddress });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('📋 Current user data:');
    console.log('   - ID:', user._id);
    console.log('   - Role:', user.role);
    console.log('   - isAdmin:', user.isAdmin);
    console.log('   - isSuperAdmin:', user.isSuperAdmin);

    // Update to SUPER_ADMIN
    const updateResult = await User.updateOne(
      { _id: user._id },
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
    console.log('   - ID:', updatedUser._id);
    console.log('   - Role:', updatedUser.role);
    console.log('   - isAdmin:', updatedUser.isAdmin);
    console.log('   - isSuperAdmin:', updatedUser.isSuperAdmin);
    console.log('   - isPlatformAdmin:', updatedUser.isPlatformAdmin);
    console.log('   - isAmcAdmin:', updatedUser.isAmcAdmin);

  } catch (error) {
    console.error('❌ Error updating cloud user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB Atlas');
  }
}

// Run the script
updateCloudUser();
