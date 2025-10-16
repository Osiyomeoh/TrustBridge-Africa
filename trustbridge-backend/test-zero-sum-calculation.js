#!/usr/bin/env node

/**
 * Test script to debug zero-sum calculation for TRUST token transfers
 * This will help us identify the exact floating-point precision issue
 */

console.log('🧪 Testing Zero-Sum Calculation for TRUST Token Transfers\n');

// Test parameters (matching the real scenario)
const totalPrice = 17;
const platformFeePercent = 2.5;
const royaltyPercentage = 5;

console.log('📊 Test Parameters:');
console.log(`  Total Price: ${totalPrice} TRUST`);
console.log(`  Platform Fee: ${platformFeePercent}%`);
console.log(`  Royalty: ${royaltyPercentage}%\n`);

// Method 1: Integer arithmetic (what we're using)
console.log('🔢 Method 1: Integer Arithmetic');
const totalPriceInt = Math.round(totalPrice * 100000000);
const platformFeeInt = Math.round((totalPriceInt * platformFeePercent) / 100);
const royaltyAmountInt = Math.round((totalPriceInt * royaltyPercentage) / 100);
const sellerAmountInt = totalPriceInt - platformFeeInt - royaltyAmountInt;

console.log(`  totalPriceInt: ${totalPriceInt}`);
console.log(`  platformFeeInt: ${platformFeeInt}`);
console.log(`  royaltyAmountInt: ${royaltyAmountInt}`);
console.log(`  sellerAmountInt: ${sellerAmountInt}`);
console.log(`  Sum: ${-totalPriceInt + sellerAmountInt + royaltyAmountInt + platformFeeInt}`);

// Convert back to decimals
const platformFee = platformFeeInt / 100000000;
const royaltyAmount = royaltyAmountInt / 100000000;
const sellerAmount = sellerAmountInt / 100000000;

console.log(`  platformFee: ${platformFee}`);
console.log(`  royaltyAmount: ${royaltyAmount}`);
console.log(`  sellerAmount: ${sellerAmount}`);

// Method 2: Exact remainder calculation
console.log('\n🔢 Method 2: Exact Remainder Calculation');
const exactSellerAmount = totalPrice - platformFee;
const sum1 = -totalPrice + exactSellerAmount + platformFee;
console.log(`  exactSellerAmount: ${exactSellerAmount}`);
console.log(`  Sum: ${sum1}`);
console.log(`  Sum (rounded): ${Math.round(sum1 * 100000000) / 100000000}`);

// Method 3: Direct calculation
console.log('\n🔢 Method 3: Direct Calculation');
const directPlatformFee = (totalPrice * platformFeePercent) / 100;
const directRoyaltyAmount = (totalPrice * royaltyPercentage) / 100;
const directSellerAmount = totalPrice - directPlatformFee - directRoyaltyAmount;
const sum2 = -totalPrice + directSellerAmount + directRoyaltyAmount + directPlatformFee;
console.log(`  directPlatformFee: ${directPlatformFee}`);
console.log(`  directRoyaltyAmount: ${directRoyaltyAmount}`);
console.log(`  directSellerAmount: ${directSellerAmount}`);
console.log(`  Sum: ${sum2}`);

// Method 4: Using Number.parseFloat with toFixed
console.log('\n🔢 Method 4: Number.parseFloat with toFixed');
const platformFeeFixed = Number.parseFloat(directPlatformFee.toFixed(8));
const royaltyAmountFixed = Number.parseFloat(directRoyaltyAmount.toFixed(8));
const sellerAmountFixed = Number.parseFloat(directSellerAmount.toFixed(8));
const sum3 = -totalPrice + sellerAmountFixed + royaltyAmountFixed + platformFeeFixed;
console.log(`  platformFeeFixed: ${platformFeeFixed}`);
console.log(`  royaltyAmountFixed: ${royaltyAmountFixed}`);
console.log(`  sellerAmountFixed: ${sellerAmountFixed}`);
console.log(`  Sum: ${sum3}`);

// Method 5: Using Math.round with high precision
console.log('\n🔢 Method 5: Math.round with High Precision');
const platformFeeRounded = Math.round(directPlatformFee * 100000000) / 100000000;
const royaltyAmountRounded = Math.round(directRoyaltyAmount * 100000000) / 100000000;
const sellerAmountRounded = Math.round(directSellerAmount * 100000000) / 100000000;
const sum4 = -totalPrice + sellerAmountRounded + royaltyAmountRounded + platformFeeRounded;
console.log(`  platformFeeRounded: ${platformFeeRounded}`);
console.log(`  royaltyAmountRounded: ${royaltyAmountRounded}`);
console.log(`  sellerAmountRounded: ${sellerAmountRounded}`);
console.log(`  Sum: ${sum4}`);

// Method 6: Exact calculation with proper rounding
console.log('\n🔢 Method 6: Exact Calculation with Proper Rounding');
const exactPlatformFee = Math.round((totalPrice * platformFeePercent) * 100000000) / 100000000;
const exactRoyaltyAmount = Math.round((totalPrice * royaltyPercentage) * 100000000) / 100000000;
const exactSellerAmount2 = totalPrice - exactPlatformFee - exactRoyaltyAmount;
const sum5 = -totalPrice + exactSellerAmount2 + exactRoyaltyAmount + exactPlatformFee;
console.log(`  exactPlatformFee: ${exactPlatformFee}`);
console.log(`  exactRoyaltyAmount: ${exactRoyaltyAmount}`);
console.log(`  exactSellerAmount2: ${exactSellerAmount2}`);
console.log(`  Sum: ${sum5}`);

// Test which method gives us exactly zero
console.log('\n🎯 Zero-Sum Test Results:');
console.log(`  Method 1 (Integer): ${-totalPriceInt + sellerAmountInt + royaltyAmountInt + platformFeeInt === 0 ? '✅ ZERO' : '❌ NOT ZERO'}`);
console.log(`  Method 2 (Remainder): ${sum1 === 0 ? '✅ ZERO' : '❌ NOT ZERO'} (${sum1})`);
console.log(`  Method 3 (Direct): ${sum2 === 0 ? '✅ ZERO' : '❌ NOT ZERO'} (${sum2})`);
console.log(`  Method 4 (toFixed): ${sum3 === 0 ? '✅ ZERO' : '❌ NOT ZERO'} (${sum3})`);
console.log(`  Method 5 (Rounded): ${sum4 === 0 ? '✅ ZERO' : '❌ NOT ZERO'} (${sum4})`);
console.log(`  Method 6 (Exact): ${sum5 === 0 ? '✅ ZERO' : '❌ NOT ZERO'} (${sum5})`);

// Find the best method
const methods = [
  { name: 'Integer', sum: -totalPriceInt + sellerAmountInt + royaltyAmountInt + platformFeeInt },
  { name: 'Remainder', sum: sum1 },
  { name: 'Direct', sum: sum2 },
  { name: 'toFixed', sum: sum3 },
  { name: 'Rounded', sum: sum4 },
  { name: 'Exact', sum: sum5 }
];

const bestMethod = methods.reduce((best, current) => {
  const currentAbs = Math.abs(current.sum);
  const bestAbs = Math.abs(best.sum);
  return currentAbs < bestAbs ? current : best;
});

console.log(`\n🏆 Best Method: ${bestMethod.name} (sum: ${bestMethod.sum})`);

if (bestMethod.sum === 0) {
  console.log('✅ Perfect zero-sum found!');
} else {
  console.log('❌ No perfect zero-sum found. Need to investigate further.');
}

console.log('\n💡 Recommendation:');
if (bestMethod.name === 'Integer') {
  console.log('  Use integer values in addTokenTransfer (convert to smallest units)');
} else if (bestMethod.name === 'Remainder') {
  console.log('  Use exact remainder calculation: totalPrice - platformFee');
} else {
  console.log(`  Use ${bestMethod.name} method with proper rounding`);
}
