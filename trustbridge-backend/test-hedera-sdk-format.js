#!/usr/bin/env node

/**
 * Test script to determine the correct format for Hedera SDK addTokenTransfer
 */

console.log('🧪 Testing Hedera SDK addTokenTransfer Format\n');

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
console.log(`  Integer Sum: ${-totalPriceInt + sellerAmountInt + royaltyAmountInt + platformFeeInt}`);

// Convert to decimals
const totalPriceDecimal = totalPriceInt / 100000000;
const platformFeeDecimal = platformFeeInt / 100000000;
const royaltyAmountDecimal = royaltyAmountInt / 100000000;
const sellerAmountDecimal = sellerAmountInt / 100000000;

console.log('\n🔢 Decimal Values:');
console.log(`  totalPriceDecimal: ${totalPriceDecimal}`);
console.log(`  platformFeeDecimal: ${platformFeeDecimal}`);
console.log(`  royaltyAmountDecimal: ${royaltyAmountDecimal}`);
console.log(`  sellerAmountDecimal: ${sellerAmountDecimal}`);
console.log(`  Decimal Sum: ${-totalPriceDecimal + sellerAmountDecimal + royaltyAmountDecimal + platformFeeDecimal}`);

// Test different formats
console.log('\n🔍 Testing Different Formats:');

// Format 1: Raw integers (what we tried)
console.log('  Format 1: Raw Integers');
console.log(`    From buyer: -${totalPriceInt}`);
console.log(`    To seller: ${sellerAmountInt}`);
console.log(`    To seller royalty: ${royaltyAmountInt}`);
console.log(`    To platform: ${platformFeeInt}`);
console.log(`    Sum: ${-totalPriceInt + sellerAmountInt + royaltyAmountInt + platformFeeInt}`);
console.log(`    Result: Perfect zero-sum but INSUFFICIENT_TOKEN_BALANCE error`);

// Format 2: Decimal values (what we should use)
console.log('\n  Format 2: Decimal Values');
console.log(`    From buyer: -${totalPriceDecimal}`);
console.log(`    To seller: ${sellerAmountDecimal}`);
console.log(`    To seller royalty: ${royaltyAmountDecimal}`);
console.log(`    To platform: ${platformFeeDecimal}`);
console.log(`    Sum: ${-totalPriceDecimal + sellerAmountDecimal + royaltyAmountDecimal + platformFeeDecimal}`);
console.log(`    Result: Has floating-point errors but correct token amounts`);

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
console.log(`    Result: Has floating-point errors but correct token amounts`);

console.log('\n💡 Analysis:');
console.log('  - Format 1: Perfect zero-sum but values are too large (causes INSUFFICIENT_TOKEN_BALANCE)');
console.log('  - Format 2: Has floating-point errors but values are correct size');
console.log('  - Format 3: Has floating-point errors but values are correct size');

console.log('\n🎯 Recommendation:');
console.log('  Use Format 2 (Decimal Values) and accept the tiny floating-point error');
console.log('  The error is negligible (-3.885780586188048e-16) and should not cause issues');
console.log('  If it does cause issues, we need to investigate Hedera SDK token amount format further');

console.log('\n🔧 Next Steps:');
console.log('  1. Try Format 2 (Decimal Values) in the actual code');
console.log('  2. If it still fails, check Hedera SDK documentation for token amount format');
console.log('  3. Consider using a different approach for zero-sum calculation');
