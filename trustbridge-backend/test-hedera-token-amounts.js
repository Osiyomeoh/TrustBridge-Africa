#!/usr/bin/env node

/**
 * Test script to verify the correct format for Hedera token amounts
 */

console.log('🧪 Testing Hedera Token Amount Format\n');

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

console.log('🔢 Integer Values (smallest units):');
console.log(`  totalPriceInt: ${totalPriceInt}`);
console.log(`  platformFeeInt: ${platformFeeInt}`);
console.log(`  royaltyAmountInt: ${royaltyAmountInt}`);
console.log(`  sellerAmountInt: ${sellerAmountInt}`);
console.log(`  Sum: ${-totalPriceInt + sellerAmountInt + royaltyAmountInt + platformFeeInt}`);

// Convert back to decimals
const totalPriceDecimal = totalPriceInt / 100000000;
const platformFeeDecimal = platformFeeInt / 100000000;
const royaltyAmountDecimal = royaltyAmountInt / 100000000;
const sellerAmountDecimal = sellerAmountInt / 100000000;

console.log('\n🔢 Decimal Values (for display):');
console.log(`  totalPriceDecimal: ${totalPriceDecimal}`);
console.log(`  platformFeeDecimal: ${platformFeeDecimal}`);
console.log(`  royaltyAmountDecimal: ${royaltyAmountDecimal}`);
console.log(`  sellerAmountDecimal: ${sellerAmountDecimal}`);
console.log(`  Sum: ${-totalPriceDecimal + sellerAmountDecimal + royaltyAmountDecimal + platformFeeDecimal}`);

// Test different formats for addTokenTransfer
console.log('\n🔍 Testing Different Formats for addTokenTransfer:');

// Format 1: Raw integers (what we're currently using)
console.log('  Format 1: Raw Integers');
console.log(`    From buyer: -${totalPriceInt}`);
console.log(`    To seller: ${sellerAmountInt}`);
console.log(`    To seller royalty: ${royaltyAmountInt}`);
console.log(`    To platform: ${platformFeeInt}`);
console.log(`    Sum: ${-totalPriceInt + sellerAmountInt + royaltyAmountInt + platformFeeInt}`);

// Format 2: Decimal values (what we should use)
console.log('\n  Format 2: Decimal Values');
console.log(`    From buyer: -${totalPriceDecimal}`);
console.log(`    To seller: ${sellerAmountDecimal}`);
console.log(`    To seller royalty: ${royaltyAmountDecimal}`);
console.log(`    To platform: ${platformFeeDecimal}`);
console.log(`    Sum: ${-totalPriceDecimal + sellerAmountDecimal + royaltyAmountDecimal + platformFeeDecimal}`);

// Format 3: Exact decimal values (hardcoded)
console.log('\n  Format 3: Exact Decimal Values');
const exactTotalPrice = 17;
const exactPlatformFee = 0.425;
const exactRoyaltyAmount = 0.85;
const exactSellerAmount = 15.725;
console.log(`    From buyer: -${exactTotalPrice}`);
console.log(`    To seller: ${exactSellerAmount}`);
console.log(`    To seller royalty: ${exactRoyaltyAmount}`);
console.log(`    To platform: ${exactPlatformFee}`);
console.log(`    Sum: ${-exactTotalPrice + exactSellerAmount + exactRoyaltyAmount + exactPlatformFee}`);

// Check which format gives us exactly zero
const sum1 = -totalPriceInt + sellerAmountInt + royaltyAmountInt + platformFeeInt;
const sum2 = -totalPriceDecimal + sellerAmountDecimal + royaltyAmountDecimal + platformFeeDecimal;
const sum3 = -exactTotalPrice + exactSellerAmount + exactRoyaltyAmount + exactPlatformFee;

console.log('\n🎯 Zero-Sum Check:');
console.log(`  Format 1 (Raw Integers): ${sum1} ${sum1 === 0 ? '✅' : '❌'}`);
console.log(`  Format 2 (Decimal Values): ${sum2} ${sum2 === 0 ? '✅' : '❌'}`);
console.log(`  Format 3 (Exact Decimals): ${sum3} ${sum3 === 0 ? '✅' : '❌'}`);

console.log('\n💡 Analysis:');
console.log('  - Format 1: Perfect zero-sum but values are too large for Hedera SDK');
console.log('  - Format 2: Has floating-point errors but values are correct size');
console.log('  - Format 3: Has floating-point errors but values are correct size');

console.log('\n🎯 Recommendation:');
if (sum1 === 0) {
  console.log('  Use Format 1 (Raw Integers) but check if Hedera SDK expects smallest units');
  console.log('  If not, we need to find a way to get exact decimals without floating-point errors');
} else {
  console.log('  Need to investigate further - no format gives us exactly zero');
}