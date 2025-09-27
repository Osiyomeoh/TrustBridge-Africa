#!/bin/bash

# 🗑️ TrustBridge Contract Cleanup Script
# This script deletes unnecessary files based on latest deployment analysis
# Run with: bash CLEANUP_DELETE_FILES.sh

echo "🚀 Starting TrustBridge Contract Cleanup..."
echo "================================================"

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

# Function to safely delete directories
safe_delete_dir() {
    local dir_path="$1"
    local description="$2"
    
    if [ -d "$dir_path" ]; then
        echo "🗑️  Deleting directory: $description"
        rm -rf "$dir_path"
        echo "   ✅ Deleted: $dir_path"
    else
        echo "   ⚠️  Not found: $dir_path"
    fi
}

echo ""
echo "📋 1. DELETING OLD DEPLOYMENT FILES"
echo "=================================="

# Delete old deployment files (keep only LATEST_DEPLOYMENTS_REFERENCE.json)
safe_delete "$BASE_DIR/deployments/fresh-deployment.json" "Old fresh deployment"
safe_delete "$BASE_DIR/deployments/working-addresses-reference.json" "Old working addresses reference"
# Keep: trust-ecosystem.json (still referenced) and LATEST_DEPLOYMENTS_REFERENCE.json (new)

echo ""
echo "📋 2. DELETING OLD DEPLOYMENT SCRIPTS"
echo "===================================="

# Delete old deployment scripts
safe_delete "$BASE_DIR/scripts/deploy-fresh.js" "Old fresh deployment script"
safe_delete "$BASE_DIR/scripts/deploy-enhanced-system.js" "Old enhanced system deployment"
safe_delete "$BASE_DIR/scripts/deploy-enhanced-minting.js" "Old enhanced minting deployment"
safe_delete "$BASE_DIR/scripts/deploy-mandatory-amc.js" "Old mandatory AMC deployment"

echo ""
echo "📋 3. DELETING OLD TEST SCRIPTS"
echo "=============================="

# Delete old test scripts (keep only essential ones)
safe_delete "$BASE_DIR/scripts/test-existing-assets-flow.js" "Old test script"
safe_delete "$BASE_DIR/scripts/test-real-user-flow.js" "Old test script"
safe_delete "$BASE_DIR/scripts/test-business-economics-100.js" "Old test script"
safe_delete "$BASE_DIR/scripts/test-fixed-upgrade-flow.js" "Old test script"
safe_delete "$BASE_DIR/scripts/check-current-state.js" "Old check script"
safe_delete "$BASE_DIR/scripts/decode-verification-error.js" "Old debug script"
safe_delete "$BASE_DIR/scripts/check-asset-nft-roles.js" "Old check script"
safe_delete "$BASE_DIR/scripts/test-asset-creation-only.js" "Old test script"
safe_delete "$BASE_DIR/scripts/test-digital-user-flow.js" "Old test script"
safe_delete "$BASE_DIR/scripts/test-trust-ecosystem.js" "Old test script"
safe_delete "$BASE_DIR/scripts/check-current-allowance.js" "Old check script"
safe_delete "$BASE_DIR/scripts/test-rwa-flow-100.js" "Old test script"
safe_delete "$BASE_DIR/scripts/test-final-system-status.js" "Old test script"
safe_delete "$BASE_DIR/scripts/test-simple-flow.js" "Old test script"
safe_delete "$BASE_DIR/scripts/check-core-asset-factory.js" "Old check script"
safe_delete "$BASE_DIR/scripts/test-complete-asset-flow.js" "Old test script"

# Keep these essential test scripts:
# - test-final-100-success.js (comprehensive test)
# - test-complete-business-flow.js (business flow test)

echo ""
echo "📋 4. DELETING OLD CONTRACT FILES (NOT DEPLOYED)"
echo "=============================================="

# Delete old contract files that are not in current deployment
safe_delete "$BASE_DIR/contracts/UniversalAssetFactory.sol" "Old UniversalAssetFactory contract"
safe_delete "$BASE_DIR/contracts/HederaAssetFactory.sol" "Old HederaAssetFactory contract"
safe_delete "$BASE_DIR/contracts/AssetManagementCompany.sol" "Old AssetManagementCompany contract"
safe_delete "$BASE_DIR/contracts/EnhancedTRUSTAssetFactory.sol" "Old EnhancedTRUSTAssetFactory contract"
safe_delete "$BASE_DIR/contracts/MandatoryAMCFactory.sol" "Old MandatoryAMCFactory contract"

# NOTE: CoreAssetFactory.sol, AMCManager.sol, BatchMinting.sol, AdvancedMinting.sol are ACTIVE and should NOT be deleted

echo ""
echo "📋 5. DELETING OLD ABI FILES (FRONTEND)"
echo "======================================"

# Delete old ABI files from frontend that don't match current contracts
safe_delete "../trustbridge-frontend/src/contracts/UniversalAssetFactory.json" "Old UniversalAssetFactory ABI"
safe_delete "../trustbridge-frontend/src/contracts/HederaAssetFactory.json" "Old HederaAssetFactory ABI"
safe_delete "../trustbridge-frontend/src/contracts/AssetManagementCompany.json" "Old AssetManagementCompany ABI"
safe_delete "../trustbridge-frontend/src/contracts/EnhancedTRUSTAssetFactory.json" "Old EnhancedTRUSTAssetFactory ABI"
safe_delete "../trustbridge-frontend/src/contracts/MandatoryAMCFactory.json" "Old MandatoryAMCFactory ABI"

# NOTE: CoreAssetFactory.json, AMCManager.json, BatchMinting.json, AdvancedMinting.json are ACTIVE and should NOT be deleted

echo ""
echo "📋 6. DELETING OLD DEBUGGING FILES"
echo "================================="

# Delete old debugging and markdown files
safe_delete "$BASE_DIR/deployments/ABI_SYNC_FIX.md" "Old debug file"
safe_delete "$BASE_DIR/deployments/ADMIN_DASHBOARD_FIX.md" "Old debug file"
safe_delete "$BASE_DIR/deployments/ADMIN_TAB_FIX.md" "Old debug file"
safe_delete "$BASE_DIR/deployments/ASSET_CREATION_DEBUG.md" "Old debug file"
safe_delete "$BASE_DIR/deployments/ASSET_CREATION_FINAL_FIX.md" "Old debug file"
safe_delete "$BASE_DIR/deployments/ASSET_CREATION_FIX.md" "Old debug file"
safe_delete "$BASE_DIR/deployments/ASSET_CREATION_SUCCESS_FIX.md" "Old debug file"
safe_delete "$BASE_DIR/deployments/ASSET_CREATION_SUCCESS.md" "Old debug file"
safe_delete "$BASE_DIR/deployments/ASSET_VERIFICATION_FIX.md" "Old debug file"
safe_delete "$BASE_DIR/deployments/ASSET_VERIFICATION_STATUS_FIX.md" "Old debug file"
safe_delete "$BASE_DIR/deployments/ATTESTOR_APPROVAL_FUNCTIONS_ADDED.md" "Old debug file"
safe_delete "$BASE_DIR/deployments/BIGINT_SERIALIZATION_FIX.md" "Old debug file"
safe_delete "$BASE_DIR/deployments/COMPREHENSIVE_BIGINT_FIX.md" "Old debug file"
safe_delete "$BASE_DIR/deployments/DETAILED_DEBUGGING.md" "Old debug file"
safe_delete "$BASE_DIR/deployments/ECOSYSTEM_FLOW_STATUS.md" "Old debug file"
safe_delete "$BASE_DIR/deployments/ENHANCED_DEBUGGING.md" "Old debug file"
safe_delete "$BASE_DIR/deployments/FILE_UPLOAD_ACCEPTED_TYPES_FIX.md" "Old debug file"
safe_delete "$BASE_DIR/deployments/FRONTEND_INTEGRATION_COMPLETE.md" "Old debug file"
safe_delete "$BASE_DIR/deployments/FRONTEND_NULL_CONTRACT_FIX.md" "Old debug file"
safe_delete "$BASE_DIR/deployments/MISSING_RENDER_FUNCTIONS_FIX.md" "Old debug file"
safe_delete "$BASE_DIR/deployments/NAVIGATION_REFRESH_FIX.md" "Old debug file"
safe_delete "$BASE_DIR/deployments/REQUEST_VERIFICATION_BUTTON_FIX.md" "Old debug file"
safe_delete "$BASE_DIR/deployments/ROUTE_PATH_FIX.md" "Old debug file"
safe_delete "$BASE_DIR/deployments/TRUST_TOKEN_BALANCE_FIX.md" "Old debug file"
safe_delete "$BASE_DIR/deployments/VERIFICATION_ALLOWANCE_FIX.md" "Old debug file"
safe_delete "$BASE_DIR/deployments/VERIFICATION_ALWAYS_APPROVE_FIX.md" "Old debug file"
safe_delete "$BASE_DIR/deployments/VERIFICATION_ASSET_ID_FIX.md" "Old debug file"
safe_delete "$BASE_DIR/deployments/VERIFICATION_DEBUGGING_ADDED.md" "Old debug file"
safe_delete "$BASE_DIR/deployments/VERIFICATION_FRESH_DATA_FIX.md" "Old debug file"
safe_delete "$BASE_DIR/deployments/VERIFICATION_LEVEL_ENUM_FIX.md" "Old debug file"
safe_delete "$BASE_DIR/deployments/VERIFICATION_MODE_IMPROVEMENT.md" "Old debug file"
safe_delete "$BASE_DIR/deployments/VERIFICATION_PROVIDER_REFRESH_FIX.md" "Old debug file"
safe_delete "$BASE_DIR/deployments/VERIFICATION_SKIP_DOCUMENTS_FIX.md" "Old debug file"
safe_delete "$BASE_DIR/deployments/WALLET_ADDRESS_FIX.md" "Old debug file"

echo ""
echo "📋 7. DELETING OLD ARTIFACTS (IF ANY)"
echo "==================================="

# Delete old artifacts that might be outdated
safe_delete_dir "$BASE_DIR/artifacts/contracts/UniversalAssetFactory.sol" "Old UniversalAssetFactory artifacts"
safe_delete_dir "$BASE_DIR/artifacts/contracts/HederaAssetFactory.sol" "Old HederaAssetFactory artifacts"
safe_delete_dir "$BASE_DIR/artifacts/contracts/AssetManagementCompany.sol" "Old AssetManagementCompany artifacts"
safe_delete_dir "$BASE_DIR/artifacts/contracts/EnhancedTRUSTAssetFactory.sol" "Old EnhancedTRUSTAssetFactory artifacts"
safe_delete_dir "$BASE_DIR/artifacts/contracts/MandatoryAMCFactory.sol" "Old MandatoryAMCFactory artifacts"

# NOTE: CoreAssetFactory.sol, AMCManager.sol, BatchMinting.sol, AdvancedMinting.sol artifacts are ACTIVE and should NOT be deleted

echo ""
echo "🎉 CLEANUP COMPLETE!"
echo "==================="
echo ""
echo "✅ Files deleted successfully"
echo "📋 Current active contracts:"
echo "   - TRUST Token: 0xa6f8fC5b5A9B5670dF868247585bcD86eD124ba2"
echo "   - AssetNFT: 0x42be9627C970D40248690F010b3c2a7F8C68576C"
echo "   - TRUSTAssetFactory: 0x044e4e033978af17102C69E1B79B6Ddc6078A0D9"
echo "   - CoreAssetFactory: 0x27A5705717294a481338193E9Cb5F33A40169401"
echo "   - AMCManager: 0xeDdEA0d8332e332382136feB27FbeAa2f0301250"
echo "   - AttestorVerificationSystem: 0x25F6F7209692D9b553E4d082bA964A03AdBE630d"
echo "   - TRUSTMarketplace: 0x67539aC13CD768D29701628242BB21259dde5457"
echo "   - PoolManager: 0x9a366CD458f7ADe4e20317f5915Ae7128CabaC5C"
echo "   - TradingEngine: 0xBf2e1a52b59DD6b09A5b091bb97f347D7473585d"
echo "   - BatchMinting: 0xD02fA53B407E2eCBf920Ed683D82d85b3F68E32f"
echo "   - AdvancedMinting: 0xac1E822296e6485449163EE9DAB0eAE3138565e7"
echo "   - And 3 more active contracts..."
echo ""
echo "📁 Kept essential files:"
echo "   - LATEST_DEPLOYMENTS_REFERENCE.json (comprehensive reference)"
echo "   - CONTRACT_ADDRESSES_QUICK_REFERENCE.md (quick lookup)"
echo "   - trust-ecosystem.json (deployment record)"
echo "   - test-final-100-success.js (comprehensive test)"
echo "   - test-complete-business-flow.js (business flow test)"
echo ""
echo "🚀 Next steps:"
echo "   1. Update frontend contract addresses"
echo "   2. Sync marketplace with real blockchain data"
echo "   3. Test complete user flows"
echo "   4. Deploy to mainnet when ready"
echo ""
echo "✨ TrustBridge ecosystem is now clean and optimized!"
