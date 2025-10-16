#!/usr/bin/env node

/**
 * Test script to verify exact decimal conversion using toFixed
 */

console.log('🧪 Testing Exact Decimal Conversion with toFixed\n');

// Test parameters
const totalPrice = 17;
const platformFeePercent = 2.5;
const royaltyPercentage = 5;

console.log('📊 Test Parameters:');
console.log(`  Total Price: ${totalPrice} TRUST`);
console.log(`  Platform Fee: ${platformFeePercent}%`);
console.log(`  Royalty: ${royaltyPercentage}%\n`);

// Calculate with integer arithmetic
const totalPriceInt = Math.round(totalPrice * 100000000);
const platformFeeInt = Math.round((totalPriceInt * platformFeePercent) / 100);
const royaltyAmountInt = Math.round((totalPriceInt * royaltyPercentage) / 100);
const sellerAmountInt = totalPriceInt - platformFeeInt - royaltyAmountInt;

console.log('🔢 Integer Values:');
console.log(`  totalPriceInt: ${totalPriceInt}`);
console.log(`  platformFeeInt: ${platformFeeInt}`);
console.log(`  royaltyAmountInt: ${royaltyAmountInt}`);
console.log(`  sellerAmountInt: ${sellerAmountInt}`);
console.log(`  Integer Sum: ${-totalPriceInt + sellerAmountInt + royaltyAmountInt + platformFeeInt}`);

// Convert to exact decimals using toFixed
const exactPlatformFee = Number.parseFloat((platformFeeInt / 100000000).toFixed(8));
const exactRoyaltyAmount = Number.parseFloat((royaltyAmountInt / 100000000).toFixed(8));
const exactSellerAmount = Number.parseFloat((sellerAmountInt / 100000000).toFixed(8));

console.log('\n🔢 Exact Decimal Values:');
console.log(`  exactPlatformFee: ${exactPlatformFee}`);
console.log(`  exactRoyaltyAmount: ${exactRoyaltyAmount}`);
console.log(`  exactSellerAmount: ${exactSellerAmount}`);

// Calculate the sum
const sum = -totalPrice + exactSellerAmount + exactRoyaltyAmount + exactPlatformFee;
console.log(`  Sum: -${totalPrice} + ${exactSellerAmount} + ${exactRoyaltyAmount} + ${exactPlatformFee} = ${sum}`);

// Check if it's exactly zero
console.log(`  Is exactly zero? ${sum === 0 ? '✅ YES' : '❌ NO'}`);
console.log(`  Difference from zero: ${Math.abs(sum)}`);

// Test different precision levels
console.log('\n🔍 Testing Different Precision Levels:');

const precisions = [6, 7, 8, 9, 10];
precisions.forEach(precision => {
  const platformFee = Number.parseFloat((platformFeeInt / 100000000).toFixed(precision));
  const royaltyAmount = Number.parseFloat((royaltyAmountInt / 100000000).toFixed(precision));
  const sellerAmount = Number.parseFloat((sellerAmountInt / 100000000).toFixed(precision));
  const testSum = -totalPrice + sellerAmount + royaltyAmount + platformFee;
  
  console.log(`  Precision ${precision}: ${testSum} ${testSum === 0 ? '✅' : '❌'}`);
});

// Find the best precision
const bestPrecision = precisions.find(precision => {
  const platformFee = Number.parseFloat((platformFeeInt / 100000000).toFixed(precision));
  const royaltyAmount = Number.parseFloat((royaltyAmountInt / 100000000).toFixed(precision));
  const sellerAmount = Number.parseFloat((sellerAmountInt / 100000000).toFixed(precision));
  const testSum = -totalPrice + sellerAmount + royaltyAmount + platformFee;
  return testSum === 0;
});

if (bestPrecision) {
  console.log(`\n✅ Best precision: ${bestPrecision} (gives exactly zero)`);
} else {
  console.log('\n❌ No precision level gives exactly zero');
  console.log('💡 This suggests we need to use integer values directly in addTokenTransfer');
}

console.log('\n🎯 Recommendation:');
if (sum === 0) {
  console.log('  Use exact decimal values with toFixed(8)');
} else {
  console.log('  Need to investigate further - floating-point errors persist');
  console.log('  Consider using integer values directly in addTokenTransfer');
}
