// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IPolicyManager {
    struct AssetTypePolicy {
        uint256 minScore;
        uint256 ttlSeconds;
        uint256 requiredAttestors;
        bool requiresManualReview;
    }

    function setAssetTypePolicy(
        bytes32 assetType,
        uint256 minScore,
        uint256 ttlSeconds,
        uint256 requiredAttestors,
        bool requiresManualReview
    ) external;

    function getAssetTypePolicy(bytes32 assetType) external view returns (AssetTypePolicy memory);
    function isAssetTypeSupported(bytes32 assetType) external view returns (bool);
}
