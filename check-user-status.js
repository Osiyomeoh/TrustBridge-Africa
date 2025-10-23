const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://trustbridge:trustbridge123@cluster0.6hq8k.mongodb.net/trustbridge?retryWrites=true&w=majority';

async function checkUserStatus() {
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
    
    const users = await User.find({}).select('walletAddress role email createdAt').limit(10);
    
    console.log('\n=== RECENT USERS ===');
    console.log(`Found ${users.length} users:`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. Wallet: ${user.walletAddress}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Email: ${user.email || 'N/A'}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('   ---');
    });

    // Check total users
    const totalUsers = await User.countDocuments();
    console.log(`\n=== SUMMARY ===`);
    console.log(`Total users: ${totalUsers}`);

    // Check admin users specifically
    const adminUsers = await User.find({
      role: { $in: ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'AMC_ADMIN', 'ADMIN'] }
    });
    console.log(`Admin users: ${adminUsers.length}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkUserStatus();
