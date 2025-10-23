const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://trustbridge:trustbridge123@cluster0.6hq8k.mongodb.net/trustbridge?retryWrites=true&w=majority';

async function createSampleAssets() {
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

    // Define Asset schema
    const AssetSchema = new mongoose.Schema({
      assetId: { type: String, required: true, unique: true },
      owner: { type: String, required: true },
      type: { type: String, required: true },
      name: { type: String, required: true },
      description: { type: String },
      location: {
        country: { type: String, required: true },
        region: { type: String, required: true },
        address: { type: String },
        coordinates: {
          lat: { type: Number },
          lng: { type: Number }
        }
      },
      totalValue: { type: Number, required: true },
      tokenSupply: { type: Number, required: true },
      tokenizedAmount: { type: Number, default: 0 },
      maturityDate: { type: Date, required: true },
      expectedAPY: { type: Number, required: true },
      verificationScore: { type: Number, default: 0 },
      status: { type: String, default: 'PENDING' },
      tokenContract: { type: String },
      transactionHash: { type: String },
      verificationData: { type: mongoose.Schema.Types.Mixed },
      investments: { type: [mongoose.Schema.Types.Mixed], default: [] },
      operations: { type: [String], default: [] }
    }, { timestamps: true });

    const Asset = mongoose.model('Asset', AssetSchema);

    // Sample RWA assets
    const sampleAssets = [
      {
        assetId: 'RWA-001-AGRICULTURAL',
        owner: '0x1234567890123456789012345678901234567890', // Replace with actual wallet
        type: 'AGRICULTURAL',
        name: 'Premium Coffee Plantation - Costa Rica',
        description: 'A 50-hectare premium coffee plantation in the Central Valley of Costa Rica, producing high-quality Arabica beans. The plantation has been family-owned for three generations and includes modern processing facilities.',
        location: {
          country: 'Costa Rica',
          region: 'Central Valley',
          address: 'Finca El Paraíso, Central Valley, Costa Rica',
          coordinates: { lat: 9.9281, lng: -84.0907 }
        },
        totalValue: 2500000,
        tokenSupply: 1000000,
        maturityDate: new Date('2026-12-31'),
        expectedAPY: 8.5,
        verificationScore: 75,
        status: 'PENDING',
        verificationData: {
          documents: ['deed.pdf', 'certification.pdf', 'inspection.pdf'],
          photos: ['plantation1.jpg', 'plantation2.jpg', 'processing.jpg'],
          inspectionDate: new Date('2024-01-15'),
          inspectorNotes: 'Well-maintained plantation with modern facilities'
        }
      },
      {
        assetId: 'RWA-002-REAL_ESTATE',
        owner: '0x1234567890123456789012345678901234567890',
        type: 'REAL_ESTATE',
        name: 'Commercial Office Building - Downtown Miami',
        description: 'A 15-story Class A office building in the heart of downtown Miami, featuring modern amenities, LEED certification, and 95% occupancy rate. Prime location with excellent transportation access.',
        location: {
          country: 'United States',
          region: 'Florida',
          address: '123 Biscayne Blvd, Miami, FL 33132',
          coordinates: { lat: 25.7743, lng: -80.1937 }
        },
        totalValue: 45000000,
        tokenSupply: 4500000,
        maturityDate: new Date('2027-06-30'),
        expectedAPY: 6.8,
        verificationScore: 85,
        status: 'PENDING',
        verificationData: {
          documents: ['title.pdf', 'appraisal.pdf', 'lease_agreements.pdf'],
          photos: ['building_exterior.jpg', 'lobby.jpg', 'office_space.jpg'],
          inspectionDate: new Date('2024-02-01'),
          inspectorNotes: 'Excellent condition, all systems operational'
        }
      },
      {
        assetId: 'RWA-003-EQUIPMENT',
        owner: '0x1234567890123456789012345678901234567890',
        type: 'EQUIPMENT',
        name: 'Heavy Construction Equipment Fleet',
        description: 'A fleet of 25 heavy construction machines including excavators, bulldozers, cranes, and trucks. All equipment is well-maintained with complete service records and currently under profitable contracts.',
        location: {
          country: 'Canada',
          region: 'Ontario',
          address: 'Construction Equipment Depot, Toronto, ON',
          coordinates: { lat: 43.6532, lng: -79.3832 }
        },
        totalValue: 12000000,
        tokenSupply: 1200000,
        maturityDate: new Date('2025-12-31'),
        expectedAPY: 12.0,
        verificationScore: 70,
        status: 'PENDING',
        verificationData: {
          documents: ['equipment_list.pdf', 'service_records.pdf', 'contracts.pdf'],
          photos: ['fleet_overview.jpg', 'excavator.jpg', 'crane.jpg'],
          inspectionDate: new Date('2024-01-20'),
          inspectorNotes: 'All equipment in good working condition'
        }
      },
      {
        assetId: 'RWA-004-COMMODITY',
        owner: '0x1234567890123456789012345678901234567890',
        type: 'COMMODITY',
        name: 'Gold Bullion Reserve',
        description: '500 kg of certified 99.9% pure gold bullion stored in a secure, insured vault facility. All bars are certified by recognized refiners and include proper documentation.',
        location: {
          country: 'Switzerland',
          region: 'Zurich',
          address: 'Secure Vault Facility, Zurich, Switzerland',
          coordinates: { lat: 47.3769, lng: 8.5417 }
        },
        totalValue: 35000000,
        tokenSupply: 3500000,
        maturityDate: new Date('2026-03-31'),
        expectedAPY: 4.2,
        verificationScore: 95,
        status: 'PENDING',
        verificationData: {
          documents: ['vault_receipt.pdf', 'assayer_certificate.pdf', 'insurance.pdf'],
          photos: ['gold_bars.jpg', 'vault_security.jpg', 'certificates.jpg'],
          inspectionDate: new Date('2024-02-10'),
          inspectorNotes: 'All gold verified and properly stored'
        }
      },
      {
        assetId: 'RWA-005-INVENTORY',
        owner: '0x1234567890123456789012345678901234567890',
        type: 'INVENTORY',
        name: 'Premium Wine Collection',
        description: 'A curated collection of 10,000 bottles of premium wines from renowned vineyards across France, Italy, and California. Collection includes vintage wines with excellent aging potential.',
        location: {
          country: 'France',
          region: 'Bordeaux',
          address: 'Climate-Controlled Wine Cellar, Bordeaux, France',
          coordinates: { lat: 44.8378, lng: -0.5792 }
        },
        totalValue: 8500000,
        tokenSupply: 850000,
        maturityDate: new Date('2028-12-31'),
        expectedAPY: 15.0,
        verificationScore: 80,
        status: 'PENDING',
        verificationData: {
          documents: ['inventory_list.pdf', 'authenticity_certificates.pdf', 'storage_contract.pdf'],
          photos: ['wine_cellar.jpg', 'wine_bottles.jpg', 'vintage_collection.jpg'],
          inspectionDate: new Date('2024-02-05'),
          inspectorNotes: 'Excellent collection with proper storage conditions'
        }
      }
    ];

    console.log('\n🚀 Creating sample RWA assets...');
    
    // Clear existing assets first
    await Asset.deleteMany({});
    console.log('Cleared existing assets');

    // Insert sample assets
    for (const asset of sampleAssets) {
      const newAsset = new Asset(asset);
      await newAsset.save();
      console.log(`✅ Created asset: ${asset.name} (${asset.assetId})`);
    }

    console.log(`\n🎉 Successfully created ${sampleAssets.length} sample RWA assets!`);
    console.log('\n📊 Asset Summary:');
    sampleAssets.forEach((asset, index) => {
      console.log(`${index + 1}. ${asset.name}`);
      console.log(`   Type: ${asset.type}`);
      console.log(`   Value: $${asset.totalValue.toLocaleString()}`);
      console.log(`   APY: ${asset.expectedAPY}%`);
      console.log(`   Status: ${asset.status}`);
      console.log('   ---');
    });

  } catch (error) {
    console.error('Error creating sample assets:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

createSampleAssets();
