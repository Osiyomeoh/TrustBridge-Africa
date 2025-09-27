import { ethers } from 'ethers';

// Hedera Testnet configuration
const HEDERA_TESTNET_RPC = 'https://testnet.hashio.io/api';
const TRUST_TOKEN_ADDRESS = '0x170B35e97C217dBf63a500EaB884392F7BF6Ec34';

// TRUST Token ABI
const TRUST_TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function paused() view returns (bool)",
  "function hasRole(bytes32 role, address account) view returns (bool)",
  "function getRoleAdmin(bytes32 role) view returns (bytes32)",
  "function DEFAULT_ADMIN_ROLE() view returns (bytes32)",
  "function MINTER_ROLE() view returns (bytes32)",
  "function BURNER_ROLE() view returns (bytes32)"
];

async function testContractStorage() {
  try {
    console.log('🔍 Testing TRUST token contract storage...');
    
    const provider = new ethers.JsonRpcProvider(HEDERA_TESTNET_RPC);
    const trustToken = new ethers.Contract(TRUST_TOKEN_ADDRESS, TRUST_TOKEN_ABI, provider);
    
    console.log('📍 TRUST Token address:', TRUST_TOKEN_ADDRESS);
    
    // Check basic contract info
    try {
      const name = await trustToken.name();
      const symbol = await trustToken.symbol();
      const decimals = await trustToken.decimals();
      const totalSupply = await trustToken.totalSupply();
      const isPaused = await trustToken.paused();
      
      console.log('🪙 Token info:', name, `(${symbol})`);
      console.log('🔢 Decimals:', decimals);
      console.log('📊 Total supply:', ethers.formatEther(totalSupply), 'TRUST');
      console.log('⏸️ Paused:', isPaused);
    } catch (error) {
      console.log('⚠️ Could not get basic info:', error.message);
    }
    
    // Check roles
    try {
      const DEFAULT_ADMIN_ROLE = await trustToken.DEFAULT_ADMIN_ROLE();
      const MINTER_ROLE = await trustToken.MINTER_ROLE();
      const BURNER_ROLE = await trustToken.BURNER_ROLE();
      
      console.log('🔐 DEFAULT_ADMIN_ROLE:', DEFAULT_ADMIN_ROLE);
      console.log('🔐 MINTER_ROLE:', MINTER_ROLE);
      console.log('🔐 BURNER_ROLE:', BURNER_ROLE);
      
      // Check if deployer has roles
      const deployerAddress = '0xA6e8bf8E89Bd2c2BD37e308F275C4f52284a911F';
      const userAddress = '0xa620f55Ec17bf98d9898E43878c22c10b5324069';
      
      const deployerHasAdmin = await trustToken.hasRole(DEFAULT_ADMIN_ROLE, deployerAddress);
      const userHasAdmin = await trustToken.hasRole(DEFAULT_ADMIN_ROLE, userAddress);
      
      console.log('👑 Deployer has admin role:', deployerHasAdmin);
      console.log('👤 User has admin role:', userHasAdmin);
      
    } catch (error) {
      console.log('⚠️ Could not check roles:', error.message);
    }
    
    // Check if the issue is with the contract's state
    console.log('\n🔍 Checking contract state...');
    
    // Try to read some storage slots
    try {
      // Check if the contract has any custom validation
      const contractCode = await provider.getCode(TRUST_TOKEN_ADDRESS);
      console.log('📄 Contract code length:', contractCode.length);
      
      // Check if the contract is a proxy
      if (contractCode.includes('0x608060405234801561001057600080fd5b50')) {
        console.log('🔍 Contract appears to be a proxy');
      } else {
        console.log('🔍 Contract appears to be a direct implementation');
      }
      
    } catch (error) {
      console.log('⚠️ Could not check contract code:', error.message);
    }
    
    // Try to understand the error codes
    console.log('\n🔍 Analyzing error codes...');
    const errorCodes = {
      '0xe450d38c': 'transfer error',
      '0xfb8f41b2': 'transferFrom error'
    };
    
    for (const [code, description] of Object.entries(errorCodes)) {
      console.log(`❌ ${code}: ${description}`);
    }
    
    // Check if the issue is with the contract's initialization
    console.log('\n🧪 Testing contract initialization...');
    
    try {
      // Try to call a simple view function
      const balance = await trustToken.balanceOf('0x0000000000000000000000000000000000000000');
      console.log('✅ Contract is responsive (zero address balance):', ethers.formatEther(balance), 'TRUST');
    } catch (error) {
      console.log('❌ Contract is not responsive:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error testing contract storage:', error);
  }
}

testContractStorage();
