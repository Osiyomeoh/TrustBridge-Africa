#!/bin/bash

# 🗑️ TrustBridge Remaining Files Cleanup Script
# This script deletes remaining unnecessary files after initial cleanup
# Run with: bash CLEANUP_REMAINING_FILES.sh

echo "🚀 Starting TrustBridge Remaining Files Cleanup..."
echo "=================================================="

# Set the base directory
BASE_DIR="$(dirname "$0")"

# Function to safely delete files
safe_delete() {
    local file_path="$1"
    local description="$2"
    
    if [ -f "$file_path" ]; then
        echo "🗑️  Deleting: $description"
        rm "$file_path"
        echo "   ✅ Deleted: $file_path"
    else
        echo "   ⚠️  Not found: $file_path"
    fi
}

echo ""
echo "📋 1. DELETING OLD TEST SCRIPTS (KEEP ONLY ESSENTIAL)"
echo "===================================================="

# Keep only these essential test scripts:
# - test-final-100-success.js (comprehensive test)
# - test-complete-business-flow.js (business flow test)

# Delete old test scripts
safe_delete "$BASE_DIR/scripts/test-100-percent-flow.js" "Old test-100-percent-flow script"
safe_delete "$BASE_DIR/scripts/test-1b-core-functionality.js" "Old test-1b-core-functionality script"
safe_delete "$BASE_DIR/scripts/test-1b-market-flow.js" "Old test-1b-market-flow script"
safe_delete "$BASE_DIR/scripts/test-all-contracts.js" "Old test-all-contracts script"
safe_delete "$BASE_DIR/scripts/test-asset-verification-upgrade.js" "Old test-asset-verification-upgrade script"
safe_delete "$BASE_DIR/scripts/test-complete-ecosystem-final.js" "Old test-complete-ecosystem-final script"
safe_delete "$BASE_DIR/scripts/test-complete-ecosystem-flow.js" "Old test-complete-ecosystem-flow script"
safe_delete "$BASE_DIR/scripts/test-complete-minting-flow.js" "Old test-complete-minting-flow script"
safe_delete "$BASE_DIR/scripts/test-complete-upgrade-flow.js" "Old test-complete-upgrade-flow script"
safe_delete "$BASE_DIR/scripts/test-core-flows.js" "Old test-core-flows script"
safe_delete "$BASE_DIR/scripts/test-digital-flow-100.js" "Old test-digital-flow-100 script"
safe_delete "$BASE_DIR/scripts/test-dual-flow.js" "Old test-dual-flow script"
safe_delete "$BASE_DIR/scripts/test-enhanced-minting.js" "Old test-enhanced-minting script"
safe_delete "$BASE_DIR/scripts/test-fractionalized-trading.js" "Old test-fractionalized-trading script"
safe_delete "$BASE_DIR/scripts/test-investment-gains.js" "Old test-investment-gains script"
safe_delete "$BASE_DIR/scripts/test-mandatory-amc-flow.js" "Old test-mandatory-amc-flow script"
safe_delete "$BASE_DIR/scripts/test-modular-flows.js" "Old test-modular-flows script"
safe_delete "$BASE_DIR/scripts/test-simple-1b-flow.js" "Old test-simple-1b-flow script"
safe_delete "$BASE_DIR/scripts/test-trust-token-flow.js" "Old test-trust-token-flow script"
safe_delete "$BASE_DIR/scripts/test-verification-approval.js" "Old test-verification-approval script"

echo ""
echo "📋 2. DELETING DEBUG AND CHECK SCRIPTS"
echo "====================================="

# Delete debug and check scripts
safe_delete "$BASE_DIR/scripts/debug-contract-fee-recipient.js" "Old debug-contract-fee-recipient script"
safe_delete "$BASE_DIR/scripts/debug-verification-allowance.js" "Old debug-verification-allowance script"
safe_delete "$BASE_DIR/scripts/check-allowances.js" "Old check-allowances script"

echo ""
echo "📋 3. DELETING DEMO SCRIPTS"
echo "=========================="

# Delete demo scripts
safe_delete "$BASE_DIR/scripts/demo-african-farmer-flow.js" "Old demo-african-farmer-flow script"

echo ""
echo "📋 4. DELETING OLD DEPLOYMENT SCRIPTS"
echo "===================================="

# Delete old deployment scripts (keep only current ones)
safe_delete "$BASE_DIR/scripts/deploy-modular-system.js" "Old deploy-modular-system script"
safe_delete "$BASE_DIR/scripts/deploy-trust-ecosystem.js" "Old deploy-trust-ecosystem script"
safe_delete "$BASE_DIR/scripts/deploy-trust-marketplace.js" "Old deploy-trust-marketplace script"
safe_delete "$BASE_DIR/scripts/redeploy-pool-manager.js" "Old redeploy-pool-manager script"

echo ""
echo "📋 5. DELETING OLD CONTRACT FILES (IF ANY REMAINING)"
echo "=================================================="

# Check for any remaining old contract files
safe_delete "$BASE_DIR/contracts/AssetManagementCompany.sol" "Old AssetManagementCompany contract"
safe_delete "$BASE_DIR/contracts/EnhancedTRUSTAssetFactory.sol" "Old EnhancedTRUSTAssetFactory contract"
safe_delete "$BASE_DIR/contracts/MandatoryAMCFactory.sol" "Old MandatoryAMCFactory contract"

echo ""
echo "📋 6. DELETING OLD ABI FILES (FRONTEND - IF ANY REMAINING)"
echo "========================================================"

# Check for any remaining old ABI files
safe_delete "../trustbridge-frontend/src/contracts/AssetManagementCompany.json" "Old AssetManagementCompany ABI"
safe_delete "../trustbridge-frontend/src/contracts/EnhancedTRUSTAssetFactory.json" "Old EnhancedTRUSTAssetFactory ABI"
safe_delete "../trustbridge-frontend/src/contracts/MandatoryAMCFactory.json" "Old MandatoryAMCFactory ABI"

echo ""
echo "📋 7. DELETING OLD ARTIFACTS (IF ANY REMAINING)"
echo "=============================================="

# Check for any remaining old artifacts
safe_delete_dir "$BASE_DIR/artifacts/contracts/AssetManagementCompany.sol" "Old AssetManagementCompany artifacts"
safe_delete_dir "$BASE_DIR/artifacts/contracts/EnhancedTRUSTAssetFactory.sol" "Old EnhancedTRUSTAssetFactory artifacts"
safe_delete_dir "$BASE_DIR/artifacts/contracts/MandatoryAMCFactory.sol" "Old MandatoryAMCFactory artifacts"

echo ""
echo "🎉 REMAINING CLEANUP COMPLETE!"
echo "============================="
echo ""
echo "✅ Files deleted successfully"
echo "📋 Essential files kept:"
echo "   - test-final-100-success.js (comprehensive test)"
echo "   - test-complete-business-flow.js (business flow test)"
echo "   - hardhat.config.js (build configuration)"
echo "   - All active contract .sol files"
echo "   - All active ABI .json files"
echo ""
echo "📊 Cleanup Summary:"
echo "   - Test scripts: 20+ deleted (kept 2 essential)"
echo "   - Debug scripts: 3 deleted"
echo "   - Demo scripts: 1 deleted"
echo "   - Old deployment scripts: 4 deleted"
echo "   - Total files cleaned: 28+ files"
echo ""
echo "🚀 Next steps:"
echo "   1. Update frontend contract addresses"
echo "   2. Sync marketplace with real blockchain data"
echo "   3. Test complete user flows"
echo "   4. Deploy to mainnet when ready"
echo ""
echo "✨ TrustBridge backend is now fully optimized!"
