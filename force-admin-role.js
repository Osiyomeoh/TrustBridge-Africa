const mongoose = require('mongoose');

// Try multiple MongoDB connection strings
const MONGODB_URIS = [
  process.env.MONGODB_URI,
  'mongodb+srv://trustbridge:trustbridge123@cluster0.6hq8k.mongodb.net/trustbridge?retryWrites=true&w=majority',
  'mongodb://localhost:27017/trustbridge',
  'mongodb://127.0.0.1:27017/trustbridge'
];

// Replace with your actual wallet address
const YOUR_WALLET_ADDRESS = '0x1234567890123456789012345678901234567890'; // UPDATE THIS!

async function forceAdminRole() {
  let connected = false;
  
  for (const uri of MONGODB_URIS) {
    if (!uri) continue;
    
    try {
      console.log(`Trying to connect to: ${uri.substring(0, 50)}...`);
      
      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferCommands: false,
      });
      
      console.log('✅ Connected to MongoDB!');
      connected = true;
      break;
      
    } catch (error) {
      console.log(`❌ Failed to connect: ${error.message}`);
      continue;
    }
  }
  
  if (!connected) {
    console.log('\n❌ Could not connect to any MongoDB instance');
    console.log('Please check your MongoDB connection or start a local MongoDB instance');
    return;
  }

  try {
    // Create a flexible User schema
    const UserSchema = new mongoose.Schema({}, { strict: false });
    const User = mongoose.model('User', UserSchema);
    
    console.log(`\n🔍 Looking for user with wallet: ${YOUR_WALLET_ADDRESS}`);
    
    // Find existing user
    let user = await User.findOne({ walletAddress: YOUR_WALLET_ADDRESS });
    
    if (user) {
      console.log('✅ Found existing user:');
      console.log(`   Role: ${user.role}`);
      console.log(`   Email: ${user.email || 'N/A'}`);
      console.log(`   Active: ${user.isActive !== false ? 'Yes' : 'No'}`);
      
      // Update role to SUPER_ADMIN
      await User.findOneAndUpdate(
        { walletAddress: YOUR_WALLET_ADDRESS },
        { 
          role: 'SUPER_ADMIN',
          isActive: true,
          updatedAt: new Date()
        }
      );
      
      console.log('✅ Updated user role to SUPER_ADMIN');
      
    } else {
      console.log('❌ User not found, creating new admin user...');
      
      // Create new admin user
      const newUser = new User({
        walletAddress: YOUR_WALLET_ADDRESS,
        email: 'admin@trustbridge.com',
        name: 'Super Admin',
        role: 'SUPER_ADMIN',
        isActive: true,
        kycStatus: 'approved',
        emailVerificationStatus: 'verified',
        reputation: 100,
        stakingBalance: 0,
        totalInvested: 0,
        investmentCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await newUser.save();
      console.log('✅ Created new SUPER_ADMIN user');
    }
    
    // Verify the update
    const updatedUser = await User.findOne({ walletAddress: YOUR_WALLET_ADDRESS });
    console.log('\n🎉 SUCCESS! User details:');
    console.log(`   Wallet: ${updatedUser.walletAddress}`);
    console.log(`   Role: ${updatedUser.role}`);
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Active: ${updatedUser.isActive !== false ? 'Yes' : 'No'}`);
    
    console.log('\n✅ Admin access should now work!');
    console.log('Try accessing: http://localhost:3000/admin/assets');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Check if wallet address is updated
if (YOUR_WALLET_ADDRESS === '0x1234567890123456789012345678901234567890') {
  console.log('⚠️  WARNING: Please update YOUR_WALLET_ADDRESS in this script!');
  console.log('Current wallet:', YOUR_WALLET_ADDRESS);
  console.log('Edit the script and replace with your actual wallet address');
  console.log('');
}

forceAdminRole();
