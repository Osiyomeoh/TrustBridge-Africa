import { ethers } from 'ethers';

// Hedera Testnet configuration
const HEDERA_TESTNET_RPC = 'https://testnet.hashio.io/api';
const TRUST_TOKEN_ADDRESS = '0x170B35e97C217dBf63a500EaB884392F7BF6Ec34';
const USER_ADDRESS = '0xa620f55Ec17bf98d9898E43878c22c10b5324069';

// TRUST Token ABI with staking functions
const TRUST_TOKEN_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function stakingBalances(address) view returns (uint256)",
  "function stakingTimestamps(address) view returns (uint256)",
  "function lockPeriods(address) view returns (uint256)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)"
];

async function testStaking() {
  try {
    console.log('🔍 Testing TRUST token staking...');
    
    const provider = new ethers.JsonRpcProvider(HEDERA_TESTNET_RPC);
    const trustToken = new ethers.Contract(TRUST_TOKEN_ADDRESS, TRUST_TOKEN_ABI, provider);
    
    console.log('📍 TRUST Token address:', TRUST_TOKEN_ADDRESS);
    console.log('👤 User address:', USER_ADDRESS);
    
    // Check user's balance and staking info
    try {
      const balance = await trustToken.balanceOf(USER_ADDRESS);
      const stakingBalance = await trustToken.stakingBalances(USER_ADDRESS);
      const stakingTimestamp = await trustToken.stakingTimestamps(USER_ADDRESS);
      const lockPeriod = await trustToken.lockPeriods(USER_ADDRESS);
      
      console.log('💰 User balance:', ethers.formatEther(balance), 'TRUST');
      console.log('🔒 Staking balance:', ethers.formatEther(stakingBalance), 'TRUST');
      console.log('⏰ Staking timestamp:', stakingTimestamp.toString());
      console.log('🔐 Lock period:', lockPeriod.toString(), 'seconds');
      
      // Check if user has staked tokens
      if (stakingBalance > 0) {
        console.log('⚠️ User has staked tokens! This might be preventing transfers.');
        
        // Check if lock period has expired
        const currentTime = Math.floor(Date.now() / 1000);
        const lockEndTime = Number(stakingTimestamp) + Number(lockPeriod);
        
        console.log('🕐 Current time:', currentTime);
        console.log('🔓 Lock ends at:', lockEndTime);
        console.log('⏳ Time until unlock:', lockEndTime - currentTime, 'seconds');
        
        if (currentTime < lockEndTime) {
          console.log('❌ Tokens are still locked! This is likely preventing transfers.');
        } else {
          console.log('✅ Lock period has expired, tokens should be unlockable.');
        }
      } else {
        console.log('✅ User has no staked tokens.');
      }
      
    } catch (error) {
      console.log('⚠️ Could not get staking info:', error.message);
    }
    
    // Check if the issue is with the contract's transfer logic
    console.log('\n🔍 Checking contract transfer logic...');
    
    // Try to understand why transfers are failing
    try {
      // Check if the contract has any custom validation
      const contractCode = await provider.getCode(TRUST_TOKEN_ADDRESS);
      
      // Look for common OpenZeppelin patterns
      if (contractCode.includes('0x608060405234801561001057600080fd5b50')) {
        console.log('🔍 Contract uses standard OpenZeppelin pattern');
      }
      
      // Check if the contract has custom transfer hooks
      if (contractCode.includes('_beforeTokenTransfer') || contractCode.includes('_afterTokenTransfer')) {
        console.log('⚠️ Contract has custom transfer hooks that might be causing issues');
      } else {
        console.log('✅ Contract does not have custom transfer hooks');
      }
      
    } catch (error) {
      console.log('⚠️ Could not analyze contract code:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error testing staking:', error);
  }
}

testStaking();
