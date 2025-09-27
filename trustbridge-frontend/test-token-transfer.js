import { ethers } from 'ethers';

// Hedera Testnet configuration
const HEDERA_TESTNET_RPC = 'https://testnet.hashio.io/api';
const TRUST_TOKEN_ADDRESS = '0x170B35e97C217dBf63a500EaB884392F7BF6Ec34';
const CORE_ASSET_FACTORY_ADDRESS = '0xF743D30062Bc04c69fC2F07F216C0357F0bDdb76';
const FEE_RECIPIENT = '0xA6e8bf8E89Bd2c2BD37e308F275C4f52284a911F';
const USER_ADDRESS = '0xa620f55Ec17bf98d9898E43878c22c10b5324069';

// TRUST Token ABI
const TRUST_TOKEN_ABI = [
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)"
];

async function testTokenTransfer() {
  try {
    console.log('🔍 Testing TRUST token transfer...');
    
    const provider = new ethers.JsonRpcProvider(HEDERA_TESTNET_RPC);
    const trustToken = new ethers.Contract(TRUST_TOKEN_ADDRESS, TRUST_TOKEN_ABI, provider);
    
    console.log('📍 TRUST Token address:', TRUST_TOKEN_ADDRESS);
    console.log('🏦 Fee recipient:', FEE_RECIPIENT);
    console.log('👤 User address:', USER_ADDRESS);
    console.log('🏭 CoreAssetFactory:', CORE_ASSET_FACTORY_ADDRESS);
    
    // Check balances
    const userBalance = await trustToken.balanceOf(USER_ADDRESS);
    const feeRecipientBalance = await trustToken.balanceOf(FEE_RECIPIENT);
    const allowance = await trustToken.allowance(USER_ADDRESS, CORE_ASSET_FACTORY_ADDRESS);
    
    console.log('💰 User balance:', ethers.formatEther(userBalance), 'TRUST');
    console.log('🏦 Fee recipient balance:', ethers.formatEther(feeRecipientBalance), 'TRUST');
    console.log('🔐 Allowance:', ethers.formatEther(allowance), 'TRUST');
    
    // Test if we can estimate gas for transferFrom
    const transferAmount = ethers.parseEther("10");
    console.log('🧪 Testing transferFrom gas estimation...');
    console.log('📊 Transfer amount:', ethers.formatEther(transferAmount), 'TRUST');
    
    try {
      const gasEstimate = await trustToken.transferFrom.estimateGas(
        USER_ADDRESS,
        FEE_RECIPIENT,
        transferAmount
      );
      console.log('✅ transferFrom gas estimate:', gasEstimate.toString());
    } catch (error) {
      console.log('❌ transferFrom gas estimate failed:', error.message);
      console.log('❌ Error data:', error.data);
    }
    
    // Test if we can estimate gas for transferFrom to CoreAssetFactory
    try {
      const gasEstimate2 = await trustToken.transferFrom.estimateGas(
        USER_ADDRESS,
        CORE_ASSET_FACTORY_ADDRESS,
        transferAmount
      );
      console.log('✅ transferFrom to CoreAssetFactory gas estimate:', gasEstimate2.toString());
    } catch (error) {
      console.log('❌ transferFrom to CoreAssetFactory gas estimate failed:', error.message);
      console.log('❌ Error data:', error.data);
    }
    
    // Check if the issue is with the fee recipient address
    console.log('\n🔍 Checking fee recipient address...');
    const feeRecipientCode = await provider.getCode(FEE_RECIPIENT);
    console.log('🏦 Fee recipient code length:', feeRecipientCode.length);
    
    if (feeRecipientCode === '0x') {
      console.log('⚠️ Fee recipient is an EOA (Externally Owned Account)');
    } else {
      console.log('⚠️ Fee recipient is a contract');
    }
    
  } catch (error) {
    console.error('❌ Error testing token transfer:', error);
  }
}

testTokenTransfer();
