#!/usr/bin/env node

/**
 * Test script to verify if we can use integer values directly in addTokenTransfer
 * This will help us understand the correct format for Hedera SDK
 */

console.log('🧪 Testing Integer Token Transfer Format\n');

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
console.log(`  Sum: ${-totalPriceInt + sellerAmountInt + royaltyAmountInt + platformFeeInt}`);

// Test different conversion methods
console.log('\n🔍 Conversion Methods:');

// Method 1: Direct integer values
console.log('  Method 1: Direct Integer Values');
console.log(`    From buyer: -${totalPriceInt}`);
console.log(`    To seller: ${sellerAmountInt + royaltyAmountInt}`);
console.log(`    To platform: ${platformFeeInt}`);
console.log(`    Sum: ${-totalPriceInt + (sellerAmountInt + royaltyAmountInt) + platformFeeInt}`);

// Method 2: Convert to decimals
console.log('\n  Method 2: Convert to Decimals');
const totalPriceDecimal = totalPriceInt / 100000000;
const sellerAmountDecimal = (sellerAmountInt + royaltyAmountInt) / 100000000;
const platformFeeDecimal = platformFeeInt / 100000000;
console.log(`    From buyer: -${totalPriceDecimal}`);
console.log(`    To seller: ${sellerAmountDecimal}`);
console.log(`    To platform: ${platformFeeDecimal}`);
console.log(`    Sum: ${-totalPriceDecimal + sellerAmountDecimal + platformFeeDecimal}`);

// Method 3: Use smallest units (divide by 100000000)
console.log('\n  Method 3: Use Smallest Units (divide by 100000000)');
const totalPriceSmallest = totalPriceInt / 100000000;
const sellerAmountSmallest = (sellerAmountInt + royaltyAmountInt) / 100000000;
const platformFeeSmallest = platformFeeInt / 100000000;
console.log(`    From buyer: -${totalPriceSmallest}`);
console.log(`    To seller: ${sellerAmountSmallest}`);
console.log(`    To platform: ${platformFeeSmallest}`);
console.log(`    Sum: ${-totalPriceSmallest + sellerAmountSmallest + platformFeeSmallest}`);

// Method 4: Use exact values with proper rounding
console.log('\n  Method 4: Exact Values with Proper Rounding');
const exactTotalPrice = 17;
const exactPlatformFee = 0.425;
const exactSellerAmount = 16.575;
console.log(`    From buyer: -${exactTotalPrice}`);
console.log(`    To seller: ${exactSellerAmount}`);
console.log(`    To platform: ${exactPlatformFee}`);
console.log(`    Sum: ${-exactTotalPrice + exactSellerAmount + exactPlatformFee}`);

// Test which method gives us exactly zero
console.log('\n🎯 Zero-Sum Test Results:');
const method1Sum = -totalPriceInt + (sellerAmountInt + royaltyAmountInt) + platformFeeInt;
const method2Sum = -totalPriceDecimal + sellerAmountDecimal + platformFeeDecimal;
const method3Sum = -totalPriceSmallest + sellerAmountSmallest + platformFeeSmallest;
const method4Sum = -exactTotalPrice + exactSellerAmount + exactPlatformFee;

console.log(`  Method 1 (Direct Integer): ${method1Sum === 0 ? '✅ ZERO' : '❌ NOT ZERO'} (${method1Sum})`);
console.log(`  Method 2 (Convert to Decimals): ${method2Sum === 0 ? '✅ ZERO' : '❌ NOT ZERO'} (${method2Sum})`);
console.log(`  Method 3 (Smallest Units): ${method3Sum === 0 ? '✅ ZERO' : '❌ NOT ZERO'} (${method3Sum})`);
console.log(`  Method 4 (Exact Values): ${method4Sum === 0 ? '✅ ZERO' : '❌ NOT ZERO'} (${method4Sum})`);

// Find the best method
const methods = [
  { name: 'Direct Integer', sum: method1Sum },
  { name: 'Convert to Decimals', sum: method2Sum },
  { name: 'Smallest Units', sum: method3Sum },
  { name: 'Exact Values', sum: method4Sum }
];

const bestMethod = methods.reduce((best, current) => {
  const currentAbs = Math.abs(current.sum);
  const bestAbs = Math.abs(best.sum);
  return currentAbs < bestAbs ? current : best;
});

console.log(`\n🏆 Best Method: ${bestMethod.name} (sum: ${bestMethod.sum})`);

if (bestMethod.sum === 0) {
  console.log('✅ Perfect zero-sum found!');
  console.log('\n💡 Recommendation:');
  if (bestMethod.name === 'Direct Integer') {
    console.log('  Use integer values directly in addTokenTransfer');
    console.log('  Hedera SDK expects smallest units for token transfers');
  } else if (bestMethod.name === 'Convert to Decimals') {
    console.log('  Convert integer values to decimals for addTokenTransfer');
    console.log('  Hedera SDK expects decimal amounts for token transfers');
  } else if (bestMethod.name === 'Smallest Units') {
    console.log('  Use smallest units (divide by 100000000) for addTokenTransfer');
  } else {
    console.log('  Use exact values with proper rounding');
  }
} else {
  console.log('❌ No perfect zero-sum found. Need to investigate further.');
  console.log('\n💡 Next Steps:');
  console.log('  1. Check Hedera SDK documentation for token amount format');
  console.log('  2. Test with actual Hedera SDK calls');
  console.log('  3. Consider using a different approach for zero-sum calculation');
}
