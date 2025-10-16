#!/usr/bin/env node

/**
 * Test script to verify Math.round approach (final)
 */

console.log('🧪 Testing Math.round Approach (Final)\n');

// Test parameters
const totalPrice = 17;
const platformFeePercent = 2.5;
const royaltyPercentage = 5;

console.log('📊 Test Parameters:');
console.log(`  Total Price: ${totalPrice} TRUST`);
console.log(`  Platform Fee: ${platformFeePercent}%`);
console.log(`  Royalty: ${royaltyPercentage}%\n`);

// Calculate with Math.round
const exactPlatformFee = Math.round((totalPrice * platformFeePercent) * 100) / 10000;
const exactRoyaltyAmount = Math.round((totalPrice * royaltyPercentage) * 100) / 10000;
const exactSellerAmount = totalPrice - exactPlatformFee - exactRoyaltyAmount;

console.log('🔢 Math.round Calculation:');
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
  const platformFee = Math.round((price * platformFeePercent) * 100) / 10000;
  const royaltyAmount = Math.round((price * royaltyPercentage) * 100) / 10000;
  const sellerAmount = price - platformFee - royaltyAmount;
  const testSum = -price + sellerAmount + royaltyAmount + platformFee;
  
  console.log(`  Price ${price}: ${testSum} ${testSum === 0 ? '✅' : '❌'}`);
});

console.log('\n💡 Analysis:');
if (sum === 0) {
  console.log('  ✅ Math.round approach gives us exactly zero!');
  console.log('  ✅ This should work with Hedera transactions');
} else {
  console.log('  ❌ Even Math.round approach has floating-point errors');
  console.log('  ❌ This suggests JavaScript floating-point arithmetic is the issue');
}

console.log('\n🎯 Recommendation:');
if (sum === 0) {
  console.log('  Use Math.round approach');
} else {
  console.log('  Need to investigate further - floating-point errors persist');
  console.log('  Consider using a different approach or accepting the error');
}
