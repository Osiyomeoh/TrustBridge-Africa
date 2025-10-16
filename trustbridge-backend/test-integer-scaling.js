#!/usr/bin/env node

/**
 * Test script to verify integer scaling approach
 */

const Decimal = require('decimal.js');

console.log('🧪 Testing Integer Scaling Approach\n');

// Test parameters
const totalPrice = 17;
const platformFeePercent = 2.5;
const royaltyPercentage = 5;

console.log('📊 Test Parameters:');
console.log(`  Total Price: ${totalPrice} TRUST`);
console.log(`  Platform Fee: ${platformFeePercent}%`);
console.log(`  Royalty: ${royaltyPercentage}%\n`);

// Calculate with decimal.js first
const totalPriceDecimal = new Decimal(totalPrice);
const platformFeeDecimal = totalPriceDecimal.mul(platformFeePercent).div(100);
const royaltyAmountDecimal = totalPriceDecimal.mul(royaltyPercentage).div(100);
const sellerAmountDecimal = totalPriceDecimal.sub(platformFeeDecimal).sub(royaltyAmountDecimal);

console.log('🔢 Decimal.js Values:');
console.log(`  totalPriceDecimal: ${totalPriceDecimal.toString()}`);
console.log(`  platformFeeDecimal: ${platformFeeDecimal.toString()}`);
console.log(`  royaltyAmountDecimal: ${royaltyAmountDecimal.toString()}`);
console.log(`  sellerAmountDecimal: ${sellerAmountDecimal.toString()}`);

// Convert to smallest units (multiply by 10^8 for 8 decimal places)
const totalPriceInt = totalPriceDecimal.mul(100000000).toNumber();
const platformFeeInt = platformFeeDecimal.mul(100000000).toNumber();
const royaltyAmountInt = royaltyAmountDecimal.mul(100000000).toNumber();
const sellerAmountInt = sellerAmountDecimal.mul(100000000).toNumber();

console.log('\n🔢 Integer Values (Smallest Units):');
console.log(`  totalPriceInt: ${totalPriceInt}`);
console.log(`  platformFeeInt: ${platformFeeInt}`);
console.log(`  royaltyAmountInt: ${royaltyAmountInt}`);
console.log(`  sellerAmountInt: ${sellerAmountInt}`);

// Check decimal.js sum
const decimalJsSum = totalPriceDecimal.sub(platformFeeDecimal).sub(royaltyAmountDecimal).sub(sellerAmountDecimal);
console.log(`  decimalJsSum: ${decimalJsSum.toString()}`);
console.log(`  Is decimalJsSum zero? ${decimalJsSum.eq(0) ? '✅ YES' : '❌ NO'}`);

// Check integer sum
const integerSum = -totalPriceInt + sellerAmountInt + royaltyAmountInt + platformFeeInt;
console.log(`  integerSum: ${integerSum}`);
console.log(`  Is integerSum zero? ${integerSum === 0 ? '✅ YES' : '❌ NO'}`);

// Test with different price values
console.log('\n🔍 Testing Different Price Values:');

const testPrices = [1, 10, 17, 50, 100, 1000];
testPrices.forEach(price => {
  const priceDecimal = new Decimal(price);
  const platformFee = priceDecimal.mul(platformFeePercent).div(100);
  const royaltyAmount = priceDecimal.mul(royaltyPercentage).div(100);
  const sellerAmount = priceDecimal.sub(platformFee).sub(royaltyAmount);
  
  const priceInt = priceDecimal.mul(100000000).toNumber();
  const platformFeeInt = platformFee.mul(100000000).toNumber();
  const royaltyAmountInt = royaltyAmount.mul(100000000).toNumber();
  const sellerAmountInt = sellerAmount.mul(100000000).toNumber();
  
  const testSum = -priceInt + sellerAmountInt + royaltyAmountInt + platformFeeInt;
  
  console.log(`  Price ${price}: ${testSum} ${testSum === 0 ? '✅' : '❌'}`);
});

console.log('\n💡 Analysis:');
if (integerSum === 0) {
  console.log('  ✅ Integer scaling approach gives us exactly zero!');
  console.log('  ✅ This should work with Hedera transactions');
} else {
  console.log('  ❌ Even integer scaling approach has errors');
  console.log('  ❌ This suggests a different issue');
}

console.log('\n🎯 Recommendation:');
if (integerSum === 0) {
  console.log('  Use integer scaling approach');
} else {
  console.log('  Need to investigate further - errors persist');
  console.log('  Consider using a different approach or accepting the error');
}
