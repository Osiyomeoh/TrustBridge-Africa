import { ethers } from 'ethers';

// Hedera Testnet configuration
const HEDERA_TESTNET_RPC = 'https://testnet.hashio.io/api';
const CORE_ASSET_FACTORY_ADDRESS = '0xF743D30062Bc04c69fC2F07F216C0357F0bDdb76';

// ABI to check enum values
const ENUM_ABI = [
  "function DIGITAL_ART() view returns (uint8)",
  "function MUSIC() view returns (uint8)",
  "function GAMING() view returns (uint8)",
  "function VIRTUAL_REAL_ESTATE() view returns (uint8)",
  "function SOCIAL_CONTENT() view returns (uint8)",
  "function MEMES() view returns (uint8)",
  "function VIRAL_CONTENT() view returns (uint8)"
];

async function testEnumValues() {
  try {
    console.log('🔍 Testing enum values...');
    
    const provider = new ethers.JsonRpcProvider(HEDERA_TESTNET_RPC);
    const contract = new ethers.Contract(CORE_ASSET_FACTORY_ADDRESS, ENUM_ABI, provider);
    
    console.log('📍 Contract address:', CORE_ASSET_FACTORY_ADDRESS);
    
    // Check if contract has these functions
    try {
      const digitalArt = await contract.DIGITAL_ART();
      console.log('🎨 DIGITAL_ART enum value:', digitalArt);
    } catch (error) {
      console.log('⚠️ Could not get DIGITAL_ART enum:', error.message);
    }
    
    try {
      const music = await contract.MUSIC();
      console.log('🎵 MUSIC enum value:', music);
    } catch (error) {
      console.log('⚠️ Could not get MUSIC enum:', error.message);
    }
    
    try {
      const gaming = await contract.GAMING();
      console.log('🎮 GAMING enum value:', gaming);
    } catch (error) {
      console.log('⚠️ Could not get GAMING enum:', error.message);
    }
    
    // Let's try a different approach - check if the contract has a function to get enum values
    console.log('\n🔍 Checking contract functions...');
    
    // Try to call createDigitalAsset with a simple test
    const testABI = [
      "function createDigitalAsset(uint8 _category, string memory _assetTypeString, string memory _name, string memory _location, uint256 _totalValue, string memory _imageURI, string memory _description) external returns (bytes32)"
    ];
    
    const testContract = new ethers.Contract(CORE_ASSET_FACTORY_ADDRESS, testABI, provider);
    
    // Try to estimate gas for the function call
    try {
      console.log('🧪 Testing gas estimation...');
      const gasEstimate = await testContract.createDigitalAsset.estimateGas(
        6, // category
        "test", // assetTypeString
        "test", // name
        "test", // location
        ethers.parseEther("1000"), // totalValue
        "https://test.com/image.jpg", // imageURI
        "test" // description
      );
      console.log('✅ Gas estimate successful:', gasEstimate.toString());
    } catch (error) {
      console.log('❌ Gas estimate failed:', error.message);
      console.log('❌ Error data:', error.data);
    }
    
  } catch (error) {
    console.error('❌ Error testing enum values:', error);
  }
}

testEnumValues();
