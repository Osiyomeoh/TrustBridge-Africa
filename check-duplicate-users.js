#!/usr/bin/env node

/**
 * Script to check for duplicate users with the same wallet address
 */

const mongoose = require('mongoose');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trustbridge';

async function checkDuplicateUsers() {
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
    console.log(`🔍 Checking for users with wallet address: ${walletAddress}`);

    // Find ALL users with this wallet address (case insensitive)
    const users = await User.find({
      $or: [
        { walletAddress: walletAddress },
        { walletAddress: walletAddress.toLowerCase() },
        { walletAddress: walletAddress.toUpperCase() },
        { walletAddress: { $regex: new RegExp(`^${walletAddress}$`, 'i') } }
      ]
    });

    console.log(`📊 Found ${users.length} user(s) with wallet address ${walletAddress}:`);

    users.forEach((user, index) => {
      console.log(`\n👤 User ${index + 1}:`);
      console.log('   - ID:', user._id);
      console.log('   - Wallet Address:', user.walletAddress);
      console.log('   - Role:', user.role);
      console.log('   - isAdmin:', user.isAdmin);
      console.log('   - isSuperAdmin:', user.isSuperAdmin);
      console.log('   - isPlatformAdmin:', user.isPlatformAdmin);
      console.log('   - isAmcAdmin:', user.isAmcAdmin);
      console.log('   - Created At:', user.createdAt);
      console.log('   - Updated At:', user.updatedAt);
    });

    // Check for exact matches
    const exactMatch = await User.findOne({ walletAddress: walletAddress });
    console.log(`\n🎯 Exact match for "${walletAddress}":`, !!exactMatch);
    if (exactMatch) {
      console.log('   - Role:', exactMatch.role);
    }

    // Check for case-insensitive matches
    const caseInsensitiveMatch = await User.findOne({
      walletAddress: { $regex: new RegExp(`^${walletAddress}$`, 'i') }
    });
    console.log(`\n🔍 Case-insensitive match for "${walletAddress}":`, !!caseInsensitiveMatch);
    if (caseInsensitiveMatch) {
      console.log('   - Role:', caseInsensitiveMatch.role);
    }

  } catch (error) {
    console.error('❌ Error checking duplicate users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

// Run the script
checkDuplicateUsers();
