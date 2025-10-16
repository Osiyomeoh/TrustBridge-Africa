#!/usr/bin/env node

/**
 * Test script to debug the exact zero-sum calculation issue
 */

console.log('🧪 Debugging Zero-Sum Calculation Issue\n');

// Test parameters (matching the real scenario)
const totalPrice = 17;
const platformFeePercent = 2.5;
const royaltyPercentage = 5;

console.log('📊 Test Parameters:');
console.log(`  Total Price: ${totalPrice} TRUST`);
console.log(`  Platform Fee: ${platformFeePercent}%`);
console.log(`  Royalty: ${royaltyPercentage}%\n`);

// Current calculation (what we're using)
const exactPlatformFee = Math.round((totalPrice * platformFeePercent / 100) * 100000000) / 100000000;
const exactRoyaltyAmount = Math.round((totalPrice * royaltyPercentage / 100) * 100000000) / 100000000;
const exactSellerAmount = totalPrice - exactPlatformFee - exactRoyaltyAmount;

console.log('🔍 Current Calculation:');
console.log(`  exactPlatformFee: ${exactPlatformFee}`);
console.log(`  exactRoyaltyAmount: ${exactRoyaltyAmount}`);
console.log(`  exactSellerAmount: ${exactSellerAmount}`);

// Calculate the sum
const sum = -totalPrice + exactSellerAmount + exactRoyaltyAmount + exactPlatformFee;
console.log(`  Sum: -${totalPrice} + ${exactSellerAmount} + ${exactRoyaltyAmount} + ${exactPlatformFee} = ${sum}`);

// Check if it's exactly zero
console.log(`  Is exactly zero? ${sum === 0 ? '✅ YES' : '❌ NO'}`);
console.log(`  Difference from zero: ${Math.abs(sum)}`);

// Try different approaches to get exactly zero
console.log('\n🔧 Trying Different Approaches:');

// Approach 1: Use integer arithmetic throughout
console.log('  Approach 1: Integer Arithmetic Throughout');
const totalPriceInt = Math.round(totalPrice * 100000000);
const platformFeeInt = Math.round((totalPriceInt * platformFeePercent) / 100);
const royaltyAmountInt = Math.round((totalPriceInt * royaltyPercentage) / 100);
const sellerAmountInt = totalPriceInt - platformFeeInt - royaltyAmountInt;

const sum1 = -totalPriceInt + sellerAmountInt + royaltyAmountInt + platformFeeInt;
console.log(`    Sum: ${sum1} ${sum1 === 0 ? '✅' : '❌'}`);

// Approach 2: Use exact decimal values
console.log('  Approach 2: Exact Decimal Values');
const exactPlatformFee2 = 0.425; // Exact value
const exactRoyaltyAmount2 = 0.85; // Exact value
const exactSellerAmount2 = 15.725; // Exact value

const sum2 = -totalPrice + exactSellerAmount2 + exactRoyaltyAmount2 + exactPlatformFee2;
console.log(`    Sum: ${sum2} ${sum2 === 0 ? '✅' : '❌'}`);

// Approach 3: Use Number.parseFloat with toFixed
console.log('  Approach 3: Number.parseFloat with toFixed');
const exactPlatformFee3 = Number.parseFloat((totalPrice * platformFeePercent / 100).toFixed(8));
const exactRoyaltyAmount3 = Number.parseFloat((totalPrice * royaltyPercentage / 100).toFixed(8));
const exactSellerAmount3 = Number.parseFloat((totalPrice - exactPlatformFee3 - exactRoyaltyAmount3).toFixed(8));

const sum3 = -totalPrice + exactSellerAmount3 + exactRoyaltyAmount3 + exactPlatformFee3;
console.log(`    Sum: ${sum3} ${sum3 === 0 ? '✅' : '❌'}`);

// Approach 4: Use Math.round with high precision
console.log('  Approach 4: Math.round with High Precision');
const exactPlatformFee4 = Math.round((totalPrice * platformFeePercent / 100) * 1000000000) / 1000000000;
const exactRoyaltyAmount4 = Math.round((totalPrice * royaltyPercentage / 100) * 1000000000) / 1000000000;
const exactSellerAmount4 = Math.round((totalPrice - exactPlatformFee4 - exactRoyaltyAmount4) * 1000000000) / 1000000000;

const sum4 = -totalPrice + exactSellerAmount4 + exactRoyaltyAmount4 + exactPlatformFee4;
console.log(`    Sum: ${sum4} ${sum4 === 0 ? '✅' : '❌'}`);

// Find the best approach
const approaches = [
  { name: 'Current', sum: sum },
  { name: 'Integer Arithmetic', sum: sum1 },
  { name: 'Exact Decimal', sum: sum2 },
  { name: 'toFixed', sum: sum3 },
  { name: 'High Precision', sum: sum4 }
];

const bestApproach = approaches.reduce((best, current) => {
  const currentAbs = Math.abs(current.sum);
  const bestAbs = Math.abs(best.sum);
  return currentAbs < bestAbs ? current : best;
});

console.log(`\n🏆 Best Approach: ${bestApproach.name} (sum: ${bestApproach.sum})`);

if (bestApproach.sum === 0) {
  console.log('✅ Perfect zero-sum found!');
  console.log('\n💡 Recommendation:');
  if (bestApproach.name === 'Integer Arithmetic') {
    console.log('  Use integer values in addTokenTransfer (convert to smallest units)');
  } else if (bestApproach.name === 'Exact Decimal') {
    console.log('  Use exact decimal values with hardcoded amounts');
  } else {
    console.log(`  Use ${bestApproach.name} approach`);
  }
} else {
  console.log('❌ No perfect zero-sum found. Need to investigate further.');
  console.log('\n💡 Next Steps:');
  console.log('  1. Check if Hedera SDK expects integer values');
  console.log('  2. Test with actual Hedera SDK calls');
  console.log('  3. Consider using a different approach for zero-sum calculation');
}
