const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://trustbridge:trustbridge123@cluster0.6hq8k.mongodb.net/trustbridge?retryWrites=true&w=majority';

async function verifyAdminStatus() {
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

    // Find all users with admin roles
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    
    const adminUsers = await User.find({
      role: { $in: ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'AMC_ADMIN', 'ADMIN'] }
    }).select('walletAddress role email createdAt');

    console.log('\n=== ADMIN USERS ===');
    console.log(`Found ${adminUsers.length} admin users:`);
    
    adminUsers.forEach((user, index) => {
      console.log(`${index + 1}. Wallet: ${user.walletAddress}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Email: ${user.email || 'N/A'}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('   ---');
    });

    // Find users with the specific wallet address
    const specificWallet = '0x1234567890123456789012345678901234567890'; // Replace with actual wallet
    const specificUser = await User.findOne({ walletAddress: specificWallet });
    
    if (specificUser) {
      console.log(`\n=== USER WITH WALLET ${specificWallet} ===`);
      console.log(`Role: ${specificUser.role}`);
      console.log(`Email: ${specificUser.email || 'N/A'}`);
      console.log(`Created: ${specificUser.createdAt}`);
    } else {
      console.log(`\n=== NO USER FOUND WITH WALLET ${specificWallet} ===`);
    }

    // Check total users
    const totalUsers = await User.countDocuments();
    console.log(`\n=== SUMMARY ===`);
    console.log(`Total users: ${totalUsers}`);
    console.log(`Admin users: ${adminUsers.length}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

verifyAdminStatus();
