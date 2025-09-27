import { ethers } from 'ethers';

// Hedera Testnet configuration
const HEDERA_TESTNET_RPC = 'https://testnet.hashio.io/api';
const TRUST_TOKEN_ADDRESS = '0x170B35e97C217dBf63a500EaB884392F7BF6Ec34';

// TRUST Token ABI
const TRUST_TOKEN_ABI = [
  "function paused() view returns (bool)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function hasRole(bytes32 role, address account) view returns (bool)",
  "function getRoleAdmin(bytes32 role) view returns (bytes32)",
  "function DEFAULT_ADMIN_ROLE() view returns (bytes32)"
];

async function testTrustTokenState() {
  try {
    console.log('🔍 Testing TRUST token state...');
    
    const provider = new ethers.JsonRpcProvider(HEDERA_TESTNET_RPC);
    const trustToken = new ethers.Contract(TRUST_TOKEN_ADDRESS, TRUST_TOKEN_ABI, provider);
    
    console.log('📍 TRUST Token address:', TRUST_TOKEN_ADDRESS);
    
    // Check if contract exists
    const code = await provider.getCode(TRUST_TOKEN_ADDRESS);
    console.log('📄 Contract code length:', code.length);
    
    if (code === '0x') {
      console.log('❌ Contract not deployed at this address');
      return;
    }
    
    // Check pause status
    try {
      const isPaused = await trustToken.paused();
      console.log('⏸️ Contract paused:', isPaused);
    } catch (error) {
      console.log('⚠️ Could not check pause status:', error.message);
    }
    
    // Check basic info
    try {
      const name = await trustToken.name();
      const symbol = await trustToken.symbol();
      const decimals = await trustToken.decimals();
      const totalSupply = await trustToken.totalSupply();
      console.log('🪙 Token info:', name, `(${symbol})`);
      console.log('🔢 Decimals:', decimals);
      console.log('📊 Total supply:', ethers.formatEther(totalSupply), 'TRUST');
    } catch (error) {
      console.log('⚠️ Could not get token info:', error.message);
    }
    
    // Check roles
    try {
      const DEFAULT_ADMIN_ROLE = await trustToken.DEFAULT_ADMIN_ROLE();
      console.log('🔐 DEFAULT_ADMIN_ROLE:', DEFAULT_ADMIN_ROLE);
      
      // Check if deployer has admin role
      const deployerAddress = '0xA6e8bf8E89Bd2c2BD37e308F275C4f52284a911F';
      const hasAdminRole = await trustToken.hasRole(DEFAULT_ADMIN_ROLE, deployerAddress);
      console.log('👑 Deployer has admin role:', hasAdminRole);
    } catch (error) {
      console.log('⚠️ Could not check roles:', error.message);
    }
    
    // Try to decode the error
    console.log('\n🔍 Analyzing error code...');
    const errorCode = '0xfb8f41b2';
    console.log('❌ Error code:', errorCode);
    
    // Try to find this error in common OpenZeppelin errors
    const commonErrors = {
      '0x08c379a0': 'Error(string)',
      '0x4e487b71': 'Panic(uint256)',
      '0xfb8f41b2': 'Custom error (unknown)'
    };
    
    console.log('🔍 Error type:', commonErrors[errorCode] || 'Unknown error');
    
  } catch (error) {
    console.error('❌ Error testing TRUST token state:', error);
  }
}

testTrustTokenState();
