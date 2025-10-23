const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://trustbridge:trustbridge123@cluster0.6hq8k.mongodb.net/trustbridge?retryWrites=true&w=majority';

async function checkUserAdminStatus() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    });
    console.log('Connected to MongoDB');

    // Find all users
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    
    const users = await User.find({}).select('walletAddress role email isActive createdAt updatedAt');
    
    console.log('\n=== ALL USERS ===');
    console.log(`Found ${users.length} users:`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. Wallet: ${user.walletAddress}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Email: ${user.email || 'N/A'}`);
      console.log(`   Active: ${user.isActive !== false ? 'Yes' : 'No'}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log(`   Updated: ${user.updatedAt}`);
      console.log('   ---');
    });

    // Check for admin users specifically
    const adminUsers = await User.find({
      role: { $in: ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'AMC_ADMIN', 'ADMIN'] }
    });
    
    console.log('\n=== ADMIN USERS ===');
    console.log(`Found ${adminUsers.length} admin users:`);
    
    adminUsers.forEach((user, index) => {
      console.log(`${index + 1}. Wallet: ${user.walletAddress}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Email: ${user.email || 'N/A'}`);
      console.log('   ---');
    });

    // Check for your specific wallet (replace with your actual wallet)
    const yourWallet = '0x1234567890123456789012345678901234567890'; // Replace with your wallet
    const yourUser = await User.findOne({ walletAddress: yourWallet });
    
    if (yourUser) {
      console.log(`\n=== YOUR USER ACCOUNT ===`);
      console.log(`Wallet: ${yourUser.walletAddress}`);
      console.log(`Role: ${yourUser.role}`);
      console.log(`Email: ${yourUser.email || 'N/A'}`);
      console.log(`Active: ${yourUser.isActive !== false ? 'Yes' : 'No'}`);
      console.log(`Created: ${yourUser.createdAt}`);
      console.log(`Updated: ${yourUser.updatedAt}`);
      
      if (!['SUPER_ADMIN', 'PLATFORM_ADMIN', 'AMC_ADMIN', 'ADMIN'].includes(yourUser.role)) {
        console.log('\n❌ ISSUE FOUND: Your account does not have admin privileges!');
        console.log('Solution: Update your role to SUPER_ADMIN, PLATFORM_ADMIN, AMC_ADMIN, or ADMIN');
      } else {
        console.log('\n✅ Your account has admin privileges!');
      }
    } else {
      console.log(`\n❌ ISSUE FOUND: No user found with wallet ${yourWallet}`);
      console.log('Solution: Create a user account or check your wallet address');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkUserAdminStatus();
