// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IPolicyManager.sol";

/**
 * @title Policy Manager
 * @notice Manages asset type policies and verification requirements
 */
contract PolicyManager is IPolicyManager, AccessControl {
    bytes32 public constant POLICY_ROLE = keccak256("POLICY_ROLE");

    mapping(bytes32 => AssetTypePolicy) public policies;

    event PolicyUpdated(bytes32 indexed assetType, uint256 minScore, uint256 ttl);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(POLICY_ROLE, msg.sender);
        
        // Initialize default policies
        _setDefaultPolicies();
    }

    function setAssetTypePolicy(
        bytes32 assetType,
        uint256 minScore,
        uint256 ttlSeconds,
        uint256 requiredAttestors,
        bool requiresManualReview
    ) external onlyRole(POLICY_ROLE) {
        require(minScore <= 10000, "Invalid min score");
        require(ttlSeconds > 0, "Invalid TTL");
        require(requiredAttestors > 0, "Invalid attestor count");

        policies[assetType] = AssetTypePolicy({
            minScore: minScore,
            ttlSeconds: ttlSeconds,
            requiredAttestors: requiredAttestors,
            requiresManualReview: requiresManualReview
        });

        emit PolicyUpdated(assetType, minScore, ttlSeconds);
    }

    function getAssetTypePolicy(bytes32 assetType) external view returns (AssetTypePolicy memory) {
        return policies[assetType];
    }

    function isAssetTypeSupported(bytes32 assetType) external view returns (bool) {
        return policies[assetType].minScore > 0;
    }

    function _setDefaultPolicies() internal {
        // Agricultural assets
        policies[keccak256("AGRICULTURAL")] = AssetTypePolicy({
            minScore: 7500, // 75%
            ttlSeconds: 180 days,
            requiredAttestors: 1,
            requiresManualReview: true
        });

        // Real estate
        policies[keccak256("REAL_ESTATE")] = AssetTypePolicy({
            minScore: 8500, // 85%
            ttlSeconds: 365 days,
            requiredAttestors: 2,
            requiresManualReview: true
        });

        // Equipment
        policies[keccak256("EQUIPMENT")] = AssetTypePolicy({
            minScore: 7500, // 75%
            ttlSeconds: 90 days,
            requiredAttestors: 1,
            requiresManualReview: false
        });

        // Commodities
        policies[keccak256("COMMODITIES")] = AssetTypePolicy({
            minScore: 8000, // 80%
            ttlSeconds: 120 days,
            requiredAttestors: 1,
            requiresManualReview: false
        });
    }
}
