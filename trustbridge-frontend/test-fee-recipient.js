import { ethers } from 'ethers';

// Hedera Testnet configuration
const HEDERA_TESTNET_RPC = 'https://testnet.hashio.io/api';
const CORE_ASSET_FACTORY_ADDRESS = '0xF743D30062Bc04c69fC2F07F216C0357F0bDdb76';
const TRUST_TOKEN_ADDRESS = '0x170B35e97C217dBf63a500EaB884392F7BF6Ec34';
const FEE_RECIPIENT = '0xA6e8bf8E89Bd2c2BD37e308F275C4f52284a911F';
const USER_ADDRESS = '0xa620f55Ec17bf98d9898E43878c22c10b5324069';

// ABI for checking roles and token balances
const ROLE_ABI = [
  "function hasRole(bytes32 role, address account) view returns (bool)",
  "function getRoleAdmin(bytes32 role) view returns (bytes32)",
  "function DEFAULT_ADMIN_ROLE() view returns (bytes32)"
];

const TRUST_TOKEN_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function name() view returns (string)",
  "function symbol() view returns (string)"
];

async function testFeeRecipient() {
  try {
    console.log('🔍 Testing fee recipient and token transfer...');
    
    const provider = new ethers.JsonRpcProvider(HEDERA_TESTNET_RPC);
    const contract = new ethers.Contract(CORE_ASSET_FACTORY_ADDRESS, ROLE_ABI, provider);
    const trustToken = new ethers.Contract(TRUST_TOKEN_ADDRESS, TRUST_TOKEN_ABI, provider);
    
    console.log('📍 CoreAssetFactory:', CORE_ASSET_FACTORY_ADDRESS);
    console.log('🏦 Fee recipient:', FEE_RECIPIENT);
    console.log('👤 User address:', USER_ADDRESS);
    
    // Check TRUST token info
    try {
      const name = await trustToken.name();
      const symbol = await trustToken.symbol();
      console.log('🪙 Token:', name, `(${symbol})`);
    } catch (error) {
      console.log('⚠️ Could not get token info:', error.message);
    }
    
    // Check user's TRUST balance
    try {
      const userBalance = await trustToken.balanceOf(USER_ADDRESS);
      console.log('💰 User TRUST balance:', ethers.formatEther(userBalance), 'TRUST');
    } catch (error) {
      console.log('⚠️ Could not get user balance:', error.message);
    }
    
    // Check fee recipient's TRUST balance
    try {
      const feeRecipientBalance = await trustToken.balanceOf(FEE_RECIPIENT);
      console.log('🏦 Fee recipient TRUST balance:', ethers.formatEther(feeRecipientBalance), 'TRUST');
    } catch (error) {
      console.log('⚠️ Could not get fee recipient balance:', error.message);
    }
    
    // Check allowance from user to CoreAssetFactory
    try {
      const allowance = await trustToken.allowance(USER_ADDRESS, CORE_ASSET_FACTORY_ADDRESS);
      console.log('🔐 Allowance (User -> CoreAssetFactory):', ethers.formatEther(allowance), 'TRUST');
    } catch (error) {
      console.log('⚠️ Could not get allowance:', error.message);
    }
    
    // Check if fee recipient has admin role
    try {
      const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
      console.log('🔐 DEFAULT_ADMIN_ROLE:', DEFAULT_ADMIN_ROLE);
      
      const hasAdminRole = await contract.hasRole(DEFAULT_ADMIN_ROLE, FEE_RECIPIENT);
      console.log('👑 Fee recipient has admin role:', hasAdminRole);
    } catch (error) {
      console.log('⚠️ Could not check admin role:', error.message);
    }
    
    // Check if user has any roles
    try {
      const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
      const userHasAdminRole = await contract.hasRole(DEFAULT_ADMIN_ROLE, USER_ADDRESS);
      console.log('👤 User has admin role:', userHasAdminRole);
    } catch (error) {
      console.log('⚠️ Could not check user admin role:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error testing fee recipient:', error);
  }
}

testFeeRecipient();
