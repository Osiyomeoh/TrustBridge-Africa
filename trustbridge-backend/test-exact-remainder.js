#!/usr/bin/env node

/**
 * Test script to verify exact remainder calculation approach
 */

console.log('🧪 Testing Exact Remainder Calculation Approach\n');

// Test parameters
const totalPrice = 17;
const platformFeePercent = 2.5;
const royaltyPercentage = 5;

console.log('📊 Test Parameters:');
console.log(`  Total Price: ${totalPrice} TRUST`);
console.log(`  Platform Fee: ${platformFeePercent}%`);
console.log(`  Royalty: ${royaltyPercentage}%\n`);

// Calculate with exact remainder
const exactPlatformFee = (totalPrice * platformFeePercent) / 100;
const exactRoyaltyAmount = (totalPrice * royaltyPercentage) / 100;
const exactSellerAmount = totalPrice - exactPlatformFee - exactRoyaltyAmount;

console.log('🔢 Exact Remainder Calculation:');
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
  const platformFee = (price * platformFeePercent) / 100;
  const royaltyAmount = (price * royaltyPercentage) / 100;
  const sellerAmount = price - platformFee - royaltyAmount;
  const testSum = -price + sellerAmount + royaltyAmount + platformFee;
  
  console.log(`  Price ${price}: ${testSum} ${testSum === 0 ? '✅' : '❌'}`);
});

// Test with exact decimal values (hardcoded)
console.log('\n🔍 Testing Exact Decimal Values (Hardcoded):');
const exactTotalPrice = 17;
const exactPlatformFee2 = 0.425;
const exactRoyaltyAmount2 = 0.85;
const exactSellerAmount2 = 15.725;

const sum2 = -exactTotalPrice + exactSellerAmount2 + exactRoyaltyAmount2 + exactPlatformFee2;
console.log(`  Sum: -${exactTotalPrice} + ${exactSellerAmount2} + ${exactRoyaltyAmount2} + ${exactPlatformFee2} = ${sum2}`);
console.log(`  Is exactly zero? ${sum2 === 0 ? '✅ YES' : '❌ NO'}`);

console.log('\n💡 Analysis:');
if (sum === 0) {
  console.log('  ✅ Exact remainder calculation gives us exactly zero!');
  console.log('  ✅ This should work with Hedera transactions');
} else {
  console.log('  ❌ Even exact remainder calculation has floating-point errors');
  console.log('  ❌ This suggests JavaScript floating-point arithmetic is the issue');
}

console.log('\n🎯 Recommendation:');
if (sum === 0) {
  console.log('  Use exact remainder calculation approach');
} else {
  console.log('  Need to investigate further - floating-point errors persist');
  console.log('  Consider using a different approach or accepting the error');
}