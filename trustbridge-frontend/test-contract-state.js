import { ethers } from 'ethers';

// Hedera Testnet configuration
const HEDERA_TESTNET_RPC = 'https://testnet.hashio.io/api';
const CORE_ASSET_FACTORY_ADDRESS = '0xF743D30062Bc04c69fC2F07F216C0357F0bDdb76';
const TRUST_TOKEN_ADDRESS = '0x170B35e97C217dBf63a500EaB884392F7BF6Ec34';

// Basic ABI for checking contract state
const BASIC_ABI = [
  "function paused() view returns (bool)",
  "function hasRole(bytes32 role, address account) view returns (bool)",
  "function getRoleAdmin(bytes32 role) view returns (bytes32)",
  "function owner() view returns (address)",
  "function feeRecipient() view returns (address)",
  "function DIGITAL_CREATION_FEE() view returns (uint256)",
  "function MIN_CREATION_FEE() view returns (uint256)"
];

async function testContractState() {
  try {
    console.log('🔍 Testing CoreAssetFactory contract state...');
    
    const provider = new ethers.JsonRpcProvider(HEDERA_TESTNET_RPC);
    const contract = new ethers.Contract(CORE_ASSET_FACTORY_ADDRESS, BASIC_ABI, provider);
    
    console.log('📍 Contract address:', CORE_ASSET_FACTORY_ADDRESS);
    
    // Check if contract exists
    const code = await provider.getCode(CORE_ASSET_FACTORY_ADDRESS);
    console.log('📄 Contract code length:', code.length);
    
    if (code === '0x') {
      console.log('❌ Contract not deployed at this address');
      return;
    }
    
    // Check pause status
    try {
      const isPaused = await contract.paused();
      console.log('⏸️ Contract paused:', isPaused);
    } catch (error) {
      console.log('⚠️ Could not check pause status:', error.message);
    }
    
    // Check fees
    try {
      const digitalFee = await contract.DIGITAL_CREATION_FEE();
      const minFee = await contract.MIN_CREATION_FEE();
      console.log('💰 Digital creation fee:', ethers.formatEther(digitalFee), 'TRUST');
      console.log('💰 Min creation fee:', ethers.formatEther(minFee), 'TRUST');
    } catch (error) {
      console.log('⚠️ Could not check fees:', error.message);
    }
    
    // Check fee recipient
    try {
      const feeRecipient = await contract.feeRecipient();
      console.log('🏦 Fee recipient:', feeRecipient);
    } catch (error) {
      console.log('⚠️ Could not check fee recipient:', error.message);
    }
    
    // Check owner
    try {
      const owner = await contract.owner();
      console.log('👑 Owner:', owner);
    } catch (error) {
      console.log('⚠️ Could not check owner:', error.message);
    }
    
    // Check roles
    try {
      const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';
      const adminRole = await contract.getRoleAdmin(DEFAULT_ADMIN_ROLE);
      console.log('🔐 Admin role:', adminRole);
    } catch (error) {
      console.log('⚠️ Could not check admin role:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error testing contract:', error);
  }
}

testContractState();
