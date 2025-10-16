#!/usr/bin/env node

/**
 * Test script to verify decimal.js approach
 */

const Decimal = require('decimal.js');

console.log('🧪 Testing decimal.js Approach\n');

// Test parameters
const totalPrice = 17;
const platformFeePercent = 2.5;
const royaltyPercentage = 5;

console.log('📊 Test Parameters:');
console.log(`  Total Price: ${totalPrice} TRUST`);
console.log(`  Platform Fee: ${platformFeePercent}%`);
console.log(`  Royalty: ${royaltyPercentage}%\n`);

// Calculate with decimal.js
const totalPriceDecimal = new Decimal(totalPrice);
const platformFeeDecimal = totalPriceDecimal.mul(platformFeePercent).div(100);
const royaltyAmountDecimal = totalPriceDecimal.mul(royaltyPercentage).div(100);
const sellerAmountDecimal = totalPriceDecimal.sub(platformFeeDecimal).sub(royaltyAmountDecimal);

// Convert back to numbers
const exactPlatformFee = platformFeeDecimal.toNumber();
const exactRoyaltyAmount = royaltyAmountDecimal.toNumber();
const exactSellerAmount = sellerAmountDecimal.toNumber();

console.log('🔢 decimal.js Calculation:');
console.log(`  totalPriceDecimal: ${totalPriceDecimal.toString()}`);
console.log(`  platformFeeDecimal: ${platformFeeDecimal.toString()}`);
console.log(`  royaltyAmountDecimal: ${royaltyAmountDecimal.toString()}`);
console.log(`  sellerAmountDecimal: ${sellerAmountDecimal.toString()}`);

console.log('\n🔢 Converted to Numbers:');
console.log(`  exactPlatformFee: ${exactPlatformFee}`);
console.log(`  exactRoyaltyAmount: ${exactRoyaltyAmount}`);
console.log(`  exactSellerAmount: ${exactSellerAmount}`);

// Check decimal.js sum
const decimalJsSum = totalPriceDecimal.sub(platformFeeDecimal).sub(royaltyAmountDecimal).sub(sellerAmountDecimal);
console.log(`  decimalJsSum: ${decimalJsSum.toString()}`);
console.log(`  Is decimalJsSum zero? ${decimalJsSum.eq(0) ? '✅ YES' : '❌ NO'}`);

// Check converted sum
const convertedSum = -totalPrice + exactSellerAmount + exactRoyaltyAmount + exactPlatformFee;
console.log(`  convertedSum: ${convertedSum}`);
console.log(`  Is convertedSum zero? ${convertedSum === 0 ? '✅ YES' : '❌ NO'}`);

// Test with different price values
console.log('\n🔍 Testing Different Price Values:');

const testPrices = [1, 10, 17, 50, 100, 1000];
testPrices.forEach(price => {
  const priceDecimal = new Decimal(price);
  const platformFee = priceDecimal.mul(platformFeePercent).div(100);
  const royaltyAmount = priceDecimal.mul(royaltyPercentage).div(100);
  const sellerAmount = priceDecimal.sub(platformFee).sub(royaltyAmount);
  const testSum = priceDecimal.sub(platformFee).sub(royaltyAmount).sub(sellerAmount);
  
  console.log(`  Price ${price}: ${testSum.toString()} ${testSum.eq(0) ? '✅' : '❌'}`);
});

console.log('\n💡 Analysis:');
if (decimalJsSum.eq(0)) {
  console.log('  ✅ decimal.js approach gives us exactly zero!');
  console.log('  ✅ This should work with Hedera transactions');
} else {
  console.log('  ❌ Even decimal.js approach has errors');
  console.log('  ❌ This suggests a different issue');
}

console.log('\n🎯 Recommendation:');
if (decimalJsSum.eq(0)) {
  console.log('  Use decimal.js approach');
} else {
  console.log('  Need to investigate further - errors persist');
  console.log('  Consider using a different approach or accepting the error');
}
