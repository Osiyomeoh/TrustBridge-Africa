import { ethers } from 'ethers';

// Hedera Testnet configuration
const HEDERA_TESTNET_RPC = 'https://testnet.hashio.io/api';
const TRUST_TOKEN_ADDRESS = '0x170B35e97C217dBf63a500EaB884392F7BF6Ec34';
const USER_ADDRESS = '0xa620f55Ec17bf98d9898E43878c22c10b5324069';
const FEE_RECIPIENT = '0xA6e8bf8E89Bd2c2BD37e308F275C4f52284a911F';

// TRUST Token ABI
const TRUST_TOKEN_ABI = [
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)"
];

async function testSimpleTransfer() {
  try {
    console.log('🔍 Testing simple TRUST token transfer...');
    
    const provider = new ethers.JsonRpcProvider(HEDERA_TESTNET_RPC);
    const trustToken = new ethers.Contract(TRUST_TOKEN_ADDRESS, TRUST_TOKEN_ABI, provider);
    
    console.log('📍 TRUST Token address:', TRUST_TOKEN_ADDRESS);
    console.log('👤 User address:', USER_ADDRESS);
    console.log('🏦 Fee recipient:', FEE_RECIPIENT);
    
    // Check balances
    const userBalance = await trustToken.balanceOf(USER_ADDRESS);
    const feeRecipientBalance = await trustToken.balanceOf(FEE_RECIPIENT);
    
    console.log('💰 User balance:', ethers.formatEther(userBalance), 'TRUST');
    console.log('🏦 Fee recipient balance:', ethers.formatEther(feeRecipientBalance), 'TRUST');
    
    // Test simple transfer (user to fee recipient)
    const transferAmount = ethers.parseEther("1");
    console.log('🧪 Testing simple transfer gas estimation...');
    console.log('📊 Transfer amount:', ethers.formatEther(transferAmount), 'TRUST');
    
    try {
      const gasEstimate = await trustToken.transfer.estimateGas(
        FEE_RECIPIENT,
        transferAmount
      );
      console.log('✅ transfer gas estimate:', gasEstimate.toString());
    } catch (error) {
      console.log('❌ transfer gas estimate failed:', error.message);
      console.log('❌ Error data:', error.data);
    }
    
    // Test transferFrom with a different spender
    console.log('\n🧪 Testing transferFrom with different spender...');
    const testSpender = '0x0000000000000000000000000000000000000001'; // Dummy address
    
    try {
      const gasEstimate2 = await trustToken.transferFrom.estimateGas(
        USER_ADDRESS,
        FEE_RECIPIENT,
        transferAmount
      );
      console.log('✅ transferFrom gas estimate:', gasEstimate2.toString());
    } catch (error) {
      console.log('❌ transferFrom gas estimate failed:', error.message);
      console.log('❌ Error data:', error.data);
    }
    
    // Check if the issue is with the specific addresses
    console.log('\n🔍 Checking address validity...');
    
    // Check if user address has code
    const userCode = await provider.getCode(USER_ADDRESS);
    console.log('👤 User address code length:', userCode.length);
    
    // Check if fee recipient has code
    const feeRecipientCode = await provider.getCode(FEE_RECIPIENT);
    console.log('🏦 Fee recipient code length:', feeRecipientCode.length);
    
    // Check if the issue is with the amount
    console.log('\n🧪 Testing with different amounts...');
    
    const testAmounts = [
      ethers.parseEther("0.1"),
      ethers.parseEther("1"),
      ethers.parseEther("10")
    ];
    
    for (const amount of testAmounts) {
      try {
        const gasEstimate = await trustToken.transfer.estimateGas(
          FEE_RECIPIENT,
          amount
        );
        console.log(`✅ Transfer ${ethers.formatEther(amount)} TRUST gas estimate:`, gasEstimate.toString());
      } catch (error) {
        console.log(`❌ Transfer ${ethers.formatEther(amount)} TRUST failed:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing simple transfer:', error);
  }
}

testSimpleTransfer();
