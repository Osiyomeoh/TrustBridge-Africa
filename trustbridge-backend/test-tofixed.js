#!/usr/bin/env node

/**
 * Test script to verify toFixed(8) approach
 */

console.log('🧪 Testing toFixed(8) Approach\n');

// Test parameters
const totalPrice = 17;
const platformFeePercent = 2.5;
const royaltyPercentage = 5;

console.log('📊 Test Parameters:');
console.log(`  Total Price: ${totalPrice} TRUST`);
console.log(`  Platform Fee: ${platformFeePercent}%`);
console.log(`  Royalty: ${royaltyPercentage}%\n`);

// Calculate with toFixed(8)
const exactPlatformFee = parseFloat(((totalPrice * platformFeePercent) / 100).toFixed(8));
const exactRoyaltyAmount = parseFloat(((totalPrice * royaltyPercentage) / 100).toFixed(8));
const exactSellerAmount = parseFloat((totalPrice - exactPlatformFee - exactRoyaltyAmount).toFixed(8));

console.log('🔢 toFixed(8) Calculation:');
console.log(`  exactPlatformFee: ${exactPlatformFee}`);
console.log(`  exactRoyaltyAmount: ${exactRoyaltyAmount}`);
console.log(`  exactSellerAmount: ${exactSellerAmount}`);

// Calculate the sum
const sum = -totalPrice + exactSellerAmount + exactRoyaltyAmount + exactPlatformFee;
console.log(`  Sum: -${totalPrice} + ${exactSellerAmount} + ${exactRoyaltyAmount} + ${exactPlatformFee} = ${sum}`);

// Check if it's exactly zero
console.log(`  Is exactly zero? ${sum === 0 ? '✅ YES' : '❌ NO'}`);
console.log(`  Difference from zero: ${Math.abs(sum)}`);

// Test with different price values
console.log('\n🔍 Testing Different Price Values:');

const testPrices = [1, 10, 17, 50, 100, 1000];
testPrices.forEach(price => {
  const platformFee = parseFloat(((price * platformFeePercent) / 100).toFixed(8));
  const royaltyAmount = parseFloat(((price * royaltyPercentage) / 100).toFixed(8));
  const sellerAmount = parseFloat((price - platformFee - royaltyAmount).toFixed(8));
  const testSum = -price + sellerAmount + royaltyAmount + platformFee;
  
  console.log(`  Price ${price}: ${testSum} ${testSum === 0 ? '✅' : '❌'}`);
});

console.log('\n💡 Analysis:');
if (sum === 0) {
  console.log('  ✅ toFixed(8) approach gives us exactly zero!');
  console.log('  ✅ This should work with Hedera transactions');
} else {
  console.log('  ❌ Even toFixed(8) approach has floating-point errors');
  console.log('  ❌ This suggests JavaScript floating-point arithmetic is the issue');
}

console.log('\n🎯 Recommendation:');
if (sum === 0) {
  console.log('  Use toFixed(8) approach');
} else {
  console.log('  Need to investigate further - floating-point errors persist');
  console.log('  Consider using a different approach or accepting the error');
}
