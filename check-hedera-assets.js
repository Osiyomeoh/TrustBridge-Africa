const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://trustbridge:trustbridge123@cluster0.6hq8k.mongodb.net/trustbridge?retryWrites=true&w=majority';

async function checkHederaAssets() {
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

    // Find all assets
    const Asset = mongoose.model('Asset', new mongoose.Schema({}, { strict: false }));
    
    const assets = await Asset.find({}).select('assetId name type status totalValue tokenContract hederaTokenId createdAt updatedAt');
    
    console.log('\n=== REAL ASSETS IN DATABASE ===');
    console.log(`Found ${assets.length} assets:`);
    
    if (assets.length === 0) {
      console.log('❌ No assets found in database');
      console.log('This means no real RWA assets have been created yet');
    } else {
      assets.forEach((asset, index) => {
        console.log(`${index + 1}. Asset ID: ${asset.assetId}`);
        console.log(`   Name: ${asset.name || 'N/A'}`);
        console.log(`   Type: ${asset.type || 'N/A'}`);
        console.log(`   Status: ${asset.status || 'N/A'}`);
        console.log(`   Total Value: ${asset.totalValue || 'N/A'}`);
        console.log(`   Token Contract: ${asset.tokenContract || 'N/A'}`);
        console.log(`   Hedera Token ID: ${asset.hederaTokenId || 'N/A'}`);
        console.log(`   Created: ${asset.createdAt}`);
        console.log(`   Updated: ${asset.updatedAt}`);
        console.log('   ---');
      });
    }

    // Check for any Hedera token IDs
    const assetsWithHederaTokens = await Asset.find({ 
      hederaTokenId: { $exists: true, $ne: null, $ne: '' } 
    });
    
    console.log(`\n=== ASSETS WITH HEDERA TOKENS ===`);
    console.log(`Found ${assetsWithHederaTokens.length} assets with Hedera tokens:`);
    
    assetsWithHederaTokens.forEach((asset, index) => {
      console.log(`${index + 1}. ${asset.name} - Token ID: ${asset.hederaTokenId}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkHederaAssets();
