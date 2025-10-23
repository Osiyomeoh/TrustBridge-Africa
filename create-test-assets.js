const axios = require('axios');

const BASE_URL = 'http://localhost:4001';

// Sample assets data
const sampleAssets = [
  {
    assetId: 'RWA-001-AGRICULTURAL',
    owner: '0x1234567890123456789012345678901234567890',
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
    maturityDate: '2026-12-31T00:00:00.000Z',
    expectedAPY: 8.5,
    verificationScore: 75,
    status: 'PENDING'
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
    maturityDate: '2027-06-30T00:00:00.000Z',
    expectedAPY: 6.8,
    verificationScore: 85,
    status: 'PENDING'
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
    maturityDate: '2025-12-31T00:00:00.000Z',
    expectedAPY: 12.0,
    verificationScore: 70,
    status: 'PENDING'
  }
];

async function createSampleAssets() {
  try {
    console.log('🚀 Creating sample RWA assets...');
    
    for (const asset of sampleAssets) {
      try {
        console.log(`Creating asset: ${asset.name}`);
        
        const response = await axios.post(`${BASE_URL}/api/assets`, asset, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        console.log(`✅ Successfully created: ${asset.name} (${asset.assetId})`);
      } catch (error) {
        if (error.response?.status === 401) {
          console.log(`⚠️  Asset ${asset.name} already exists or authentication required`);
        } else {
          console.error(`❌ Error creating ${asset.name}:`, error.response?.data || error.message);
        }
      }
    }
    
    console.log('\n🎉 Sample asset creation completed!');
    
    // Try to list assets
    try {
      console.log('\n📋 Fetching all assets...');
      const response = await axios.get(`${BASE_URL}/api/assets`);
      console.log(`Found ${response.data.length} assets in the system`);
      
      response.data.forEach((asset, index) => {
        console.log(`${index + 1}. ${asset.name} (${asset.status})`);
      });
    } catch (error) {
      console.log('Could not fetch assets:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

createSampleAssets();
