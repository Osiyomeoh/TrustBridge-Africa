// Check accurate balances for user
import { ethers } from 'ethers';

const USER_ADDRESS = '0xa620f55Ec17bf98d9898E43878c22c10b5324069';
const TRUST_TOKEN_ADDRESS = '0x170B35e97C217dBf63a500EaB884392F7BF6Ec34';

const NETWORK_CONFIG = {
  hederaRpcUrl: 'https://testnet.hashio.io/api',
  chainId: 296,
};

async function checkUserBalances() {
  console.log('💰 Checking accurate balances for user...');
  console.log('👤 User address:', USER_ADDRESS);
  
  try {
    const provider = new ethers.JsonRpcProvider(NETWORK_CONFIG.hederaRpcUrl);
    
    // Check HBAR balance (native token)
    console.log('\n🪙 HBAR Balance:');
    const hbarBalance = await provider.getBalance(USER_ADDRESS);
    const hbarFormatted = ethers.formatEther(hbarBalance);
    console.log('HBAR Balance:', hbarFormatted, 'HBAR');
    console.log('HBAR Balance (tinybar):', hbarBalance.toString());
    
    // Check TRUST token balance
    console.log('\n🪙 TRUST Token Balance:');
    const trustTokenABI = [
      "function balanceOf(address) view returns (uint256)",
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function decimals() view returns (uint8)"
    ];
    
    const trustTokenContract = new ethers.Contract(TRUST_TOKEN_ADDRESS, trustTokenABI, provider);
    
    const trustBalance = await trustTokenContract.balanceOf(USER_ADDRESS);
    const trustFormatted = ethers.formatEther(trustBalance);
    const tokenName = await trustTokenContract.name();
    const tokenSymbol = await trustTokenContract.symbol();
    const decimals = await trustTokenContract.decimals();
    
    console.log('Token Name:', tokenName);
    console.log('Token Symbol:', tokenSymbol);
    console.log('Decimals:', decimals);
    console.log('TRUST Balance:', trustFormatted, tokenSymbol);
    console.log('TRUST Balance (wei):', trustBalance.toString());
    
    // Summary
    console.log('\n📊 Balance Summary:');
    console.log('HBAR:', hbarFormatted);
    console.log('TRUST:', trustFormatted);
    
    // Check if user can create digital assets
    const minRequired = ethers.parseEther('10');
    const canCreateAsset = trustBalance >= minRequired;
    console.log('\n🎯 Digital Asset Creation:');
    console.log('Can create asset:', canCreateAsset ? '✅ YES' : '❌ NO');
    
  } catch (error) {
    console.error('❌ Error checking balances:', error.message);
  }
}

checkUserBalances();
