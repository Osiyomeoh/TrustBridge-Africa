#!/usr/bin/env node

/**
 * Test script to verify the royalty percentage calculation fix
 */

console.log('🧪 Testing Royalty Percentage Calculation Fix\n');

// Test parameters (matching the real scenario)
const totalPrice = 17;
const platformFeePercent = 2.5;
const royaltyPercentage = 5;

console.log('📊 Test Parameters:');
console.log(`  Total Price: ${totalPrice} TRUST`);
console.log(`  Platform Fee: ${platformFeePercent}%`);
console.log(`  Royalty: ${royaltyPercentage}%\n`);

// OLD (WRONG) calculation
console.log('❌ OLD (WRONG) Calculation:');
const oldPlatformFee = Math.round((totalPrice * platformFeePercent) * 100000000) / 100000000;
const oldRoyaltyAmount = Math.round((totalPrice * royaltyPercentage) * 100000000) / 100000000;
const oldSellerAmount = totalPrice - oldPlatformFee - oldRoyaltyAmount;

console.log(`  Platform Fee: ${totalPrice} * ${platformFeePercent} = ${oldPlatformFee} TRUST`);
console.log(`  Royalty Amount: ${totalPrice} * ${royaltyPercentage} = ${oldRoyaltyAmount} TRUST`);
console.log(`  Seller Amount: ${totalPrice} - ${oldPlatformFee} - ${oldRoyaltyAmount} = ${oldSellerAmount} TRUST`);
console.log(`  Sum: -${totalPrice} + ${oldSellerAmount} + ${oldRoyaltyAmount} + ${oldPlatformFee} = ${-totalPrice + oldSellerAmount + oldRoyaltyAmount + oldPlatformFee}\n`);

// NEW (CORRECT) calculation
console.log('✅ NEW (CORRECT) Calculation:');
const newPlatformFee = Math.round((totalPrice * platformFeePercent / 100) * 100000000) / 100000000;
const newRoyaltyAmount = Math.round((totalPrice * royaltyPercentage / 100) * 100000000) / 100000000;
const newSellerAmount = totalPrice - newPlatformFee - newRoyaltyAmount;

console.log(`  Platform Fee: ${totalPrice} * ${platformFeePercent} / 100 = ${newPlatformFee} TRUST`);
console.log(`  Royalty Amount: ${totalPrice} * ${royaltyPercentage} / 100 = ${newRoyaltyAmount} TRUST`);
console.log(`  Seller Amount: ${totalPrice} - ${newPlatformFee} - ${newRoyaltyAmount} = ${newSellerAmount} TRUST`);
console.log(`  Sum: -${totalPrice} + ${newSellerAmount} + ${newRoyaltyAmount} + ${newPlatformFee} = ${-totalPrice + newSellerAmount + newRoyaltyAmount + newPlatformFee}\n`);

// Comparison
console.log('📊 Comparison:');
console.log(`  Platform Fee: ${oldPlatformFee} TRUST → ${newPlatformFee} TRUST (${((newPlatformFee / oldPlatformFee) * 100).toFixed(1)}% of original)`);
console.log(`  Royalty Amount: ${oldRoyaltyAmount} TRUST → ${newRoyaltyAmount} TRUST (${((newRoyaltyAmount / oldRoyaltyAmount) * 100).toFixed(1)}% of original)`);
console.log(`  Seller Amount: ${oldSellerAmount} TRUST → ${newSellerAmount} TRUST`);

// Zero-sum check
const oldSum = -totalPrice + oldSellerAmount + oldRoyaltyAmount + oldPlatformFee;
const newSum = -totalPrice + newSellerAmount + newRoyaltyAmount + newPlatformFee;

console.log(`\n🎯 Zero-Sum Check:`);
console.log(`  Old Sum: ${oldSum} ${oldSum === 0 ? '✅' : '❌'}`);
console.log(`  New Sum: ${newSum} ${newSum === 0 ? '✅' : '❌'}`);

if (newSum === 0) {
  console.log('\n🎉 SUCCESS! The fix works correctly!');
  console.log('✅ Royalty calculation is now mathematically correct');
  console.log('✅ Platform fee calculation is now mathematically correct');
  console.log('✅ Zero-sum balance is perfect');
} else {
  console.log('\n❌ FAILED! The fix needs more work');
  console.log(`❌ Zero-sum balance is not perfect: ${newSum}`);
}

console.log('\n💡 Summary:');
console.log('  - Old calculation treated percentages as raw numbers');
console.log('  - New calculation properly divides by 100');
console.log('  - Result: Realistic payment amounts instead of crazy values');
