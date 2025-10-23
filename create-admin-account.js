#!/usr/bin/env node

/**
 * Script to create the initial Hedera super admin account
 * This bypasses the authentication requirement for initial setup
 */

const mongoose = require('mongoose');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trustbridge';

async function createSuperAdmin() {
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

    // Check if super admin already exists
    const existingAdmin = await User.findOne({ 
      walletAddress: '0.0.6916959' 
    });

    if (existingAdmin) {
      console.log('⚠️  Super admin already exists for account 0.0.6916959');
      console.log('Current admin status:', {
        isAdmin: existingAdmin.isAdmin,
        isSuperAdmin: existingAdmin.isSuperAdmin,
        role: existingAdmin.role
      });
      
      // Update to super admin if not already
      if (!existingAdmin.isSuperAdmin) {
        await User.findOneAndUpdate(
          { walletAddress: '0.0.6916959' },
          {
            isAdmin: true,
            isSuperAdmin: true,
            isPlatformAdmin: true,
            isAmcAdmin: true,
            role: 'SUPER_ADMIN',
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
        );
        console.log('✅ Updated existing account to super admin');
      }
    } else {
      // Create new super admin
      const superAdmin = new User({
        walletAddress: '0.0.6916959',
        hederaAccountId: '0.0.6916959',
        isAdmin: true,
        isSuperAdmin: true,
        isPlatformAdmin: true,
        isAmcAdmin: true,
        role: 'SUPER_ADMIN',
        permissions: [
          'manage_users',
          'manage_assets',
          'manage_pools',
          'manage_kyc',
          'view_analytics',
          'manage_hedera_tokens',
          'manage_hedera_assets',
          'manage_admin_accounts'
        ]
      });

      await superAdmin.save();
      console.log('✅ Created new super admin account for 0.0.6916959');
    }

    console.log('🎉 Super admin setup complete!');
    console.log('You can now access the admin dashboard with account 0.0.6916959');

  } catch (error) {
    console.error('❌ Error creating super admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

// Run the script
createSuperAdmin();
