#!/usr/bin/env node

/**
 * Test Royalty Calculation Logic
 * Verifies that royalty calculations work correctly
 */

console.log('🧪 Testing Royalty Calculation Logic\n');

// Test cases
const testCases = [
  { price: 100, royalty: 5, expected: { royalty: 5, platform: 2.5, seller: 92.5 } },
  { price: 50, royalty: 10, expected: { royalty: 5, platform: 1.25, seller: 43.75 } },
  { price: 200, royalty: 0, expected: { royalty: 0, platform: 5, seller: 195 } },
  { price: 1000, royalty: 2.5, expected: { royalty: 25, platform: 25, seller: 950 } },
  { price: 1, royalty: 1, expected: { royalty: 0.01, platform: 0.025, seller: 0.965 } }
];

const platformFeePercentage = 2.5;

function calculatePayments(assetPrice, royaltyPercentage) {
  const platformFee = (assetPrice * platformFeePercentage) / 100;
  const royaltyAmount = royaltyPercentage > 0 ? (assetPrice * royaltyPercentage) / 100 : 0;
  const sellerAmount = assetPrice - platformFee - royaltyAmount;
  
  return {
    totalPrice: assetPrice,
    platformFee: platformFee,
    royaltyAmount: royaltyAmount,
    sellerAmount: sellerAmount
  };
}

console.log('📊 Test Results:\n');

testCases.forEach((testCase, index) => {
  const result = calculatePayments(testCase.price, testCase.royalty);
  const passed = 
    Math.abs(result.royaltyAmount - testCase.expected.royalty) < 0.01 &&
    Math.abs(result.platformFee - testCase.expected.platform) < 0.01 &&
    Math.abs(result.sellerAmount - testCase.expected.seller) < 0.01;
  
  console.log(`Test ${index + 1}: ${passed ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Price: ${testCase.price} TRUST, Royalty: ${testCase.royalty}%`);
  console.log(`  Expected: Royalty=${testCase.expected.royalty}, Platform=${testCase.expected.platform}, Seller=${testCase.expected.seller}`);
  console.log(`  Actual:   Royalty=${result.royaltyAmount.toFixed(2)}, Platform=${result.platformFee.toFixed(2)}, Seller=${result.sellerAmount.toFixed(2)}`);
  console.log('');
});

console.log('🎯 How to Test in the App:');
console.log('1. Create an asset with royalty percentage (e.g., 5%)');
console.log('2. List it for sale');
console.log('3. Buy it with another account');
console.log('4. Check console logs for payment breakdown');
console.log('5. Verify creator received royalty amount');
console.log('6. Check transaction history for multiple transfers');

console.log('\n💡 Royalty Verification Checklist:');
console.log('✅ Console shows "Payment breakdown" with royalty amount');
console.log('✅ Console shows "Sending X TRUST royalty to creator"');
console.log('✅ Console shows "Royalty sent to creator"');
console.log('✅ Success message mentions royalty amount');
console.log('✅ Creator\'s TRUST balance increases by royalty amount');
console.log('✅ Multiple transactions appear in transaction history');
